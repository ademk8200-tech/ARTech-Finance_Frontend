import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { getNetworkData } from '../services/networkService';
import { RefreshCw, Maximize, Network, AlertTriangle, Activity, ShieldCheck } from 'lucide-react';

// MiroFish renk paleti (referansla aynı)
const MIRO_COLORS = ['#FF6B35', '#004E89', '#7B2D8E', '#1A936F', '#C5283D', '#E9724C'];
const ENTITY_TYPES = ["Bireysel", "Kurumsal", "Yurtdışı", "Kripto Borsası", "Paravan Şirket", "Offshore"];
const TYPE_COLOR_MAP = ENTITY_TYPES.reduce((acc, type, idx) => {
  acc[type] = MIRO_COLORS[idx];
  return acc;
}, {});

function NetworkAnalysis() {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  const linkLabelGroupRef = useRef(null);

  const [networkData, setNetworkData] = useState({ nodes: [], edges: [] });
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const [showEdgeLabels, setShowEdgeLabels] = useState(true);
  const [loading, setLoading] = useState(true);

  // Veri çek
  useEffect(() => {
    setLoading(true);
    getNetworkData()
      .then(data => setNetworkData(data || { nodes: [], edges: [] }))
      .finally(() => setLoading(false));
  }, []);

  const renderGraph = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;
    if (!networkData.nodes || networkData.nodes.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Veriyi normalize et + curvature hesapla (multi-edge için)
    const nodes = networkData.nodes.map(n => ({
      ...n,
      id: String(n.id),
    }));
    const validIds = new Set(nodes.map(n => n.id));

    const rawEdges = networkData.edges
      .map(e => ({
        ...e,
        source: String(typeof e.source === 'object' ? e.source.id : e.source),
        target: String(typeof e.target === 'object' ? e.target.id : e.target),
      }))
      .filter(e => validIds.has(e.source) && validIds.has(e.target));

    // Aynı node çifti arası birden çok edge varsa eğri hesapla
    const pairCount = {};
    const pairIdx = {};
    rawEdges.forEach(e => {
      const key = [e.source, e.target].sort().join('__');
      pairCount[key] = (pairCount[key] || 0) + 1;
    });
    const edges = rawEdges.map(e => {
      const key = [e.source, e.target].sort().join('__');
      const total = pairCount[key];
      const idx = pairIdx[key] || 0;
      pairIdx[key] = idx + 1;
      let curvature = 0;
      if (total > 1) {
        const range = Math.min(1.2, 0.6 + total * 0.15);
        curvature = ((idx / (total - 1)) - 0.5) * range * 2;
        if (e.source > e.target) curvature = -curvature;
      }
      return { ...e, curvature };
    });

    // SVG temizle
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Zoom destekli ana grup
    const g = svg.append('g');

    svg.call(
      d3.zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([0.2, 4])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        })
    );

    // d3-force simülasyonu (MiroFish ile aynı parametreler)
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id(d => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide(28))
      .force('x', d3.forceX(width / 2).strength(0.04))
      .force('y', d3.forceY(height / 2).strength(0.04));

    simulationRef.current = simulation;

    // ---- Link path hesaplayıcısı (curvature destekli) ----
    const getLinkPath = (d) => {
      const sx = d.source.x ?? 0;
      const sy = d.source.y ?? 0;
      const tx = d.target.x ?? 0;
      const ty = d.target.y ?? 0;
      if (!d.curvature) {
        return `M${sx},${sy} L${tx},${ty}`;
      }
      const dx = tx - sx;
      const dy = ty - sy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const offsetRatio = 0.25;
      const baseOffset = Math.max(35, dist * offsetRatio);
      const offsetX = -dy / dist * d.curvature * baseOffset;
      const offsetY = dx / dist * d.curvature * baseOffset;
      const cx = (sx + tx) / 2 + offsetX;
      const cy = (sy + ty) / 2 + offsetY;
      return `M${sx},${sy} Q${cx},${cy} ${tx},${ty}`;
    };

    const getLinkMid = (d) => {
      const sx = d.source.x ?? 0;
      const sy = d.source.y ?? 0;
      const tx = d.target.x ?? 0;
      const ty = d.target.y ?? 0;
      if (!d.curvature) {
        return { x: (sx + tx) / 2, y: (sy + ty) / 2 };
      }
      const dx = tx - sx;
      const dy = ty - sy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const baseOffset = Math.max(35, dist * 0.25);
      const offsetX = -dy / dist * d.curvature * baseOffset;
      const offsetY = dx / dist * d.curvature * baseOffset;
      const cx = (sx + tx) / 2 + offsetX;
      const cy = (sy + ty) / 2 + offsetY;
      return { x: 0.25 * sx + 0.5 * cx + 0.25 * tx, y: 0.25 * sy + 0.5 * cy + 0.25 * ty };
    };

    // ---- Edges (path olarak çiz) ----
    const linkGroup = g.append('g').attr('class', 'links');

    const link = linkGroup.selectAll('path.edge')
      .data(edges)
      .enter().append('path')
      .attr('class', 'edge')
      .attr('stroke', '#C0C0C0')
      .attr('stroke-width', 1.5)
      .attr('fill', 'none')
      .attr('marker-end', 'url(#arrow)')
      .style('cursor', 'pointer');

    // Ok başı tanımı
    svg.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 18)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto-start-reverse')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', '#C0C0C0');

    // Edge label arka planı
    const linkLabelBg = linkGroup.selectAll('rect.edge-label-bg')
      .data(edges)
      .enter().append('rect')
      .attr('class', 'edge-label-bg')
      .attr('fill', 'rgba(255,255,255,0.95)')
      .attr('stroke', 'rgba(0,0,0,0.1)')
      .attr('rx', 3)
      .attr('ry', 3)
      .style('display', showEdgeLabels ? 'block' : 'none');

    // Edge label metin
    const linkLabels = linkGroup.selectAll('text.edge-label')
      .data(edges)
      .enter().append('text')
      .attr('class', 'edge-label')
      .text(d => d.amount != null ? `${Number(d.amount).toLocaleString('tr-TR')} ₺` : (d.label || ''))
      .attr('font-size', '9px')
      .attr('fill', '#555')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-family', 'system-ui, sans-serif')
      .style('pointer-events', 'none')
      .style('display', showEdgeLabels ? 'block' : 'none');

    linkLabelGroupRef.current = { linkLabelBg, linkLabels };

    // ---- Nodes ----
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const node = nodeGroup.selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', 10)
      .attr('fill', d => TYPE_COLOR_MAP[d.type || d.accountType] || '#999')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2.5)
      .style('cursor', 'pointer')
      .call(
        d3.drag()
          .on('start', (event, d) => {
            // MiroFish mantığı: önce sadece pozisyonu fixle, sürükleme tespit edilince simülasyonu ısıt
            d.fx = d.x;
            d.fy = d.y;
            d._dragStartX = event.x;
            d._dragStartY = event.y;
            d._isDragging = false;
          })
          .on('drag', (event, d) => {
            const dx = event.x - d._dragStartX;
            const dy = event.y - d._dragStartY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (!d._isDragging && distance > 3) {
              d._isDragging = true;
              simulation.alphaTarget(0.3).restart();
            }
            if (d._isDragging) {
              d.fx = event.x;
              d.fy = event.y;
            }
          })
          .on('end', (event, d) => {
            if (d._isDragging) {
              simulation.alphaTarget(0);
            }
            d.fx = null;
            d.fy = null;
            d._isDragging = false;
          })
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        // Tüm node'ları default'a döndür
        node.attr('stroke', '#fff').attr('stroke-width', 2.5);
        link.attr('stroke', '#C0C0C0').attr('stroke-width', 1.5);

        // Seçilen node'u vurgula
        d3.select(event.currentTarget).attr('stroke', '#E91E63').attr('stroke-width', 4);

        // Bağlı edge'leri vurgula
        link.filter(l => l.source.id === d.id || l.target.id === d.id)
          .attr('stroke', '#E91E63')
          .attr('stroke-width', 2.5);

        setSelectedNodeData(d);
      });

    // Node label
    const nodeLabels = nodeGroup.selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text(d => {
        const name = d.label || d.ownerName || d.id;
        return name.length > 14 ? name.substring(0, 14) + '…' : name;
      })
      .attr('font-size', '11px')
      .attr('font-weight', 500)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'hanging')
      .attr('dy', 14)
      .attr('fill', '#333')
      .style('pointer-events', 'none')
      .style('font-family', 'system-ui, sans-serif');

    // ---- tick callback ----
    simulation.on('tick', () => {
      link.attr('d', getLinkPath);

      // Label arka planları ölçü için her tick'te yeniden boyutlandırılır
      linkLabels
        .attr('x', d => getLinkMid(d).x)
        .attr('y', d => getLinkMid(d).y);

      linkLabelBg.each(function (d, i) {
        const labelEl = linkLabels.nodes()[i];
        if (!labelEl || labelEl.style.display === 'none') return;
        const bbox = labelEl.getBBox();
        const mid = getLinkMid(d);
        d3.select(this)
          .attr('x', mid.x - bbox.width / 2 - 4)
          .attr('y', mid.y - bbox.height / 2 - 2)
          .attr('width', bbox.width + 8)
          .attr('height', bbox.height + 4);
      });

      node.attr('cx', d => d.x).attr('cy', d => d.y);
      nodeLabels.attr('x', d => d.x).attr('y', d => d.y);
    });

    // Boş alana tıklayınca seçimi kaldır
    svg.on('click', () => {
      setSelectedNodeData(null);
      node.attr('stroke', '#fff').attr('stroke-width', 2.5);
      link.attr('stroke', '#C0C0C0').attr('stroke-width', 1.5);
    });
  }, [networkData, showEdgeLabels]);

  // Veri/ekran değişince yeniden çiz
  useEffect(() => {
    renderGraph();
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [renderGraph]);

  // Ekran resize
  useEffect(() => {
    const handleResize = () => renderGraph();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderGraph]);

  // Edge label toggle
  useEffect(() => {
    if (!linkLabelGroupRef.current) return;
    const { linkLabelBg, linkLabels } = linkLabelGroupRef.current;
    linkLabelBg.style('display', showEdgeLabels ? 'block' : 'none');
    linkLabels.style('display', showEdgeLabels ? 'block' : 'none');
  }, [showEdgeLabels]);

  const handleRefresh = async () => {
    setLoading(true);
    setSelectedNodeData(null);
    try {
      const data = await getNetworkData();
      setNetworkData(data || { nodes: [], edges: [] });
    } finally {
      setLoading(false);
    }
  };

  const getColor = (type) => TYPE_COLOR_MAP[type] || '#999';

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] space-y-4">
      <div className="flex flex-1 gap-4 min-h-0 overflow-hidden">

        {/* Graph Container - MiroFish açık arka plan */}
        <div
          ref={containerRef}
          className="flex-1 relative overflow-hidden rounded-xl border border-slate-200 shadow-sm"
          style={{
            backgroundColor: '#FAFAFA',
            backgroundImage: 'radial-gradient(#D0D0D0 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px'
          }}
        >
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full"
            style={{ touchAction: 'none' }}
          />

          {loading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-600 font-medium tracking-wide">Graph Data Loading...</p>
            </div>
          )}

          {/* Top Right Tools */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-1.5 bg-white rounded shadow-sm text-slate-600 hover:text-blue-600 transition-colors border border-slate-200 text-sm font-medium"
              title="Refresh Graph"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              className="flex items-center justify-center w-8 h-8 bg-white rounded shadow-sm text-slate-600 hover:text-blue-600 transition-colors border border-slate-200"
              title="Toggle Maximize"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>

          {/* Top Left Title */}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
            <span className="text-lg font-bold text-slate-800 tracking-tight">Graph Relationship Visualization</span>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100 p-4 z-10 min-w-[200px]">
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Entity Types</span>
            <div className="flex flex-col gap-2">
              {ENTITY_TYPES.map((type, idx) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full shadow-sm" style={{ background: MIRO_COLORS[idx % MIRO_COLORS.length] }}></span>
                  <span className="text-sm font-medium text-slate-700">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Edge Labels Toggle */}
          <div className="absolute top-16 right-4 flex items-center gap-3 px-3 py-2 bg-white rounded-lg shadow-sm border border-slate-200 z-10">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={showEdgeLabels} onChange={(e) => setShowEdgeLabels(e.target.checked)} />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
              <span className="ml-3 text-sm font-medium text-slate-600">Show Edge Labels</span>
            </label>
          </div>
        </div>

        {/* Right Panel: Account Details */}
        <div className="w-[340px] bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-sm z-10">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
            <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">{selectedNodeData ? 'Hesap Detayları' : 'Panel'}</span>
            {selectedNodeData && (
              <span className="px-2 py-1 text-xs font-bold text-white rounded" style={{ background: getColor(selectedNodeData.type || selectedNodeData.accountType) }}>
                {selectedNodeData.type || selectedNodeData.accountType || 'Entity'}
              </span>
            )}
          </div>

          <div className="flex-1 p-5 overflow-y-auto">
            {selectedNodeData ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center pt-2">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow-sm border-2 ${selectedNodeData.riskScore >= 80 ? 'bg-red-50 text-red-500 border-red-100' :
                    selectedNodeData.riskScore >= 50 ? 'bg-orange-50 text-orange-500 border-orange-100' :
                      'bg-green-50 text-green-500 border-green-100'
                    }`}>
                    {selectedNodeData.riskScore >= 80 ? <AlertTriangle className="w-8 h-8" /> :
                      selectedNodeData.riskScore >= 50 ? <Activity className="w-8 h-8" /> :
                        <ShieldCheck className="w-8 h-8" />}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{selectedNodeData.label || selectedNodeData.ownerName}</h3>
                  <p className="text-xs text-slate-500 mt-1 font-mono bg-slate-100 inline-block px-2 py-0.5 rounded">{selectedNodeData.id}</p>
                </div>

                <div className="bg-white rounded-lg p-4 space-y-3 border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-slate-500 text-sm font-medium">Hesap Türü</span>
                    <span className="text-slate-800 font-bold">{selectedNodeData.type || selectedNodeData.accountType || "Belirsiz"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-slate-500 text-sm font-medium">Risk Skoru</span>
                    <span className={`font-bold ${selectedNodeData.riskScore >= 80 ? 'text-red-500' :
                      selectedNodeData.riskScore >= 50 ? 'text-orange-500' :
                        'text-green-500'
                      }`}>{selectedNodeData.riskScore} / 100</span>
                  </div>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {selectedNodeData.riskScore >= 80
                      ? "Bu hesap ağ üzerinde kritik ve yüksek riskli bağlantılara sahip. Yüksek riskli işlemler izlenmektedir."
                      : selectedNodeData.riskScore >= 50
                        ? "Şüpheli para transfer örüntüleri (sık tekrarlayan işlemler vs.) bulunuyor. İncelemeye alınması tavsiye edilir."
                        : "Ağ üzerindeki işlemleri genellikle normal ticari/bireysel akışlarla uyumlu ve risksiz görünmektedir."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                  <Network className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-sm text-center font-medium">Detaylarını görmek için<br />grafikteki bir düğüme tıklayın.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default NetworkAnalysis;
