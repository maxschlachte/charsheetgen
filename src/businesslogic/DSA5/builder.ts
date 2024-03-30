import { MDI } from "./icons";
import { physicalSkills, socialSkills, natureSkills, scienceSkills, craftSkills, fightSkills } from "./staticData";
import { getNumberValue, getStringValue, updateValue } from "./utils";
import { weaponRows } from "./sheetDef";
import { IButton, ISelect } from "@/types/interfaces";

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
    const current_MU = getNumberValue("id:MU");
    const current_KL = getNumberValue("id:KL");
    const current_IN = getNumberValue("id:IN");
    const current_KO = getNumberValue("id:KO");
    const current_KK = getNumberValue("id:KK");
    const current_LE = getNumberValue("id:LE");
    const current_AE = getNumberValue("id:AE");
    const current_KE = getNumberValue("id:KE");
    const current_SK = getNumberValue("id:SK");
    const current_ZK = getNumberValue("id:ZK");
    const current_GS = getNumberValue("id:GS");
    const start_LE = current_LE - 5 - 2 * getNumberValue("id:KO");
    spent_AP += Math.min(start_LE, 7) * (start_LE < 0 ? 4 : 6) + calcCosts(0, Math.max(start_LE - 7, 0), "D");
    if(current_AE > 0){
        const start_AE = current_AE - 20 - getNumberValue("id:" + getStringValue("id:Zauber-property"));
        spent_AP += start_AE * (start_AE < 0 ? 2 : 6);
    }
    if(current_KE > 0){
        const start_KE = current_KE - 20 - getNumberValue("id:" + getStringValue("id:Liturgie-property"));
        spent_AP += start_KE * (start_KE < 0 ? 2 : 6);
    }
    const start_SK = current_SK - Math.round((current_MU + current_KL + current_IN) / 6.0);
    spent_AP += (start_SK + 5) * 25;
    const start_ZK = current_ZK - Math.round((current_KO + current_KO + current_KK) / 6.0);
    spent_AP += (start_ZK + 5) * 25;
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
    updateValue("id:AW-readonly", aw);
};
const idsTrackAW = [/id:GE/];
idsTrackFunctions.push([idsTrackAW, trackAW]);

// calculate BE from armor and equipment
export const trackBE = () => {
    const weightTotal = getNumberValue("id:weight-total-readonly");
    const tk = getNumberValue("id:weight-max-readonly");
    let d = Math.floor(Math.max(0, weightTotal-tk) / 4.0);
    for(var i = 1; i <= 10; ++i){
        const id = i.toString();
        d += getNumberValue("id:armor-BE-" + id);
    }
    d = Math.max(0, Math.min(d, 4));
    const be = ["", "I", "II", "III", "IV"][d];
    updateValue("id:Belastung-name-readonly", "Belastung");
    updateValue("id:Belastung-readonly", be);
};
const idsTrackBE = [/id:armor-BE-\d+/, /id:weight-(max|total)-readonly/];
idsTrackFunctions.push([idsTrackBE, trackBE]);

// calculate INI
export const trackINI = () => {
    const mu = getNumberValue("id:MU");
    const ge = getNumberValue("id:GE");
    const ini = Math.round((mu+ge)/2.0);
    updateValue("id:INI-readonly", ini);
};
const idsTrackINI = [/id:GE/, /id:MU/];
idsTrackFunctions.push([idsTrackINI, trackINI]);

// add tooltips with formulas to some fields
export const trackLabels = () => {
    const AE_property = getStringValue("id:Zauber-property");
    const KE_property = getStringValue("id:Liturgie-property");
    const formulas: { [label: string]: string; } = {
        "LE" : "GW + 2 × KO ± Mod.", 
        "AE" : "ggf. 20 + " + (AE_property == "" ? "LeitEig." : AE_property) + " ± Mod.", 
        "KE" : "ggf. 20 + " + (KE_property == "" ? "LeitEig." : KE_property) + " ± Mod.", 
        "SK" : "GW + (MU + KL + IN) / 6 ± Mod.", 
        "ZK" : "GW + (KO + KO + KK) / 6 ± Mod.",
    };
    const labels = document.getElementsByClassName("v-field-label--floating");
    const info_sign = " 🛈";
    for(var i = 0; i < labels.length; ++i){
        const label = labels[i].innerHTML.replace(/<[^>]*>?/gm, '').trim().replace(info_sign, "");
        if(Object.keys(formulas).includes(label)){
            labels[i].innerHTML = label + info_sign;
            labels[i].parentElement!.parentElement!.parentElement!.title = formulas[label];
        }
    }
};
const idsTrackLabels = [/id:[^-]+/, /id:(Liturgie|Zauber)-property/];
idsTrackFunctions.push([idsTrackLabels, trackLabels]);

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
        updateValue("id:Schmerz-readonly", s);
    }
    updateValue("id:Schmerz-name-readonly", "Schmerz");
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
    updateValue("id:weight-total-readonly", weightTotal);
    const kk = getNumberValue("id:KK");
    const tk = kk * 2;
    updateValue("id:weight-max-readonly", tk);
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