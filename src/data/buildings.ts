import { BuildingDef, ResourceType, SubstrateLayer } from '../types';

export const BUILDING_DEFS: Record<string, BuildingDef> = {
  // === TIER 0 — Founding ===
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

  // === TIER 1 — Settlement ===
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

  well: {
    id: 'well',
    name: 'Well',
    footprint: { w: 1, h: 1 },
    emissions: [
      { layer: SubstrateLayer.Sustenance, strength: 3, radius: 4 },
    ],
    suppressions: [],
    resourceCost: { [ResourceType.Timber]: 5, [ResourceType.Stone]: 3 },
    resourceProduction: {},
    resourceConsumption: {},
    tier: 1,
    prerequisites: ['settlers_camp'],
    color: 0x5599bb,
  },

  pasture: {
    id: 'pasture',
    name: 'Pasture',
    footprint: { w: 3, h: 2 },
    emissions: [
      { layer: SubstrateLayer.Sustenance, strength: 5, radius: 5 },
    ],
    suppressions: [
      { layer: SubstrateLayer.Culture, strength: 1, radius: 3 },
    ],
    resourceCost: { [ResourceType.Timber]: 12 },
    resourceProduction: { [ResourceType.Food]: 4 },
    resourceConsumption: {},
    tier: 1,
    prerequisites: ['settlers_camp'],
    color: 0x9ab86e,
  },

  simple_shrine: {
    id: 'simple_shrine',
    name: 'Simple Shrine',
    footprint: { w: 1, h: 1 },
    emissions: [
      { layer: SubstrateLayer.Piety, strength: 4, radius: 6 },
      { layer: SubstrateLayer.Culture, strength: 1, radius: 3 },
    ],
    suppressions: [],
    resourceCost: { [ResourceType.Timber]: 8, [ResourceType.Stone]: 5 },
    resourceProduction: {},
    resourceConsumption: {},
    tier: 1,
    prerequisites: ['settlers_camp'],
    color: 0xccaaff,
  },

  palisade: {
    id: 'palisade',
    name: 'Palisade Wall',
    footprint: { w: 1, h: 1 },
    emissions: [
      { layer: SubstrateLayer.Security, strength: 3, radius: 4 },
    ],
    suppressions: [],
    resourceCost: { [ResourceType.Timber]: 6 },
    resourceProduction: {},
    resourceConsumption: {},
    tier: 1,
    prerequisites: ['settlers_camp'],
    color: 0x8b7355,
  },

  // === TIER 2 — Village ===
  stone_quarry: {
    id: 'stone_quarry',
    name: 'Stone Quarry',
    footprint: { w: 2, h: 2 },
    emissions: [
      { layer: SubstrateLayer.Industry, strength: 4, radius: 5 },
    ],
    suppressions: [
      { layer: SubstrateLayer.Prosperity, strength: 3, radius: 5 },
      { layer: SubstrateLayer.Sustenance, strength: 1, radius: 3 },
    ],
    resourceCost: { [ResourceType.Timber]: 15, [ResourceType.Stone]: 5 },
    resourceProduction: { [ResourceType.Stone]: 6 },
    resourceConsumption: {},
    tier: 2,
    prerequisites: ['clay_pit'],
    color: 0x777777,
  },

  granary: {
    id: 'granary',
    name: 'Granary',
    footprint: { w: 2, h: 1 },
    emissions: [
      { layer: SubstrateLayer.Sustenance, strength: 4, radius: 7 },
      { layer: SubstrateLayer.Prosperity, strength: 1, radius: 4 },
    ],
    suppressions: [],
    resourceCost: { [ResourceType.Timber]: 12, [ResourceType.Stone]: 8 },
    resourceProduction: { [ResourceType.Food]: 2 },
    resourceConsumption: {},
    tier: 2,
    prerequisites: ['farm'],
    color: 0xddb866,
  },

  market: {
    id: 'market',
    name: 'Market',
    footprint: { w: 2, h: 2 },
    emissions: [
      { layer: SubstrateLayer.Prosperity, strength: 6, radius: 8 },
      { layer: SubstrateLayer.Culture, strength: 2, radius: 5 },
    ],
    suppressions: [],
    resourceCost: { [ResourceType.Timber]: 15, [ResourceType.Stone]: 10 },
    resourceProduction: { [ResourceType.Wealth]: 2 },
    resourceConsumption: { [ResourceType.Food]: 1 },
    tier: 2,
    prerequisites: ['farm', 'clay_pit'],
    color: 0xe8c44a,
  },

  potters_workshop: {
    id: 'potters_workshop',
    name: "Potter's Workshop",
    footprint: { w: 1, h: 1 },
    emissions: [
      { layer: SubstrateLayer.Industry, strength: 4, radius: 4 },
    ],
    suppressions: [
      { layer: SubstrateLayer.Prosperity, strength: 2, radius: 3 },
    ],
    resourceCost: { [ResourceType.Timber]: 10, [ResourceType.Stone]: 8 },
    resourceProduction: { [ResourceType.Wealth]: 1 },
    resourceConsumption: { [ResourceType.Stone]: 1 },
    tier: 2,
    prerequisites: ['clay_pit'],
    color: 0xb87333,
  },

  weavers_hut: {
    id: 'weavers_hut',
    name: "Weaver's Hut",
    footprint: { w: 1, h: 1 },
    emissions: [
      { layer: SubstrateLayer.Industry, strength: 3, radius: 4 },
      { layer: SubstrateLayer.Prosperity, strength: 1, radius: 3 },
    ],
    suppressions: [],
    resourceCost: { [ResourceType.Timber]: 10, [ResourceType.Stone]: 5 },
    resourceProduction: { [ResourceType.Wealth]: 1 },
    resourceConsumption: {},
    tier: 2,
    prerequisites: ['pasture'],
    color: 0xc4a882,
  },

  watchtower: {
    id: 'watchtower',
    name: 'Watchtower',
    footprint: { w: 1, h: 1 },
    emissions: [
      { layer: SubstrateLayer.Security, strength: 5, radius: 7 },
    ],
    suppressions: [],
    resourceCost: { [ResourceType.Timber]: 10, [ResourceType.Stone]: 10 },
    resourceProduction: {},
    resourceConsumption: {},
    tier: 2,
    prerequisites: ['palisade'],
    color: 0x996644,
  },

  barracks: {
    id: 'barracks',
    name: 'Barracks',
    footprint: { w: 2, h: 2 },
    emissions: [
      { layer: SubstrateLayer.Security, strength: 6, radius: 8 },
    ],
    suppressions: [
      { layer: SubstrateLayer.Prosperity, strength: 2, radius: 4 },
      { layer: SubstrateLayer.Piety, strength: 1, radius: 3 },
    ],
    resourceCost: { [ResourceType.Timber]: 20, [ResourceType.Stone]: 15 },
    resourceProduction: {},
    resourceConsumption: { [ResourceType.Food]: 3, [ResourceType.Bronze]: 1 },
    tier: 2,
    prerequisites: ['palisade'],
    color: 0xaa3333,
  },

  // === TIER 3 — Town ===
  temple: {
    id: 'temple',
    name: 'Temple',
    footprint: { w: 2, h: 2 },
    emissions: [
      { layer: SubstrateLayer.Piety, strength: 8, radius: 10 },
      { layer: SubstrateLayer.Culture, strength: 4, radius: 7 },
    ],
    suppressions: [],
    resourceCost: { [ResourceType.Stone]: 30, [ResourceType.Timber]: 15, [ResourceType.Wealth]: 10 },
    resourceProduction: {},
    resourceConsumption: { [ResourceType.Wealth]: 2 },
    tier: 3,
    prerequisites: ['simple_shrine', 'market'],
    color: 0xbb88ee,
  },

  bronze_smithy: {
    id: 'bronze_smithy',
    name: 'Bronze Smithy',
    footprint: { w: 2, h: 1 },
    emissions: [
      { layer: SubstrateLayer.Industry, strength: 6, radius: 6 },
    ],
    suppressions: [
      { layer: SubstrateLayer.Prosperity, strength: 3, radius: 5 },
      { layer: SubstrateLayer.Sustenance, strength: 2, radius: 3 },
    ],
    resourceCost: { [ResourceType.Stone]: 20, [ResourceType.Timber]: 15 },
    resourceProduction: { [ResourceType.Bronze]: 3 },
    resourceConsumption: { [ResourceType.Timber]: 2 },
    tier: 3,
    prerequisites: ['stone_quarry', 'potters_workshop'],
    color: 0xcd7f32,
  },

  scribal_school: {
    id: 'scribal_school',
    name: 'Scribal School',
    footprint: { w: 1, h: 1 },
    emissions: [
      { layer: SubstrateLayer.Culture, strength: 6, radius: 7 },
      { layer: SubstrateLayer.Prosperity, strength: 2, radius: 4 },
    ],
    suppressions: [],
    resourceCost: { [ResourceType.Stone]: 15, [ResourceType.Timber]: 10, [ResourceType.Wealth]: 5 },
    resourceProduction: {},
    resourceConsumption: { [ResourceType.Wealth]: 1 },
    tier: 3,
    prerequisites: ['market'],
    color: 0x4488cc,
  },

  stone_wall: {
    id: 'stone_wall',
    name: 'Stone Wall',
    footprint: { w: 1, h: 1 },
    emissions: [
      { layer: SubstrateLayer.Security, strength: 5, radius: 5 },
    ],
    suppressions: [],
    resourceCost: { [ResourceType.Stone]: 12 },
    resourceProduction: {},
    resourceConsumption: {},
    tier: 3,
    prerequisites: ['watchtower', 'stone_quarry'],
    color: 0x666666,
  },

  trade_post: {
    id: 'trade_post',
    name: 'Trade Post',
    footprint: { w: 2, h: 1 },
    emissions: [
      { layer: SubstrateLayer.Prosperity, strength: 5, radius: 7 },
      { layer: SubstrateLayer.Culture, strength: 2, radius: 4 },
    ],
    suppressions: [],
    resourceCost: { [ResourceType.Timber]: 15, [ResourceType.Stone]: 10, [ResourceType.Wealth]: 5 },
    resourceProduction: { [ResourceType.Wealth]: 3 },
    resourceConsumption: {},
    tier: 3,
    prerequisites: ['market'],
    color: 0xddaa44,
  },

  small_palace: {
    id: 'small_palace',
    name: 'Small Palace',
    footprint: { w: 3, h: 3 },
    emissions: [
      { layer: SubstrateLayer.Prosperity, strength: 8, radius: 10 },
      { layer: SubstrateLayer.Culture, strength: 6, radius: 8 },
      { layer: SubstrateLayer.Security, strength: 3, radius: 6 },
    ],
    suppressions: [],
    resourceCost: {
      [ResourceType.Stone]: 40,
      [ResourceType.Timber]: 20,
      [ResourceType.Bronze]: 10,
      [ResourceType.Wealth]: 15,
    },
    resourceProduction: { [ResourceType.Wealth]: 2 },
    resourceConsumption: { [ResourceType.Food]: 3, [ResourceType.Wealth]: 3 },
    tier: 3,
    prerequisites: ['temple', 'scribal_school'],
    color: 0xeedd88,
  },

  // === TIER 4 — City-State ===
  great_temple: {
    id: 'great_temple',
    name: 'Great Temple',
    footprint: { w: 3, h: 3 },
    emissions: [
      { layer: SubstrateLayer.Piety, strength: 12, radius: 14 },
      { layer: SubstrateLayer.Culture, strength: 8, radius: 10 },
      { layer: SubstrateLayer.Prosperity, strength: 3, radius: 6 },
    ],
    suppressions: [],
    resourceCost: {
      [ResourceType.Stone]: 60,
      [ResourceType.Bronze]: 15,
      [ResourceType.Wealth]: 25,
    },
    resourceProduction: {},
    resourceConsumption: { [ResourceType.Wealth]: 5 },
    tier: 4,
    prerequisites: ['temple', 'small_palace'],
    color: 0xdd99ff,
  },

  grand_palace: {
    id: 'grand_palace',
    name: 'Grand Palace',
    footprint: { w: 4, h: 4 },
    emissions: [
      { layer: SubstrateLayer.Prosperity, strength: 12, radius: 14 },
      { layer: SubstrateLayer.Culture, strength: 10, radius: 12 },
      { layer: SubstrateLayer.Security, strength: 5, radius: 8 },
    ],
    suppressions: [],
    resourceCost: {
      [ResourceType.Stone]: 80,
      [ResourceType.Timber]: 30,
      [ResourceType.Bronze]: 25,
      [ResourceType.Wealth]: 40,
    },
    resourceProduction: { [ResourceType.Wealth]: 5 },
    resourceConsumption: { [ResourceType.Food]: 5, [ResourceType.Wealth]: 6 },
    tier: 4,
    prerequisites: ['small_palace', 'great_temple'],
    color: 0xffdd66,
  },

  library: {
    id: 'library',
    name: 'Library',
    footprint: { w: 2, h: 2 },
    emissions: [
      { layer: SubstrateLayer.Culture, strength: 10, radius: 10 },
      { layer: SubstrateLayer.Prosperity, strength: 3, radius: 5 },
    ],
    suppressions: [],
    resourceCost: {
      [ResourceType.Stone]: 25,
      [ResourceType.Timber]: 15,
      [ResourceType.Wealth]: 15,
    },
    resourceProduction: {},
    resourceConsumption: { [ResourceType.Wealth]: 2 },
    tier: 4,
    prerequisites: ['scribal_school', 'small_palace'],
    color: 0x5599dd,
  },

  siege_workshop: {
    id: 'siege_workshop',
    name: 'Siege Workshop',
    footprint: { w: 2, h: 2 },
    emissions: [
      { layer: SubstrateLayer.Security, strength: 6, radius: 6 },
      { layer: SubstrateLayer.Industry, strength: 4, radius: 5 },
    ],
    suppressions: [
      { layer: SubstrateLayer.Prosperity, strength: 3, radius: 5 },
    ],
    resourceCost: {
      [ResourceType.Stone]: 25,
      [ResourceType.Timber]: 20,
      [ResourceType.Bronze]: 15,
    },
    resourceProduction: {},
    resourceConsumption: { [ResourceType.Bronze]: 2, [ResourceType.Timber]: 2 },
    tier: 4,
    prerequisites: ['barracks', 'bronze_smithy'],
    color: 0x884422,
  },
};
