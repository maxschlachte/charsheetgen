import { MDI } from "./icons";
import { physicalSkills, socialSkills, natureSkills, scienceSkills, craftSkills, fightSkills } from "./staticData";
import { getNumberValue, getStringValue, updateValue } from "./utils";
import { weaponRows } from "./sheetDef";
import { IButton, ISelect } from "@/types/interfaces";
import { start } from "repl";

// get the IDs of all input elements
export const getInputIds = (item: any, ids: string[] = []): string[] => {
    if(Array.isArray(item)){
        for(var i = 0; i < item.length; ++i){
            getInputIds(item[i], ids);
        }
    }
    else if(item.hasOwnProperty("id") && !(item.hasOwnProperty("readonly") && item.readonly)){
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

const idsTrackFunctions: [RegExp[], Function][] = [];

// calculate the spent AP
export const trackAP = () => {
    let spent_AP = 0;
    for(const property of ["MU", "KL", "IN", "CH", "FF", "GE", "KO", "KK"]){
        const currentValue = getNumberValue("id:" + property);
        spent_AP += calcCosts(8, currentValue, "E");
    }
    for(const skills of [physicalSkills, socialSkills, natureSkills, scienceSkills, craftSkills, fightSkills]){
        for(const skill of skills){
            const id = skill.name.replaceAll(" ", "_");
            const startValue = (skills == fightSkills ? 6 : 0);
            const currentValue = getNumberValue("id:" + id);
            const skillGroup = getStringValue("id:" + id + "-group");
            spent_AP += calcCosts(startValue, currentValue, (skillGroup == "" ? skill.group : skillGroup));
        }
    }
    for(const prefix of ["Zauber", "Liturgie"]){
        for(var i = 1; i <= 40; ++i){
            const id = i.toString();
            const spellName = getStringValue("id:" + prefix + "-name-" + id).trim();
            const spellTime = getStringValue("id:" + prefix + "-time-" + id).trim();
            const spellDistance = getStringValue("id:" + prefix + "-distance-" + id).trim();
            const spellDuration = getStringValue("id:" + prefix + "-duration-" + id).trim();
            const spellProperties = getStringValue("id:" + prefix + "-properties-" + id).trim();
            const spellGroup = getStringValue("id:" + prefix + "-group-" + id);
            const spellValue = getNumberValue("id:" + prefix + "-" + id);
            if(spellValue > 0 || !(spellName + spellTime + spellDistance + spellDuration + spellProperties + spellGroup == "")){
                spent_AP += calcCosts(-1, spellValue, (spellGroup == "" ? "A" : spellGroup));
            }
        }
    }
    const start_LE = getNumberValue("id:GW-LE");
    const start_SK = getNumberValue("id:GW-SK");
    const start_ZK = getNumberValue("id:GW-ZK");
    const start_GS = getNumberValue("id:GW-GS");
    const bought_LE = getNumberValue("id:LE-bought");
    const bought_AE = getNumberValue("id:AE-bought");
    const bought_KE = getNumberValue("id:KE-bought");
    spent_AP += (start_LE - 5) * (start_LE < 5 ? 4 : 6);
    spent_AP += (start_SK + 5) * 25;
    spent_AP += (start_ZK + 5) * 25;
    spent_AP += (start_GS - 8) * (start_GS < 8 ? 4 : 8);
    spent_AP += calcCosts(0, bought_LE, "D");
    spent_AP += calcCosts(0, bought_AE, "D");
    spent_AP += calcCosts(0, bought_KE, "D");
    const regexp = /(\d+)\s*AP/gi;
    const fieldIds = ["Vorteile", "Nachteile", "Sprachen_&_Schriften", "allgemeine_Sonderfertigkeiten", "spezielle_Sonderfertigkeiten"];
    for(const id of fieldIds){
        const currentValue = getStringValue("id:" + id);
        const matches = [...currentValue.matchAll(regexp)];
        for(const match of matches){
            spent_AP += (id == "Nachteile" ? -1 : +1) * Number(match[1]);
        }
    }
    updateValue("id:AP-spent", spent_AP);
};
const idsTrackAP = ([] as RegExp[]);
idsTrackFunctions.push([idsTrackAP, trackAP]);

// sort armor alphabetically
export const trackArmor = () => {
    var items = [];
    let weightTotal = 0;
    for(var i = 1; i <= 10; ++i){
        const id = i.toString();
        const itemName = getStringValue("id:armor-name-" + id).trim();
        const itemRS = getNumberValue("id:armor-RS-" + id);
        const itemBE = getNumberValue("id:armor-BE-" + id);
        if(itemRS > 0 || itemBE > 0 || !(itemName == "")){
            items.push({name : itemName, rs : itemRS, be : itemBE});
        }
    }
    items.sort(function(item1, item2){ return item1.name.localeCompare(item2.name); });
    for(var i = 1; i <= 10; ++i){
        const id = i.toString();
        const item = (items.length > 0 ? items.shift() : {name : "", rs : "", be: ""});
        updateValue("id:armor-name-" + id, (item as any).name);
        updateValue("id:armor-RS-" + id, (item as any).rs);
        updateValue("id:armor-BE-" + id, (item as any).be);
    }
};
const idsTrackArmor = [/id:armor-(BE|name|RS)-\d+/];
idsTrackFunctions.push([idsTrackArmor, trackArmor]);

// calculate AW
export const trackAW = () => {
    const ge = getNumberValue("id:GE");
    const aw = Math.round(ge/2.0);
    updateValue("id:AW", aw);
};
const idsTrackAW = [/id:GE/];
idsTrackFunctions.push([idsTrackAW, trackAW]);

// calculate BE from armor and equipment
export const trackBE = () => {
    const weightTotal = getNumberValue("id:weight-total");
    const tk = getNumberValue("id:weight-max");
    let d = Math.floor(Math.max(0, weightTotal-tk) / 4.0);
    let armorBE = 0;
    for(var i = 1; i <= 10; ++i){
        const id = i.toString();
        armorBE = Math.max(armorBE, getNumberValue("id:armor-BE-" + id));
    }
    d += armorBE;
    d = Math.max(0, Math.min(d, 4));
    const be = ["", "I", "II", "III", "IV"][d];
    updateValue("id:Belastung-name", "Belastung");
    updateValue("id:Belastung", be);
};
const idsTrackBE = [/id:armor-BE-\d+/, /id:weight-(max|total)/];
idsTrackFunctions.push([idsTrackBE, trackBE]);

// calculate INI
export const trackINI = () => {
    const mu = getNumberValue("id:MU");
    const ge = getNumberValue("id:GE");
    const ini = Math.round((mu+ge)/2.0);
    updateValue("id:INI", ini);
};
const idsTrackINI = [/id:GE/, /id:MU/];
idsTrackFunctions.push([idsTrackINI, trackINI]);

// calculate the "Schmerz" level
export const trackSchmerz = () => {
    const current_LE = getNumberValue("id:LeP");
    const max_LE = getNumberValue("id:LE");
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
        updateValue("id:Schmerz", s);
    }
    updateValue("id:Schmerz-name", "Schmerz");
};
const idsTrackSchmerz = [/id:LE/, /id:LeP/];
idsTrackFunctions.push([idsTrackSchmerz, trackSchmerz]);

// sort the spells alphabetically and expand/reduce the number of rows in the spells table
export const trackSpells = () => {
    for(const prefix of ["Zauber", "Liturgie"]){
        var spells = [];
        for(var i = 1; i <= 40; ++i){
            const id = i.toString();
            const spellName = getStringValue("id:" + prefix + "-name-" + id).trim();
            const spellTime = getStringValue("id:" + prefix + "-time-" + id).trim();
            const spellDistance = getStringValue("id:" + prefix + "-distance-" + id).trim();
            const spellDuration = getStringValue("id:" + prefix + "-duration-" + id).trim();
            const spellProperties = getStringValue("id:" + prefix + "-properties-" + id).trim();
            const spellGroup = getStringValue("id:" + prefix + "-group-" + id);
            const spellValue = getNumberValue("id:" + prefix + "-" + id);
            if(spellValue > 0 || !(spellName + spellTime + spellDistance + spellDuration + spellProperties + spellGroup == "")){
                spells.push({name : spellName, time : spellTime, distance : spellDistance, duration : spellDuration, properties : spellProperties, group : spellGroup, value : spellValue});
            }
        }
        spells.sort(function(spell1, spell2){ return spell1.name.localeCompare(spell2.name); });
        const spells_length = spells.length;
        for(var i = 1; i <= 40; ++i){
            const id = i.toString();
            const spell = (spells.length > 0 ? spells.shift() : {name : "", time : "", distance : "", duration : "", properties : "", group : "", value : ""});
            updateValue("id:" + prefix + "-name-" + id, (spell as any).name);
            updateValue("id:" + prefix + "-time-" + id, (spell as any).time);
            updateValue("id:" + prefix + "-distance-" + id, (spell as any).distance);
            updateValue("id:" + prefix + "-duration-" + id, (spell as any).duration);
            updateValue("id:" + prefix + "-properties-" + id, (spell as any).properties);
            updateValue("id:" + prefix + "-group-" + id, (spell as any).group);
            updateValue("id:" + prefix + "-" + id, (spell as any).value);
        }
        const sheets = document.getElementsByClassName("v-sheet");
        for(var n = 0; n < sheets.length; ++n){
            const sheet = sheets[n];
            if(sheet.innerHTML.trim().startsWith(prefix.toUpperCase())){
                const table_rows = (sheet.parentElement!).children[1].getElementsByTagName("table")[0].getElementsByTagName("tr");
                for(var i = 0; i < table_rows.length-1; ++i){
                    if(i < 1 + Math.max(6, 2 + spells_length - (spells_length % 2))){
                        (table_rows[i] as HTMLElement).style.display = "table-row";
                    }
                    else {
                        (table_rows[i] as HTMLElement).style.display = "none";
                    }
                }
            }
        }
    }
};
const idsTrackSpells = [/id:(Liturgie|Zauber)-\d+/, /id:(Liturgie|Zauber)-(distance|duration|group|name|properties|time)-\d+/];
idsTrackFunctions.push([idsTrackSpells, trackSpells]);

// adapt the icons of the attack and defend buttons to the selected fight skill
export const trackWeaponIcons = () => {
    const isDwarf = getStringValue("id:Spezies").toLowerCase().includes("zwerg");
    const fightSkillsByName : { [name: string] : any; } = {};
    for(const skill of fightSkills){
        fightSkillsByName[skill.name] = skill;
    }
    for(const weaponRow of weaponRows){
        const id = (weaponRow[1] as ISelect).id!;
        const skillName = getStringValue(id);
        weaponRow[3].name = "±AT/PA";
        if(skillName == ""){
            (weaponRow[4] as IButton).icon = "";
            (weaponRow[5] as IButton).icon = "";
        }
        else {
            const skill = fightSkillsByName[skillName];
            if(skill.fk){
                weaponRow[3].name = "LZ";
                (weaponRow[4] as IButton).icon = MDI.RANGED;
            }
            else {
                (weaponRow[4] as IButton).icon = (isDwarf ? MDI.MELEE_AXE : MDI.MELEE);
            }
            if(skill.pa){
                (weaponRow[5] as IButton).icon = MDI.DEFEND;
            }
            else {
                (weaponRow[5] as IButton).icon = "";
            }
        }
    }
};
const idsTrackWeaponIcons = [/id:Spezies/, /id:weapon-fightSkill-\d+/];
idsTrackFunctions.push([idsTrackWeaponIcons, trackWeaponIcons]);

// sort the equipment alphabetically; update "Gesamtgewicht" and "Tragkraft"
export const trackWeight = () => {
    var items = [];
    let weightTotal = 0;
    for(var i = 1; i <= 40; ++i){
        const id = i.toString();
        const itemName = getStringValue("id:item-name-" + id).trim();
        const itemWeight = getNumberValue("id:item-weight-" + id);
        if(itemWeight > 0 || !(itemName == "")){
            items.push({name : itemName, weight : itemWeight});
            weightTotal += itemWeight;
        }
    }
    items.sort(function(item1, item2){ return item1.name.localeCompare(item2.name); });
    for(var i = 1; i <= 40; ++i){
        const id = i.toString();
        const item = (items.length > 0 ? items.shift() : {name : "", weight : ""});
        updateValue("id:item-name-" + id, (item as any).name);
        updateValue("id:item-weight-" + id, (item as any).weight);
    }
    weightTotal = Math.round(weightTotal * 100) / 100;
    updateValue("id:weight-total", weightTotal);
    const kk = getNumberValue("id:KK");
    const tk = kk * 2;
    updateValue("id:weight-max", tk);
};
const idsTrackWeight = [/id:KK/, /id:item-(name|weight)-\d+/];
idsTrackFunctions.push([idsTrackWeight, trackWeight]);

const idMatch = (ids: RegExp[], id: string | undefined) => {
    if((ids.length == 0) || (id === undefined)){
        return true;
    }
    for(const idRegex of ids){
        const idRegexFull = new RegExp("^" + idRegex.source + "$");
        if(id.match(idRegexFull)){
            return true;
        }
    }
    return false;
};

export const trackAll = (id: string | undefined = undefined) => {
    for(const idsTrackFunction of idsTrackFunctions){
        if(idMatch(idsTrackFunction[0], id)){
            idsTrackFunction[1]();
        }
    }
};