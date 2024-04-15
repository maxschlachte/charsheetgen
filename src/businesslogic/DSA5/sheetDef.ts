import { useHooks } from "@/services/hooks.service";
import { useMenu } from "@/services/menu.service";
import { useStore } from "@/services/store.service";
import { CELL_TYPES, ELEMENT_TYPES, MENU_ENTRY_TYPES, POSITIONING } from "@/types/enums";
import { IButton, ICell, IElement, IElementText, IGrid, IInputNumber, IInputText, IMenuCheckbox, ISelect, ISheet, ITable, IText, ITextArea } from "@/types/interfaces";
import { chooseModifierAndMakeAttackCheck, chooseModifierAndMakeDefenseCheck, chooseModifierAndMakeHealingRoll, chooseModifierAndMakeHouseruleCheck, chooseModifierAndMakeHouseruleFightCheck, chooseModifierAndMakeInitiativeRoll, chooseModifierAndMakeSimpleCheck, chooseModifierAndMakeTripleCheck, chooseValueAndChangeMoney, getBooleanValue, initializeValue } from "./utils";
import { physicalSkills, socialSkills, natureSkills, scienceSkills, craftSkills, fightSkills } from "./staticData";
import { MDI } from "./icons";
import { getInputIds, trackAll } from "./builder";
import { read } from "fs";

function textField(name: string, colspan: number = 1){
  return {
    id: "id:" + name,
    name: name,
    type: CELL_TYPES.INPUT_STRING,
    colspan: colspan
  };
}

function propertyBuyin(id: string, readonly: boolean = false, colspan: number = 1){
  const idWithoutSpaces = id.replaceAll(" ", "-");
  return {
    id: "id:" + idWithoutSpaces + "-bought",
    name: "Zukauf " + id,
    type: CELL_TYPES.INPUT_NUMBER,
    readonly: readonly,
    colspan: colspan
  };
}

function propertyField(id: string, readonly: boolean = false, colspan: number = 1){
  const idWithoutSpaces = id.replaceAll(" ", "-");
  return {
    id: "id:" + idWithoutSpaces,
    name: id,
    type: CELL_TYPES.INPUT_NUMBER,
    readonly: readonly,
    colspan: colspan
  };
}

function propertyCheck(id: string){
  const idWithoutSpaces = id.replaceAll(" ", "-");
  return {
    name: "Probe: " + id,
    type: CELL_TYPES.BUTTON,
    colspan: 1,
    icon: "mdi-dice-d20-outline",
    action: () => {
      if(getBooleanValue("id:houserules")){
        chooseModifierAndMakeHouseruleCheck("id:" + idWithoutSpaces, "Probe: " + id, idWithoutSpaces);
      }
      else {
        chooseModifierAndMakeSimpleCheck("id:" + idWithoutSpaces, "Probe: " + id, idWithoutSpaces);
      }
    }
  };
}

function propertyRegen(id: string){
  const idWithoutSpaces = id.replaceAll(" ", "-");
  return {
    name: "Regeneration: " + id,
    type: CELL_TYPES.BUTTON,
    colspan: 1,
    icon: MDI.HEAL,
    action: () => {
      chooseModifierAndMakeHealingRoll("id:" + idWithoutSpaces, "Regeneration: " + id, idWithoutSpaces);
    }
  };
}

