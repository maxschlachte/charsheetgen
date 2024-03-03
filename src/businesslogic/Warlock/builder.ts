import { ELEMENT_TYPES, CELL_TYPES } from "@/types/enums";
import { IButton, IGrid, IInputNumber, IInputText, ISelect } from "@/types/interfaces";
import { meleeSkills, rangedSkills, damageTypes, armorTypes } from "./staticData";
import { chooseModifierAndMakeFightCheck, getSkillId, getValue, makeFightCheck, modifyValue, openDialogGeneric, openDialogInflictWounds, rollArmorRating } from "./utils";
import { MDI } from "./icons";


export const buildWeaponElement = (type: "Melee" | "Ranged", idx: Number): IGrid => {
    const grid = {
        type: ELEMENT_TYPES.GRID,
        cells: []
    } as IGrid;
    const idWeaponName = `id:${type.toLowerCase()}-weapon-name-${idx}`;
    const idWeaponSkill = `id:${type.toLowerCase()}-weapon-skill-${idx}`;
    const idWeaponDamage = `id:${type.toLowerCase()}-weapon-damage-${idx}`;
    const idWeaponDamageType = `id:${type.toLowerCase()}-damage-type-${idx}`;
    const weaponName: IInputText = {
        id: idWeaponName,
        name: `${type} Weapon`,
        type: CELL_TYPES.INPUT_STRING,
        colspan: 4
    };
    const weaponSkill: ISelect = {
        id: idWeaponSkill,
        name: `${type} Skill`,
        type: CELL_TYPES.SELECT,
        items: type == "Melee" ? meleeSkills : rangedSkills,
        colspan: 4
    };
    const weaponDamage: IInputText = {
        id: idWeaponDamage,
        name: `Damage`,
        type: CELL_TYPES.INPUT_STRING,
        colspan: type == "Melee" ? 3 : 4
    };
    const damageType: ISelect = {
        id: idWeaponDamageType,
        name: `Damage Type`,
        type: CELL_TYPES.SELECT,
        items: damageTypes,
        colspan: 3
    };
    grid.cells.push([weaponName, weaponSkill]);
    if (type == "Melee") {
        const attackButton: IButton = {
          name: `Attack`,
          type: CELL_TYPES.BUTTON,
          icon: MDI.MELEE,
          action: () => {
            const weaponSkill = getValue(idWeaponSkill, undefined);
            if (weaponSkill !== undefined) {
              const skillId = getSkillId(weaponSkill);
              makeFightCheck(skillId, idWeaponDamage, idWeaponDamageType, "Attack", weaponSkill, 5);
            }
          }
        };
        const defendButton: IButton = {
          name: `Defend`,
          type: CELL_TYPES.BUTTON,
          icon: MDI.DEFEND,
          action: () => {
            const weaponSkill = getValue(idWeaponSkill, undefined);
            if (weaponSkill !== undefined) {
              const skillId = getSkillId(weaponSkill);
              makeFightCheck(skillId, idWeaponDamage, idWeaponDamageType, "Parry", weaponSkill, 0);
            }
          }
        };
        grid.cells.push([weaponDamage, damageType, attackButton, defendButton]);
    } else {
        const rangedAttackButton: IButton = {
          name: `Ranged Attack`,
          type: CELL_TYPES.BUTTON,
          icon: MDI.RANGED,
          action: () => {
            const weaponSkill = getValue(idWeaponSkill, undefined);
            if (weaponSkill !== undefined) {
              const skillId = getSkillId(weaponSkill);
              chooseModifierAndMakeFightCheck(skillId, idWeaponDamage, idWeaponDamageType, weaponSkill);
            }
          }
        };
        grid.cells.push([weaponDamage, damageType, rangedAttackButton]);
    }
    return grid;
}

export const buildArmorGrid = (staminaId: string): IGrid => {
  const grid = {
    type: ELEMENT_TYPES.GRID,
    cells: []
  } as IGrid;
  const idArmorType = "id:armor-type";
  const description: IInputText = {
    name: "Armor Description",
    type: CELL_TYPES.INPUT_STRING,
    colspan: 4
  };
  const armorTypeSelect: ISelect = {
    id: idArmorType,
    name: "Armor Type",
    type: CELL_TYPES.SELECT,
    items: armorTypes,
    colspan: 3
  };
  const damageInflictButton: IButton = {
    name: "Inflict Damage",
    type: CELL_TYPES.BUTTON,
    icon: MDI.DAMAGE,
    colspan: 1,
    action: () => {
      const currentStamina = Number(getValue(staminaId, 0));
      const armorRatingDesc = getValue(idArmorType, armorTypes[0]);
      const armorRating = rollArmorRating(armorRatingDesc);
      console.log(currentStamina);
      console.log(armorRating)
      openDialogInflictWounds((inflictedDamage: number) => {
        const newStamina = currentStamina - Math.max(inflictedDamage - armorRating, 1);
        modifyValue(staminaId, -Math.max(inflictedDamage - armorRating, 1));
        if (newStamina < 0) {
          openDialogGeneric("Critical Hit!", `The game master rolls on the critical hit table with a +${Math.abs(newStamina)} modifier!`, "mdi-skull-outline");
        }
      })
    }
  };
  grid.cells.push([description, armorTypeSelect, damageInflictButton]);
  return grid;
}
