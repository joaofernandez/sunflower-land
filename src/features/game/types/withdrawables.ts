import { CropName, CropSeedName } from "./crops";
import { FruitName, FruitSeedName } from "./fruits";
import {
  Animal,
  BarnItem,
  Food,
  LegacyItem,
  MOMEventItem,
  MarketItem,
  MutantChicken,
  QuestItem,
  Shovel,
  ToolName,
  TravelingSalesmanItem,
  getKeys,
} from "./craftables";
import {
  Coupons,
  EasterEgg,
  FertiliserName,
  InventoryItemName,
  LanternName,
  Points,
  SpecialEvent,
} from "./game";
import { BeanName, ExoticCropName, MutantCropName } from "./beans";
import { WarTentItem } from "./craftables";
import { TreasureToolName } from "./tools";
import {
  GoblinBlacksmithItemName,
  GoblinPirateItemName,
  HeliosBlacksmithItem,
  PotionHouseItemName,
  PurchasableItems,
  SoldOutCollectibleName,
} from "./collectibles";
import { CommodityName, ResourceName } from "./resources";
import { Flag } from "./flags";
import { SkillName } from "./skills";
import { BuildingName } from "./buildings";
import { ConsumableName } from "./consumables";
import {
  AchievementDecorationName,
  EventDecorationName,
  PotionHouseDecorationName,
  SeasonalDecorationName,
  ShopDecorationName,
} from "./decorations";
import {
  BeachBountyTreasure,
  BoostTreasure,
  DecorationTreasure,
} from "./treasure";
import { WorkbenchToolName } from "./tools";
import { BumpkinItem } from "./bumpkin";
import { hasSeasonEnded } from "./seasons";
import { GoblinState } from "../lib/goblinMachine";

const canWithdrawTimebasedItem = (availableAt: Date) => {
  const now = new Date();

  return now >= availableAt;
};

const cropSeeds: Record<CropSeedName, () => boolean> = {
  "Beetroot Seed": () => false,
  "Cabbage Seed": () => false,
  "Carrot Seed": () => false,
  "Cauliflower Seed": () => false,
  "Kale Seed": () => false,
  "Potato Seed": () => false,
  "Pumpkin Seed": () => false,
  "Sunflower Seed": () => false,
  "Parsnip Seed": () => false,
  "Eggplant Seed": () => false,
  "Corn Seed": () => false,
  "Radish Seed": () => false,
  "Wheat Seed": () => false,
};

const fruitSeed: Record<FruitSeedName, () => boolean> = {
  "Apple Seed": () => false,
  "Blueberry Seed": () => false,
  "Orange Seed": () => false,
};
const crops: Record<CropName, () => boolean> = {
  Beetroot: () => true,
  Cabbage: () => true,
  Carrot: () => true,
  Cauliflower: () => true,
  Kale: () => true,
  Potato: () => true,
  Pumpkin: () => true,
  Sunflower: () => true,
  Parsnip: () => true,
  Eggplant: () => true,
  Corn: () => false,
  Radish: () => true,
  Wheat: () => true,
};

const fruits: Record<FruitName, () => boolean> = {
  Apple: () => true,
  Blueberry: () => true,
  Orange: () => true,
};

const beans: Record<BeanName, () => boolean> = {
  "Magic Bean": () => false,
};

const questItems: Record<QuestItem, () => boolean> = {
  "Ancient Goblin Sword": () => false,
  "Ancient Human Warhammer": () => false,
  "Goblin Key": () => false,
  "Sunflower Key": () => false,
};

const warTentItems: Record<WarTentItem, () => boolean> = {
  "Beetroot Amulet": () => false,
  "Carrot Amulet": () => false,
  "Sunflower Amulet": () => false,
  "Green Amulet": () => false,
  "Skull Hat": () => false,
  "Sunflower Shield": () => false,
  "Undead Rooster": () => true,
  "War Skull": () => true,
  "War Tombstone": () => true,
  "Warrior Helmet": () => false,
  "Warrior Pants": () => false,
  "Warrior Shirt": () => false,
};

const tools: Record<ToolName | WorkbenchToolName | Shovel, () => boolean> = {
  Axe: () => false,
  Hammer: () => false,
  Pickaxe: () => false,
  "Rusty Shovel": () => false,
  "Iron Pickaxe": () => false,
  "Stone Pickaxe": () => false,
  Rod: () => false,
  Shovel: () => false,
};

const treasureTools: Record<TreasureToolName, () => boolean> = {
  "Sand Drill": () => false,
  "Sand Shovel": () => false,
};