function skillsTable(group: string, properties: string, skills: {name: string; properties: string; group: string}[]){
  const skillsTable: ITable = {
    type: ELEMENT_TYPES.TABLE,
    column: [
      {
        name: group,
        width: "35%",
        position: POSITIONING.LEFT
      },
      {
        name: "",
        width: "25%",
        position: POSITIONING.CENTER
      },
      {
        name: "BE",
        width: "10%",
        position: POSITIONING.CENTER
      },
      {
        name: "SF",
        width: "10%",
        position: POSITIONING.CENTER
      },
      {
        name: (skills == fightSkills ? "KTW" : "FW"),
        width: "10%",
        position: POSITIONING.CENTER
      },
      {
        name: "",
        width: "10%",
        position: POSITIONING.CENTER
      }
    ],
    cells: []
  }
  for (const skill of skills) {
    const id = skill.name.replaceAll(" ", "_");
    const nameCell: ICell = {
      name: skill.name,
      type: CELL_TYPES.STRING
    };
    const propertiesCell: ICell = {
      name: skill.properties,
      type: CELL_TYPES.STRING
    };
    const beCell: ISelect = {
      id: "id:" + id + "-BE",
      name: "",
      type: CELL_TYPES.SELECT,
      items: ["", "x"]
    };
    const groupCell: ISelect = {
      id: "id:" + id + "-group",
      name: "",
      type: CELL_TYPES.SELECT,
      items: ["", "A", "B", "C", "D"]
    };
    const valueCell: IInputNumber = {
      id: "id:" + id,
      name: (skills == fightSkills ? "KTW" : "FW"),
      type: CELL_TYPES.INPUT_NUMBER,
      range: [0,20]
    };
    const checkButtonCell: IButton = {
      name: skill.name,
      type: CELL_TYPES.BUTTON,
      icon: "mdi-dice-d20-outline",
      action: () => {
        if(getBooleanValue("id:houserules")){
          chooseModifierAndMakeHouseruleCheck("id:" + id, "Probe: " + skill.name, skill.name);
        }
        else {
          if(skills == fightSkills){
            chooseModifierAndMakeSimpleCheck("id:" + id, "Probe: " + skill.name, skill.name);
          }
          else {
            chooseModifierAndMakeTripleCheck("id:" + id, "Probe: " + skill.name, skill.name);
          }
        }
      }
    };
    skillsTable.cells.push([nameCell, propertiesCell, beCell, groupCell, valueCell, checkButtonCell])
  }
  return skillsTable;
}

function magicTable(name: string){
  const prefix = name.split("/")[0].replaceAll(" ", "_");
  const magicTable: ITable = {
    type: ELEMENT_TYPES.TABLE,
    column: [
      {
        name: prefix,
        width: "22.5%",
        position: POSITIONING.LEFT
      },
      {
        name: (prefix == "Liturgie" ? "KeP" : "AeP"),
        width: "7.5%",
        position: POSITIONING.CENTER
      },
      {
        name: prefix.charAt(0) + "D",
        width: "12.5%",
        position: POSITIONING.CENTER
      },
      {
        name: "RW",
        width: "12.5%",
        position: POSITIONING.CENTER
      },
      {
        name: "WD",
        width: "12.5%",
        position: POSITIONING.CENTER
      },
      {
        name: "",
        width: "12.5%",
        position: POSITIONING.CENTER
      },
      {
        name: "SF",
        width: "7.5%",
        position: POSITIONING.CENTER
      },
      {
        name: "FW",
        width: "7.5%",
        position: POSITIONING.CENTER
      },
      {
        name: "",
        width: "5%",
        position: POSITIONING.CENTER
      }
    ],
    cells: []
  }
  for (var i = 1; i <= 40; ++i) {
    const id = i.toString();
    const nameCell: ICell = {
      id: "id:" + prefix + "-name-" + id,
      name: "",
      type: CELL_TYPES.INPUT_STRING
    };
    const costsCell: ICell = {
      id: "id:" + prefix + "-costs-" + id,
      name: "",
      type: CELL_TYPES.INPUT_NUMBER
    };
    const timeCell: ICell = {
      id: "id:" + prefix + "-time-" + id,
      name: "",
      type: CELL_TYPES.INPUT_STRING
    };
    const distanceCell: ICell = {
      id: "id:" + prefix + "-distance-" + id,
      name: "",
      type: CELL_TYPES.INPUT_STRING
    };
    const durationCell: ICell = {
      id: "id:" + prefix + "-duration-" + id,
      name: "",
      type: CELL_TYPES.INPUT_STRING
    };
    const propertiesCell: ICell = {
      id: "id:" + prefix + "-properties-" + id,
      name: "Eigenschaften",
      type: CELL_TYPES.INPUT_STRING
    };
    const groupCell: ISelect = {
      id: "id:" + prefix + "-group-" + id,
      name: "",
      type: CELL_TYPES.SELECT,
      items: ["", "A", "B", "C", "D"]
    };
    const valueCell: IInputNumber = {
      id: "id:" + prefix + "-" + id,
      name: "FW",
      type: CELL_TYPES.INPUT_NUMBER,
      range: [0,20]
    };
    const checkButtonCell: IButton = {
      name: "",
      type: CELL_TYPES.BUTTON,
      icon: "mdi-dice-d20-outline",
      action: () => {
        if(getBooleanValue("id:houserules")){
          chooseModifierAndMakeHouseruleCheck("id:" + prefix + "-" + id, "Probe: " + name, "id:" + prefix + "-name-" + id);
        }
        else {
          chooseModifierAndMakeTripleCheck("id:" + prefix + "-" + id, "Probe: " + name, "id:" + prefix + "-name-" + id);
        }
      }
    };
    magicTable.cells.push([nameCell, costsCell, timeCell, distanceCell, durationCell, propertiesCell, groupCell, valueCell, checkButtonCell])
  }
  magicTable.cells.push([
    {
      name: "LeitEig.",
      type: CELL_TYPES.STRING,
    },
    {
      name: "",
      type: CELL_TYPES.STRING,
    },
    {
      name: "",
      type: CELL_TYPES.STRING,
    },
    {
      name: "",
      type: CELL_TYPES.STRING,
    },
    {
      name: "",
      type: CELL_TYPES.STRING,
    },
    {
      id: "id:" + prefix + "-property",
      name: "Eigenschaft",
      type: CELL_TYPES.INPUT_STRING,
    },
    {
      name: "",
      type: CELL_TYPES.STRING,
    },
    {
      name: "",
      type: CELL_TYPES.STRING,
    },
    {
      name: "",
      type: CELL_TYPES.STRING,
    },
  ]);
  return magicTable;
}

