import { describe, it, expect } from 'vitest';
import { computeBoundingViewBox } from '../src/utils/viewBox';

describe('Auto-Fit ViewBox Calculation Suite', () => {
  it('handles empty nodes array gracefully', () => {
    const result = computeBoundingViewBox([]);
    expect(result.width).toBeGreaterThanOrEqual(400);
    expect(result.height).toBeGreaterThanOrEqual(300);
    expect(result.viewBox).toBe(`0 0 ${result.width} ${result.height}`);
  });

  it('guarantees every node with radius included lies strictly inside computed viewBox for 200+ random node sets', () => {
    for (let testIdx = 0; testIdx < 250; testIdx++) {
      const nodeCount = Math.floor(Math.random() * 25) + 1; // 1 to 25 nodes
      const radius = Math.floor(Math.random() * 20) + 15; // 15 to 34 px
      const padding = Math.floor(Math.random() * 30) + 20; // 20 to 49 px

      const nodes: { x: number; y: number }[] = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.floor(Math.random() * 2000) - 500, // Range -500 to 1500
          y: Math.floor(Math.random() * 2000) - 500,
        });
      }

      const result = computeBoundingViewBox(nodes, {
        padding,
        nodeRadius: radius,
        zoom: 1,
      });

      // Assert viewBox string matches numerical results
      const parts = result.viewBox.split(' ').map(Number);
      expect(parts).toHaveLength(4);
      expect(parts[0]).toBe(result.minX);
      expect(parts[1]).toBe(result.minY);
      expect(parts[2]).toBe(result.width);
      expect(parts[3]).toBe(result.height);

      // Assert that for EVERY node, its full circular boundary [x - r, x + r] and [y - r, y + r]
      // lies strictly within [minX, minX + width] and [minY, minY + height]
      for (const n of nodes) {
        const nodeLeft = n.x - radius;
        const nodeRight = n.x + radius;
        const nodeTop = n.y - radius;
        const nodeBottom = n.y + radius;

        expect(nodeLeft).toBeGreaterThanOrEqual(result.minX);
        expect(nodeRight).toBeLessThanOrEqual(result.minX + result.width);
        expect(nodeTop).toBeGreaterThanOrEqual(result.minY);
        expect(nodeBottom).toBeLessThanOrEqual(result.minY + result.height);
      }
    }
  });

  it('supports zooming out without clipping any nodes', () => {
    const nodes = [
      { x: 100, y: 100 },
      { x: 800, y: 600 },
    ];
    const radius = 25;
    const zoomedOut = computeBoundingViewBox(nodes, { nodeRadius: radius, zoom: 0.75 });

    for (const n of nodes) {
      expect(n.x - radius).toBeGreaterThanOrEqual(zoomedOut.minX);
      expect(n.x + radius).toBeLessThanOrEqual(zoomedOut.minX + zoomedOut.width);
      expect(n.y - radius).toBeGreaterThanOrEqual(zoomedOut.minY);
      expect(n.y + radius).toBeLessThanOrEqual(zoomedOut.minY + zoomedOut.height);
    }
  });

  it('guarantees all 5 presets in sampleGraphs are fully inside viewBox with at least 40px padding', async () => {
    const { sampleGraphs } = await import('../src/algorithms/graphs/sampleGraphs');

    for (const [key, preset] of Object.entries(sampleGraphs)) {
      const nodes = preset.data.nodes;
      const result = computeBoundingViewBox(nodes, {
        padding: 40,
        nodeRadius: 34, // includes dist: labels
        minWidth: 460,
        minHeight: 260,
      });

      for (const n of nodes) {
        // Node circle and badges must be strictly inside viewBox
        expect(n.x - 34).toBeGreaterThanOrEqual(result.minX);
        expect(n.x + 34).toBeLessThanOrEqual(result.minX + result.width);
        expect(n.y - 34).toBeGreaterThanOrEqual(result.minY);
        expect(n.y + 34).toBeLessThanOrEqual(result.minY + result.height);
      }

      // In particular, for dijkstraRoadmap, check bottom nodes C and E
      if (key === 'dijkstraRoadmap') {
        const nodeC = nodes.find((n) => n.id === 'C')!;
        const nodeE = nodes.find((n) => n.id === 'E')!;
        expect(nodeC.y + 34).toBeLessThanOrEqual(result.minY + result.height - 40);
        expect(nodeE.y + 34).toBeLessThanOrEqual(result.minY + result.height - 40);
      }
    }
  });

  it('supports pan offsets correctly', () => {
    const nodes = [{ x: 100, y: 100 }, { x: 300, y: 300 }];
    const base = computeBoundingViewBox(nodes, { zoom: 1, panX: 0, panY: 0 });
    const panned = computeBoundingViewBox(nodes, { zoom: 1, panX: 50, panY: -30 });

    expect(panned.minX).toBe(base.minX + 50);
    expect(panned.minY).toBe(base.minY - 30);
    expect(panned.width).toBe(base.width);
    expect(panned.height).toBe(base.height);
  });
});
