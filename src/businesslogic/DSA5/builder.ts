import { MDI } from "./icons";
import { physicalSkills, socialSkills, natureSkills, scienceSkills, craftSkills, fightSkills } from "./staticData";
import { getNumberValue, getStringValue, updateValue } from "./utils";

// get the IDs of all input elements
export const getInputIds = (item: any, ids: string[] = []): string[] => {
    if(Array.isArray(item)){
        for(var i = 0; i < item.length; ++i){
            getInputIds(item[i], ids);
        }
    }
    else if(
        item.hasOwnProperty("id") &&
        !item.id.split("-").includes("readonly")
    ){
        ids.push(item.id);
    }
    else {
        for(const prop of ["cards", "cells", "elements"]){
            if(item.hasOwnProperty(prop)){
                getInputIds(item[prop], ids);
            }
        }
    }
    return ids;
};

// "Steigerungskosten"
const groupCosts: { [group: string]: number; } = {"A" : 1, "B" : 2, "C" : 3, "D" : 4, "E" : 15};

// calculate the "Steigerungskosten" up to the current value (can be negative if the value is lower than the start value)
function calcCosts(startValue: number, currentValue: number, group: string){
    let spent_AP = 0;
    for(var i = currentValue + 1; i <= startValue; ++i){
        spent_AP -= groupCosts[group] * (Math.max(0, i - (group == "E" ? 14 : 12)) + 1);
    }
    for(var i = startValue + 1; i <= currentValue; ++i){
        spent_AP += groupCosts[group] * (Math.max(0, i - (group == "E" ? 14 : 12)) + 1);
    }
    return spent_AP;
}

// calculate the spent AP
export const trackAP = () => {
    let spent_AP = 0;
    const currentValues = [];
    for(const property of ["MU", "KL", "IN", "CH", "FF", "GE", "KO", "KK"]){
        const currentValue = getNumberValue("id:" + property);
        spent_AP += calcCosts(8, currentValue, "E");
        currentValues.push(currentValue);
    }
    if(Math.min(...currentValues) >= 8 && Math.max(...currentValues) > 8){
        spent_AP -= groupCosts["E"];
    }
    for(const skills of [physicalSkills, socialSkills, natureSkills, scienceSkills, craftSkills, fightSkills]){
        for(const skill of skills){
            const currentValue = getNumberValue("id:" + skill.name.replaceAll(" ", "_"));
            const startValue = (skills == fightSkills ? 6 : 0);
            spent_AP += calcCosts(startValue, currentValue, skill.group);
        }
    }
    const current_MU = getNumberValue("id:MU");
    const current_KL = getNumberValue("id:KL");
    const current_IN = getNumberValue("id:IN");
    const current_KO = getNumberValue("id:KO");
    const current_KK = getNumberValue("id:KK");
    const current_LE = getNumberValue("id:LE-max");
    const current_SK = getNumberValue("id:SK");
    const current_ZK = getNumberValue("id:ZK");
    const current_GS = getNumberValue("id:GS");
    const start_LE = current_LE - 2 * getNumberValue("id:KO");
    if(start_LE < 5){
        spent_AP -= (5 - start_LE) * 4;
    }
    else {
        spent_AP += Math.min(start_LE - 5, 7) * 6 + calcCosts(0, Math.max(start_LE - 5 - 7, 0), "D");
    }
    const start_SK = current_SK - Math.round((current_MU + current_KL + current_IN) / 6.0);
    spent_AP += Math.sign(start_SK + 5) * 25;
    const start_ZK = current_ZK - Math.round((current_KO + current_KO + current_KK) / 6.0);
    spent_AP += Math.sign(start_ZK + 5) * 25;
    spent_AP += (current_GS - 8) * (current_GS < 8 ? 4 : 8);
    const regexp = /(\d+)\s*AP/gi;
    const fieldIds = ["Vorteile", "Nachteile", "Sprachen_&_Schriften", "allgemeine_Sonderfertigkeiten", "spezielle_Sonderfertigkeiten"];
    for(const id of fieldIds){
        const currentValue = getStringValue("id:" + id);
        const matches = [...currentValue.matchAll(regexp)];
        for(const match of matches){
            spent_AP += (id == "Nachteile" ? -1 : +1) * Number(match[1]);
        }
    }
    updateValue("id:AP-spent-readonly", spent_AP);
};

// calculate AW
export const trackAW = () => {
    const ge = getNumberValue("id:GE");
    const aw = Math.round(ge/2.0);
    updateValue("id:AW-readonly", aw);
};

// calculate BE from armor and equipment
export const trackBE = () => {
    const weightTotal = getNumberValue("id:weight-total-readonly");
    const tk = getNumberValue("id:weight-max-readonly");
    let d = Math.floor(Math.max(0, weightTotal-tk) / 4.0);
    for(var i = 1; i <= 10; ++i){
        const id = i.toString();
        d += getNumberValue("id:weapon-BE-" + id);
    }
    d = Math.min(d, 4);
    const be = ["", "I", "II", "III", "IV"][d];
    updateValue("id:Belastung-name-readonly", "Belastung");
    updateValue("id:Belastung-readonly", be);
};