function stateRow(i: number, name: string = ""){
  const id = i.toString();
  const nameCell: IInputText = {
    id: "id:" + (name == "" ? "state-name-" + id : name + "-name"),
    name: "Zustand",
    type: CELL_TYPES.INPUT_STRING,
    readonly: (name == "" ? false : true),
    colspan: 2
  };
  const valueCell: IInputText = {
    id: "id:" + (name == "" ? "state-" + id : name),
    name: "Stufe",
    type: CELL_TYPES.INPUT_STRING,
    readonly: (name == "" ? false : true),
    colspan: 1
  };
  return [nameCell, valueCell];
}

function armorRow(i: number){
  const id = i.toString();
  return [
    {
      id: "id:armor-name-" + id,
      name: "",
      type: CELL_TYPES.INPUT_STRING,
    },
    {
      id: "id:armor-RS-" + id,
      name: "",
      type: CELL_TYPES.INPUT_NUMBER,
    },
    {
      id: "id:armor-BE-" + id,
      name: "",
      type: CELL_TYPES.INPUT_NUMBER,
    },
  ]
}

function itemRow(i: number){
  const id = i.toString();
  return [
    {
      id: "id:item-name-" + id,
      name: "",
      type: CELL_TYPES.INPUT_STRING,
    },
    {
      id: "id:item-weight-" + id,
      name: "",
      type: CELL_TYPES.INPUT_NUMBER,
    },
  ]
}

export const weaponRows: ((IInputText | ISelect | IButton)[])[] = [];

function weaponRow(i: number){
  const id = i.toString();
  const nameCell: IInputText = {
    id: "id:weapon-name-" + id,
    name: "Waffe",
    type: CELL_TYPES.INPUT_STRING,
    colspan: 2
  };
  const fightSkillCell: ISelect = {
    id: "id:weapon-fightSkill-" + id,
    name: "Kampftechnik",
    type: CELL_TYPES.SELECT,
    items: fightSkills.map(skill => skill.name).sort(),
    colspan: 2
  };
  const damageCell: IInputText = {
    id: "id:weapon-damage-" + id,
    name: "TP",
    type: CELL_TYPES.INPUT_STRING,
    colspan: 1
  };
  const modifierCell: IInputText = {
    id: "id:weapon-modifier-" + id,
    name: "±AT/PA",
    type: CELL_TYPES.INPUT_STRING,
    colspan: 1
  };
  const attackCell: IButton = {
    name: "Probe: AT",
    type: CELL_TYPES.BUTTON,
    icon: MDI.MELEE,
    action: () => {
      if(getBooleanValue("id:houserules")){
        chooseModifierAndMakeHouseruleFightCheck("id:weapon-name-" + id, "Probe: AT");
      }
      else {
        chooseModifierAndMakeAttackCheck("id:weapon-name-" + id, "Probe: AT");
      }
    },
    colspan: 1
  };
  const defendCell: IButton = {
    name: "Probe: PA",
    type: CELL_TYPES.BUTTON,
    icon: MDI.DEFEND,
    action: () => {
      if(getBooleanValue("id:houserules")){
        chooseModifierAndMakeHouseruleFightCheck("id:weapon-name-" + id, "Probe: PA");
      }
      else {
        chooseModifierAndMakeDefenseCheck("id:weapon-name-" + id, "Probe: PA");
      }
    },
    colspan: 1
  };
  const row = [nameCell, fightSkillCell, damageCell, modifierCell, attackCell, defendCell];
  weaponRows.push(row);
  return row;
}

