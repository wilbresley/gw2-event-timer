export const tokeninfo = {
  name: "Test Account.1234",
  permissions: [
    "account",
    "inventories",
    "characters",
    "builds",
    "wallet",
    "unlocks",
    "tradingpost",
    "pvp",
    "wvw",
    "progression",
    "guilds"
  ]
};

export const account = {
  name: "Test Account.1234",
  world: 1001,
  access: [],
  created: "2015-01-01T00:00:00Z",
  age: 3600,
  deaths: 0,
  commander: false,
  fractal_level: 0,
  daily_ap: 0,
  monthly_ap: 0,
  guilds: [],
  wvw: { rank: 0 }
};

export const worlds = [{ id: 1001, name: "Test World" }];

export const character = {
  name: "Ritualist Test",
  profession: "Necromancer",
  level: 80,
  race: "Human",
  gender: "Female",
  age: 3600,
  deaths: 0,
  created: "2015-01-01T00:00:00Z",
  guild: "",
  crafting: [],
  build_tabs: [
    {
      tab: 1,
      is_active: true,
      build: { specializations: [{ id: 1 }, { id: 2 }, { id: 3 }] }
    }
  ],
  equipment_tabs: [
    {
      tab: 1,
      is_active: true,
      name: "PvE",
      equipment: [{ id: 1, slot: "Helm", stats: { id: 1 } }]
    }
  ],
  equipment: [{ id: 1, slot: "Helm", stats: { id: 1 } }],
  bags: []
};

export const professions = [
  { id: "Guardian", name: "Guardian", icon: "" },
  { id: "Revenant", name: "Revenant", icon: "" },
  { id: "Warrior", name: "Warrior", icon: "" },
  { id: "Engineer", name: "Engineer", icon: "" },
  { id: "Ranger", name: "Ranger", icon: "" },
  { id: "Thief", name: "Thief", icon: "" },
  { id: "Elementalist", name: "Elementalist", icon: "" },
  { id: "Mesmer", name: "Mesmer", icon: "" },
  { id: "Necromancer", name: "Necromancer", icon: "" }
];

export const specializations = [
  { id: 1, name: "Ritualist", icon: "", elite: true },
  { id: 2, name: "Spite", icon: "", elite: false },
  { id: 3, name: "Curses", icon: "", elite: false }
];

export const items = [
  {
    id: 1,
    name: "Test Helm",
    icon: "",
    rarity: "Ascended",
    type: "Armor",
    details: { type: "Helm", weight_class: "Light" }
  }
];

export const itemstats = [];
