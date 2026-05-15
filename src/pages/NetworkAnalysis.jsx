import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Graph } from '@antv/g6';
import { getNetworkData } from '../services/networkService';
import { RefreshCw, Maximize, Network, AlertTriangle, Activity, ShieldCheck } from 'lucide-react';

// MiroFish Color Palette
const MIRO_COLORS = ['#FF6B35', '#004E89', '#7B2D8E', '#1A936F', '#C5283D', '#E9724C'];
const ENTITY_TYPES = ["Bireysel", "Kurumsal", "Yurtdışı", "Kripto Borsası", "Paravan Şirket", "Offshore"];
const TYPE_COLOR_MAP = ENTITY_TYPES.reduce((acc, type, idx) => {
  acc[type] = MIRO_COLORS[idx];
  return acc;
}, {});

function NetworkAnalysis() {
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const showEdgeLabelsRef = useRef(true);
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const [showEdgeLabels, setShowEdgeLabels] = useState(true);
  const [loading, setLoading] = useState(true);

  const [networkData, setNetworkData] = useState({ nodes: [], edges: [] });

  // TODO: Bir node seçildiğinde, eğer işlem detayı arasında importantNodes/importantEdges varsa onları kırmızı border ile vurgulamak için kod eklenecek.

  useEffect(() => {
    getNetworkData().then(data => setNetworkData(data || { nodes: [], edges: [] }));
  }, []);

  // Mock data oluştur
  const buildData = useCallback(() => {
    const rawNodes = JSON.parse(JSON.stringify(networkData.nodes || []));
    const rawEdges = JSON.parse(JSON.stringify(networkData.edges || []));

    const baseNodes = rawNodes.map(n => ({ ...n, id: String(n.id) }));
    const baseEdges = rawEdges.map(e => ({
      ...e,
      source: String(typeof e.source === 'object' ? e.source.id : e.source),
      target: String(typeof e.target === 'object' ? e.target.id : e.target),
    }));

    const allNodes = baseNodes;
    const validIds = new Set(allNodes.map(n => n.id));

    const allEdges = baseEdges.filter(e => validIds.has(e.source) && validIds.has(e.target));

    // G6 v5 format: { id, data } for nodes, { id, source, target, data } for edges
    return {
      nodes: allNodes.map(n => ({ id: n.id, data: { ...n } })),
      edges: allEdges.map((e, idx) => ({
        id: `edge-${idx}`,
        source: e.source,
        target: e.target,
        data: { amount: e.amount },
      })),
    };
  }, [networkData]);

  // Tüm state'leri temizle
  const clearStates = (graph) => {
    const states = {};
    graph.getNodeData().forEach(n => { states[n.id] = []; });
    graph.getEdgeData().forEach(e => { states[e.id] = []; });
    graph.setElementState(states);
  };

  // Graph'ı başlat
  useEffect(() => {
    if (!containerRef.current || graphRef.current) return;

    const initGraph = async () => {
      setLoading(true);
      const data = buildData();
      const { width, height } = containerRef.current.getBoundingClientRect();

      const graph = new Graph({
        container: containerRef.current,
        width: width || 800,
        height: height || 600,
        data,
        node: {
          style: {
            size: 18,
            fill: (d) => TYPE_COLOR_MAP[d.data?.type] || '#999',
            stroke: '#fff',
            lineWidth: 1.5,
            labelText: (d) => {
              const name = d.data?.label || d.data?.ownerName || d.id;
              return name.length > 14 ? name.substring(0, 14) + '…' : name;
            },
            labelPlacement: 'right',
            labelOffsetX: 4,
            labelFontSize: 11,
            labelFill: '#333',
            labelFontWeight: 500,
            cursor: 'pointer',
          },
          state: {
            selected: {
              stroke: '#E91E63',
              lineWidth: 3,
              size: 22,
              shadowColor: 'rgba(233, 30, 99, 0.3)',
              shadowBlur: 10,
            },
          },
        },
        edge: {
          style: {
            stroke: '#c0c0c0',
            lineWidth: 1.5,
            endArrow: true,
            endArrowSize: 5,
            labelText: (d) =>
              showEdgeLabelsRef.current && d.data?.amount != null
                ? `${d.data.amount.toLocaleString('tr-TR')} ₺`
                : '',
            labelFontSize: 9,
            labelFill: '#666',
            labelBackground: true,
            labelBackgroundFill: 'rgba(255,255,255,0.95)',
            labelBackgroundRadius: 3,
            labelPadding: [2, 4],
          },
          state: {
            highlight: {
              stroke: '#E91E63',
              lineWidth: 2.5,
            },
            dim: {
              stroke: '#e2e8f0',
              lineWidth: 1,
            },
          },
        },
        layout: {
          type: 'd3-force',
          link: { distance: 130 },
          manyBody: { strength: -500 },
          collide: { radius: 25 }, // Çakışma engelleme - G6 native
          center: { strength: 0.05 },
        },
        behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
        animation: false,
      });

      // Node tıklama
      graph.on('node:click', (evt) => {
        const id = evt.target.id;
        const nodeData = graph.getNodeData(id);
        setSelectedNodeData(nodeData.data);

        clearStates(graph);

        const states = { [id]: ['selected'] };
        const related = graph.getRelatedEdgesData(id);
        related.forEach(e => {
          states[e.id] = ['highlight'];
        });
        graph.setElementState(states);
      });

      // Boş alan tıklama
      graph.on('canvas:click', () => {
        setSelectedNodeData(null);
        clearStates(graph);
      });

      // Node sürükleme bitince layout'u yeniden tetikle - diğer node'lar yerleşir
      let layoutRunning = false;
      const triggerReLayout = async () => {
        if (layoutRunning) return;
        layoutRunning = true;
        try {
          await graph.layout();
        } catch (err) {
          // sessizce yut
        }
        layoutRunning = false;
      };
      graph.on('node:dragend', triggerReLayout);
      graph.on('element:dragend', triggerReLayout);

      graphRef.current = graph;
      await graph.render();
      setLoading(false);
    };

    initGraph();

    return () => {
      if (graphRef.current) {
        graphRef.current.destroy();
        graphRef.current = null;
      }
    };
  }, [buildData]);

  // Container resize handler
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (graphRef.current && containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (width > 0 && height > 0) {
          graphRef.current.setSize(width, height);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Edge label toggle
  useEffect(() => {
    showEdgeLabelsRef.current = showEdgeLabels;
    if (!graphRef.current) return;
    try {
      const edges = graphRef.current.getEdgeData();
      graphRef.current.updateEdgeData(edges.map(e => ({ id: e.id })));
      graphRef.current.draw();
    } catch (err) {
      console.warn('Edge label toggle:', err);
    }
  }, [showEdgeLabels]);

  const handleRefresh = async () => {
    if (!graphRef.current) return;
    setLoading(true);
    setSelectedNodeData(null);
    const newData = buildData();
    graphRef.current.setData(newData);
    await graphRef.current.render();
    setLoading(false);
  };

  const getColor = (type) => TYPE_COLOR_MAP[type] || '#999';

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] space-y-4">
      <div className="flex flex-1 gap-4 min-h-0 overflow-hidden">

        {/* Graph Container */}
        <div className="flex-1 relative bg-[#f8f9fa] overflow-hidden rounded-xl border border-slate-200 shadow-sm"
          style={{
            backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}>

          <div ref={containerRef} className="absolute inset-0 w-full h-full" />

          {loading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm">
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
