import { useDialog } from "@/services/dialog.service";
import { useStore } from "@/services/store.service";
import { INPUT_TYPES } from "@/types/enums";
import { IDialog} from "@/types/interfaces";
import colors from "vuetify/lib/util/colors.mjs";
import { armorTypes } from "./staticData";

export const openDialogInflictWounds = (callback: Function) => {
  const inputId = "id:modifier-dialog";
  const dialogDataCheckModifier: IDialog = {
    headline: "Inflict Damage",
    icon: "mdi-water-outline",
    input: {
      id: inputId,
      type: INPUT_TYPES.NUMERIC,
      width: "100%",
      range: [0,1000],
      placeholder: "Damage",
    },
    text: "How much damage is inflicted?",
    buttons: [
      {
        text: "Confirm",
        callback: () => {
          const damage = Number(useStore().getValueById(inputId, 0));
          useDialog().closeDialog();
          callback(damage);
        }
      },
      {
        text: "Abort",
        callback: () => {
          useDialog().closeDialog();
        }
      }
    ]
  }
  useDialog().openDialog(dialogDataCheckModifier);
}

export const chooseModifierAndMakeCheck = (elementId: string, headline: string, ability: string, callback?: Function) => {
  const inputId = "id:modifier-dialog";
  const dialogDataCheckModifier: IDialog = {
    headline: headline,
    input: {
      id: inputId,
      type: INPUT_TYPES.NUMERIC,
      width: "100%",
      range: [-10,10],
      placeholder: "Modifier",
    },
    text: `Confirm the modifier for the ${ability}-Check!`,
    buttons: [
      {
        text: "Confirm",
        callback: () => {
          const modifier = useStore().getValueById(inputId, 0);
          makeCheckWithFixedModifier(elementId, headline, ability, modifier, callback);
        }
      },
      {
        text: "Abort",
        callback: () => {
          useDialog().closeDialog();
        }
      }
    ]
  }
  useDialog().openDialog(dialogDataCheckModifier);
}

export const makeCheckWithFixedModifier = (elementId: string, headline: string, ability: string, modifier: number, callback?: Function) => {
  const targetValue = 20;
  const currentValue = useStore().getValueById(elementId, 0);
  const rnd = Math.floor(Math.random() * 20) + 1;
  const result = (Number(rnd) + Number(currentValue) + Number(modifier));
  const success = result >= targetValue;
  const dialogData: IDialog = {
    headline: headline,
    icon: success ? "mdi-check-circle-outline" : "mdi-close-circle-outline",
    color: success ? colors.green.base : colors.red.base,
    text: `Rolled a ${rnd} + ${modifier != 0 ? currentValue + (modifier > 0 ? " + " : " - ") + Math.abs(modifier) : currentValue} = ${result} against ${targetValue}. The check on ${ability} ${success ? " was a success!" : " failed!"}`,
    buttons: [
      {
        text: "Ok",
        callback: () => {
          if (callback !== undefined) {
            callback();
          }
          useDialog().closeDialog();
        }
      }
    ]
  }
  useDialog().openDialog(dialogData);
}

export const makeFightCheck = (elementId: string, damageId: string, damageTypeId: string, type: "Attack" | "Parry", ability: string, modifier: number) => {
  const currentValue = useStore().getValueById(elementId, 0);
  const damage = useStore().getValueById(damageId, "");
  const damageType = useStore().getValueById(damageTypeId, "");
  const rnd = Math.floor(Math.random() * 20) + 1;
  const result = (Number(rnd) + Number(currentValue) + Number(modifier));
  const dialogData: IDialog = {
    headline: `${ability}-${type}`,
    icon: type == "Attack" ? "mdi-sword" : "mdi-shield-outline",
    text: `Rolled a ${rnd} + ${modifier != 0 ? currentValue + (modifier > 0 ? " + " : " - ") + Math.abs(modifier) : currentValue} = ${result}!`,
    buttons: [
      {
        text: "Roll damage",
        callback: () => {
          openDialogGeneric("Damage", `Your enemy suffers ${rollWeaponDamage(damage)} points of ${damageType} damage!`, "mdi-water");
        }
      },
      {
        text: "Missed!",
        callback: () => {
          useDialog().closeDialog();
        }
      }
    ]
  }
  useDialog().openDialog(dialogData);
}

