import { ResourceType, SubstrateLayer } from '../types';
import { GameState } from '../core/GameState';

export type EventPrerequisite = (state: GameState) => boolean;

export interface EventChoice {
  label: string;
  description: string;
  effects: EventEffect[];
  hidden?: boolean;
}

export type EventEffect =
  | { type: 'resource'; resource: ResourceType; amount: number }
  | { type: 'population'; amount: number }
  | { type: 'substrate_global'; layer: SubstrateLayer; amount: number }
  | { type: 'message'; text: string };

export interface EventDef {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
  prerequisite?: EventPrerequisite;
  maxRecurrences: number;
  minTick: number;
  tier: 'early' | 'mid' | 'late';
}

export const EVENT_DEFS: EventDef[] = [
  // === EARLY GAME ===
  {
    id: 'wandering_herders',
    title: 'Wandering Herders',
    description: 'A group of nomadic herders approaches your settlement, their livestock weary from travel. They seek shelter and rest.',
    choices: [
      {
        label: 'Welcome them',
        description: 'Offer food and shelter. They may stay and work.',
        effects: [
          { type: 'resource', resource: ResourceType.Food, amount: -15 },
          { type: 'population', amount: 8 },
        ],
      },
      {
        label: 'Trade with them',
        description: 'Exchange wealth for their surplus livestock.',
        effects: [
          { type: 'resource', resource: ResourceType.Wealth, amount: -5 },
          { type: 'resource', resource: ResourceType.Food, amount: 30 },
        ],
      },
      {
        label: 'Turn them away',
        description: 'You cannot spare the resources.',
        effects: [],
      },
    ],
    maxRecurrences: 2,
    minTick: 10,
    tier: 'early',
  },

  {
    id: 'brush_fire',
    title: 'Brush Fire!',
    description: 'Dry conditions have sparked a wildfire spreading toward your timber reserves. Smoke fills the air.',
    choices: [
      {
        label: 'Fight the fire',
        description: 'Send laborers to contain the blaze. Production slows.',
        effects: [
          { type: 'resource', resource: ResourceType.Timber, amount: -10 },
          { type: 'resource', resource: ResourceType.Food, amount: -5 },
        ],
      },
      {
        label: 'Sacrifice the timber',
        description: 'Let it burn. Save the people.',
        effects: [
          { type: 'resource', resource: ResourceType.Timber, amount: -30 },
        ],
      },
      {
        label: 'Controlled burn',
        description: 'A risky firebreak maneuver.',
        effects: [
          { type: 'resource', resource: ResourceType.Timber, amount: -15 },
        ],
      },
    ],
    maxRecurrences: 3,
    minTick: 20,
    tier: 'early',
  },

  {
    id: 'good_harvest',
    title: 'Bountiful Harvest',
    description: 'The rains came at the perfect time this season. Your farms overflow with grain.',
    choices: [
      {
        label: 'Store it all',
        description: 'Fill the granaries for harder times.',
        effects: [
          { type: 'resource', resource: ResourceType.Food, amount: 40 },
        ],
      },
      {
        label: 'Hold a feast',
        description: 'Celebrate with your people. Morale soars.',
        effects: [
          { type: 'resource', resource: ResourceType.Food, amount: 15 },
          { type: 'population', amount: 5 },
        ],
      },
      {
        label: 'Trade the surplus',
        description: 'Convert excess grain to wealth.',
        effects: [
          { type: 'resource', resource: ResourceType.Food, amount: 10 },
          { type: 'resource', resource: ResourceType.Wealth, amount: 10 },
        ],
      },
    ],
    prerequisite: (state) =>
      [...state.buildings.values()].some(b => b.defId === 'farm'),
    maxRecurrences: 4,
    minTick: 15,
    tier: 'early',
  },

  {
    id: 'lost_travelers',
    title: 'Lost Travelers',
    description: 'A small band of travelers arrives at your gates, exhausted and carrying strange goods from distant lands.',
    choices: [
      {
        label: 'Take them in',
        description: 'More mouths to feed, but more hands to work.',
        effects: [
          { type: 'resource', resource: ResourceType.Food, amount: -10 },
          { type: 'population', amount: 12 },
        ],
      },
      {
        label: 'Barter for goods',
        description: 'They carry exotic wares.',
        effects: [
          { type: 'resource', resource: ResourceType.Wealth, amount: 8 },
          { type: 'resource', resource: ResourceType.Bronze, amount: 3 },
        ],
      },
    ],
    maxRecurrences: 2,
    minTick: 25,
    tier: 'early',
  },

  {
    id: 'stone_discovery',
    title: 'Stone Deposit Found',
    description: 'Workers have uncovered a rich vein of quality stone beneath a hillside.',
    choices: [
      {
        label: 'Quarry it immediately',
        description: 'A windfall of building material.',
        effects: [
          { type: 'resource', resource: ResourceType.Stone, amount: 25 },
        ],
      },
      {
        label: 'Mark it for later',
        description: 'The stone will keep. Focus on other priorities.',
        effects: [
          { type: 'resource', resource: ResourceType.Stone, amount: 10 },
        ],
      },
    ],
    maxRecurrences: 2,
    minTick: 30,
    tier: 'early',
  },

  // === MID GAME ===
  {
    id: 'trade_dispute',
    title: 'Trade Dispute',
    description: 'A neighboring city-state accuses your merchants of selling counterfeit goods. Relations sour.',
    choices: [
      {
        label: 'Pay reparations',
        description: 'Costly, but preserves the trade relationship.',
        effects: [
          { type: 'resource', resource: ResourceType.Wealth, amount: -20 },
        ],
      },
      {
        label: 'Deny the accusation',
        description: 'Risky. They may cut off trade entirely.',
        effects: [
          { type: 'resource', resource: ResourceType.Wealth, amount: -8 },
          { type: 'resource', resource: ResourceType.Food, amount: -15 },
        ],
      },
      {
        label: 'Send an envoy',
        description: 'Diplomacy costs wealth but may find a middle ground.',
        effects: [
          { type: 'resource', resource: ResourceType.Wealth, amount: -12 },
        ],
      },
    ],
    prerequisite: (state) =>
      [...state.buildings.values()].some(b => b.defId === 'market'),
    maxRecurrences: 3,
    minTick: 60,
    tier: 'mid',
  },

  {
    id: 'priesthood_ascendant',
    title: 'Priesthood Ascendant',
    description: 'The temple hierarchy has grown powerful. They demand a seat on the ruling council and greater tithes.',
    choices: [
      {
        label: 'Grant their demands',
        description: 'Peace with the priests, but at what cost?',
        effects: [
          { type: 'resource', resource: ResourceType.Wealth, amount: -15 },
          { type: 'population', amount: 10 },
          { type: 'substrate_global', layer: SubstrateLayer.Piety, amount: 2 },
        ],
      },
      {
        label: 'Refuse outright',
        description: 'The priests will not take this lightly.',
        effects: [
          { type: 'population', amount: -8 },
          { type: 'substrate_global', layer: SubstrateLayer.Piety, amount: -3 },
        ],
      },
      {
        label: 'Build them a grand shrine',
        description: 'A compromise. Expensive but keeps the peace.',
        effects: [
          { type: 'resource', resource: ResourceType.Stone, amount: -20 },
          { type: 'resource', resource: ResourceType.Wealth, amount: -10 },
        ],
      },
    ],
    prerequisite: (state) =>
      [...state.buildings.values()].some(b => b.defId === 'temple'),
    maxRecurrences: 2,
    minTick: 80,
    tier: 'mid',
  },

  {
    id: 'bronze_shortage',
    title: 'Bronze Supply Disrupted',
    description: 'Your tin supplier has been raided. The flow of bronze metal has stopped. Your smiths sit idle, your warriors\' equipment rusts.',
    choices: [
      {
        label: 'Ration bronze',
        description: 'Stretch what remains. Military and industry suffer.',
        effects: [
          { type: 'resource', resource: ResourceType.Bronze, amount: -8 },
        ],
      },
      {
        label: 'Seek new sources',
        description: 'Expensive prospecting missions.',
        effects: [
          { type: 'resource', resource: ResourceType.Wealth, amount: -15 },
          { type: 'resource', resource: ResourceType.Bronze, amount: 5 },
        ],
      },
    ],
    prerequisite: (state) =>
      [...state.buildings.values()].some(b => b.defId === 'bronze_smithy'),
    maxRecurrences: 3,
    minTick: 90,
    tier: 'mid',
  },

  {
    id: 'drought',
    title: 'Drought',
    description: 'The rains have not come. Fields crack and wither under the merciless sun. Wells run low.',
    choices: [
      {
        label: 'Ration water and food',
        description: 'Everyone suffers, but the city endures.',
        effects: [
          { type: 'resource', resource: ResourceType.Food, amount: -30 },
          { type: 'population', amount: -5 },
        ],
      },
      {
        label: 'Sacrifice to the gods',
        description: 'The priests demand offerings for divine intervention.',
        effects: [
          { type: 'resource', resource: ResourceType.Wealth, amount: -15 },
          { type: 'resource', resource: ResourceType.Food, amount: -15 },
        ],
      },
      {
        label: 'Buy grain from neighbors',
        description: 'They know you are desperate. The price is steep.',
        effects: [
          { type: 'resource', resource: ResourceType.Wealth, amount: -25 },
          { type: 'resource', resource: ResourceType.Food, amount: 20 },
        ],
      },
    ],
    maxRecurrences: 3,
    minTick: 50,
    tier: 'mid',
  },

  // === LATE GAME ===
  {
    id: 'plague',
    title: 'Plague Sweeps the City',
    description: 'A terrible sickness has arrived with a trade caravan. Citizens fall ill by the dozens. The city reeks of fear.',
    choices: [
      {
        label: 'Quarantine',
        description: 'Isolate the sick. Productivity plummets, but it may contain the spread.',
        effects: [
          { type: 'population', amount: -20 },
          { type: 'resource', resource: ResourceType.Food, amount: -20 },
        ],
      },
      {
        label: 'Pray for deliverance',
        description: 'Rally the priests. Outcome uncertain.',
        effects: [
          { type: 'population', amount: -30 },
          { type: 'resource', resource: ResourceType.Wealth, amount: -10 },
        ],
      },
      {
        label: 'Burn the district',
        description: 'Extreme. Effective. Devastating.',
        effects: [
          { type: 'population', amount: -15 },
          { type: 'resource', resource: ResourceType.Timber, amount: -20 },
          { type: 'resource', resource: ResourceType.Stone, amount: -15 },
        ],
      },
    ],
    prerequisite: (state) => state.population.totalPopulation >= 150,
    maxRecurrences: 2,
    minTick: 120,
    tier: 'late',
  },

  {
    id: 'foreign_empire',
    title: 'Foreign Empire Approaches',
    description: 'Scouts report a massive army marching from the east, sacking cities in its path. They will reach you within days.',
    choices: [
      {
        label: 'Fortify and prepare',
        description: 'Rally every warrior. Shore up the walls.',
        effects: [
          { type: 'resource', resource: ResourceType.Bronze, amount: -15 },
          { type: 'resource', resource: ResourceType.Stone, amount: -20 },
          { type: 'resource', resource: ResourceType.Food, amount: -30 },
        ],
      },
      {
        label: 'Send tribute',
        description: 'A mountain of wealth might dissuade them. Might.',
        effects: [
          { type: 'resource', resource: ResourceType.Wealth, amount: -50 },
          { type: 'resource', resource: ResourceType.Bronze, amount: -10 },
        ],
      },
      {
        label: 'Evacuate civilians',
        description: 'Save the people, lose the city.',
        effects: [
          { type: 'population', amount: -40 },
          { type: 'resource', resource: ResourceType.Food, amount: -20 },
        ],
      },
    ],
    prerequisite: (state) => state.population.totalPopulation >= 300,
    maxRecurrences: 1,
    minTick: 150,
    tier: 'late',
  },

  {
    id: 'sea_peoples',
    title: 'The Sea Peoples',
    description: 'A vast, unstoppable migratory force crashes upon the shores. This is the Bronze Age Collapse. Every system you have built is tested simultaneously.',
    choices: [
      {
        label: 'Stand and fight',
        description: 'Everything you have. Everything you are.',
        effects: [
          { type: 'resource', resource: ResourceType.Bronze, amount: -20 },
          { type: 'resource', resource: ResourceType.Food, amount: -40 },
          { type: 'population', amount: -50 },
        ],
      },
      {
        label: 'Negotiate passage',
        description: 'Perhaps they can be bargained with. At enormous cost.',
        effects: [
          { type: 'resource', resource: ResourceType.Wealth, amount: -60 },
          { type: 'resource', resource: ResourceType.Food, amount: -30 },
          { type: 'resource', resource: ResourceType.Bronze, amount: -10 },
        ],
      },
      {
        label: 'Flee to the hills',
        description: 'Abandon the city. Survive.',
        effects: [
          { type: 'population', amount: -80 },
          { type: 'resource', resource: ResourceType.Wealth, amount: -30 },
        ],
      },
    ],
    prerequisite: (state) => state.population.totalPopulation >= 400,
    maxRecurrences: 1,
    minTick: 200,
    tier: 'late',
  },
];
