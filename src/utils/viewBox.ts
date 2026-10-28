export interface BoundingBoxOptions {
  padding?: number;
  nodeRadius?: number;
  minWidth?: number;
  minHeight?: number;
  zoom?: number;
  panX?: number;
  panY?: number;
}

export interface ViewBoxResult {
  minX: number;
  minY: number;
  width: number;
  height: number;
  viewBox: string;
}

/**
 * Computes an SVG viewBox that guarantees every node (radius included) + padding
 * lies completely inside the visible viewport, centered.
 */
export function computeBoundingViewBox(
  nodes: { x: number; y: number }[],
  options: BoundingBoxOptions = {}
): ViewBoxResult {
  const padding = options.padding ?? 40;
  const nodeRadius = options.nodeRadius ?? 26;
  const minWidth = options.minWidth ?? 400;
  const minHeight = options.minHeight ?? 300;
  const zoom = options.zoom ?? 1;
  const panX = options.panX ?? 0;
  const panY = options.panY ?? 0;

  if (!nodes || nodes.length === 0) {
    return {
      minX: 0,
      minY: 0,
      width: minWidth,
      height: minHeight,
      viewBox: `0 0 ${minWidth} ${minHeight}`,
    };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const n of nodes) {
    if (typeof n.x === 'number' && !isNaN(n.x)) {
      minX = Math.min(minX, n.x - nodeRadius);
      maxX = Math.max(maxX, n.x + nodeRadius);
    }
    if (typeof n.y === 'number' && !isNaN(n.y)) {
      minY = Math.min(minY, n.y - nodeRadius);
      maxY = Math.max(maxY, n.y + nodeRadius);
    }
  }

  if (!isFinite(minX) || !isFinite(maxX) || !isFinite(minY) || !isFinite(maxY)) {
    return {
      minX: 0,
      minY: 0,
      width: minWidth,
      height: minHeight,
      viewBox: `0 0 ${minWidth} ${minHeight}`,
    };
  }

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;

  const paddedWidth = contentWidth + 2 * padding;
  const paddedHeight = contentHeight + 2 * padding;

  const baseWidth = Math.max(minWidth, paddedWidth);
  const baseHeight = Math.max(minHeight, paddedHeight);

  // Center coordinate of all nodes
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  // Apply zoom factor (zoom < 1 zooms out, zoom > 1 zooms in)
  const safeZoom = Math.max(0.1, zoom);
  const zoomedWidth = baseWidth / safeZoom;
  const zoomedHeight = baseHeight / safeZoom;

  const finalMinX = centerX + panX - zoomedWidth / 2;
  const finalMinY = centerY + panY - zoomedHeight / 2;

  return {
    minX: Math.round(finalMinX),
    minY: Math.round(finalMinY),
    width: Math.round(zoomedWidth),
    height: Math.round(zoomedHeight),
    viewBox: `${Math.round(finalMinX)} ${Math.round(finalMinY)} ${Math.round(zoomedWidth)} ${Math.round(zoomedHeight)}`,
  };
}
