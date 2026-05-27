import { BuildingDef, ResourceType, SubstrateLayer } from '../types';

export const BUILDING_DEFS: Record<string, BuildingDef> = {
  settlers_camp: {
    id: 'settlers_camp',
    name: "Settler's Camp",
    footprint: { w: 2, h: 2 },
    emissions: [
      { layer: SubstrateLayer.Sustenance, strength: 4, radius: 8 },
      { layer: SubstrateLayer.Prosperity, strength: 2, radius: 5 },
    ],
    suppressions: [],
    resourceCost: {},
    resourceProduction: {
      [ResourceType.Food]: 2,
      [ResourceType.Timber]: 1,
    },
    resourceConsumption: {},
    tier: 0,
    prerequisites: [],
    color: 0xc9a86c,
  },

  farm: {
    id: 'farm',
    name: 'Farm',
    footprint: { w: 2, h: 2 },
    emissions: [
      { layer: SubstrateLayer.Sustenance, strength: 6, radius: 6 },
    ],
    suppressions: [],
    resourceCost: { [ResourceType.Timber]: 10 },
    resourceProduction: { [ResourceType.Food]: 5 },
    resourceConsumption: {},
    tier: 1,
    prerequisites: ['settlers_camp'],
    color: 0x8db856,
  },

  lumber_camp: {
    id: 'lumber_camp',
    name: 'Lumber Camp',
    footprint: { w: 1, h: 1 },
    emissions: [
      { layer: SubstrateLayer.Industry, strength: 3, radius: 5 },
    ],
    suppressions: [
      { layer: SubstrateLayer.Prosperity, strength: 2, radius: 4 },
    ],
    resourceCost: { [ResourceType.Timber]: 5 },
    resourceProduction: { [ResourceType.Timber]: 4 },
    resourceConsumption: {},
    tier: 1,
    prerequisites: ['settlers_camp'],
    color: 0x6b4226,
  },

  clay_pit: {
    id: 'clay_pit',
    name: 'Clay Pit',
    footprint: { w: 1, h: 1 },
    emissions: [
      { layer: SubstrateLayer.Industry, strength: 2, radius: 4 },
    ],
    suppressions: [
      { layer: SubstrateLayer.Prosperity, strength: 1, radius: 3 },
    ],
    resourceCost: { [ResourceType.Timber]: 8 },
    resourceProduction: { [ResourceType.Stone]: 3 },
    resourceConsumption: {},
    tier: 1,
    prerequisites: ['settlers_camp'],
    color: 0xa0725a,
  },
};
