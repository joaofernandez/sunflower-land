import Decimal from "decimal.js-light";
import { INITIAL_STOCK } from "features/game/lib/constants";
import { GoblinState } from "features/game/lib/goblinMachine";
import { getBumpkinLevel } from "features/game/lib/level";
import { getKeys } from "features/game/types/craftables";
import { CROP_SEEDS } from "features/game/types/crops";
import { FRUIT_SEEDS } from "features/game/types/fruits";
import { GameState, InventoryItemName } from "features/game/types/game";
import { ITEM_DETAILS } from "features/game/types/images";
import React from "react";
import { Label } from "../Label";
import { RequirementLabel } from "../RequirementsLabel";
import { SquareIcon } from "../SquareIcon";
import { formatDateRange } from "lib/utils/time";
import { SUNNYSIDE } from "assets/sunnyside";
import {
  BUMPKIN_ITEM_PART,
  BumpkinItem,
  ITEM_IDS,
} from "features/game/types/bumpkin";
import { getImageUrl } from "features/goblins/tailor/TabContent";
import { NPC } from "features/island/bumpkin/components/NPC";

/**
 * The props for the details for items.
 * @param type The type is item.
 * @param item The item.
 * @param quantity The item quantity. Leave it undefined if quantity is not displayed.
 */
type BaseProps = {
  quantity?: Decimal;
  from?: Date;
  to?: Date;
  item?: InventoryItemName;
  wearable?: BumpkinItem;
};
type InventoryDetailsProps = BaseProps & {
  item: InventoryItemName;
};
type WearableDetailsProps = BaseProps & {
  wearable: BumpkinItem;
};
type ItemDetailsProps = InventoryDetailsProps | WearableDetailsProps;

/**
 * The props for harvests requirement label.
 * @param minHarvest The minimum number of harvests.
 * @param maxHarvest The maximum number of harvests.
 */
interface HarvestsRequirementProps {
  minHarvest: number;
  maxHarvest: number;
}

/**
 * The props for the crafting requirements.
 * @param resources The item resources requirements.
 * @param sfl The SFL requirements.
 * @param showSflIfFree Whether to show free SFL requirement if SFL cost is 0. Defaults to false.
 * @param harvests The min/max harvests for the item.
 * @param xp The XP gained for consuming the item.
 * @param timeSeconds The wait time in seconds for crafting the item.
 * @param level The level requirements.
 */
interface RequirementsProps {
  resources?: Partial<Record<InventoryItemName, Decimal>>;
  sfl?: Decimal;
  showSflIfFree?: boolean;
  harvests?: HarvestsRequirementProps;
  xp?: Decimal;
  timeSeconds?: number;
  level?: number;
}

/**
 * The props for the component.
 * @param gameState The game state.
 * @param stock The stock of the item available to craft.  Undefined if the stock is unlimited.
 * @param isLimitedItem true if the item quantity is limited to a certain number in the blockchain, else false. Defaults to false.
 * @param details The item details.
 * @param boost The available boost of the item.
 * @param requirements The item quantity requirement.
 * @param actionView The view for displaying the crafting action.
 */
interface Props {
  gameState: GameState | GoblinState;
  stock?: Decimal;
  isLimitedItem?: boolean;
  details: ItemDetailsProps;
  boost?: string;
  requirements?: RequirementsProps;
  limit?: number;
  actionView?: JSX.Element;
  hideDescription?: boolean;
}

function getDetails(
  game: GameState,
  details: ItemDetailsProps
): {
  limit: Decimal;
  count: Decimal;
  isSeed: boolean;
  image: string;
  name: string;
  description: string;
} {
  if (details.item) {
    const inventoryCount = game.inventory[details.item] ?? new Decimal(0);
    const limit = INITIAL_STOCK(game)[details.item];
    const isSeed =
      details.item in FRUIT_SEEDS() || details.item in CROP_SEEDS();

    return {
      count: inventoryCount,
      description: ITEM_DETAILS[details.item].description,
      image: ITEM_DETAILS[details.item].image,
      isSeed,
      name: details.item,
      limit: limit as Decimal,
    };
  }

  const wardrobeCount = game.wardrobe[details.wearable] ?? 0;

  return {
    count: new Decimal(wardrobeCount),
    limit: new Decimal(1),
    description: "?",
    image: getImageUrl(ITEM_IDS[details.wearable]),
    isSeed: false,
    name: details.wearable,
  };
}

/**
 * The view for displaying item name, details, crafting requirements and action.
 * @props The component props.
 */