/* TODO - Split TOOLS into TOOLS and SHOVELS
 * SHOVELS are a separate object in the frontend, but they are
 * part of TOOLS in the backend.
 */

const warBanners = {
  "Human War Banner": () => false,
  "Goblin War Banner": () => false,
};

const heliosBlacksmith: Record<HeliosBlacksmithItem, () => boolean> = {
  "Immortal Pear": () => false,
  "Treasure Map": () => false,
  "Basic Scarecrow": () => false,
  Bale: () => false,
  "Scary Mike": () => false,
  "Laurie the Chuckle Crow": () => false,
  "Grain Grinder": () => canWithdrawTimebasedItem(new Date("2023-11-02")),
  Kernaldo: () => canWithdrawTimebasedItem(new Date("2023-10-02")),
  Poppy: () => canWithdrawTimebasedItem(new Date("2023-09-02")),
};

const commodities: Record<CommodityName, () => boolean> = {
  // Mushrooms
  "Magic Mushroom": () => false,
  "Wild Mushroom": () => false,

  Chicken: () => false,
  Wood: () => true,
  Stone: () => true,
  Iron: () => true,
  Gold: () => true,
  Diamond: () => false,

  Honey: () => false,
  Egg: () => true,
};

const resources: Record<ResourceName, () => boolean> = {
  Tree: () => false,
  "Stone Rock": () => false,
  "Iron Rock": () => false,
  "Gold Rock": () => false,
  "Crop Plot": () => false,
  "Fruit Patch": () => false,
  Boulder: () => false,
};

const mutantChickens: Record<MutantChicken, () => boolean> = {
  "Ayam Cemani": () => true,
  "Fat Chicken": () => true,
  "Rich Chicken": () => true,
  "Speed Chicken": () => true,
  "El Pollo Veloz": () => true,
};

const flags: Record<Flag, () => boolean> = {
  "Australian Flag": () => true,
  "Belgian Flag": () => true,
  "Brazilian Flag": () => true,
  "Chinese Flag": () => true,
  "Finnish Flag": () => true,
  "French Flag": () => true,
  "German Flag": () => true,
  "Indonesian Flag": () => true,
  "Indian Flag": () => true,
  "Iranian Flag": () => true,
  "Italian Flag": () => true,
  "Japanese Flag": () => true,
  "Moroccan Flag": () => true,
  "Dutch Flag": () => true,
  "Philippine Flag": () => true,
  "Polish Flag": () => true,
  "Portuguese Flag": () => true,
  "Russian Flag": () => true,
  "Saudi Arabian Flag": () => true,
  "South Korean Flag": () => true,
  "Spanish Flag": () => true,
  "Sunflower Flag": () => true,
  "Thai Flag": () => true,
  "Turkish Flag": () => true,
  "Ukrainian Flag": () => true,
  "American Flag": () => true,
  "Vietnamese Flag": () => true,
  "Canadian Flag": () => true,
  "Singaporean Flag": () => true,
  "British Flag": () => true,
  "Sierra Leone Flag": () => true,
  "Romanian Flag": () => true,
  "Rainbow Flag": () => true,
  "Goblin Flag": () => true,
  "Pirate Flag": () => true,
  "Algerian Flag": () => true,
  "Mexican Flag": () => true,
  "Dominican Republic Flag": () => true,
  "Argentinian Flag": () => true,
  "Lithuanian Flag": () => true,
  "Malaysian Flag": () => true,
  "Colombian Flag": () => true,
};

const easterEggs: Record<EasterEgg, () => boolean> = {
  "Blue Egg": () => false,
  "Green Egg": () => false,
  "Orange Egg": () => false,
  "Pink Egg": () => false,
  "Purple Egg": () => false,
  "Red Egg": () => false,
  "Yellow Egg": () => false,
};

const skills: Record<SkillName, () => boolean> = {
  "Green Thumb": () => false,
  "Barn Manager": () => false,
  "Seed Specialist": () => false,
  Wrangler: () => false,
  Lumberjack: () => false,
  Prospector: () => false,
  Logger: () => false,
  "Gold Rush": () => false,
  Artist: () => false,
  Coder: () => false,
  "Liquidity Provider": () => false,
  "Discord Mod": () => false,
  Warrior: () => false,
};

