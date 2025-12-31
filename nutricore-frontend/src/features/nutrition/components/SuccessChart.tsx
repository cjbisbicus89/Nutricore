import React from 'react';

export const SuccessChart = ({ data }: { data: any[] }) => {
 
  if (!data || data.length < 2) {
    return (
      <div style={{ 
        height: '100%', width: '100%', display: 'flex', alignItems: 'center', 
        justifyContent: 'center', color: '#94A3B8', border: '2px dashed #E2E8F0', borderRadius: '20px' 
      }}>
        <p style={{ fontSize: '13px' }}>Esperando registros para trazar tendencia...</p>
      </div>
    );
  }

  
  const weights = data.map(d => d.weight || d.currentWeight || 0).reverse();
  const maxW = Math.max(...weights);
  const minW = Math.min(...weights);
  const range = maxW - minW || 1;


  const width = 1000;
  const height = 400;
  const padding = 40;


  const points = weights.map((w, i) => {
    const x = padding + (i / (weights.length - 1)) * (width - padding * 2);
    const y = height - padding - ((w - minW) / range) * (height - padding * 2);
    return { x, y, val: w };
  });


  const linePath = points.reduce((acc, p, i, a) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const prev = a[i - 1];
    const cp1x = prev.x + (p.x - prev.x) / 2;
    return `${acc} C ${cp1x},${prev.y} ${cp1x},${p.y} ${p.x},${p.y}`;
  }, "");

 
  const areaPath = `${linePath} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00C2A0" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00C2A0" stopOpacity="0" />
          </linearGradient>
        </defs>

   
        {[0, 0.5, 1].map((m, i) => (
          <line 
            key={i}
            x1={padding} 
            y1={padding + (height - padding * 2) * m} 
            x2={width - padding} 
            y2={padding + (height - padding * 2) * m} 
            stroke="#F1F5F9" 
            strokeWidth="2" 
          />
        ))}

    
        <path d={areaPath} fill="url(#areaGradient)" />

      
        <path 
          d={linePath} 
          fill="none" 
          stroke="#00C2A0" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

     
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="8" fill="#fff" stroke="#00C2A0" strokeWidth="4" />
           
            <text 
              x={p.x} 
              y={p.y - 20} 
              textAnchor="middle" 
              style={{ fontSize: '24px', fontWeight: 'bold', fill: '#1A2332', fontFamily: 'sans-serif' }}
            >
              {p.val}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};