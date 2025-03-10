import { createMachine, Interpreter, assign } from "xstate";

import { Context as AuthContext } from "features/auth/lib/authMachine";

import { GameState, Inventory, InventoryItemName } from "../types/game";
import { mint } from "../actions/mint";

import { getOnChainState } from "../actions/onchain";
import { ErrorCode, ERRORS } from "lib/errors";
import { EMPTY } from "./constants";
import { loadSession } from "../actions/loadSession";
import { wallet } from "lib/blockchain/wallet";
import { INITIAL_SESSION } from "./gameMachine";
import { wishingWellMachine } from "features/goblins/wishingWell/wishingWellMachine";
import { tradingPostMachine } from "features/goblins/trader/tradingPost/lib/tradingPostMachine";
import Decimal from "decimal.js-light";
import { CONFIG } from "lib/config";
import { getAvailableGameState } from "./transforms";
import { getBumpkinLevel } from "./level";
import { randomID } from "lib/utils/random";
import { OFFLINE_FARM } from "./landData";
import { GoblinBlacksmithItemName } from "../types/collectibles";
import { depositToFarm } from "lib/blockchain/Deposit";
import { reset } from "features/farming/hud/actions/reset";
import { getSessionId } from "lib/blockchain/Session";
import {
  withdrawBumpkin,
  withdrawItems,
  withdrawSFL,
  withdrawWearables,
} from "../actions/withdraw";

const API_URL = CONFIG.API_URL;

export type GoblinState = Omit<GameState, "skills">;

export interface Context {
  state: GoblinState;
  sessionId?: string;
  errorCode?: ErrorCode;
  transactionId?: string;
  farmAddress?: string;
  deviceTrackerId?: string;
  mintedAtTimes: Partial<Record<InventoryItemName, number>>;
  verified?: boolean;
}

type MintEvent = {
  type: "MINT";
  item: GoblinBlacksmithItemName;
  captcha: string;
};

export type MintedEvent = {
  item: GoblinBlacksmithItemName;
  sessionId: string;
};

type WithdrawEvent = {
  type: "WITHDRAW";
  sfl: number;
  ids: number[];
  amounts: string[];
  bumpkinId?: number;
  wearableIds: number[];
  wearableAmounts: number[];
  captcha: string;
};

type OpeningWishingWellEvent = {
  type: "OPENING_WISHING_WELL";
  authState: AuthContext;
};

type OpenTradingPostEvent = {
  type: "OPEN_TRADING_POST";
  authState: AuthContext;
};

type UpdateBalance = {
  type: "UPDATE_BALANCE";
  newBalance: Decimal;
};

type UpdateSession = {
  type: "UPDATE_SESSION";
  inventory: Inventory;
  balance: Decimal;
  sessionId: string;
  deviceTrackerId: string;
};

type DepositEvent = {
  type: "DEPOSIT";
  sfl: string;
  itemIds: number[];
  itemAmounts: string[];
  wearableIds: number[];
  wearableAmounts: number[];
  budIds: number[];
};

export type BlockchainEvent =
  | {
      type: "REFRESH";
    }
  | {
      type: "CONTINUE";
    }
  | {
      type: "OPENING_WISHING_WELL";
    }
  | {
      type: "OPEN_TRADING_POST";
    }
  | {
      type: "RESET";
    }
  | {
      type: "PROVE_PERSONHOOD";
    }
  | {
      type: "PERSONHOOD_FINISHED";
      verified: boolean;
    }
  | {
      type: "PERSONHOOD_CANCELLED";
    }
  | WithdrawEvent
  | MintEvent
  | OpeningWishingWellEvent
  | OpenTradingPostEvent
  | UpdateBalance
  | UpdateSession
  | DepositEvent;

export type GoblinMachineState = {
  value:
    | "loading"
    | "wishing"
    | "minting"
    | "minted"
    | "withdrawing"
    | "withdrawn"
    | "playing"
    | "trading"
    | "depositing"
    | "refreshing"
    | "levelRequirementNotReached"
    | "error"
    | "provingPersonhood";
  context: Context;
};

export type StateKeys = keyof Omit<GoblinMachineState, "context">;
export type StateValues = GoblinMachineState[StateKeys];

export type MachineInterpreter = Interpreter<
  Context,
  any,
  BlockchainEvent,
  GoblinMachineState
>;

export const RETREAT_LEVEL_REQUIREMENT = 1;

