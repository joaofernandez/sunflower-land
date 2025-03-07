import Decimal from "decimal.js-light";
import "lib/__mocks__/configMock.ts";
import { TEST_FARM } from "../../lib/constants";
import { GameState } from "../../types/game";
import { craftCollectible } from "./craftCollectible";

const GAME_STATE: GameState = TEST_FARM;

describe("craftCollectible", () => {
  it("throws an error if item is not craftable", () => {
    expect(() =>
      craftCollectible({
        state: GAME_STATE,
        action: {
          type: "collectible.crafted",
          name: "Sunflower Statue" as any,
        },
      })
    ).toThrow("Item does not exist");
  });

  it("does not craft item if there is insufficient ingredients", () => {
    expect(() =>
      craftCollectible({
        state: {
          ...GAME_STATE,
          balance: new Decimal(10),
          inventory: {},
        },
        action: {
          type: "collectible.crafted",
          name: "Immortal Pear",
        },
      })
    ).toThrow("Insufficient ingredient: Gold");
  });

  it("does not craft item if there is insufficient SFL", () => {
    expect(() =>
      craftCollectible({
        state: {
          ...GAME_STATE,
          balance: new Decimal(0),
          inventory: {
            Wood: new Decimal(100),
            Radish: new Decimal(60),
            Kale: new Decimal(40),
            Wheat: new Decimal(20),
          },
        },
        action: {
          type: "collectible.crafted",
          name: "Laurie the Chuckle Crow",
        },
      })
    ).toThrow("Insufficient SFL");
  });

  it("crafts item if there is sufficient ingredients and no SFL requirement", () => {
    const result = craftCollectible({
      state: {
        ...GAME_STATE,
        balance: new Decimal(0),
        inventory: {
          Gold: new Decimal(5),
          Apple: new Decimal(10),
          Blueberry: new Decimal(10),
          Orange: new Decimal(10),
        },
      },
      action: {
        type: "collectible.crafted",
        name: "Immortal Pear",
      },
    });
    expect(result.inventory["Immortal Pear"]).toEqual(new Decimal(1));
  });

  it("does not craft too early", () => {
    expect(() =>
      craftCollectible({
        state: {
          ...GAME_STATE,
          balance: new Decimal(400),
        },
        action: {
          type: "collectible.crafted",
          name: "Poppy",
        },
        createdAt: new Date("2023-07-31").getTime(),
      })
    ).toThrow("Too early");
  });

  it("does not craft too late", () => {
    expect(() =>
      craftCollectible({
        state: {
          ...GAME_STATE,
          balance: new Decimal(400),
        },
        action: {
          type: "collectible.crafted",
          name: "Poppy",
        },
        createdAt: new Date("2023-09-02").getTime(),
      })
    ).toThrow("Too late");
  });

  it("crafts item with sufficient ingredients", () => {
    const state = craftCollectible({
      state: {
        ...GAME_STATE,
        balance: new Decimal(1),
        inventory: {
          Gold: new Decimal(10),
          Apple: new Decimal(15),
          Orange: new Decimal(12),
          Blueberry: new Decimal(10),
        },
      },
      action: {
        type: "collectible.crafted",
        name: "Immortal Pear",
      },
    });

    expect(state.inventory["Immortal Pear"]).toEqual(new Decimal(1));
    expect(state.inventory["Gold"]).toEqual(new Decimal(5));
    expect(state.inventory["Apple"]).toEqual(new Decimal(5));
    expect(state.inventory["Orange"]).toEqual(new Decimal(2));
    expect(state.inventory["Blueberry"]).toEqual(new Decimal(0));
  });

  it("does not craft an item that is not in stock", () => {
    expect(() =>
      craftCollectible({
        state: {
          ...GAME_STATE,
          stock: {
            "Immortal Pear": new Decimal(0),
          },
          balance: new Decimal(10),
        },
        action: {
          type: "collectible.crafted",
          name: "Immortal Pear",
        },
      })
    ).toThrow("Not enough stock");
  });

  it("increments Immortal Pear Crafted activity by 1 when 1 pear is crafted", () => {
    const state = craftCollectible({
      state: {
        ...GAME_STATE,
        balance: new Decimal(1),
        inventory: {
          Gold: new Decimal(10),
          Apple: new Decimal(15),
          Orange: new Decimal(12),
          Blueberry: new Decimal(10),
        },
      },
      action: {
        type: "collectible.crafted",
        name: "Immortal Pear",
      },
    });

    expect(state.bumpkin?.activity?.["Immortal Pear Crafted"]).toBe(1);
  });

  it("requires ID does not exist", () => {
    expect(() =>
      craftCollectible({
        state: {
          ...GAME_STATE,
          balance: new Decimal(1),
          inventory: {
            Sunflower: new Decimal(150),
            "Basic Land": new Decimal(10),
            Gold: new Decimal(100),
            "Wooden Compass": new Decimal(50),
          },
          buildings: {},
          collectibles: {
            "Treasure Map": [
              {
                id: "123",
                coordinates: { x: 0, y: 0 },
                createdAt: 0,
                readyAt: 0,
              },
            ],
          },
        },
        action: {
          type: "collectible.crafted",
          name: "Treasure Map",
          coordinates: { x: 0, y: 5 },
          id: "123",
        },
      })
    ).toThrow("ID already exists");
  });

  it("requires decoration does not collide", () => {
    expect(() =>
      craftCollectible({
        state: {
          ...GAME_STATE,
          balance: new Decimal(1),
          inventory: {
            Sunflower: new Decimal(150),
            "Basic Land": new Decimal(10),
            Gold: new Decimal(100),
            "Wooden Compass": new Decimal(50),
          },
          buildings: {},
          collectibles: {
            "Treasure Map": [
              {
                id: "123",
                coordinates: { x: 0, y: 0 },
                createdAt: 0,
                readyAt: 0,
              },
            ],
          },
        },
        action: {
          type: "collectible.crafted",
          name: "Treasure Map",
          coordinates: { x: 0, y: 0 },
          id: "456",
        },
      })
    ).toThrow("Decoration collides");
  });

  it("places decoration", () => {
    const state = craftCollectible({
      state: {
        ...GAME_STATE,
        balance: new Decimal(1),
        inventory: {
          Sunflower: new Decimal(150),
          "Basic Land": new Decimal(10),
          Gold: new Decimal(100),
          "Wooden Compass": new Decimal(50),
        },
        buildings: {},
        collectibles: {},
      },
      action: {
        type: "collectible.crafted",
        name: "Treasure Map",
        coordinates: { x: 0, y: 5 },
        id: "456",
      },
    });

    expect(state.collectibles["Treasure Map"]?.[0]?.coordinates).toEqual({
      x: 0,
      y: 5,
    });
  });
  it("crafts item with sufficient ingredients", () => {
    const state = craftCollectible({
      state: {
        ...GAME_STATE,
        balance: new Decimal(100),
        inventory: {
          "Crow Feather": new Decimal(500),
        },
      },
      action: {
        type: "collectible.crafted",
        name: "Kernaldo",
      },
    });

    expect(state.inventory["Kernaldo"]).toEqual(new Decimal(1));
    expect(state.inventory["Crow Feather"]).toEqual(new Decimal(0));
    expect(state.balance).toEqual(new Decimal(50));
  });
});