const coupons: Record<Coupons, () => boolean> = {
  "Trading Ticket": () => false,
  "War Bond": () => false,
  "Jack-o-lantern": () => false,
  "Golden Crop": () => false,
  "Beta Pass": () => false,
  "Red Envelope": () => false,
  "Love Letter": () => false,
  "Block Buck": () => false,
  "Solar Flare Ticket": () => false,
  "Dawn Breaker Ticket": () => false,
  "Sunflower Supporter": () => false,
  "Crow Feather": () => false,
  "Potion Ticket": () => false,
  "Bud Ticket": () => false,
};

const buildings: Record<BuildingName, () => boolean> = {
  "Town Center": () => false,
  "Fire Pit": () => false,
  Market: () => false,
  Workbench: () => false,
  Kitchen: () => false,
  Tent: () => false,
  "Water Well": () => false,
  Bakery: () => false,
  "Hen House": () => false,
  Deli: () => false,
  "Smoothie Shack": () => false,
  Toolshed: () => false,
  Warehouse: () => false,
};

const fertilisers: Record<FertiliserName, () => boolean> = {
  "Rapid Growth": () => false,
};

const food: Record<Food, () => boolean> = {
  "Beetroot Cake": () => false,
  "Cabbage Cake": () => false,
  "Carrot Cake": () => false,
  "Cauliflower Cake": () => false,
  "Potato Cake": () => false,
  "Pumpkin Cake": () => false,
  "Sunflower Cake": () => false,
  "Parsnip Cake": () => false,
  "Radish Cake": () => false,
  "Wheat Cake": () => false,
  "Pumpkin Soup": () => false,
  "Radish Pie": () => false,
  "Roasted Cauliflower": () => false,
  Sauerkraut: () => false,
};

const consumables: Record<ConsumableName, () => boolean> = {
  "Mashed Potato": () => false,
  "Pumpkin Soup": () => false,
  "Bumpkin Broth": () => false,
  "Boiled Eggs": () => false,
  "Mushroom Soup": () => false,
  "Roast Veggies": () => false,
  "Bumpkin Salad": () => false,
  "Cauliflower Burger": () => false,
  "Mushroom Jacket Potatoes": () => false,
  "Goblin's Treat": () => false,
  "Club Sandwich": () => false,
  "Kale Stew": () => false,
  Pancakes: () => false,
  "Kale & Mushroom Pie": () => false,
  "Fermented Carrots": () => false,
  Sauerkraut: () => false,
  "Blueberry Jam": () => false,
  "Apple Pie": () => false,
  "Orange Cake": () => false,
  "Honey Cake": () => false,
  "Sunflower Crunch": () => false,
  "Reindeer Carrot": () => false,
  "Sunflower Cake": () => false,
  "Potato Cake": () => false,
  "Pumpkin Cake": () => false,
  "Carrot Cake": () => false,
  "Cabbage Cake": () => false,
  "Beetroot Cake": () => false,
  "Cauliflower Cake": () => false,
  "Parsnip Cake": () => false,
  "Radish Cake": () => false,
  "Wheat Cake": () => false,
  "Apple Juice": () => false,
  "Orange Juice": () => false,
  "Purple Smoothie": () => false,
  "Power Smoothie": () => false,
  "Bumpkin Detox": () => false,
  "Bumpkin Roast": () => false,
  "Goblin Brunch": () => false,
  "Fruit Salad": () => false,
  "Kale Omelette": () => false,
  "Cabbers n Mash": () => false,
  "Fancy Fries": () => false,
  "Pirate Cake": () => false,
  "Bumpkin ganoush": () => false,
  Cornbread: () => false,
  "Eggplant Cake": () => false,
  Popcorn: () => false,
};

const decorations: Record<ShopDecorationName, () => boolean> = {
  "Town Sign": () => false,
  "White Tulips": () => false,
  "Potted Sunflower": () => false,
  "Potted Potato": () => false,
  "Potted Pumpkin": () => false,
  Cactus: () => false,
  "Basic Bear": () => false,
  "Dirt Path": () => false,
  Bush: () => false,
  Shrub: () => false,
  Fence: () => false,
  "Bonnie's Tombstone": () => false,
  "Grubnash's Tombstone": () => false,
  "Crimson Cap": () => false,
  "Toadstool Seat": () => false,
  "Chestnut Fungi Stool": () => false,
  "Mahogany Cap": () => false,
  "Pine Tree": () => false,
  "Stone Fence": () => false,
  "Field Maple": () => false,
  "Red Maple": () => false,
  "Golden Maple": () => false,
};

