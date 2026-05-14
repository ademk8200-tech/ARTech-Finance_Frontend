import React, { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { networkData } from '../data/mockData';
import { RefreshCw, Maximize, ArrowLeft, Network, Info, AlertTriangle, Activity, ShieldCheck } from 'lucide-react';

// MiroFish Color Palette
const MIRO_COLORS = ['#FF6B35', '#004E89', '#7B2D8E', '#1A936F', '#C5283D', '#E9724C', '#3498db', '#9b59b6', '#27ae60', '#f39c12'];
const ENTITY_TYPES = ["Bireysel", "Kurumsal", "Yurtdışı", "Kripto Borsası", "Paravan Şirket", "Offshore"];

function NetworkAnalysis() {
  const containerRef = useRef(null);
  const fgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [showEdgeLabels, setShowEdgeLabels] = useState(true); // Default true in MiroFish
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Resize observer
  useEffect(() => {
    const observeTarget = containerRef.current;
    if (!observeTarget) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    resizeObserver.observe(observeTarget);
    return () => resizeObserver.unobserve(observeTarget);
  }, []);

  // Generate synthetic data with curvature calculation
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      // ÇOK KRİTİK: react-force-graph objeleri mutasyona uğrattığı için 
      // mockData'dan gelen verileri derinlemesine (deep) kopyalamalıyız.
      const baseNodes = networkData.nodes ? networkData.nodes.map(n => ({ ...n })) : [];
      const baseEdges = networkData.edges ? networkData.edges.map(e => ({ ...e })) : [];

      const generatedNodes = [];
      const generatedEdges = [];

      const firstNames = ["Ahmet", "Mehmet", "Ayşe", "Fatma", "Global", "Tech", "Crypto", "Holdings", "Trade"];
      const lastNames = ["Yılmaz", "Kaya", "A.Ş.", "Ltd.", "GmbH", "LLC"];

      // Add 150 random nodes
      for (let i = 11; i <= 160; i++) {
        const riskRand = Math.random();
        let riskScore = 0;
        if (riskRand < 0.6) riskScore = Math.floor(Math.random() * 50);
        else if (riskRand < 0.9) riskScore = 50 + Math.floor(Math.random() * 30);
        else riskScore = 80 + Math.floor(Math.random() * 21);

        const type = ENTITY_TYPES[Math.floor(Math.random() * ENTITY_TYPES.length)];

        generatedNodes.push({
          id: `gen-acc-${i}`,
          label: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
          ownerName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
          riskScore,
          riskLevel: riskScore >= 80 ? 'Yüksek' : riskScore >= 50 ? 'Orta' : 'Düşük',
          type: type,
          accountType: type
        });
      }

      const allNodes = [...baseNodes, ...generatedNodes];

      // Hubs for realistic clustering
      const hubs = [];
      for (let h = 0; h < 10; h++) {
        hubs.push(allNodes[Math.floor(Math.random() * allNodes.length)]);
      }

      for (let e = 0; e < 200; e++) {
        const isHubConnection = Math.random() > 0.4;
        let source, target;
        
        if (isHubConnection) {
          source = hubs[Math.floor(Math.random() * hubs.length)].id;
          target = allNodes[Math.floor(Math.random() * allNodes.length)].id;
        } else {
          source = allNodes[Math.floor(Math.random() * allNodes.length)].id;
          target = allNodes[Math.floor(Math.random() * allNodes.length)].id;
        }

        if (source !== target) {
          generatedEdges.push({
            source,
            target,
            amount: Math.floor(Math.random() * 500000),
            name: 'TRANSFER'
          });
        }
      }

      const allEdges = [...baseEdges.map(e => ({...e, name: 'RELATED'})), ...generatedEdges];

      // Curvature calculation for multiple edges between same nodes
      const edgePairCount = {};
      const edgePairIndex = {};
      
      allEdges.forEach(e => {
        const pairKey = [e.source, e.target].sort().join('_');
        edgePairCount[pairKey] = (edgePairCount[pairKey] || 0) + 1;
      });

      const finalLinks = allEdges.map(e => {
        const pairKey = [e.source, e.target].sort().join('_');
        const totalCount = edgePairCount[pairKey];
        const currentIndex = edgePairIndex[pairKey] || 0;
        edgePairIndex[pairKey] = currentIndex + 1;
        
        let curvature = 0;
        if (totalCount > 1) {
          const curvatureRange = Math.min(1.2, 0.6 + totalCount * 0.15);
          curvature = ((currentIndex / (totalCount - 1)) - 0.5) * curvatureRange * 2;
          if (e.source > e.target) curvature = -curvature; // Normalize direction
        }

        return {
          ...e,
          curvature
        };
      });

      setGraphData({
        nodes: allNodes,
        links: finalLinks
      });
      setLoading(false);
    }, 500); // Simulate network load
  }, []);

  // Update d3-force physics settings for more spacious layout
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-400);
      fgRef.current.d3Force('link').distance(120);
    }
  }, [graphData, dimensions]);

  const getColor = (type) => {
    const idx = ENTITY_TYPES.indexOf(type);
    return idx >= 0 ? MIRO_COLORS[idx % MIRO_COLORS.length] : '#999';
  };

  // Node rendering matching MiroFish style
  const paintNode = useCallback((node, ctx, globalScale) => {
    const isSelected = selectedNodeData && selectedNodeData.id === node.id;
    const color = getColor(node.type || node.accountType || 'Entity');
    const nodeSize = 6; // slightly larger than before, closer to MiroFish r=10 (in their scale)

    // Highlight logic
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeSize + 2, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'rgba(233, 30, 99, 0.2)'; // #E91E63 Highlight
      ctx.fill();
    }

    // Node Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    
    // MiroFish has white stroke
    ctx.strokeStyle = isSelected ? '#E91E63' : '#ffffff';
    ctx.lineWidth = isSelected ? 1.5 : 1;
    ctx.stroke();

    // Node Label
    const fontSize = Math.max(5 / globalScale, 1);
    ctx.font = `500 ${fontSize}px system-ui, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#333333';
    
    // Truncate logic like MiroFish
    const name = node.label || node.ownerName || node.id;
    const displayName = name.length > 12 ? name.substring(0, 12) + '…' : name;
    
    ctx.fillText(displayName, node.x + nodeSize + (4 / globalScale), node.y);
  }, [selectedNodeData]);

  // Click hit-area matching the visual node and a generous margin
  const paintNodePointerArea = useCallback((node, color, ctx) => {
    ctx.fillStyle = color;
    const hitRadius = 12; // Generous hit area for easy clicking
    
    ctx.beginPath();
    ctx.arc(node.x, node.y, hitRadius, 0, 2 * Math.PI, false);
    ctx.fill();
  }, []);

  // Edge label rendering matching MiroFish style
  const paintLink = useCallback((link, ctx, globalScale) => {
    if (!showEdgeLabels || !link.amount) return;
    
    const start = link.source;
    const end = link.target;
    if (typeof start !== 'object' || typeof end !== 'object') return;

    // Calculate quadratic bezier midpoint
    let midX, midY;
    if (link.curvature === 0) {
      midX = (start.x + end.x) / 2;
      midY = (start.y + end.y) / 2;
    } else {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const pairTotal = 1; // Simplify offset for performance
      const offsetRatio = 0.25 + pairTotal * 0.05;
      const baseOffset = Math.max(35, dist * offsetRatio);
      
      const offsetX = (-dy / dist) * link.curvature * baseOffset;
      const offsetY = (dx / dist) * link.curvature * baseOffset;
      
      const cx = (start.x + end.x) / 2 + offsetX;
      const cy = (start.y + end.y) / 2 + offsetY;
      
      midX = 0.25 * start.x + 0.5 * cx + 0.25 * end.x;
      midY = 0.25 * start.y + 0.5 * cy + 0.25 * end.y;
    }

    const labelText = `${link.amount.toLocaleString('tr-TR')} ₺`;
    const fontSize = Math.max(9 / globalScale, 1.5);
    ctx.font = `${fontSize}px system-ui, sans-serif`;
    
    const textWidth = ctx.measureText(labelText).width;
    const bckgDimensions = [textWidth + (8 / globalScale), fontSize + (4 / globalScale)];

    // Background rect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.roundRect(
      midX - bckgDimensions[0] / 2, 
      midY - bckgDimensions[1] / 2, 
      bckgDimensions[0], 
      bckgDimensions[1], 
      3 / globalScale // border radius
    );
    ctx.fill();

    // Text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#666666';
    ctx.fillText(labelText, midX, midY);
  }, [showEdgeLabels]);

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] space-y-4">
      <div className="flex flex-1 gap-4 min-h-0 overflow-hidden">
        
        {/* Graph Container */}
        <div className="flex-1 relative bg-[#f8f9fa] overflow-hidden rounded-xl border border-slate-200 shadow-sm" 
             style={{
               backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
               backgroundSize: '20px 20px'
             }}
             ref={containerRef}>
          
          {loading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-600 font-medium tracking-wide">Graph Data Loading...</p>
            </div>
          )}

          {dimensions.width > 0 && graphData.nodes.length > 0 && (
            <ForceGraph2D
              ref={fgRef}
              width={dimensions.width}
              height={dimensions.height}
              graphData={graphData}
              nodeCanvasObject={paintNode}
              nodePointerAreaPaint={paintNodePointerArea}
              linkColor={(link) => {
                if (selectedNodeData) {
                  const isConnected = link.source.id === selectedNodeData.id || link.target.id === selectedNodeData.id;
                  return isConnected ? '#E91E63' : '#e2e8f0'; // Pink highlight for connected edges
                }
                return '#c0c0c0'; // MiroFish standard link color
              }}
              linkWidth={(link) => {
                if (selectedNodeData && (link.source.id === selectedNodeData.id || link.target.id === selectedNodeData.id)) {
                  return 2.5;
                }
                return 1.5;
              }}
              linkCurvature="curvature"
              linkDirectionalParticles={2}
              linkDirectionalParticleSpeed={0.005}
              linkDirectionalParticleWidth={1.5}
              linkDirectionalParticleColor={() => '#3498db'} // Blue particles for flow
              linkCanvasObjectMode={() => showEdgeLabels ? "after" : undefined}
              linkCanvasObject={paintLink}
              onNodeClick={(node) => {
                setSelectedNodeData(node);
              }}
              onBackgroundClick={() => setSelectedNodeData(null)}
              backgroundColor="transparent"
              cooldownTicks={100}
            />
          )}

          {/* MiroFish Internal Top Right Tools */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button 
              onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 500); }}
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

          {/* Top Left Title Area */}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
            <span className="text-lg font-bold text-slate-800 tracking-tight">Graph Relationship Visualization</span>
          </div>

          {/* Legend (Bottom Left) */}
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

          {/* Show Edge Labels Toggle (Bottom Right or below Top Right) */}
          <div className="absolute top-16 right-4 flex items-center gap-3 px-3 py-2 bg-white rounded-lg shadow-sm border border-slate-200 z-10">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={showEdgeLabels} onChange={(e) => setShowEdgeLabels(e.target.checked)} />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
              <span className="ml-3 text-sm font-medium text-slate-600">Show Edge Labels</span>
            </label>
          </div>

        </div>

        {/* Right Panel: Account Details (Preserved intact) */}
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
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow-sm border-2 ${
                    selectedNodeData.riskScore >= 80 ? 'bg-red-50 text-red-500 border-red-100' : 
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
                    <span className={`font-bold ${
                      selectedNodeData.riskScore >= 80 ? 'text-red-500' : 
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
                <p className="text-sm text-center font-medium">Detaylarını görmek için<br/>grafikteki bir düğüme tıklayın.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default NetworkAnalysis;