const emptyLine = [
  {
    name: "",
    type: CELL_TYPES.STRING,
    colspan: 6
  }
];

export const sheetDef: ISheet = {
  headline: "DSA5",
  saveNameFieldId: "id:name",
  config: {
    gap: 2,
    pageTitle: "DSA5 Heldendokument"
  },
  cards: [
    {
      headline: "Charakter",
      elements: [
        {
          type: ELEMENT_TYPES.GRID,
          cells: [
            [
              textField("Name", 6),
            ],
            [
              textField("Familie", 3),
              textField("Geburtsort", 3),
            ],
            [
              textField("Geburtsdatum", 2),
              textField("Alter", 2),
              textField("Geschlecht", 2),
            ],
            [
              textField("Spezies", 2),
              textField("Größe", 2),
              textField("Gewicht", 2),
            ],
            [
              textField("Haarfarbe", 3),
              textField("Augenfarbe", 3),
            ],
            [
              textField("Kultur", 3),
              textField("Profession", 3),
            ],
            [
              textField("Titel", 3),
              textField("Sozialstatus", 3),
            ],
            [
              {
                name: "Charakteristika / Sonstiges",
                type: CELL_TYPES.TEXTAREA,
                colspan: 6
              }
            ],
            emptyLine,
            [
              propertyField("MU"),
              propertyCheck("MU"),
              {
                id: "id:AP-total",
                name: "AP gesamt",
                type: CELL_TYPES.INPUT_NUMBER,
                colspan: 2
              },
              {
                id: "id:AP-spent",
                name: "AP ausgegeben",
                type: CELL_TYPES.INPUT_NUMBER,
                readonly: true,
                colspan: 2
              },
            ],
            [
              propertyField("KL"),
              propertyCheck("KL"),
              propertyField("GW LE"),
              propertyField("GW SK"),
              propertyField("GW ZK"),
              propertyField("GW GS"),
            ],
            [
              propertyField("IN"),
              propertyCheck("IN"),
              propertyBuyin("LE"),
              propertyField("LE"),
              propertyField("LeP"),
              propertyRegen("LeP"),
            ],
            [
              propertyField("CH"),
              propertyCheck("CH"),
              propertyBuyin("AE"),
              propertyField("AE"),
              propertyField("AeP"),
              propertyRegen("AeP"),
            ],
            [
              propertyField("FF"),
              propertyCheck("FF"),
              propertyBuyin("KE"),
              propertyField("KE"),
              propertyField("KeP"),
              propertyRegen("KeP"),
            ],
            [
              propertyField("GE"),
              propertyCheck("GE"),
              {
                id: "id:SK",
                name: "SK",
                type: CELL_TYPES.INPUT_NUMBER,
                colspan: 2
              },
              propertyField("INI", true),
              {
                name: "Probe: INI",
                type: CELL_TYPES.BUTTON,
                colspan: 1,
                icon: "mdi-flash-outline",
                action: () => {
                  chooseModifierAndMakeInitiativeRoll("id:INI", "Probe: INI", "INI");
                }
              },
            ],
            [
              propertyField("KO"),
              propertyCheck("KO"),
              {
                id: "id:ZK",
                name: "ZK",
                type: CELL_TYPES.INPUT_NUMBER,
                colspan: 2
              },
              propertyField("AW", true),
              propertyCheck("AW"),
            ],
            [
              propertyField("KK"),
              propertyCheck("KK"),
              {
                id: "id:Schip",
                name: "Schip",
                type: CELL_TYPES.INPUT_NUMBER,
                colspan: 2
              },
              propertyField("GS"),
              propertyCheck("GS"),
            ],
            emptyLine,
            stateRow(0, "Belastung"),
            stateRow(0, "Schmerz"),
            stateRow(1),
            stateRow(2),
            stateRow(3),
            stateRow(4),
            emptyLine,
            [
              {
                id: "id:Vorteile",
                name: "Vorteile",
                type: CELL_TYPES.TEXTAREA,
                colspan: 6
              }
            ],
            [
              {
                id: "id:Nachteile",
                name: "Nachteile",
                type: CELL_TYPES.TEXTAREA,
                colspan: 6
              }
            ],
            [
              {
                id: "id:Sprachen_&_Schriften",
                name: "Sprachen & Schriften",
                type: CELL_TYPES.TEXTAREA,
                colspan: 6
              }
            ],
            [
              {
                id: "id:allgemeine_Sonderfertigkeiten",
                name: "allgemeine Sonderfertigkeiten",
                type: CELL_TYPES.TEXTAREA,
                colspan: 6
              }
            ],
            [
              {
                id: "id:spezielle_Sonderfertigkeiten",
                name: "spezielle Sonderfertigkeiten (Kampf, Magie, Liturgie)",
                type: CELL_TYPES.TEXTAREA,
                colspan: 6
              }
            ],
          ]
        } as IGrid,
      ]
    },
    {
      headline: "Fertigkeiten",
      elements: [
        skillsTable("Körpertalente", "MU/GE/KK", physicalSkills),
        emptyLine,
        skillsTable("Gesellschaftstalente", "IN/CH/CH", socialSkills),
        emptyLine,
        skillsTable("Naturtalente", "MU/GE/KO", natureSkills),
        emptyLine,
        skillsTable("Wissenstalente", "KL/KL/IN", scienceSkills),
        emptyLine,
        skillsTable("Handwerkstalente", "FF/FF/KO", craftSkills),
        emptyLine,
        skillsTable("Kampftechniken", "", fightSkills),
      ]
    },
    {
      headline: "Ausrüstung",
      elements: [
        {
          type: ELEMENT_TYPES.GRID,
          cells: [
            [
              {
                id: "id:money-D",
                name: "D",
                type: CELL_TYPES.INPUT_NUMBER,
                readonly: true,
                colspan: 1
              },
              {
                id: "id:money-S",
                name: "S",
                type: CELL_TYPES.INPUT_NUMBER,
                readonly: true,
                colspan: 1
              },
              {
                id: "id:money-H",
                name: "H",
                type: CELL_TYPES.INPUT_NUMBER,
                readonly: true,
                colspan: 1
              },
              {
                id: "id:money-K",
                name: "K",
                type: CELL_TYPES.INPUT_NUMBER,
                readonly: true,
                colspan: 1
              },
              {
                name: "Geld ausgeben",
                type: CELL_TYPES.BUTTON,
                colspan: 1,
                icon: MDI.COINS_MINUS,
                action: () => {
                  chooseValueAndChangeMoney("Geld ausgeben", -1);
                }
              },
              {
                name: "Geld erhalten",
                type: CELL_TYPES.BUTTON,
                colspan: 1,
                icon: MDI.COINS_PLUS,
                action: () => {
                  chooseValueAndChangeMoney("Geld erhalten", +1);
                }
              },
            ],
          ],
        },
        {
          type: ELEMENT_TYPES.TABLE,
          column: [
            {
              name: "Rüstung",
              width: "30%",
              position: POSITIONING.LEFT
            },
            {
              name: "RS",
              width: "10%",
              position: POSITIONING.CENTER
            },
            {
              name: "BE",
              width: "10%",
              position: POSITIONING.CENTER
            },
            {
              name: "Rüstung",
              width: "30%",
              position: POSITIONING.LEFT
            },
            {
              name: "RS",
              width: "10%",
              position: POSITIONING.CENTER
            },
            {
              name: "BE",
              width: "10%",
              position: POSITIONING.CENTER
            },
          ],
          cells: [
            armorRow(1).concat(armorRow(4)),
            armorRow(2).concat(armorRow(5)),
            armorRow(3).concat(armorRow(6)),
          ]
        },
        {
          type: ELEMENT_TYPES.TABLE,
          column: [
            {
              name: "Gegenstand",
              width: "30%",
              position: POSITIONING.LEFT
            },
            {
              name: "Gewicht",
              width: "20%",
              position: POSITIONING.CENTER
            },
            {
              name: "Gegenstand",
              width: "30%",
              position: POSITIONING.LEFT
            },
            {
              name: "Gewicht",
              width: "20%",
              position: POSITIONING.CENTER
            },
          ],
          cells: [
            itemRow(1).concat(itemRow(21)),
            itemRow(2).concat(itemRow(22)),
            itemRow(3).concat(itemRow(23)),
            itemRow(4).concat(itemRow(24)),
            itemRow(5).concat(itemRow(25)),
            itemRow(6).concat(itemRow(26)),
            itemRow(7).concat(itemRow(27)),
            itemRow(8).concat(itemRow(28)),
            itemRow(9).concat(itemRow(29)),
            itemRow(10).concat(itemRow(30)),
            itemRow(11).concat(itemRow(31)),
            itemRow(12).concat(itemRow(32)),
            itemRow(13).concat(itemRow(33)),
            itemRow(14).concat(itemRow(34)),
            itemRow(15).concat(itemRow(35)),
            itemRow(16).concat(itemRow(36)),
            itemRow(17).concat(itemRow(37)),
            itemRow(18).concat(itemRow(38)),
            itemRow(19).concat(itemRow(39)),
            itemRow(20).concat(itemRow(40)),
            [
              {
                name: "Gesamt",
                type: CELL_TYPES.STRING,
              },
              {
                id: "id:weight-total",
                name: " ",
                type: CELL_TYPES.INPUT_STRING,
              },
              {
                name: "TK",
                type: CELL_TYPES.STRING,
              },
              {
                id: "id:weight-max",
                name: " ",
                type: CELL_TYPES.INPUT_STRING,
              },
            ],
          ]
        },
        {
          type: ELEMENT_TYPES.GRID,
          cells: [
            [
              {
                name: "Besonderer Besitz (Tiere etc.)",
                type: CELL_TYPES.TEXTAREA,
                colspan: 6
              }
            ],
          ]
        },
      ]
    },
    {
      headline: "Waffen & Schilde",
      colspan: 2,
      elements: [
        {
          type: ELEMENT_TYPES.GRID,
          cells: [
            weaponRow(1),
            weaponRow(2),
            weaponRow(3),
            weaponRow(4),
            weaponRow(5),
            weaponRow(6),
          ]
        } as IGrid
      ]
    },
    {
      headline: "Zauber & Rituale",
      colspan: 2,
      elements: [
        magicTable("Zauber/Ritual"),
      ]
    },
    {
      headline: "Liturgien & Zeremonien",
      colspan: 2,
      elements: [
        magicTable("Liturgie/Zeremonie"),
      ]
    },
  ]
} as ISheet;

