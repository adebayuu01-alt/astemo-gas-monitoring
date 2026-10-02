import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

/**
 * Draw a rounded rectangle on Canvas
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
  if (width <= 0 || height <= 0) return;
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export default function DashboardBarChart({
  data = [],
  valueKey = 'consumption',
  labelKey = 'label',
  fullDateKey = 'fullDate',
  maxY = 150,
  yAxisLabels = ['150', '100', '50', '25', '0'],
  barColor = '#2196F3',
  hoverBarColor = '#1E88E5',
  unit = 'Nm³',
  zoomLevel = 1
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Show all Sumbu X labels completely from start to end of month
  const shouldShowLabel = useCallback((idx, total) => {
    return true;
  }, []);

  // Track container size using ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setCanvasSize({
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        });
      }
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);

    return () => ro.disconnect();
  }, [zoomLevel]);

  // Compute layout coordinates
  const layout = useMemo(() => {
    const { width, height } = canvasSize;
    if (width <= 0 || height <= 0) return null;

    // Generous padding so Y-axis labels have ample room and never get clipped
    const padLeft = 48;
    const padRight = 14;
    const padTop = 10;
    const padBottom = 22; // Room for X-axis labels below the baseline
    const baselineY = height - padBottom;
    const plotHeight = Math.max(10, baselineY - padTop);
    const plotWidth = Math.max(10, width - padLeft - padRight);

    const count = data.length;
    const colWidth = count > 0 ? plotWidth / count : plotWidth;

    // Desired gap between adjacent bars is 24px (user requested 24px gap instead of sparse wide spacing)
    const desiredGap = 24;
    const gap = Math.min(desiredGap, Math.max(4, colWidth - 8));
    const barW = Math.max(4, colWidth - gap);

    const bars = data.map((item, idx) => {
      const val = Number(item[valueKey]) || 0;
      const ratio = Math.max(0, Math.min(1, val / maxY));
      const barH = ratio * plotHeight;
      const colCenterX = padLeft + idx * colWidth + colWidth / 2;
      const barX = colCenterX - barW / 2;
      const barY = baselineY - barH;

      return {
        x: barX,
        y: barY,
        width: barW,
        height: barH,
        centerX: colCenterX,
        val,
        raw: item,
        idx
      };
    });

    return {
      width,
      height,
      padLeft,
      padRight,
      padTop,
      baselineY,
      plotHeight,
      plotWidth,
      colWidth,
      bars
    };
  }, [canvasSize, data, valueKey, maxY]);

  // Draw Bar Chart onto HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !layout) return;

    const { width, height, padLeft, padRight, padTop, baselineY, plotHeight, bars } = layout;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // 1. Horizontal Gridlines & Y-Axis Labels (Render ALL steps without missing gaps)
    const stepsCount = yAxisLabels.length;
    yAxisLabels.forEach((label, idx) => {
      // index 0 is top (max value), index stepsCount-1 is baseline (0)
      const ratio = stepsCount > 1 ? (stepsCount - 1 - idx) / (stepsCount - 1) : 0;
      const y = Number((baselineY - ratio * plotHeight).toFixed(1));

      // Horizontal gridline
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.strokeStyle = idx === stepsCount - 1 ? 'transparent' : '#F2F4F7';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Small Y tick notch protruding to the left
      ctx.beginPath();
      ctx.moveTo(padLeft - 4, y);
      ctx.lineTo(padLeft, y);
      ctx.strokeStyle = '#D0D5DD';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Y-axis label text
      ctx.fillStyle = '#98A2B3';
      ctx.font = '600 11px Inter, system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, padLeft - 7, y);
    });

    // 2. Cartesian Axes Lines
    // Vertical Y-axis Line
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, baselineY);
    ctx.strokeStyle = '#D0D5DD';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Horizontal Sumbu X Line (baseline)
    ctx.beginPath();
    ctx.moveTo(padLeft, baselineY);
    ctx.lineTo(width - padRight, baselineY);
    ctx.strokeStyle = '#D0D5DD';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 3. Draw Bars & Sumbu X Ticks/Labels
    const isDense = bars.length > 20;
    bars.forEach((bar, idx) => {
      const isHovered = hoveredIdx === idx;
      ctx.fillStyle = isHovered ? hoverBarColor : barColor;

      if (bar.height > 0) {
        drawRoundedRect(ctx, bar.x, bar.y, bar.width, bar.height, 4);
        ctx.fill();
      }

      // Sumbu X tick notch pointing downwards
      ctx.beginPath();
      ctx.moveTo(bar.centerX, baselineY);
      ctx.lineTo(bar.centerX, baselineY + 4);
      ctx.strokeStyle = '#D0D5DD';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Sumbu X label text below the line (Display ALL days from 01 to end of month)
      if (shouldShowLabel(idx, bars.length)) {
        ctx.fillStyle = isHovered ? '#1E232F' : '#667085';
        ctx.font = isHovered
          ? (isDense ? '700 9.5px Inter, system-ui, -apple-system, sans-serif' : '700 11px Inter, system-ui, -apple-system, sans-serif')
          : (isDense ? '500 9.5px Inter, system-ui, -apple-system, sans-serif' : '500 11px Inter, system-ui, -apple-system, sans-serif');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(bar.raw[labelKey] || '', bar.centerX, baselineY + 7);
      }
    });

    ctx.restore();
  }, [layout, barColor, hoverBarColor, yAxisLabels, labelKey, shouldShowLabel, hoveredIdx]);

  // Handle mouse move to find hovered bar and track cursor coordinates
  const handleMouseMove = (e) => {
    if (!layout || layout.bars.length === 0 || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setMousePos({ x: mouseX, y: mouseY });

    let closestIdx = 0;
    let minDist = Infinity;
    layout.bars.forEach((bar, idx) => {
      const dist = Math.abs(bar.centerX - mouseX);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });

    setHoveredIdx(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
  };

  const activeBar = hoveredIdx !== null && layout && layout.bars[hoveredIdx] ? layout.bars[hoveredIdx] : null;
  const isNearRightEdge = layout && mousePos.x > layout.width - 160;

  return (
    <div className="w-full h-full relative flex-1 min-h-0 select-none">
      {/* Scrollable Container (allows horizontal scroll when zoomLevel > 1) */}
      <div
        className={`w-full h-full relative ${
          zoomLevel > 1 ? 'overflow-x-auto chart-scrollbar pb-1' : 'overflow-hidden'
        }`}
      >
        <div
          ref={containerRef}
          className="h-full relative transition-[width] duration-300 ease-out"
          style={{
            width: `${zoomLevel * 100}%`,
            minWidth: '100%'
          }}
        >
          {/* HTML5 Canvas Element */}
          <canvas
            ref={canvasRef}
            className="block w-full h-full cursor-pointer"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />

          {/* Interactive Tooltip positioned to the right of cursor */}
          {activeBar && layout && (
            <div
              className="absolute z-30 pointer-events-none transition-all duration-75 ease-out"
              style={{
                left: `${mousePos.x}px`,
                top: `${Math.max(45, Math.min(layout.height - 45, mousePos.y))}px`,
                transform: isNearRightEdge
                  ? 'translate(calc(-100% - 14px), -50%)'
                  : 'translate(14px, -50%)'
              }}
            >
              <div className="relative bg-white rounded-xl shadow-xl border border-gray-100 p-2.5 min-w-[140px] select-none">
                {/* Triangular pointer notch pointing towards cursor */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rotate-45 border-gray-100 ${
                    isNearRightEdge ? '-right-1.5 border-r border-t' : '-left-1.5 border-l border-b'
                  }`}
                />

                {/* Tooltip Header Title */}
                <div className="text-[11px] font-bold text-[#1E232F] text-center pb-1.5 border-b border-gray-100 tracking-tight">
                  {activeBar.raw[fullDateKey] || activeBar.raw[labelKey]}
                </div>

                {/* Tooltip Row */}
                <div className="pt-1.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#2196F3] shrink-0" />
                    <span className="text-gray-600 font-medium">Consumption</span>
                  </div>
                  <span className="font-bold text-[#1E232F]">{activeBar.val} {unit}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