const seasonalDecorations: Record<SeasonalDecorationName, () => boolean> = {
  Clementine: () => true,
  Cobalt: () => true,
  "Dawn Umbrella Seat": () => true,
  "Eggplant Grill": () => true,
  "Giant Dawn Mushroom": () => true,
  "Shroom Glow": () => true,
  Candles: () => canWithdrawTimebasedItem(new Date("2023-11-02")),
  "Haunted Stump": () => canWithdrawTimebasedItem(new Date("2023-09-02")),
  "Spooky Tree": () => canWithdrawTimebasedItem(new Date("2023-10-02")), // Spooky Tree available from 01/09/2023 to 01/10/2023. Hence withdrawal date should be after that
};

const mutantCrop: Record<MutantCropName, () => boolean> = {
  "Stellar Sunflower": () => true,
  "Potent Potato": () => true,
  "Radical Radish": () => true,
};

const specialEvents: Record<SpecialEvent | MOMEventItem, () => boolean> = {
  "Chef Apron": () => false,
  "Chef Hat": () => false,
  "Engine Core": () => false,
  Observatory: () => true,
};

const points: Record<Points, () => boolean> = {
  "Human War Point": () => false,
  "Goblin War Point": () => false,
};

const goblinBlacksmith: Record<GoblinBlacksmithItemName, () => boolean> = {
  "Mushroom House": () => true,
  Obie: () => true,
  "Purple Trail": () => true,
  Maximus: () => true,
};

const animals: Record<Animal, () => boolean> = {
  Cow: () => false,
  Pig: () => false,
  Sheep: () => false,
  Chicken: () => false,
};

const barnItems: Record<BarnItem, () => boolean> = {
  "Chicken Coop": () => true,
  "Easter Bunny": () => true,
  "Farm Cat": () => true,
  "Farm Dog": () => true,
  "Gold Egg": () => true,
  Rooster: () => true,
};

const blacksmithItems: Record<LegacyItem, () => boolean> = {
  "Sunflower Statue": () => true,
  "Potato Statue": () => true,
  "Christmas Tree": () => true,
  Gnome: () => true,
  "Sunflower Tombstone": () => true,
  "Sunflower Rock": () => true,
  "Goblin Crown": () => true,
  Fountain: () => true,
  "Egg Basket": () => false,
  "Woody the Beaver": () => true,
  "Apprentice Beaver": () => true,
  "Foreman Beaver": () => true,
  "Nyon Statue": () => true,
  "Homeless Tent": () => true,
  "Farmer Bath": () => true,
  "Mysterious Head": () => true,
  "Rock Golem": () => true,
  "Tunnel Mole": () => true,
  "Rocky the Mole": () => true,
  Nugget: () => true,
};

const travelingSalesmanItems: Record<TravelingSalesmanItem, () => boolean> = {
  "Christmas Bear": () => true,
  "Golden Bonsai": () => true,
  "Victoria Sisters": () => true,
  "Wicker Man": () => true,
};

const soldOut: Record<SoldOutCollectibleName, () => boolean> = {
  "Peeled Potato": () => true,
  "Christmas Snow Globe": () => true,
  "Beta Bear": () => true,
  "Cyborg Bear": () => true,
  "Wood Nymph Wendy": () => true,
  "Squirrel Monkey": () => true,
  "Black Bearry": () => true,
  "Lady Bug": () => true,
  "Cabbage Boy": () => true,
  "Cabbage Girl": () => true,
  "Maneki Neko": () => true,
  "Heart Balloons": () => true,
  Flamingo: () => true,
  "Blossom Tree": () => true,
  "Palm Tree": () => true,
  "Beach Ball": () => true,
  "Collectible Bear": () => true,
  "Pablo The Bunny": () => true,
  "Easter Bush": () => true,
  "Giant Carrot": () => true,
  Hoot: () => true,
  "Sir Goldensnout": () => true,
  "Freya Fox": () => true,
  "Queen Cornelia": () =>
    canWithdrawTimebasedItem(new Date("Wed October 14 2023 10:00:00 GMT+1000")),
};

const achievementDecoration: Record<AchievementDecorationName, () => boolean> =
  {
    "Chef Bear": () => true,
    "Construction Bear": () => true,
    "Angel Bear": () => true,
    "Badass Bear": () => true,
    "Bear Trap": () => true,
    "Brilliant Bear": () => true,
    "Classy Bear": () => true,
    "Farmer Bear": () => true,
    "Sunflower Bear": () => true,
    "Rich Bear": () => true,
    "Rainbow Artist Bear": () => true,
    "Devil Bear": () => true,
  };