// calculate INI
export const trackINI = () => {
    const mu = getNumberValue("id:MU");
    const ge = getNumberValue("id:GE");
    const ini = Math.round((mu+ge)/2.0);
    updateValue("id:INI-readonly", ini);
};

// calculate the "Schmerz" level
export const trackSchmerz = () => {
    const current_LE = getNumberValue("id:LE");
    const max_LE = getNumberValue("id:LE-max");
    if(max_LE > 0){
        const loss = 1.0*(max_LE-current_LE)/max_LE;
        let s = "";
        if(current_LE <= 5){
            s = "IV";
        }
        else if(loss >= 0.75){
            s = "III";
        }
        else if(loss >= 0.5){
            s = "II";
        }
        else if(loss >= 0.25){
            s = "I";
        }
        updateValue("id:Schmerz-readonly", s);
    }
    updateValue("id:Schmerz-name-readonly", "Schmerz");
};

// adapt the icons of the attack and defend buttons to the selected fight skill
export const trackWeaponIcons = () => {
    const isDwarf = getStringValue("id:Spezies").toLowerCase().includes("zwerg");
    const fightSkillsByName : { [name: string] : any; } = {};
    for(const skill of fightSkills){
        fightSkillsByName[skill.name] = skill;
    }
    const sheets = document.getElementsByClassName("v-sheet");
    for(var n = 0; n < sheets.length; ++n){
        const sheet = sheets[n];
        if(sheet.innerHTML.trim().replaceAll("&amp;", "&") == "RÜSTUNGEN, WAFFEN & SCHILDE"){
            const grid = (sheet.parentElement!).children[1].children[0].children[0];
            const labels = [];
            const buttons = [];
            for(var i = 0; i < grid.children.length; ++i){
                const child = grid.children[i];
                if(child.children[0].classList.contains("v-select")){
                    const selects = child.children[0].getElementsByClassName("v-select__selection-text");
                    if(selects.length > 0){
                        labels.push(selects[0].innerHTML.replace(/<[^>]*>?/gm, '').trim());
                    }
                    else {
                        labels.push("");
                    }
                }
                else if(child.children[0].classList.contains("v-btn")){
                    buttons.push(child.children[0]);
                }
            }
            const attackButtons : any[] = [];
            const defendButtons : any[] = [];
            for(var i = 0; i < buttons.length; ++i){
                (i % 2 == 0 ? attackButtons : defendButtons).push(buttons[i]);
            }
            for(var i = 0; i < labels.length; ++i){
                const attackElem = attackButtons[i].getElementsByClassName("mdi")[0];
                const defendElem = defendButtons[i].getElementsByClassName("mdi")[0];
                attackElem.classList.remove(MDI.MELEE);
                attackElem.classList.remove(MDI.MELEE_AXE, "mdi-flip-h");
                attackElem.classList.remove(MDI.RANGED);
                defendElem.classList.remove(MDI.DEFEND);
                if(Object.keys(fightSkillsByName).includes(labels[i])){
                    const skill = fightSkillsByName[labels[i]];
                    if(skill.fk){
                        attackElem.classList.add(MDI.RANGED);
                    }
                    else if(isDwarf){
                        attackElem.classList.add(MDI.MELEE_AXE, "mdi-flip-h");
                    }
                    else {
                        attackElem.classList.add(MDI.MELEE);
                    }
                    if(skill.pa){
                        defendElem.classList.add(MDI.DEFEND);
                    }
                }
            }
        }
    }
};

// sort the equipment alphabetically; update "Gesamtgewicht" and "Tragkraft"
export const trackWeight = () => {
    var items = [];
    let weightTotal = 0;
    for(var i = 1; i < 100; ++i){
        const id = i.toString();
        const itemName = getStringValue("id:item-name-" + id).trim();
        const itemWeight = getNumberValue("id:item-weight-" + id);
        if(itemWeight > 0 || !(itemName == "")){
            items.push({name : itemName, weight : itemWeight});
            weightTotal += itemWeight;
        }
    }
    items.sort(function(item1, item2){ return item1.name.localeCompare(item2.name); });
    for(var i = 1; i < 100; ++i){
        const id = i.toString();
        const item = (items.length > 0 ? items.shift() : {name : "", weight : ""});
        updateValue("id:item-name-" + id, (item as any).name);
        updateValue("id:item-weight-" + id, (item as any).weight);
    }
    updateValue("id:weight-total-readonly", weightTotal);
    const kk = getNumberValue("id:KK");
    const tk = kk * 2;
    updateValue("id:weight-max-readonly", tk);
};

export const trackAll = () => {
    trackAP();
    trackAW();
    trackBE();
    trackINI();
    trackSchmerz();
    trackWeaponIcons();
    trackWeight();
};