// initialise "Eigenschaften"
for(const property of ["MU", "KL", "IN", "CH", "FF", "GE", "KO", "KK"]){
  initializeValue("id:" + property, 8);
}

// initialise other stats
initializeValue("id:GW-LE", 5);
initializeValue("id:GW-SK", -5);
initializeValue("id:GW-ZK", -5);
initializeValue("id:GW-GS", 8);
initializeValue("id:LE", 21);
initializeValue("id:SK", -1);
initializeValue("id:ZK", -1);
initializeValue("id:GS", 8);

// initialise BE, SF and FW for all skills
for(const skills of [physicalSkills, socialSkills, natureSkills, scienceSkills, craftSkills, fightSkills]){
  for(const skill of skills){
    const name = skill.name.replaceAll(" ", "_");
    if(skill.be == "ja"){
      initializeValue("id:" + name + "-BE", "x");
    }
    initializeValue("id:" + name + "-group", skill.group);
    initializeValue("id:" + name, (skills == fightSkills ? 6 : 0));
  }
}

trackAll();

// add watchers to all input elements
const ids = getInputIds(sheetDef);
for(const id of ids){
  useStore().watch(id, (newValue : any) => {
    trackAll(id);
  }); 
}

useHooks().on("new", () => { window.location.reload(); })

useMenu().addEntry({
  title: "House rules",
  storeId: "id:houserules",
  type: MENU_ENTRY_TYPES.CHECKBOX,
  callback: () => { console.log("id:houserules", getBooleanValue("id:houserules")); }
});