const market: Record<MarketItem, () => boolean> = {
  // TODO add rule when beans are introduced
  "Carrot Sword": () => true,

  "Golden Cauliflower": () => true,
  "Mysterious Parsnip": () => true,
  Nancy: () => true,
  Scarecrow: () => true,
  Kuebiko: () => true,
};

const boostTreasure: Record<BoostTreasure, () => boolean> = {
  "Lunar Calendar": () => true,
  "Tiki Totem": () => true,
  "Genie Lamp": () => true,
  Foliant: () => true,
};

const goblinPirate: Record<GoblinPirateItemName, () => boolean> = {
  "Iron Idol": () => true,
  "Heart of Davy Jones": () => true,
  Karkinos: () => true,
  "Emerald Turtle": () => true,
  "Tin Turtle": () => false,
  "Golden Bear Head": () => false,
  "Parasaur Skull": () => false,
};

const treasureDecoration: Record<DecorationTreasure, () => boolean> = {
  "T-Rex Skull": () => true,
  "Sunflower Coin": () => true,
  "Pirate Bear": () => true,
  "Whale Bear": () => true,

  "Abandoned Bear": () => false,
  "Dinosaur Bone": () => hasSeasonEnded("Dawn Breaker"),
  Galleon: () => false,
  "Human Bear": () => false,
  "Lifeguard Bear": () => true,
  "Skeleton King Staff": () => false,
  "Snorkel Bear": () => true,
  "Turtle Bear": () => true,
  "Goblin Bear": () => false,
};

const beachBounty: Record<BeachBountyTreasure, () => boolean> = {
  "Pirate Bounty": () => false,
  Pearl: () => false,
  Coral: () => false,
  "Clam Shell": () => false,
  Pipi: () => false,
  Starfish: () => false,
  Seaweed: () => false,
  "Sea Cucumber": () => false,
  Crab: () => false,
  "Wooden Compass": () => false,
  "Iron Compass": () => false,
  "Old Bottle": () => false,
  "Emerald Compass": () => false,
};

const eventDecoration: Record<EventDecorationName, () => boolean> = {
  "Valentine Bear": () => true,
  "Easter Bear": () => true,
  "Easter Bush": () => true,
  "Giant Carrot": () => true,
  "Genie Bear": () => true,
  "Eggplant Bear": () => true,
  "Dawn Flower": () => true,
};

const lanterns: Record<LanternName, () => boolean> = {
  "Luminous Lantern": () => true,
  "Radiance Lantern": () => true,
  "Aurora Lantern": () => true,
  "Ocean Lantern": () => true,
  "Solar Lantern": () => true,
  "Betty Lantern": () => true,
  "Bumpkin Lantern": () => true,
  "Goblin Lantern": () => true,
};

const purchasables: Record<PurchasableItems, () => boolean> = {
  "Witches' Eve Banner": () => false,
  "Dawn Breaker Banner": () => false,
  "Solar Flare Banner": () => false,
  "Gold Pass": () => false,
};

const potionHouse: Record<
  PotionHouseDecorationName | PotionHouseItemName,
  () => boolean
> = {
  "Giant Cabbage": () => false,
  "Giant Potato": () => false,
  "Giant Pumpkin": () => false,
  "Lab Grown Carrot": () => false,
  "Lab Grown Pumpkin": () => false,
  "Lab Grown Radish": () => false,
};

const exoticCrops: Record<ExoticCropName, () => boolean> = {
  "Adirondack Potato": () => false,
  "Black Magic": () => false,
  "Golden Helios": () => false,
  "Purple Cauliflower": () => false,
  "Warty Goblin Pumpkin": () => false,
  "White Carrot": () => false,
  Chiogga: () => false,
};

export const WITHDRAWABLES: Record<InventoryItemName, () => boolean> = {
  ...crops,
  ...fruits,
  ...cropSeeds,
  ...fruitSeed,
  ...beans,
  ...questItems,
  ...warTentItems,
  ...tools,
  ...treasureTools,
  ...food,
  ...warBanners,
  ...heliosBlacksmith,
  ...commodities,
  ...mutantChickens,
  ...flags,
  ...easterEggs,
  ...mutantCrop,
  ...specialEvents,
  ...points,
  ...goblinBlacksmith,
  ...soldOut,
  ...travelingSalesmanItems,
  ...blacksmithItems,
  ...barnItems,
  ...animals,
  ...achievementDecoration,
  ...market,
  ...boostTreasure,
  ...goblinPirate,
  ...treasureDecoration,
  ...eventDecoration,
  ...seasonalDecorations,
  ...beachBounty,
  ...resources,
  ...purchasables,
  "Basic Land": () => false,
  ...lanterns,

  // non-withdrawables
  ...skills,
  ...coupons,
  ...buildings,
  ...fertilisers,
  ...consumables,
  ...decorations,
  ...potionHouse,
  ...exoticCrops,
};

