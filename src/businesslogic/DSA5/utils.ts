import { useDialog } from "@/services/dialog.service";
import { useStore } from "@/services/store.service";
import { INPUT_TYPES } from "@/types/enums";
import { IDialog} from "@/types/interfaces";
import colors from "vuetify/lib/util/colors.mjs";
import { physicalSkills, socialSkills, natureSkills, scienceSkills, craftSkills, fightSkills } from "./staticData";
import { start } from "repl";


// helper function: opens a dialog box to enter a value to do something with
function chooseAndDo (inputId: string, type: INPUT_TYPES.NUMERIC | INPUT_TYPES.TEXT, placeholder: string, message: string, makeCheck: Function, elementId: null | string, headline: string, ability: number | string, callback?: Function) {
  const dialogDataCheckValue: IDialog = {
    headline: headline,
    input: {
      id: inputId,
      type: type,
      width: "100%",
      range: [-100,100],
      placeholder: placeholder,
    },
    text: message,
    buttons: [
      {
        text: "Bestätigen",
        callback: () => {
          makeCheck(...([elementId, headline, ability, (type == INPUT_TYPES.NUMERIC ? getNumberValue(inputId) : getStringValue(inputId)), callback].filter(arg => !(arg == null))));
        }
      },
      {
        text: "Abbrechen",
        callback: () => {
          useDialog().closeDialog();
        }
      }
    ]
  }
  useDialog().openDialog(dialogDataCheckValue);
}

// helper function: opens a dialog box to enter a modifier to make a check with
function chooseModifierAndMakeCheck (makeCheck: Function, elementId: string, headline: string, ability: string, callback?: Function) {
  const inputId = "id:modifier-dialog";
  const type = INPUT_TYPES.NUMERIC;
  const placeholder = "Modifikator";
  if(ability.startsWith("id:")){
    ability = getStringValue(ability);
  }
  const message = `Gib den Modifikator für den Wurf auf ${ability} an!`;
  chooseAndDo(inputId, type, placeholder, message, makeCheck, elementId, headline, ability, callback);
}