export const CraftingRequirements: React.FC<Props> = ({
  gameState,
  stock,
  isLimitedItem = false,
  limit,
  details,
  boost,
  requirements,
  actionView,
  hideDescription,
}: Props) => {
  const getStock = () => {
    if (!stock) return <></>;

    if (stock.lessThanOrEqualTo(0)) {
      return (
        <div className="flex justify-center mt-0 sm:mb-1">
          <Label type="danger">Sold out</Label>
        </div>
      );
    }

    const { count, limit, isSeed } = getDetails(gameState, details);

    const isInventoryFull =
      isSeed && (limit === undefined ? false : count.greaterThan(limit));

    return (
      <div className="flex justify-center mt-0 sm:mb-1">
        <Label type={isInventoryFull ? "danger" : "info"}>
          {`${stock} ${isLimitedItem ? "left" : "in stock"}`}
        </Label>
      </div>
    );
  };

  const getItemDetail = ({
    hideDescription,
  }: {
    hideDescription?: boolean;
  }) => {
    const { image: icon, description, name } = getDetails(gameState, details);
    const title = details.quantity
      ? `${details.quantity} x ${details.item}`
      : name;

    return (
      <>
        <div className="flex space-x-2 justify-start items-center sm:flex-col-reverse md:space-x-0">
          {icon && !!details.item && (
            <div className="sm:mt-2">
              <SquareIcon icon={icon} width={14} />
            </div>
          )}
          {details.wearable && (
            <div className="relative sm:w-4/5 my-1  flex">
              <img src={icon} className="sm:w-full w-14 my-2 rounded-lg" />
              <div className="sm:absolute -ml-4 bottom-16 w-10 h-4 right-0">
                <NPC
                  key={details.wearable}
                  parts={{
                    body: "Beige Farmer Potion",
                    hair: "Sun Spots",
                    [BUMPKIN_ITEM_PART[details.wearable]]: details.wearable,
                  }}
                />
              </div>
            </div>
          )}
          <span className="sm:text-center">{title}</span>
        </div>
        {!hideDescription && (
          <span className="text-xs sm:mt-1 whitespace-pre-line sm:text-center">
            {description}
          </span>
        )}
      </>
    );
  };

  const getBoost = () => {
    if (!boost) return <></>;

    return (
      <div className="flex flex-col space-y-1 mt-2">
        <div className="flex justify-start sm:justify-center">
          <Label type="info" className="text-center">
            {boost}
          </Label>
        </div>
      </div>
    );
  };

  const getRequirements = () => {
    if (!requirements) return <></>;

    return (
      <div className="border-t border-white w-full my-2 pt-2 flex justify-between gap-x-3 gap-y-2 flex-wrap sm:flex-col sm:items-center sm:flex-nowrap">
        {/* Item ingredients requirements */}
        {!!requirements.resources &&
          getKeys(requirements.resources).map((ingredientName, index) => (
            <RequirementLabel
              key={index}
              type="item"
              item={ingredientName}
              balance={gameState.inventory[ingredientName] ?? new Decimal(0)}
              requirement={
                (requirements.resources ?? {})[ingredientName] ?? new Decimal(0)
              }
            />
          ))}

        {/* SFL requirement */}
        {!!requirements.sfl &&
          (requirements.sfl.greaterThan(0) || requirements.showSflIfFree) && (
            <RequirementLabel
              type="sfl"
              balance={gameState.balance}
              requirement={requirements.sfl}
            />
          )}

        {/* Harvests display */}
        {!!requirements.harvests && (
          <RequirementLabel
            type="harvests"
            minHarvest={requirements.harvests.minHarvest}
            maxHarvest={requirements.harvests.maxHarvest}
          />
        )}

        {/* XP display */}
        {!!requirements.xp && (
          <RequirementLabel type="xp" xp={requirements.xp} />
        )}

        {/* Time requirement display */}
        {!!requirements.timeSeconds && (
          <RequirementLabel
            type="time"
            waitSeconds={requirements.timeSeconds}
          />
        )}

        {/* Level requirement */}
        {!!requirements.level && (
          <RequirementLabel
            type="level"
            currentLevel={getBumpkinLevel(gameState.bumpkin?.experience ?? 0)}
            requirement={requirements.level}
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex flex-col h-full px-1 py-0">
        {getStock()}
        {details.from && (
          <Label type="warning" className="my-1 mx-auto">
            <div className="flex items-center">
              <img src={SUNNYSIDE.icons.stopwatch} className="h-5 mr-1" />
              <span className="text-xxs">
                {" "}
                {formatDateRange(details.from, details.to as Date)}
              </span>
            </div>
          </Label>
        )}
        {getItemDetail({ hideDescription })}
        {limit && (
          <p className="my-1 text-xs text-left sm:text-center">{`Max ${limit} per player`}</p>
        )}
        {getBoost()}
        {getRequirements()}
      </div>
      {actionView}
    </div>
  );
};