const canWithdrawBoostedWearable = (
  wearable: BumpkinItem,
  state?: GoblinState
) => {
  if (!state) return false;

  if (wearable === "Fruit Picker Apron") {
    return getKeys(state.fruitPatches).every(
      (id) => state.fruitPatches[id].fruit === undefined
    );
  }

  if (wearable === "Eggplant Onesie") {
    return getKeys(state.crops).every(
      (id) => state.crops[id].crop?.name !== "Eggplant"
    );
  }

  if (wearable === "Corn Onesie") {
    return getKeys(state.crops).every(
      (id) => state.crops[id].crop?.name !== "Corn"
    );
  }

  if (wearable === "Parsnip") {
    return getKeys(state.crops).every(
      (id) => state.crops[id].crop?.name !== "Parsnip"
    );
  }

  if (wearable === "Sunflower Amulet") {
    return getKeys(state.crops).every(
      (id) => state.crops[id].crop?.name !== "Sunflower"
    );
  }

  if (wearable === "Carrot Amulet") {
    return getKeys(state.crops).every(
      (id) => state.crops[id].crop?.name !== "Carrot"
    );
  }

  if (wearable === "Beetroot Amulet") {
    return getKeys(state.crops).every(
      (id) => state.crops[id].crop?.name !== "Beetroot"
    );
  }

  if (wearable === "Green Amulet") {
    return getKeys(state.crops).every((id) => !state.crops[id].crop);
  }

  if (wearable === "Cattlegrim") {
    return getKeys(state.chickens).every((id) => !state.chickens[id].fedAt);
  }

  if (wearable === "Infernal Pitchfork") {
    return getKeys(state.crops).every((id) => !state.crops[id].crop);
  }

  // Safety check
  return false;
};

export const BUMPKIN_WITHDRAWABLES: Record<
  BumpkinItem,
  (state?: GoblinState) => boolean
