import { Grid } from './Grid';
import { TerrainType } from '../types';

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function smoothNoise(
  width: number, height: number, scale: number, rand: () => number,
): number[][] {
  const noise: number[][] = [];
  const baseW = Math.ceil(width / scale) + 2;
  const baseH = Math.ceil(height / scale) + 2;
  const base: number[][] = [];

  for (let y = 0; y < baseH; y++) {
    base[y] = [];
    for (let x = 0; x < baseW; x++) {
      base[y][x] = rand();
    }
  }

  for (let y = 0; y < height; y++) {
    noise[y] = [];
    for (let x = 0; x < width; x++) {
      const fx = x / scale;
      const fy = y / scale;
      const ix = Math.floor(fx);
      const iy = Math.floor(fy);
      const dx = fx - ix;
      const dy = fy - iy;

      const tl = base[iy][ix];
      const tr = base[iy][ix + 1];
      const bl = base[iy + 1][ix];
      const br = base[iy + 1][ix + 1];

      const top = tl + (tr - tl) * dx;
      const bot = bl + (br - bl) * dx;
      noise[y][x] = top + (bot - top) * dy;
    }
  }
  return noise;
}

export function generateMap(grid: Grid, seed?: number): void {
  const rand = seededRandom(seed ?? (Date.now() & 0xffffffff));

  const elevation = smoothNoise(grid.width, grid.height, 12, rand);
  const moisture = smoothNoise(grid.width, grid.height, 10, rand);
  const detail = smoothNoise(grid.width, grid.height, 4, rand);

  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const e = elevation[y][x] * 0.6 + detail[y][x] * 0.4;
      const m = moisture[y][x];

      let terrain: TerrainType;
      if (e < 0.28) {
        terrain = TerrainType.Water;
      } else if (e < 0.35) {
        terrain = TerrainType.Sand;
      } else if (e > 0.78) {
        terrain = TerrainType.Hill;
      } else if (e > 0.68 && m < 0.4) {
        terrain = TerrainType.Stone;
      } else if (m > 0.55 && e < 0.65) {
        terrain = TerrainType.Forest;
      } else {
        terrain = TerrainType.Grass;
      }

      grid.setTerrain(x, y, terrain);
    }
  }
}