export const chooseModifierAndMakeFightCheck = (elementId: string, damageId: string, damageTypeId: string, ability: string) => {
  const inputId = "id:modifier-dialog";
  const dialogDataCheckModifier: IDialog = {
    headline: `${ability}-Attack`,
    input: {
      id: inputId,
      type: INPUT_TYPES.NUMERIC,
      width: "100%",
      range: [-12,12],
      placeholder: "Modifier",
    },
    text: `Confirm the modifier for the ${ability}-Attack!`,
    buttons: [
      {
        text: "Confirm",
        callback: () => {
          const modifier = useStore().getValueById(inputId, 0);
          makeFightCheck(elementId, damageId, damageTypeId, "Attack", ability, modifier);
        }
      },
      {
        text: "Abort",
        callback: () => {
          useDialog().closeDialog();
        }
      }
    ]
  }
  useDialog().openDialog(dialogDataCheckModifier);
}

export const makePluckCheck = (elementId: string, headline: string) => {
  const currentValue = useStore().getValueById(elementId, 0);
  const rnd1 = Math.floor(Math.random() * 6) + 1;
  const rnd2 = Math.floor(Math.random() * 6) + 1;
  const dialogData: IDialog = {
    headline: headline,
    color: colors.blue.base,
    text: "Rolled a " + rnd1 + " + " + rnd2 + " + " + currentValue + " = " + (Number(rnd1) + Number(rnd2) + Number(currentValue)) + "!",
    buttons: [
      {
        text: "Ok",
        callback: () => {
          useDialog().closeDialog();
        }
      }
    ]
  }
  useDialog().openDialog(dialogData);
}

export const openDialogGeneric = (headline: string, text: string, icon?: string) => {
  const dialogData: IDialog = {
    headline: headline,
    icon: icon,
    text: text,
    buttons: [
      {
        text: "Ok",
        callback: () => {
          useDialog().closeDialog();
        }
      }
    ]
  }
  useDialog().openDialog(dialogData);
}

export const modifyValue = (elementId: string, value: number) => {
  const currentValue = useStore().getValueById(elementId, undefined);
  if (currentValue != undefined) {
    useStore().updateSaveableValueById(elementId, Number(currentValue) + value);
  }
}

export const getValue = <Type>(elementId: string, def: Type): Type => {
    const val = useStore().getValueById(elementId, undefined);
    return val ? val : def;
}

export const rollWeaponDamage = (damageString: string): number => {
  const regex = /^(\d*)[dD](\d+)(\s*[+-]?\s*\d+)?$/;
  const match = damageString.match(regex);

  if (!match) {
    console.error('Invalid damage string format. Please use the format "xDy+z".');
    return 0;
  } else {
    const numberOfDice = match[1] ? parseInt(match[1], 10) : 1;
    const numberOfSides = parseInt(match[2], 10);
    const staticBonus = match[3] ? parseInt(match[3].replace(/\s/g, ''), 10) : 0;
    let totalDamage = 0;
  
    for (let i = 0; i < numberOfDice; i++) {
      // Roll the dice (random number between 1 and numberOfSides)
      const rollResult = Math.floor(Math.random() * numberOfSides) + 1;
      totalDamage += rollResult;
    }
    totalDamage += staticBonus;
    return totalDamage;
  }
}

export const rollArmorRating = (armorRatingDesc: string) => {
  let armorRating = 0;
  if (armorRatingDesc == armorTypes[1]) {
    armorRating = Math.floor(Math.random() * 3) + 1;
  } else if (armorRatingDesc == armorTypes[2]) {
    armorRating = Math.floor(Math.random() * 6) + 1;
  } else if (armorRatingDesc == armorTypes[3]) {
    armorRating = Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 2;
  }
  return armorRating;
}

export const getSkillId = (skillName: string): string => {
  return `id:${skillName.toLowerCase()}`;
}