> = {
  "Beige Farmer Potion": () => false,
  "Dark Brown Farmer Potion": () => false,
  "Light Brown Farmer Potion": () => false,
  "Goblin Potion": () => false,
  "Basic Hair": () => false,
  "Rancher Hair": () => false,
  "Explorer Hair": () => false,
  "Red Farmer Shirt": () => false,
  "Yellow Farmer Shirt": () => false,
  "Blue Farmer Shirt": () => false,
  "Chef Apron": () => true,
  "Warrior Shirt": () => true,
  "Farmer Overalls": () => false,
  "Lumberjack Overalls": () => false,
  "Farmer Pants": () => false,
  "Warrior Pants": () => true,
  "Black Farmer Boots": () => true,
  "Farmer Pitchfork": () => true,
  "Farmer Hat": () => true,
  "Chef Hat": () => true,
  "Warrior Helmet": () => true,
  "Sunflower Amulet": (state) =>
    canWithdrawBoostedWearable("Sunflower Amulet", state),
  "Carrot Amulet": (state) =>
    canWithdrawBoostedWearable("Carrot Amulet", state),
  "Beetroot Amulet": (state) =>
    canWithdrawBoostedWearable("Beetroot Amulet", state),
  "Green Amulet": (state) => canWithdrawBoostedWearable("Green Amulet", state),
  "Sunflower Shield": () => true,
  "Farm Background": () => true,
  "Fancy Top": () => true,
  "Brown Boots": () => true,
  "Brown Suspenders": () => true,
  "Fancy Pants": () => true,
  "Maiden Skirt": () => true,
  "Maiden Top": () => true,
  "Peasant Skirt": () => true,
  "SFL T-Shirt": () => true,
  "Yellow Boots": () => true,
  "Buzz Cut": () => false,
  "Parlour Hair": () => true,
  Axe: () => true,
  Sword: () => true,
  "Blue Suspenders": () => true,
  "Forest Background": () => true,
  "Seashore Background": () => true,
  Blondie: () => true,
  "Brown Long Hair": () => true,
  "Sun Spots": () => true,
  "White Long Hair": () => true,
  "Cemetery Background": () => true,
  "Teal Mohawk": () => true,
  "Space Background": () => true,
  Parsnip: (state) => canWithdrawBoostedWearable("Parsnip", state),
  "Jail Background": () => true,
  "Golden Spatula": () => true,
  "Artist Scarf": () => true,
  "Bumpkin Art Competition Merch": () => true,
  "Project Dignity Hoodie": () => true,
  "Developer Hoodie": () => true,
  "Blacksmith Hair": () => true,
  Hammer: () => true,
  "Bumpkin Boots": () => true,
  "Fire Shirt": () => true,
  "Red Long Hair": () => true,
  "Snowman Onesie": () => true,
  "Reindeer Suit": () => true,
  "Shark Onesie": () => true,
  "Christmas Background": () => true,
  "Devil Wings": () => true,
  "Angel Wings": () => true,
  "Fire Hair": () => true,
  "Luscious Hair": () => true,
  "Ancient War Hammer": () => true,
  "Ancient Goblin Sword": () => true,
  "Mountain View Background": () => true,
  "Skull Hat": () => true,
  "Reindeer Antlers": () => true,
  "Santa Hat": () => true,
  "Pineapple Shirt": () => true,
  "China Town Background": () => true,
  "Lion Dance Mask": () => true,
  "Fruit Picker Shirt": () => true,
  "Fruit Picker Apron": (state) =>
    canWithdrawBoostedWearable("Fruit Picker Apron", state),
  "Fruit Bowl": () => true,
  "Striped Blue Shirt": () => true,
  "Peg Leg": () => true,
  "Pirate Potion": () => true,
  "Pirate Hat": () => true,
  "Pirate General Coat": () => true,
  "Pirate Pants": () => true,
  "Pirate Leather Polo": () => true,
  "Crab Claw": () => true,
  "Pirate Scimitar": () => true,
  "Cupid Hair": () => true,
  "Cupid Dress": () => true,
  "Cupid Sandals": () => true,
  "Love Quiver": () => true,
  "SFL Office Background": () => true,
  "Bumpkin Puppet": () => true,
  "Goblin Puppet": () => true,
  "Hawaiian Shirt": () => true,
  "Bear Onesie": () => true,
  "Frog Onesie": () => true,
  "Tiger Onesie": () => true,
  "Beach Sarong": () => true,
  "Lifeguard Hat": () => false, // Not Launch
  "Lifeguard Pants": () => false, // Not Launch
  "Lifeguard Shirt": () => false, // Not Launch
  "Sleeping Otter": () => true,
  "Tropical Sarong": () => true,
  "Sequence Hat": () => true,
  "Sequence Shirt": () => true,
  "St Patricks Hat": () => true,
  "Bunny Onesie": () => true,
  "Light Brown Worried Farmer Potion": () => false, // Not Launched
  "Polkastarter Shirt": () => true,
  "Beach Trunks": () => false, // No Launched
  "Club Polo": () => true,
  "Dawn Breaker Background": () => true,
  "Dawn Lamp": () => true,
  "Eggplant Onesie": (state) =>
    canWithdrawBoostedWearable("Eggplant Onesie", state),
  "Fox Hat": () => false, // Not Launched
  "Grave Diggers Shovel": () => true,
  "Infected Potion": () =>
    canWithdrawTimebasedItem(new Date("Wed October 7 2023 10:00:00 GMT+1000")), // Auctioned
  "Mushroom Hat": () => true,
  "Mushroom Lamp": () => false, // Not Launched
  "Mushroom Lights Background": () => false, // Not Launched
  "Mushroom Pants": () => false, // Not Launched
  "Mushroom Shield": () => false, // Not Launched
  "Mushroom Shoes": () => false, // Not Launched
  "Mushroom Sweater": () => false, // Not Launched
  "Rash Vest": () => false, // Not Launched
  "Squid Hat": () => true,
  "Striped Red Shirt": () => false, // Not Launched
  "Striped Yellow Shirt": () => false, // Not Launched
  "Summer Top": () =>
    canWithdrawTimebasedItem(new Date("Thu August 6 2023 10:00:00 GMT+1000")), // Auctioned
  "Sunburst Potion": () => true,
  "Water Gun": () => false, // Not Launched
  "Wavy Pants": () => false, // Not Launched
  "White Turtle Neck": () => true,
  "Trial Tee": () => false,
  "Auction Megaphone": () => false, // Not Launched
  "Auctioneer Slacks": () => false, // Not Launched
  "Bidder's Brocade": () => false, // Not Launched
  "Harry's Hat": () => true,
  "Leather Shoes": () => false, // Not Launched
  "Tangerine Hair": () => false, // Not Launched
  "Straw Hat": () => true,
  "Traveller's Backpack": () => false, // Not Launched
  "Traveller's Pants": () => false, // Not Launched
  "Traveller's Shirt": () => false, // Not Launched
  "Witching Wardrobe": () => canWithdrawTimebasedItem(new Date("2023-11-02")), // Seasonal
  "Witch's Broom": () => canWithdrawTimebasedItem(new Date("2023-11-02")), // Seasonal
  "Infernal Bumpkin Potion": () =>
    canWithdrawTimebasedItem(new Date("2023-09-02")), // Seasonal
  "Infernal Goblin Potion": () =>
    canWithdrawTimebasedItem(new Date("2023-09-02")), // Seasonal
  "Imp Costume": () => canWithdrawTimebasedItem(new Date("2023-10-02")), // Seasonal
  "Ox Costume": () => canWithdrawTimebasedItem(new Date("2023-11-02")), // Seasonal
  "Luna's Hat": () =>
    canWithdrawTimebasedItem(
      new Date("Thu September 27 2023 10:00:00 GMT+1000")
    ),
  "Infernal Pitchfork": (state) =>
    canWithdrawTimebasedItem(
      new Date("Sun October 4 2023 10:00:00 GMT+1000")
    ) && canWithdrawBoostedWearable("Infernal Pitchfork", state), // Auction
  "Infernal Horns": () =>
    canWithdrawTimebasedItem(new Date("Sun October 11 2023 10:00:00 GMT+1000")), // Auction
  Cattlegrim: (state) =>
    canWithdrawTimebasedItem(
      new Date("Thu September 30 2023 10:00:00 GMT+1000")
    ) && canWithdrawBoostedWearable("Cattlegrim", state), // Auction
  "Crumple Crown": () =>
    canWithdrawTimebasedItem(
      new Date("Thu September 20 2023 10:00:00 GMT+1000")
    ), // Auction
  "Merch Bucket Hat": () => false,
  "Merch Coffee Mug": () => false,
  "Dawn Breaker Tee": () => false,
  "Merch Tee": () => false,
  "Merch Hoodie": () => false,
  "Birthday Hat": () => false,
  "Double Harvest Cap": () => false,
  "Streamer Helmet": () => false,
  "Corn Onesie": (state) => canWithdrawBoostedWearable("Corn Onesie", state), // Not Launched
  "Crow Wings": () => canWithdrawTimebasedItem(new Date("2023-11-01")), // Not Launched
  "Witches' Eve Tee": () => false,
  "Wise Beard": () => false, // Not Launched
  "Pumpkin Hat": () => false, // Not Launched
  "Wise Book": () => false, // Not Launched
  "Wise Hair": () => false, // Not Launched
  "Wise Robes": () => false, // Not Launched
  "Wise Slacks": () => false, // Not Launched
  "Wise Staff": () => false, // Not Launched
  "Greyed Glory": () => false, // Not Launched
  "Tattered Jacket": () => false, // Not Launched
  "Hoary Chin": () => false, // Not Launched
  "Tattered Slacks": () => false, // Not Launched
  "Old Shoes": () => false, // Not Launched
  "Bat Wings": () => false, // Not Launched
  "Gothic Twilight": () => false, // Not Launched
  "Dark Enchantment Gown": () => false, // Not Launched
  "Goth Hair": () => false, // Not Launched
  "Pale Potion": () => false, // Not Launched
  "Stretched Jeans": () => false, // Not Launched
  "Skull Shirt": () => false, // Not Launched
  "Victorian Hat": () => false, // Not Launched
  "Boater Hat": () => false, // Not Launched
  "Antique Dress": () => false, // Not Launched
  "Crimson Skirt": () => false, // Not Launched
  "Chic Gala Blouse": () => false, // Not Launched
  "Ash Ponytail": () => false, // Not Launched
  "Pink Ponytail": () => false, // Not Launched
  "Silver Streaks": () => false, // Not Launched,
  "Brown Rancher Hair": () => false,
  "Parsnip Horns": () => false,
  "Potato Suit": () => false,
  "Whale Hat": () =>
    canWithdrawTimebasedItem(new Date("Thu August 9 2023 10:00:00 GMT+1000")), // AUCTION
  "Pumpkin Shirt": () => false,
  Halo: () => false,
  Kama: () => false,
  "Grey Merch Hoodie": () => false,
  "Unicorn Horn": () => false,
  "Unicorn Hat": () => false,
  "Feather Hat": () => true,
  "Valoria Wreath": () => true,
  "Earn Alliance Sombrero": () => true,
};
