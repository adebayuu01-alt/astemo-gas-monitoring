import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

/**
 * Convert Hex color string to rgba string for Canvas gradients
 */
function hexToRgba(hex, alpha) {
  const cleanHex = hex.replace('#', '');
  let r, g, b;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Catmull-Rom to Cubic Bezier conversion for silky-smooth chart lines on Canvas
 */
function drawSmoothCurve(ctx, points) {
  if (!points || points.length === 0) return;
  if (points.length === 1) {
    ctx.moveTo(points[0].x, points[0].y);
    return;
  }

  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
}

export default function DashboardLineChart({
  data = [],
  valueKey = 'value',
  labelKey = 'label',
  fullDateKey = 'fullDate',
  warningValue,
  criticalValue,
  minY = 0,
  maxY = 12000,
  yAxisLabels = ['12000', '9000', '6000', '3000', '0'],
  lineColor = '#00A854',
  unit = 'Nm²',
  zoomLevel = 1,
  valueLabel = 'Value'
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Show all Sumbu X labels completely from start to end of month
  const shouldShowLabel = useCallback((idx, total) => {
    return true;
  }, []);

  // Track container size using ResizeObserver to ensure 100% responsive fit
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
    const padBottom = 22;
    const baselineY = height - padBottom;
    const plotHeight = Math.max(10, baselineY - padTop);
    const plotWidth = Math.max(10, width - padLeft - padRight);

    const count = data.length;
    const points = data.map((item, idx) => {
      const val = Number(item[valueKey]) || 0;
      const x = count === 1 ? padLeft + plotWidth / 2 : padLeft + (idx / (count - 1)) * plotWidth;
      const ratio = Math.max(0, Math.min(1, (val - minY) / (maxY - minY)));
      const y = baselineY - ratio * plotHeight;

      return {
        x: Number(x.toFixed(1)),
        y: Number(y.toFixed(1)),
        val,
        raw: item,
        idx
      };
    });

    const warningY =
      warningValue !== undefined && warningValue !== null
        ? Number((baselineY - Math.max(0, Math.min(1, (warningValue - minY) / (maxY - minY))) * plotHeight).toFixed(1))
        : null;

    const criticalY =
      criticalValue !== undefined && criticalValue !== null
        ? Number((baselineY - Math.max(0, Math.min(1, (criticalValue - minY) / (maxY - minY))) * plotHeight).toFixed(1))
        : null;

    return {
      width,
      height,
      padLeft,
      padRight,
      padTop,
      baselineY,
      plotHeight,
      plotWidth,
      points,
      warningY,
      criticalY
    };
  }, [canvasSize, data, valueKey, minY, maxY, warningValue, criticalValue]);

  // Draw chart onto HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !layout) return;

    const { width, height, padLeft, padRight, padTop, baselineY, plotHeight, points, warningY, criticalY } = layout;

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
      const step = stepsCount > 1 ? idx / (stepsCount - 1) : 0;
      const y = Number((padTop + step * plotHeight).toFixed(1));

      // Gridline
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

    // 2. Vertical Gridlines & X-axis Ticks & Labels
    const isDense = points.length > 20;
    points.forEach((pt, idx) => {
      // Vertical gridline
      ctx.beginPath();
      ctx.moveTo(pt.x, padTop);
      ctx.lineTo(pt.x, baselineY);
      ctx.strokeStyle = '#F8F9FA';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Tick notch protruding downwards from baseline
      ctx.beginPath();
      ctx.moveTo(pt.x, baselineY);
      ctx.lineTo(pt.x, baselineY + 4);
      ctx.strokeStyle = '#D0D5DD';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // X-axis label text (Display ALL days completely from start to end of month)
      if (shouldShowLabel(idx, points.length)) {
        const isHovered = hoveredIdx === idx;
        ctx.fillStyle = isHovered ? '#1E232F' : '#667085';
        ctx.font = isHovered
          ? (isDense ? '700 9.5px Inter, system-ui, -apple-system, sans-serif' : '700 11px Inter, system-ui, -apple-system, sans-serif')
          : (isDense ? '500 9.5px Inter, system-ui, -apple-system, sans-serif' : '500 11px Inter, system-ui, -apple-system, sans-serif');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(pt.raw[labelKey] || '', pt.x, baselineY + 7);
      }
    });

    // 3. Distinct Cartesian Axes Lines
    // Vertical Y-axis Line
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, baselineY);
    ctx.strokeStyle = '#D0D5DD';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Horizontal X-axis Line (baseline)
    ctx.beginPath();
    ctx.moveTo(padLeft, baselineY);
    ctx.lineTo(width - padRight, baselineY);
    ctx.strokeStyle = '#D0D5DD';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 4. Threshold Lines
    // Warning Line (Yellow dashed)
    if (warningY !== null) {
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([4, 3]);
      ctx.moveTo(padLeft, warningY);
      ctx.lineTo(width - padRight, warningY);
      ctx.strokeStyle = '#FFC30F';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // Critical Line (Red dashed)
    if (criticalY !== null) {
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([4, 3]);
      ctx.moveTo(padLeft, criticalY);
      ctx.lineTo(width - padRight, criticalY);
      ctx.strokeStyle = '#F04438';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // 5. Area Fill Under Curve
    if (points.length >= 2) {
      ctx.save();
      ctx.beginPath();
      drawSmoothCurve(ctx, points);
      ctx.lineTo(points[points.length - 1].x, baselineY);
      ctx.lineTo(points[0].x, baselineY);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, padTop, 0, baselineY);
      grad.addColorStop(0, hexToRgba(lineColor, 0.22));
      grad.addColorStop(1, hexToRgba(lineColor, 0.0));
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }

    // 6. Smooth Curve Line
    if (points.length >= 2) {
      ctx.save();
      ctx.beginPath();
      drawSmoothCurve(ctx, points);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();
    }

    // 7. Active Hover Guideline & Crosshair Dot
    if (hoveredIdx !== null && points[hoveredIdx]) {
      const activePoint = points[hoveredIdx];

      // Vertical guideline
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.moveTo(activePoint.x, padTop);
      ctx.lineTo(activePoint.x, baselineY);
      ctx.strokeStyle = '#475467';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Glowing data point circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(activePoint.x, activePoint.y, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }, [layout, lineColor, yAxisLabels, labelKey, shouldShowLabel, hoveredIdx]);

  // Handle mouse move to find closest data point
  const handleMouseMove = (e) => {
    if (!layout || layout.points.length === 0 || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    let closestIdx = 0;
    let minDist = Infinity;
    layout.points.forEach((pt, idx) => {
      const dist = Math.abs(pt.x - mouseX);
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

  const activePoint = hoveredIdx !== null && layout && layout.points[hoveredIdx] ? layout.points[hoveredIdx] : null;

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
            className="block w-full h-full cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />

          {/* Interactive Tooltip matching Figma Mockup */}
          {activePoint && layout && (
            <div
              className="absolute z-30 pointer-events-none transition-all duration-75 ease-out"
              style={{
                left: `${activePoint.x}px`,
                top: `${activePoint.y}px`,
                transform:
                  activePoint.x > layout.width * 0.7
                    ? 'translate(calc(-100% - 12px), -50%)'
                    : 'translate(12px, -50%)'
              }}
            >
              <div className="relative bg-white rounded-xl shadow-xl border border-gray-100 p-3 min-w-[190px] select-none">
                {/* Triangular Arrow Pointer pointing to data point */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rotate-45 border-gray-100 ${
                    activePoint.x > layout.width * 0.7
                      ? '-right-1.5 border-r border-t'
                      : '-left-1.5 border-l border-b'
                  }`}
                />

                {/* Tooltip Header Title (Centered) */}
                <div className="text-xs font-bold text-[#1E232F] text-center pb-2 border-b border-gray-100 tracking-tight">
                  {activePoint.raw[fullDateKey] || activePoint.raw[labelKey]}
                </div>

                {/* Tooltip Rows */}
                <div className="pt-2 space-y-2 text-xs">
                  {/* Row 1: Critical Threshold */}
                  {criticalValue !== undefined && criticalValue !== null && (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F04438] shrink-0" />
                        <span className="text-gray-600 font-medium">Critical</span>
                      </div>
                      <span className="font-bold text-[#1E232F]">
                        {typeof criticalValue === 'number' ? criticalValue.toLocaleString('id-ID') : criticalValue} {unit}
                      </span>
                    </div>
                  )}

                  {/* Row 2: Warning Threshold */}
                  {warningValue !== undefined && warningValue !== null && (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FFC30F] shrink-0" />
                        <span className="text-gray-600 font-medium">Warning</span>
                      </div>
                      <span className="font-bold text-[#1E232F]">
                        {typeof warningValue === 'number' ? warningValue.toLocaleString('id-ID') : warningValue} {unit}
                      </span>
                    </div>
                  )}

                  {/* Row 3: Actual Value */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: lineColor }} />
                      <span className="text-gray-600 font-medium">{valueLabel}</span>
                    </div>
                    <span className="font-bold text-[#1E232F]">
                      {typeof activePoint.val === 'number' ? activePoint.val.toLocaleString('id-ID') : activePoint.val} {unit}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
