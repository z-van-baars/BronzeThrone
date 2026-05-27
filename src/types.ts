export enum TerrainType {
  Grass = 'grass',
  Water = 'water',
  Forest = 'forest',
  Stone = 'stone',
  Sand = 'sand',
  Hill = 'hill',
}

export enum SubstrateLayer {
  Security = 'security',
  Prosperity = 'prosperity',
  Piety = 'piety',
  Industry = 'industry',
  Sustenance = 'sustenance',
  Culture = 'culture',
}

export enum ResourceType {
  Food = 'food',
  Timber = 'timber',
  Stone = 'stone',
  Bronze = 'bronze',
  Wealth = 'wealth',
}

export enum CitizenTier {
  Laborer = 'laborer',
  Craftsman = 'craftsman',
  Merchant = 'merchant',
  Priest = 'priest',
  Warrior = 'warrior',
  Elite = 'elite',
}

export interface GridCell {
  x: number;
  y: number;
  terrain: TerrainType;
  buildingId: string | null;
  substrate: Record<SubstrateLayer, number>;
}

export interface SubstrateEmission {
  layer: SubstrateLayer;
  strength: number;
  radius: number;
}

export interface BuildingDef {
  id: string;
  name: string;
  footprint: { w: number; h: number };
  emissions: SubstrateEmission[];
  suppressions: SubstrateEmission[];
  resourceCost: Partial<Record<ResourceType, number>>;
  resourceProduction: Partial<Record<ResourceType, number>>;
  resourceConsumption: Partial<Record<ResourceType, number>>;
  tier: number;
  prerequisites: string[];
  color: number;
}

export interface BuildingInstance {
  id: string;
  defId: string;
  x: number;
  y: number;
  intensity: number; // 0.5 to 1.2
}

export const TERRAIN_COLORS: Record<TerrainType, number> = {
  [TerrainType.Grass]: 0x6b8e4e,
  [TerrainType.Water]: 0x3a6ea5,
  [TerrainType.Forest]: 0x3d5e2a,
  [TerrainType.Stone]: 0x8a8a8a,
  [TerrainType.Sand]: 0xc2b280,
  [TerrainType.Hill]: 0x7a7a5a,
};

export const TERRAIN_PASSABLE: Record<TerrainType, boolean> = {
  [TerrainType.Grass]: true,
  [TerrainType.Water]: false,
  [TerrainType.Forest]: true,
  [TerrainType.Stone]: true,
  [TerrainType.Sand]: true,
  [TerrainType.Hill]: true,
};

export const SUBSTRATE_COLORS: Record<SubstrateLayer, number> = {
  [SubstrateLayer.Security]: 0xff4444,
  [SubstrateLayer.Prosperity]: 0xffd700,
  [SubstrateLayer.Piety]: 0xcc66ff,
  [SubstrateLayer.Industry]: 0xff8c00,
  [SubstrateLayer.Sustenance]: 0x44cc44,
  [SubstrateLayer.Culture]: 0x4488ff,
};

export const RESOURCE_COLORS: Record<ResourceType, string> = {
  [ResourceType.Food]: '#44cc44',
  [ResourceType.Timber]: '#8B4513',
  [ResourceType.Stone]: '#8a8a8a',
  [ResourceType.Bronze]: '#cd7f32',
  [ResourceType.Wealth]: '#ffd700',
};

export const RESOURCE_LABELS: Record<ResourceType, string> = {
  [ResourceType.Food]: 'Food',
  [ResourceType.Timber]: 'Timber',
  [ResourceType.Stone]: 'Stone',
  [ResourceType.Bronze]: 'Bronze',
  [ResourceType.Wealth]: 'Wealth',
};