export function startGoblinVillage(authContext: AuthContext) {
  // You can not enter the goblin village if you do not have a farm on chain
  if (authContext.user.type !== "FULL") throw new Error("Not a full user");

  const user = authContext.user;

  return createMachine<Context, BlockchainEvent, GoblinMachineState>(
    {
      id: "goblinMachine",
      initial: API_URL ? "loading" : "playing",
      context: {
        state: API_URL ? EMPTY : OFFLINE_FARM,
        sessionId: INITIAL_SESSION,
        mintedAtTimes: {},
      },
      states: {
        loading: {
          entry: "setTransactionId",
          invoke: {
            src: async (context) => {
              if (!wallet.myAccount) throw new Error("No account");

              const farmId = user.farmId as number;

              const onChainStateFn = getOnChainState({
                farmAddress: user.farmAddress as string,
                account: wallet.myAccount,
                id: farmId,
              });

              // Get session id
              const sessionIdFn = getSessionId(wallet.web3Provider, farmId);

              const [onChainState, sessionId] = await Promise.all([
                onChainStateFn,
                sessionIdFn,
              ]);

              const response = await loadSession({
                farmId,
                sessionId,
                token: user.rawToken as string,
                transactionId: context.transactionId as string,
                wallet: user.web3?.wallet as string,
              });

              const game = response?.game as GameState;

              // Show whatever is lower, on chain or off-chain
              const availableState = getAvailableGameState({
                onChain: onChainState.game,
                offChain: game,
              });

              game.id = farmId;
              game.balance = availableState.balance;
              game.inventory = availableState.inventory;
              game.farmAddress = onChainState.game.farmAddress;

              return {
                state: game,
                mintedAtTimes: onChainState.mintedAtTimes,
                sessionId,
                deviceTrackerId: response?.deviceTrackerId,
                verified: response?.verified,
              };
            },
            onDone: [
              {
                target: "levelRequirementNotReached",
                cond: (_, event) => {
                  const { bumpkin } = event.data.state;

                  if (!bumpkin) return true;

                  const bumpkinLevel = getBumpkinLevel(bumpkin.experience);

                  return bumpkinLevel < RETREAT_LEVEL_REQUIREMENT;
                },
              },
              {
                target: "playing",
                actions: assign({
                  state: (_, event) => event.data.state,
                  sessionId: (_, event) => event.data.sessionId,
                  deviceTrackerId: (_, event) => event.data.deviceTrackerId,
                  mintedAtTimes: (_, event) => event.data.mintedAtTimes,
                  verified: (_, event) => event.data.verified,
                }),
              },
            ],
            onError: {},
          },
        },
        levelRequirementNotReached: {
          // Go back... you have no business being here :)
          entry: () => history.go(-1),
        },
        playing: {
          entry: "clearTransactionId",
          on: {
            MINT: {
              target: "minting",
            },
            WITHDRAW: {
              target: "withdrawing",
            },
            OPENING_WISHING_WELL: {
              target: "wishing",
            },
            OPEN_TRADING_POST: {
              target: "trading",
            },
            DEPOSIT: {
              target: "depositing",
            },
          },
        },
        provingPersonhood: {
          on: {
            PERSONHOOD_FINISHED: {
              actions: assign({
                verified: (_context, event) => event.verified,
              }),
              target: "playing",
            },
            PERSONHOOD_CANCELLED: {
              target: "playing",
            },
          },
        },
        wishing: {
          invoke: {
            id: "wishingWell",
            autoForward: true,
            src: wishingWellMachine,
            data: {
              farmId: () => user.farmId,
              bumpkinTokenUri: (context: Context) =>
                context.state.bumpkin?.tokenUri,
              farmAddress: () => user.farmAddress,
              sessionId: (context: Context) => context.sessionId,
              token: () => user.rawToken,
              wallet: () => user.web3?.wallet as string,
              balance: (context: Context) => context.state.balance,
            },
            onDone: {
              target: "playing",
            },
          },
          on: {
            UPDATE_BALANCE: {
              actions: assign({
                state: (context, event) => {
                  if (event.newBalance) {
                    return {
                      ...context.state,
                      balance: (event as UpdateBalance).newBalance,
                    };
                  }

                  return context.state;
                },
              }),
            },
          },
        },
        trading: {
          invoke: {
            id: "tradingPost",
            autoForward: true,
            src: tradingPostMachine,
            data: {
              farmId: () => user.farmId,
              farmAddress: () => user.farmAddress,
              token: () => user.rawToken,
              deviceTrackerId: (context: Context) => context.deviceTrackerId,
              wallet: () => user.web3?.wallet,
            },
            onDone: {
              target: "playing",
            },
            onError: [
              {
                target: "playing",
                cond: (_, event: any) =>
                  event.data.message === ERRORS.REJECTED_TRANSACTION,
              },
              {
                target: "error",
                actions: "assignErrorMessage",
              },
            ],
          },
          on: {
            UPDATE_SESSION: {
              actions: assign({
                state: (context, event) => ({
                  ...context.state,
                  inventory: event.inventory,
                  balance: event.balance,
                  sessionId: event.sessionId,
                  deviceTrackerId: event.deviceTrackerId,
                }),
              }),
            },
          },
        },
        minting: {
          entry: "setTransactionId",
          invoke: {
            src: async (context, event) => {
              const { item, captcha } = event as MintEvent;

              const { sessionId } = await mint({
                farmId: Number(user.farmId),
                sessionId: context.sessionId as string,
                token: user.rawToken as string,
                item,
                captcha,
                transactionId: context.transactionId as string,
              });

              return {
                sessionId,
                item,
              } as MintedEvent;
            },
            onDone: {
              target: "minted",
              actions: assign((_, event) => ({
                sessionId: event.data.sessionId,
                actions: [],
              })),
            },
            onError: {
              target: "error",
              actions: "assignErrorMessage",
            },
          },
        },
        minted: {
          on: {
            REFRESH: "loading",
          },
        },
        withdrawing: {
          entry: "setTransactionId",
          invoke: {
            src: async (context, event) => {
              const {
                amounts,
                ids,
                sfl,
                captcha,
                type,
                wearableAmounts,
                wearableIds,
                bumpkinId,
              } = event as WithdrawEvent;

              if (Number(sfl) > 0) {
                const { sessionId } = await withdrawSFL({
                  farmId: Number(user.farmId),
                  sessionId: context.sessionId as string,
                  token: user.rawToken as string,
                  sfl,
                  captcha,
                  transactionId: context.transactionId as string,
                });

                return {
                  sessionId,
                };
              }

              if (ids.length > 0) {
                const { sessionId } = await withdrawItems({
                  farmId: Number(user.farmId),
                  sessionId: context.sessionId as string,
                  token: user.rawToken as string,
                  amounts,
                  ids,
                  captcha,
                  transactionId: context.transactionId as string,
                });

                return {
                  sessionId,
                };
              }

              if (wearableIds.length > 0) {
                const { sessionId } = await withdrawWearables({
                  farmId: Number(user.farmId),
                  sessionId: context.sessionId as string,
                  token: user.rawToken as string,
                  amounts: wearableAmounts,
                  ids: wearableIds,
                  captcha,
                  transactionId: context.transactionId as string,
                });

                return {
                  sessionId,
                };
              }

              if (bumpkinId) {
                const { sessionId } = await withdrawBumpkin({
                  farmId: Number(user.farmId),
                  token: user.rawToken as string,
                  transactionId: context.transactionId as string,
                  bumpkinId: bumpkinId,
                });

                return {
                  sessionId,
                };
              }
            },
            onDone: {
              target: "withdrawn",
              actions: assign({
                sessionId: (_, event) => event.data.sessionId,
              }),
            },
            onError: [
              {
                target: "playing",
                cond: (_, event: any) =>
                  event.data.message === ERRORS.REJECTED_TRANSACTION,
              },
              {
                target: "error",
                actions: "assignErrorMessage",
              },
            ],
          },
        },
        withdrawn: {
          on: {
            REFRESH: {
              target: "loading",
            },
          },
        },
        depositing: {
          invoke: {
            src: async (context, event) => {
              if (!wallet.myAccount) throw new Error("No account");

              await depositToFarm({
                web3: wallet.web3Provider,
                account: wallet.myAccount,
                farmId: context.state.id as number,
                sfl: (event as DepositEvent).sfl,
                itemIds: (event as DepositEvent).itemIds,
                itemAmounts: (event as DepositEvent).itemAmounts,
                wearableAmounts: (event as DepositEvent).wearableAmounts,
                wearableIds: (event as DepositEvent).wearableIds,
                budIds: (event as DepositEvent).budIds,
              });
            },
            onDone: {
              target: "refreshing",
            },
            onError: {
              target: "error",
              actions: "assignErrorMessage",
            },
          },
        },
        refreshing: {
          entry: "setTransactionId",
          invoke: {
            src: async (context) => {
              const fingerprint = "X";

              const { success } = await reset({
                farmId: Number(user.farmId),
                token: user.rawToken as string,
                fingerprint,
                transactionId: context.transactionId as string,
              });

              return {
                success,
              };
            },
            onDone: [
              {
                target: "loading",
              },
            ],
            onError: {
              target: "error",
              actions: "assignErrorMessage",
            },
          },
        },
        error: {},
      },
      on: {
        PROVE_PERSONHOOD: {
          target: "provingPersonhood",
        },
      },
    },
    {
      actions: {
        assignErrorMessage: assign<Context, any>({
          errorCode: (_context, event) => event.data.message,
        }),
        setTransactionId: assign<Context, any>({
          transactionId: () => randomID(),
        }),
        clearTransactionId: assign<Context, any>({
          transactionId: () => randomID(),
        }),
      },
    }
  );
}