// helper function: opens a dialog box to show a success/failure message
function dialogData(headline: string, success: boolean, message: string, callback?: Function){
  const dialogDataShowMessage: IDialog = {
    headline: headline,
    icon: success ? "mdi-check-circle-outline" : "mdi-close-circle-outline",
    color: success ? colors.green.base : colors.red.base,
    text: message,
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
  useDialog().openDialog(dialogDataShowMessage);
}

// attack check
export const chooseModifierAndMakeAttackCheck = (elementId: string, headline: string, callback?: Function) => {
  const ability = getStringValue(elementId.replace("-name-", "-fightSkill-"));
  chooseModifierAndMakeCheck(makeAttackCheckWithFixedModifier, elementId, headline, ability, callback);
};
export const makeAttackCheckWithFixedModifier = (elementId: string, headline: string, ability: string, modifier: number, callback?: Function) => {
  let success = false;
  let message = "";
  if(ability == ""){
    message = `Keine Kampftechnik ausgewählt!`;
  }
  else {
    const damage = getStringValue(elementId.replace("-name-", "-damage-"));
    if(!/^\s*\d+\s*[DW]\s*\d+(\s*[\+\-]\s*\d+)*\s*$/i.test(damage)){
      message = `
        Trefferpunkte: ${damage}
        Ungültiges Format!
      `;
    }
    else {
      const propertyBonus = getPropertyBonus("id:" + ability);
      const currentValue = getNumberValue("id:" + ability) + propertyBonus.attack;
      const useBE = (getStringValue("id:" + ability + "-BE") != "");
      const rnd = Math.floor(Math.random() * 20) + 1;
      const weaponModifiers = getStringValue(elementId.replace("-name-", "-modifier-"));
      const weaponModifier = (weaponModifiers == "" ? 0 : Number(weaponModifiers.split("/").shift()!.trim()));
      const stateModifier = getStateModifier(useBE);
      const result = (rnd + modifier + weaponModifier + stateModifier);
      success = result <= currentValue;
      message = `
        Gewürfelt: ${rnd}
        Modifikator: ${(modifier >= 0 ? "+" : "-") + Math.abs(modifier)}
        Waffe: ${(weaponModifier >= 0 ? "+" : "-") + Math.abs(weaponModifier)}
        Zustände: ${(stateModifier >= 0 ? "+" : "-") + Math.abs(stateModifier)} (${useBE ? "mit" : "ohne"} BE)
        Ergebnis: ${result}
        Zielwert: ${currentValue}
        Die Probe auf ${ability} war ein ${success ? "Erfolg" : "Fehlschlag"}!
      `;
      if(success){
        const regexp = /(\d+)\s*[DW]\s*(\d+)((?:\s*[\+\-]\s*\d+)*)/i;
        const match = damage.match(regexp);
        const n = Number(match![1]);
        const d = Number(match![2]);
        const m = String(match![3]).replaceAll(" ", "");
        const rnds = [];
        for(var i = 0; i < n; ++i){
          rnds.push(Math.floor(Math.random() * d) + 1);
        }
        const tp = rnds.reduce((sum, x) => sum + x, 0) + (m == "" ? 0 : eval(m)) + propertyBonus.damage;
        message = `
          ${message}
          Trefferpunkte
          Gewürfelt: ${rnds.map(rnd => rnd.toString()).join(", ")}
          Modifikator: ${m}
          Schadensbonus: +${propertyBonus.damage}
          Ergebnis: ${tp}
        `;
      }
    }
  }
  dialogData(headline, success, message, callback);
};

// defense check
export const chooseModifierAndMakeDefenseCheck = (elementId: string, headline: string, callback?: Function) => {
  const ability = getStringValue(elementId.replace("-name-", "-fightSkill-"));
  chooseModifierAndMakeCheck(makeDefenseCheckWithFixedModifier, elementId, headline, ability, callback);
};
export const makeDefenseCheckWithFixedModifier = (elementId: string, headline: string, ability: string, modifier: number, callback?: Function) => {
  let success = false;
  let message = "";
  if(ability == ""){
    message = `Keine Kampftechnik ausgewählt!`;
  }
  else {
    const propertyBonus = getPropertyBonus("id:" + ability);
    const currentValue = Math.round(getNumberValue("id:" + ability) / 2.0) + propertyBonus.defense;
    const useBE = (getStringValue("id:" + ability + "-BE") != "");
    const rnd = Math.floor(Math.random() * 20) + 1;
    const weaponModifiers = getStringValue(elementId.replace("-name-", "-modifier-"));
    const weaponModifier = (weaponModifiers == "" ? 0 : Number(weaponModifiers.split("/").pop()!.trim()));
    const stateModifier = getStateModifier(useBE);
    const result = (rnd + modifier + weaponModifier + stateModifier);
    success = result <= currentValue;
    message = `
      Gewürfelt: ${rnd}
      Modifikator: ${(modifier >= 0 ? "+" : "-") + Math.abs(modifier)}
      Waffe: ${(weaponModifier >= 0 ? "+" : "-") + Math.abs(weaponModifier)}
      Zustände: ${(stateModifier >= 0 ? "+" : "-") + Math.abs(stateModifier)} (${useBE ? "mit" : "ohne"} BE)
      Ergebnis: ${result}
      Zielwert: ${currentValue}
      Die Probe auf ${ability} war ein ${success ? "Erfolg" : "Fehlschlag"}!
    `;
    if(!success){
      let armorProtection = 0;
      for(var i = 1; i <= 10; ++i){
        const id = i.toString();
        armorProtection += getNumberValue("id:armor-RS-" + id);
      }
      message = `
        ${message}
        Rüstungsschutz
        Gesamt: ${armorProtection}
      `;
    }
  }
  dialogData(headline, success, message, callback);
};

// healing roll
export const chooseModifierAndMakeHealingRoll = (elementId: string, headline: string, ability: string, callback?: Function) => {
  chooseModifierAndMakeCheck(makeHealingRollWithFixedModifier, elementId, headline, ability, callback);
}
export const makeHealingRollWithFixedModifier = (elementId: string, headline: string, ability: string, modifier: number, callback?: Function) => {
  const currentValue = getNumberValue(elementId);
  const maxValue = getNumberValue(elementId.replace("eP", "E"));
  const rnd = Math.floor(Math.random() * 6) + 1;
  const result = rnd + modifier;
  const newValue = Math.min(currentValue + result, maxValue);
  const success = newValue >= currentValue;
  const message = `
    Gewürfelt: ${rnd}
    Modifikator: ${(modifier >= 0 ? "+" : "-") + Math.abs(modifier)}
    Ergebnis: ${result}
    ${ability} wurde von ${currentValue} auf ${newValue} ${success ? "erhöht" : "verringert"}!
  `;
  updateValue(elementId, newValue);
  dialogData(headline, success, message, callback);
}

// 1d20 check
export const chooseModifierAndMakeSimpleCheck = (elementId: string, headline: string, ability: string, callback?: Function) => {
  chooseModifierAndMakeCheck(makeSimpleCheckWithFixedModifier, elementId, headline, ability, callback);
}
export const makeSimpleCheckWithFixedModifier = (elementId: string, headline: string, ability: string, modifier: number, callback?: Function) => {
  const useBE = (getStringValue(elementId + "-BE") != "");
  const propertyBonus = getPropertyBonus(elementId);
  const currentValue = getNumberValue(elementId) + propertyBonus.attack;
  const rnd = Math.floor(Math.random() * 20) + 1;
  const stateModifier = getStateModifier(useBE);
  const result = (rnd + modifier + stateModifier);
  const success = result <= currentValue;
  const message = `
    Gewürfelt: ${rnd}
    Modifikator: ${(modifier >= 0 ? "+" : "-") + Math.abs(modifier)}
    Zustände: ${(stateModifier >= 0 ? "+" : "-") + Math.abs(stateModifier)} (${useBE ? "mit" : "ohne"} BE)
    Ergebnis: ${result}
    Zielwert: ${currentValue}
    Die Probe auf ${ability} war ein ${success ? "Erfolg" : "Fehlschlag"}!
  `;
  dialogData(headline, success, message, callback);
}

// 3d20 check
export const chooseModifierAndMakeTripleCheck = (elementId: string, headline: string, ability: string, callback?: Function) => {
  chooseModifierAndMakeCheck(makeTripleCheckWithFixedModifier, elementId, headline, ability, callback);
}
export const makeTripleCheckWithFixedModifier = (elementId: string, headline: string, ability: string, modifier: number, callback?: Function) => {
  const useBE = (getStringValue(elementId + "-BE") != "");
  const triple = getTriple(elementId).split("/");
  const tripleValue1 = getNumberValue("id:" + triple[0]);
  const tripleValue2 = getNumberValue("id:" + triple[1]);
  const tripleValue3 = getNumberValue("id:" + triple[2]);
  const currentValue = getNumberValue(elementId);
  const rnd1 = Math.floor(Math.random() * 20) + 1;
  const rnd2 = Math.floor(Math.random() * 20) + 1;
  const rnd3 = Math.floor(Math.random() * 20) + 1;
  const stateModifier = getStateModifier(useBE);
  const resultValue1 = rnd1 + modifier + stateModifier;
  const resultValue2 = rnd2 + modifier + stateModifier;
  const resultValue3 = rnd3 + modifier + stateModifier;
  const result = Math.max(resultValue1 - tripleValue1, 0) + Math.max(resultValue2 - tripleValue2, 0) + Math.max(resultValue3 - tripleValue3, 0);
  const success = result <= currentValue;
  const diff = Math.abs(currentValue-result);
  const qs = Math.max(1, Math.min(Math.ceil(diff/3.0), 6));
  const message = `
    Gewürfelt: ${rnd1}, ${rnd2}, ${rnd3}
    Modifikator: ${(modifier >= 0 ? "+" : "-") + Math.abs(modifier)}
    Zustände: ${(stateModifier >= 0 ? "+" : "-") + Math.abs(stateModifier)} (${useBE ? "mit" : "ohne"} BE)
    Ergebnis: ${resultValue1}, ${resultValue2}, ${resultValue3}
    Zielwert: ${tripleValue1}, ${tripleValue2}, ${tripleValue3}
    Die Probe auf ${ability} war ein ${success ? "Erfolg" : "Fehlschlag"}!
    ${success ? "Übrige" : "Fehlende"} Punkte: ${diff} ${success ? "(Qualiätsstufe " + qs + ")" : ""}
  `;
  dialogData(headline, success, message, callback);
}

// change money
export const chooseValueAndChangeMoney = (headline: string, sign: number, callback?: Function) => {
  const inputId = "id:money-dialog";
  const type = INPUT_TYPES.TEXT;
  const placeholder = "Betrag";
  const message = `Gib den ${sign < 0 ? "ausgegebenen" : "erhaltenen"} Betrag an! (Beispiel: 12H 3K)`;
  chooseAndDo(inputId, type, placeholder, message, changeMoneyWithFixedValue, null, headline, sign, callback);
};
export const changeMoneyWithFixedValue = (headline: string, sign: number, value: string, callback?: Function) => {
  let success = false;
  let message = "";
  if(/^(\s*\d+\s*[DHSK]\s*)+$/i.test(value)){
    const currentD = getNumberValue("id:money-D-readonly");
    const currentS = getNumberValue("id:money-S-readonly");
    const currentH = getNumberValue("id:money-H-readonly");
    const currentK = getNumberValue("id:money-K-readonly");
    const currentMoney = 1000 * currentD + 100 * currentS + 10 * currentH + currentK;
    const regexp = /(\d+)\s*([DHSK])/gi;
    const matches = [...value.matchAll(regexp)];
    const factors = {"D" : 1000, "S" : 100, "H" : 10, "K" : 1};
    let diff = 0;
    for(const match of matches){
      const val = Number(match[1]);
      const factor = (factors as any)[match[2].toUpperCase()];
      diff += factor * val;
    }
    const newMoney = currentMoney + Math.sign(sign) * diff;
    success = true;
    message = `Vermögen wurde von ${currentMoney} K auf ${newMoney} K ${sign >= 0 ? "erhöht" : "verringert"}!`;
    let digits = newMoney.toString().split("");
    let minus = "";
    if(digits[0] == "-"){
      minus = String(digits.shift());
    }
    const k = (digits.length > 0 ? digits.pop() : "0");
    updateValue("id:money-K-readonly", (k == "0" ? "" : minus) + k);
    const h = (digits.length > 0 ? digits.pop() : "0");
    updateValue("id:money-H-readonly", (h == "0" ? "" : minus) + h);
    const s = (digits.length > 0 ? digits.pop() : "0");
    updateValue("id:money-S-readonly", (s == "0" ? "" : minus) + s);
    const d = (digits.length > 0 ? digits.join("") : "0");
    updateValue("id:money-D-readonly", (d == "0" ? "" : minus) + d);
  }
  else {
    message = `
      Eingabe: ${value}
      Ungültiges Format!
    `;
  }
  dialogData(headline, success, message, callback);
};

// get modifier caused by states, including "Schmerz", with or without "Belastung"
function getStateModifier(includeBE: boolean){
  const romanNumbers: { [romanNumber: string]: number; } = {"" : 0, "I" : 1, "II" : 2, "III" : 3, "IV" : 4};
  const stateValue0 = romanNumbers[getStringValue("id:Schmerz-readonly")];
  const stateValue1 = romanNumbers[getStringValue("id:state-1")];
  const stateValue2 = romanNumbers[getStringValue("id:state-2")];
  const stateValue3 = (includeBE ? romanNumbers[getStringValue("id:Belastung-readonly")] : 0);
  return Math.min(stateValue0 + stateValue1 + stateValue2 + stateValue3, 5);
}

// get the "Leiteigenschaft" bonus of a fight skill
function getPropertyBonus(elementId: string){
  const name = elementId.replace("id:", "").replaceAll("_", " ");
  const skills = fightSkills.filter(skill => skill.name == name);
  if(skills.length == 1){
    const skill = skills[0];
    const propertyValues = getTriple(elementId).split("/").map(property => getNumberValue("id:" + property));
    const propertyValue = Math.max(...propertyValues);
    const propertyBonus = Math.floor(Math.max(0, propertyValue - 8) / 3.0);
    const propertyBonus_MU = Math.floor(Math.max(0, getNumberValue("id:MU") - 8) / 3.0);
    if(skill.fk){
      return {attack : propertyBonus, defense : 0, damage : 0};
    }
    return {attack : propertyBonus_MU, defense : propertyBonus, damage : Math.max(0, propertyValue - 15)};
  }
  return {attack : 0, defense : 0, damage : 0};
}

// get the three properties ("Eigenschaften") / the "Leiteigenschaften" of a skill
function getTriple(elementId: string){
  const name = elementId.replace("id:", "").replaceAll("_", " ");
  for(const skills of [physicalSkills, socialSkills, natureSkills, scienceSkills, craftSkills, fightSkills]){
    for(const skill of skills){
      if(skill.name == name){
        return skill.properties;
      }
    }
  }
  return getStringValue(elementId.replace("-", "-properties-"));
}

export const initializeValue = (elementId: string, startValue: any) => {
  if(useStore().getValueById(elementId, undefined) === undefined){
    updateValue(elementId, startValue);
  }
}

export const updateValue = (elementId: string, newValue: any) => {
  useStore().updateSaveableValueById(elementId, newValue);
}

export const getNumberValue = (elementId: string): number => {
  return Number(useStore().getValueById(elementId, 0));
}

export const getStringValue = (elementId: string): string => {
  return String(useStore().getValueById(elementId, ""));
}
