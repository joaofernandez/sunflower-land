import Decimal from "decimal.js-light";
import { hasRemoveRestriction } from "./removeables";
import { TEST_FARM } from "../lib/constants";

describe("canremove", () => {
  describe("prevents", () => {
    it("prevents a user from removing mutant chickens if some chicken is fed", () => {
      const [restricted] = hasRemoveRestriction("Rich Chicken", "1", {
        ...TEST_FARM,
        inventory: {
          "Rich Chicken": new Decimal(1),
        },
        chickens: {
          1: {
            multiplier: 1,
            fedAt: Date.now(),
          },
        },
      });

      expect(restricted).toBe(true);
    });

    it("prevents a user from removing chicken coop if some chicken is fed", () => {
      const [restricted] = hasRemoveRestriction("Chicken Coop", "1", {
        ...TEST_FARM,
        inventory: {
          "Chicken Coop": new Decimal(1),
        },
        chickens: {
          1: {
            multiplier: 1,
            fedAt: Date.now(),
          },
        },
      });

      expect(restricted).toBe(true);
    });

    it("prevents a user from removing Bale if some chicken is fed and within AoE", () => {
      const [restricted] = hasRemoveRestriction("Bale", "1", {
        ...TEST_FARM,
        inventory: {
          Bale: new Decimal(1),
        },
        collectibles: {
          Bale: [
            {
              id: "123",
              coordinates: { x: 0, y: 0 },
              createdAt: 0,
              readyAt: 0,
            },
          ],
        },
        chickens: {
          1: {
            multiplier: 1,
            fedAt: Date.now(),
            coordinates: { x: -1, y: 0 },
          },
        },
      });

      expect(restricted).toBe(true);
    });

    it("prevents a user from removing rooster if some chicken is fed", () => {
      const [restricted] = hasRemoveRestriction("Rooster", "1", {
        ...TEST_FARM,
        inventory: {
          Rooster: new Decimal(1),
        },
        chickens: {
          1: {
            multiplier: 1,
            fedAt: Date.now(),
          },
        },
      });

      expect(restricted).toBe(true);
    });

    it("prevents a user from removing an easter bunny when in use", () => {
      const [restricted] = hasRemoveRestriction("Easter Bunny", "1", {
        ...TEST_FARM,
        crops: {
          0: {
            createdAt: Date.now(),
            x: -2,
            y: -1,
            height: 1,
            width: 1,
            crop: { name: "Carrot", plantedAt: Date.now(), amount: 1 },
          },
        },
      });

      expect(restricted).toBe(true);
    });

    it("prevents a user from removing victoria sisters when in use", () => {
      const [restricted] = hasRemoveRestriction("Victoria Sisters", "1", {
        ...TEST_FARM,
        crops: {
          0: {
            createdAt: Date.now(),
            x: -2,
            y: -1,
            height: 1,
            width: 1,
            crop: { name: "Pumpkin", plantedAt: Date.now(), amount: 1 },
          },
        },
      });

      expect(restricted).toBe(true);
    });

    it("prevents a user from removing a golden cauliflower when in use", () => {
      const [restricted] = hasRemoveRestriction("Golden Cauliflower", "1", {
        ...TEST_FARM,
        crops: {
          0: {
            createdAt: Date.now(),
            x: -2,
            y: -1,
            height: 1,
            width: 1,
            crop: {
              name: "Cauliflower",
              plantedAt: Date.now(),
              amount: 1,
            },
          },
        },
      });

      expect(restricted).toBe(true);
    });

    it("prevents a user from removing a parsnip in use", () => {
      const [restricted] = hasRemoveRestriction("Mysterious Parsnip", "1", {
        ...TEST_FARM,
        crops: {
          0: {
            createdAt: Date.now(),
            x: -2,
            y: -1,
            height: 1,
            width: 1,
            crop: { name: "Parsnip", plantedAt: Date.now(), amount: 1 },
          },
        },
      });

      expect(restricted).toBe(true);
    });

    it("prevents a user from removing a T1 scarecrow while they have crops", () => {
      const [restricted] = hasRemoveRestriction("Nancy", "1", {
        ...TEST_FARM,
        crops: {
          0: {
            createdAt: Date.now(),
            x: -2,
            y: -1,
            height: 1,
            width: 1,
            crop: { name: "Sunflower", plantedAt: Date.now(), amount: 1 },
          },
        },
      });

      expect(restricted).toBe(true);
    });

    it("prevents a user from removing a T2 scarecrow while they have crops", () => {
      const [restricted] = hasRemoveRestriction("Scarecrow", "1", {
        ...TEST_FARM,
        crops: {
          0: {
            createdAt: Date.now(),
            x: -2,
            y: -1,
            height: 1,
            width: 1,
            crop: { name: "Sunflower", plantedAt: Date.now(), amount: 1 },
          },
        },
      });

      expect(restricted).toBe(true);
    });

    it("prevents a user from removing a T3 scarecrow while they have crops", () => {
      const [restricted] = hasRemoveRestriction("Kuebiko", "1", {
        ...TEST_FARM,
        crops: {
          0: {
            createdAt: Date.now(),
            x: -2,
            y: -1,
            height: 1,
            width: 1,
            crop: { name: "Sunflower", plantedAt: Date.now(), amount: 1 },
          },
        },
      });

      expect(restricted).toBe(true);
    });

    it("prevents a user from removing a T1 beaver while trees are replenishing", () => {
      const [restricted] = hasRemoveRestriction("Woody the Beaver", "1", {
        ...TEST_FARM,
        trees: {
          0: {
            wood: {
              amount: 1,
              choppedAt: Date.now(),
            },
            x: -3,
            y: 3,
            height: 2,
            width: 2,
          },
        },
      });

      expect(restricted).toBe(true);
    });

    it("prevents a user from removing a T2 beaver while trees are replenishing", () => {
      const [restricted] = hasRemoveRestriction("Apprentice Beaver", "1", {
        ...TEST_FARM,
        trees: {
          0: {
            wood: {
              amount: 1,
              choppedAt: Date.now(),
            },
            x: -3,
            y: 3,
            height: 2,
            width: 2,
          },
        },
      });

      expect(restricted).toBe(true);
    });

    it("prevents a user from removing a T3 beaver while trees are replenishing", () => {
      const [restricted] = hasRemoveRestriction("Foreman Beaver", "1", {
        ...TEST_FARM,
        trees: {
          0: {
            wood: {
              amount: 1,
              choppedAt: Date.now(),
            },
            x: -3,
            y: 3,
            height: 2,
            width: 2,
          },
        },
      });

      expect(restricted).toBe(true);
    });

    it("prevents a user from removing Rock Golem while they have replenishing stones", () => {
      const [restricted] = hasRemoveRestriction("Rock Golem", "1", {
        ...TEST_FARM,
        stones: {
          0: {
            x: 0,
            y: 3,
            width: 1,
            height: 1,
            stone: {
              amount: 1,
              minedAt: Date.now(),
            },
          },
        },
      });

      expect(restricted).toBe(true);
    });

    it("prevents a user from removing Tunnel Mole while they have replenishing stones", () => {
      const [restricted] = hasRemoveRestriction("Tunnel Mole", "1", {
        ...TEST_FARM,
        stones: {
          0: {
            x: 0,
            y: 3,
            width: 1,
            height: 1,
            stone: {
              amount: 1,
              minedAt: Date.now(),
            },
          },
        },
      });

      expect(restricted).toBe(true);
    });

    it("prevents a user from removing Rocky the Mole while they have replenishing iron", () => {
      const restricted = hasRemoveRestriction("Rocky the Mole", "1", {
        ...TEST_FARM,
        iron: {
          0: {
            x: 0,
            y: 3,
            width: 1,
            height: 1,
            stone: {
              amount: 1,
              minedAt: Date.now(),
            },
          },
        },
      });

      expect(restricted).toBeTruthy();
    });

    it("prevents a user from removing Nugget while they have replenishing gold", () => {
      const [restricted] = hasRemoveRestriction("Nugget", "1", {
        ...TEST_FARM,
        gold: {
          0: {
            x: 0,
            y: 3,
            width: 1,
            height: 1,
            stone: {
              amount: 1,
              minedAt: Date.now(),
            },
          },
        },
      });

      expect(restricted).toBeTruthy();
    });

    it("prevents a user from removing a peeled potato when potato's are planted", () => {
      const [restricted] = hasRemoveRestriction("Peeled Potato", "1", {
        ...TEST_FARM,
        inventory: {
          "Peeled Potato": new Decimal(2),
        },
        crops: {
          0: {
            createdAt: Date.now(),
            x: -2,
            y: -1,
            height: 1,
            width: 1,
            crop: { name: "Potato", plantedAt: Date.now(), amount: 1 },
          },
        },
      });

      expect(restricted).toBe(true);
    });
  });

  describe("enables", () => {
    it("enables users to remove crops", () => {
      const [restricted] = hasRemoveRestriction("Sunflower", "1", {
        ...TEST_FARM,
        inventory: {
          Sunflower: new Decimal(1),
        },
      });

      expect(restricted).toBe(false);
    });

    it("enables users to remove resources", () => {
      const [restricted] = hasRemoveRestriction("Wood", "1", {
        ...TEST_FARM,
        inventory: {
          Wood: new Decimal(1),
        },
      });

      expect(restricted).toBe(false);
    });

    it("enables users to remove flags", () => {
      const [restricted] = hasRemoveRestriction("Goblin Flag", "1", {
        ...TEST_FARM,
        inventory: {
          "Goblin Flag": new Decimal(1),
        },
      });

      expect(restricted).toBe(false);
    });

    it("enables users to remove observatory", () => {
      const [restricted] = hasRemoveRestriction("Observatory", "1", {
        ...TEST_FARM,
        inventory: {
          Observatory: new Decimal(1),
        },
      });

      expect(restricted).toBe(false);
    });

    it("enables a user to remove an easter bunny when not in use", () => {
      const [restricted] = hasRemoveRestriction("Easter Bunny", "1", {
        ...TEST_FARM,
        crops: {
          0: {
            createdAt: Date.now(),
            x: -2,
            y: -1,
            height: 1,
            width: 1,
          },
        },
      });

      expect(restricted).toBe(false);
    });

    it("enables a user to remove victoria sisters when not in use", () => {
      const [restricted] = hasRemoveRestriction("Victoria Sisters", "1", {
        ...TEST_FARM,
        crops: {
          0: {
            createdAt: Date.now(),
            x: -2,
            y: -1,
            height: 1,
            width: 1,
          },
        },
      });

      expect(restricted).toBe(false);
    });

    it("enables a user to remove a golden cauliflower when not in use", () => {
      const [restricted] = hasRemoveRestriction("Golden Cauliflower", "1", {
        ...TEST_FARM,
        crops: {
          0: {
            createdAt: Date.now(),
            x: -2,
            y: -1,
            height: 1,
            width: 1,
            crop: { name: "Sunflower", plantedAt: Date.now(), amount: 1 },
          },
        },
      });

      expect(restricted).toBe(false);
    });

    it("enables a user to remove a mysterious parsnip when not in use", () => {
      const [restricted] = hasRemoveRestriction("Mysterious Parsnip", "1", {
        ...TEST_FARM,
        crops: {
          0: {
            createdAt: Date.now(),
            x: -2,
            y: -1,
            height: 1,
            width: 1,
            crop: { name: "Sunflower", plantedAt: Date.now(), amount: 1 },
          },
        },
      });

      expect(restricted).toBe(false);
    });

    it("enables a user to remove a T1 scarecrow when not in use", () => {
      const [restricted] = hasRemoveRestriction("Nancy", "1", {
        ...TEST_FARM,
        inventory: {
          Nancy: new Decimal(1),
        },
        crops: {
          0: {
            createdAt: Date.now(),
            x: -2,
            y: -1,
            height: 1,
            width: 1,
          },
        },
      });

      expect(restricted).toBe(false);
    });

    it("enables a user to remove a T2 scarecrow when not in use", () => {
      const [restricted] = hasRemoveRestriction("Scarecrow", "1", {
        ...TEST_FARM,
        inventory: {
          Scarecrow: new Decimal(1),
        },
        crops: {
          0: {
            createdAt: Date.now(),
            x: -2,
            y: -1,
            height: 1,
            width: 1,
          },
        },
      });

      expect(restricted).toBe(false);
    });

    it("enables a user to remove a T3 scarecrow when not in use", () => {
      const [restricted] = hasRemoveRestriction("Kuebiko", "1", {
        ...TEST_FARM,
        inventory: { Kuebiko: new Decimal(1) },
        crops: {
          0: {
            createdAt: Date.now(),
            x: -2,
            y: -1,
            height: 1,
            width: 1,
          },
        },
      });

      expect(restricted).toBe(false);
    });

    it("enables a user to remove a T1 beaver when not in use", () => {
      const [restricted] = hasRemoveRestriction("Woody the Beaver", "1", {
        ...TEST_FARM,
        inventory: {
          "Woody the Beaver": new Decimal(1),
        },
        trees: {
          0: {
            x: 0,
            y: 3,
            width: 1,
            height: 1,
            wood: {
              amount: 1,
              choppedAt: 0,
            },
          },
        },
      });

      expect(restricted).toBe(false);
    });

    it("enables a user to remove a T2 beaver when not in use", () => {
      const [restricted] = hasRemoveRestriction("Apprentice Beaver", "1", {
        ...TEST_FARM,
        inventory: { "Apprentice Beaver": new Decimal(1) },
        trees: {
          0: {
            wood: {
              amount: 1,
              choppedAt: 0,
            },
            x: -3,
            y: 3,
            height: 2,
            width: 2,
          },
        },
      });

      expect(restricted).toBe(false);
    });

    it("enables a user to remove a T3 beaver when not in use", () => {
      const [restricted] = hasRemoveRestriction("Foreman Beaver", "1", {
        ...TEST_FARM,
        inventory: {
          "Foreman Beaver": new Decimal(1),
        },
        trees: {
          0: {
            x: 0,
            y: 3,
            width: 1,
            height: 1,
            wood: {
              amount: 1,
              choppedAt: 0,
            },
          },
        },
      });

      expect(restricted).toBe(false);
    });

    it("enable a user to remove kuebiko while they don't have seeds or crops", () => {
      const [restricted] = hasRemoveRestriction("Kuebiko", "1", {
        ...TEST_FARM,
        crops: {
          0: {
            createdAt: Date.now(),
            x: -2,
            y: -1,
            height: 1,
            width: 1,
          },
        },
        inventory: {
          Kuebiko: new Decimal(1),
        },
      });

      expect(restricted).toBe(false);
    });

    it("enable a user to remove Rock Golem while they don't have stones replenishing", () => {
      const [restricted] = hasRemoveRestriction("Rock Golem", "1", {
        ...TEST_FARM,
        iron: {
          0: {
            x: 0,
            y: 3,
            width: 1,
            height: 1,
            stone: {
              amount: 1,
              minedAt: 0,
            },
          },
        },
      });

      expect(restricted).toBe(false);
    });

    it("enable a user to remove Tunnel Mole while they don't have stones replenishing", () => {
      const [restricted] = hasRemoveRestriction("Tunnel Mole", "1", {
        ...TEST_FARM,
        stones: {
          0: {
            x: 0,
            y: 3,
            width: 1,
            height: 1,
            stone: {
              amount: 1,
              minedAt: 0,
            },
          },
        },
      });

      expect(restricted).toBe(false);
    });

    it("enable a user to remove Rocky the Mole while they don't have irons replenishing", () => {
      const iron = hasRemoveRestriction("Rocky the Mole", "1", {
        ...TEST_FARM,
        iron: {
          0: {
            x: 0,
            y: 3,
            width: 1,
            height: 1,
            stone: {
              amount: 1,
              minedAt: 0,
            },
          },
        },
      });

      expect(iron).toBeTruthy();
    });

    it("enable a user to remove Nugget while they don't have stones replenishing", () => {
      const gold = hasRemoveRestriction("Nugget", "1", {
        ...TEST_FARM,
        gold: {
          0: {
            x: 0,
            y: 3,
            width: 1,
            height: 1,
            stone: {
              amount: 1,
              minedAt: 0,
            },
          },
        },
      });

      expect(gold).toBeTruthy();
    });

    it("enables a user to remove mutant chickens as long as no chickens are fed", () => {
      const [restricted] = hasRemoveRestriction("Rich Chicken", "1", {
        ...TEST_FARM,
        inventory: {
          "Rich Chicken": new Decimal(1),
        },
        chickens: {},
      });

      expect(restricted).toBe(false);
    });

    it("enables a user to remove chicken coop as long as no chickens are fed", () => {
      const [restricted] = hasRemoveRestriction("Chicken Coop", "1", {
        ...TEST_FARM,
        inventory: {
          "Chicken Coop": new Decimal(1),
        },
        chickens: {},
      });

      expect(restricted).toBe(false);
    });

    it("enables a user to remove rooster as long as no chickens are fed", () => {
      const [restricted] = hasRemoveRestriction("Rooster", "1", {
        ...TEST_FARM,
        inventory: {
          Rooster: new Decimal(1),
        },
        chickens: {},
      });

      expect(restricted).toBe(false);
    });

    it("enables a user to remove carrot sword as long as no crops are planted", () => {
      const [restricted] = hasRemoveRestriction("Carrot Sword", "1", {
        ...TEST_FARM,
        crops: {
          0: {
            createdAt: Date.now(),
            x: -2,
            y: -1,
            height: 1,
            width: 1,
          },
        },
        inventory: {
          "Carrot Sword": new Decimal(1),
        },
      });

      expect(restricted).toBe(false);
    });

    it("enables a user to remove a collectible that is not placed", () => {
      const [restricted] = hasRemoveRestriction("Apprentice Beaver", "1", {
        ...TEST_FARM,
        collectibles: {},
      });

      expect(restricted).toBe(false);
    });

    // Hang over from previous bug where we were leaving an empty array against a collectible key if all were removed.
    it("enables a user to remove a collectible that is not placed but has a key in the db with empty array", () => {
      const [restricted] = hasRemoveRestriction("Apprentice Beaver", "1", {
        ...TEST_FARM,
        collectibles: {
          "Apprentice Beaver": [],
        },
      });

      expect(restricted).toBe(false);
    });

    it("enables a user to remove a collectible when a player has two and one is placed", () => {
      const [restricted] = hasRemoveRestriction("Apprentice Beaver", "1", {
        ...TEST_FARM,
        inventory: {
          "Apprentice Beaver": new Decimal(2),
        },
        collectibles: {
          "Apprentice Beaver": [
            {
              id: "123",
              createdAt: 0,
              coordinates: { x: 1, y: 1 },
              readyAt: 0,
            },
          ],
        },
      });

      expect(restricted).toBe(false);
    });
  });

  it("enables a user to remove a peeled potato when not in use", () => {
    const [restricted] = hasRemoveRestriction("Peeled Potato", "1", {
      ...TEST_FARM,
      inventory: {
        "Peeled Potato": new Decimal(2),
      },
      crops: {
        0: {
          createdAt: Date.now(),
          x: -2,
          y: -1,
          height: 1,
          width: 1,
          crop: { name: "Sunflower", plantedAt: Date.now(), amount: 1 },
        },
      },
    });

    expect(restricted).toBe(false);
  });

  it("enables a user to remove Cabbage Boy as long as no Cabbages are planted", () => {
    const [restricted] = hasRemoveRestriction("Cabbage Boy", "1", {
      ...TEST_FARM,
      crops: {
        0: {
          createdAt: Date.now(),
          x: -2,
          y: -1,
          height: 1,
          width: 1,
          crop: { name: "Sunflower", plantedAt: Date.now(), amount: 1 },
        },
      },
      inventory: {
        "Cabbage Boy": new Decimal(1),
      },
    });

    expect(restricted).toBe(false);
  });

  it("prevents a user from removing Cabbage Boy when Cabbages are planted", () => {
    const [restricted] = hasRemoveRestriction("Cabbage Boy", "1", {
      ...TEST_FARM,
      crops: {
        0: {
          createdAt: Date.now(),
          x: -2,
          y: -1,
          height: 1,
          width: 1,
          crop: { name: "Cabbage", plantedAt: Date.now(), amount: 1 },
        },
      },
      inventory: {
        "Cabbage Boy": new Decimal(1),
      },
    });

    expect(restricted).toBe(true);
  });

  it("enables a user to remove Cabbage Girl as long as no Cabbages are planted", () => {
    const [restricted] = hasRemoveRestriction("Cabbage Girl", "1", {
      ...TEST_FARM,
      crops: {
        0: {
          createdAt: Date.now(),
          x: -2,
          y: -1,
          height: 1,
          width: 1,
          crop: { name: "Sunflower", plantedAt: Date.now(), amount: 1 },
        },
      },
      inventory: {
        "Cabbage Girl": new Decimal(1),
      },
    });

    expect(restricted).toBe(false);
  });

  it("prevents a user from removing Cabbage Girl when Cabbages are planted", () => {
    const [restricted] = hasRemoveRestriction("Cabbage Girl", "1", {
      ...TEST_FARM,
      crops: {
        0: {
          createdAt: Date.now(),
          x: -2,
          y: -1,
          height: 1,
          width: 1,
          crop: { name: "Cabbage", plantedAt: Date.now(), amount: 1 },
        },
      },
      inventory: {
        "Cabbage Girl": new Decimal(1),
      },
    });

    expect(restricted).toBe(true);
  });

  it("enables a user to remove Karkinos as long as no Cabbages are planted", () => {
    const [restricted] = hasRemoveRestriction("Karkinos", "1", {
      ...TEST_FARM,
      crops: {
        0: {
          createdAt: Date.now(),
          x: -2,
          y: -1,
          height: 1,
          width: 1,
          crop: { name: "Sunflower", plantedAt: Date.now(), amount: 1 },
        },
      },
      inventory: {
        Karkinos: new Decimal(1),
      },
    });

    expect(restricted).toBe(false);
  });

  it("prevents a user from removing Karkinos when Cabbages are planted", () => {
    const [restricted] = hasRemoveRestriction("Karkinos", "1", {
      ...TEST_FARM,
      crops: {
        0: {
          createdAt: Date.now(),
          x: -2,
          y: -1,
          height: 1,
          width: 1,
          crop: { name: "Cabbage", plantedAt: Date.now(), amount: 1 },
        },
      },
      inventory: {
        Karkinos: new Decimal(1),
      },
    });

    expect(restricted).toBe(true);
  });

  it("enables a user to remove Pablo The Bunny as long as no Cabbages are planted", () => {
    const [restricted] = hasRemoveRestriction("Pablo The Bunny", "1", {
      ...TEST_FARM,
      crops: {
        0: {
          createdAt: Date.now(),
          x: -2,
          y: -1,
          height: 1,
          width: 1,
          crop: { name: "Sunflower", plantedAt: Date.now(), amount: 1 },
        },
      },
      inventory: {
        "Pablo The Bunny": new Decimal(1),
      },
    });

    expect(restricted).toBe(false);
  });

  it("prevents a user from removing Pablo The Bunny when Cabbages are planted", () => {
    const [restricted] = hasRemoveRestriction("Pablo The Bunny", "1", {
      ...TEST_FARM,
      crops: {
        0: {
          createdAt: Date.now(),
          x: -2,
          y: -1,
          height: 1,
          width: 1,
          crop: { name: "Carrot", plantedAt: Date.now(), amount: 1 },
        },
      },
      inventory: {
        "Pablo The Bunny": new Decimal(1),
      },
    });

    expect(restricted).toBe(true);
  });

  it("prevents a user from removing Tin Turtle when Stones are mined", () => {
    const [restricted] = hasRemoveRestriction("Tin Turtle", "1", {
      ...TEST_FARM,
      stones: {
        0: {
          x: 0,
          y: 3,
          width: 1,
          height: 1,
          stone: {
            amount: 1,
            minedAt: Date.now() - 100,
          },
        },
      },
      inventory: {
        "Tin Turtle": new Decimal(1),
      },
    });

    expect(restricted).toBe(true);
  });

  it("prevents a user from removing Emerald Turtle when Stone is mined", () => {
    const [restricted] = hasRemoveRestriction("Emerald Turtle", "1", {
      ...TEST_FARM,
      stones: {
        0: {
          x: 0,
          y: 3,
          width: 1,
          height: 1,
          stone: {
            amount: 1,
            minedAt: Date.now() - 100,
          },
        },
      },
      inventory: {
        "Emerald Turtle": new Decimal(1),
      },
    });

    expect(restricted).toBe(true);
  });

  it("prevents a user from removing Emerald Turtle when iron is mined", () => {
    const [restricted] = hasRemoveRestriction("Emerald Turtle", "1", {
      ...TEST_FARM,
      iron: {
        0: {
          x: 0,
          y: 3,
          width: 1,
          height: 1,
          stone: {
            amount: 1,
            minedAt: Date.now() - 100,
          },
        },
      },
      inventory: {
        "Emerald Turtle": new Decimal(1),
      },
    });

    expect(restricted).toBe(true);
  });

  it("prevents a user from removing Emerald Turtle when Gold is mined", () => {
    const [restricted] = hasRemoveRestriction("Emerald Turtle", "1", {
      ...TEST_FARM,
      gold: {
        0: {
          x: 0,
          y: 3,
          width: 1,
          height: 1,
          stone: {
            amount: 1,
            minedAt: Date.now() - 100,
          },
        },
      },
      inventory: {
        "Emerald Turtle": new Decimal(1),
      },
    });

    expect(restricted).toBe(true);
  });

  it("prevents a user from removing Maximus when Eggplant is planted", () => {
    const [restricted] = hasRemoveRestriction("Maximus", "1", {
      ...TEST_FARM,
      crops: {
        0: {
          createdAt: Date.now(),
          x: -2,
          y: -1,
          height: 1,
          width: 1,
          crop: { name: "Eggplant", plantedAt: Date.now(), amount: 1 },
        },
      },
      inventory: {
        Maximus: new Decimal(1),
      },
    });

    expect(restricted).toBe(true);
  });

  it("prevents a user from removing Purple Trail when Eggplant is planted", () => {
    const [restricted] = hasRemoveRestriction("Purple Trail", "1", {
      ...TEST_FARM,
      crops: {
        0: {
          createdAt: Date.now(),
          x: -2,
          y: -1,
          height: 1,
          width: 1,
          crop: { name: "Eggplant", plantedAt: Date.now(), amount: 1 },
        },
      },
      inventory: {
        Maximus: new Decimal(1),
      },
    });

    expect(restricted).toBe(true);
  });

  it("prevents a user from removing Carrot Sword when Magic Bean is planted", () => {
    const [restricted] = hasRemoveRestriction("Carrot Sword", "1", {
      ...TEST_FARM,
      collectibles: {
        "Magic Bean": [
          { coordinates: { x: 1, y: 1 }, createdAt: 0, id: "123", readyAt: 0 },
        ],
      },
      inventory: {
        Maximus: new Decimal(1),
      },
    });

    expect(restricted).toBe(true);
  });
});
