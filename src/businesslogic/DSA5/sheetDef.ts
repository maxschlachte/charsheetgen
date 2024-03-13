import { useStore } from "@/services/store.service";
import { CELL_TYPES, ELEMENT_TYPES, POSITIONING } from "@/types/enums";
import { IButton, ICell, IElement, IElementText, IGrid, IInputNumber, IInputText, ISelect, ISheet, ITable, IText, ITextArea } from "@/types/interfaces";
import { chooseModifierAndMakeAttackCheck, chooseModifierAndMakeDefenseCheck, chooseModifierAndMakeHealingRoll, chooseModifierAndMakeSimpleCheck, chooseModifierAndMakeTripleCheck, chooseValueAndChangeMoney, initializeValue } from "./utils";
import { physicalSkills, socialSkills, natureSkills, scienceSkills, craftSkills, fightSkills } from "./staticData";
import { MDI } from "./icons";
import { getInputIds, trackAll } from "./builder";

function textField(name: string, colspan: number = 1){
  return {
    id: "id:" + name,
    name: name,
    type: CELL_TYPES.INPUT_STRING,
    colspan: colspan
  };
}

function propertyField(id: string, colspan: number = 1){
  const name = id.replaceAll("-readonly", "");
  return {
    id: "id:" + id,
    name: name,
    type: CELL_TYPES.INPUT_NUMBER,
    colspan: colspan
  };
}

function propertyStart(id: string, colspan: number = 2){
  const name = id.replaceAll("-readonly", "");
  return {
    id: "id:" + id + "-max",
    name: name + " (max)",
    type: CELL_TYPES.INPUT_NUMBER,
    colspan: colspan
  };
}

function propertyCheck(id: string){
  const name = id.replaceAll("-readonly", "");
  return {
    name: "Probe: " + name,
    type: CELL_TYPES.BUTTON,
    colspan: 1,
    icon: "mdi-dice-d20-outline",
    action: () => {
      chooseModifierAndMakeSimpleCheck("id:" + id, "Probe: " + name, name);
    }
  };
}

function propertyRegen(id: string){
  const name = id.replaceAll("-readonly", "");
  return {
    name: "Regeneration: " + id,
    type: CELL_TYPES.BUTTON,
    colspan: 1,
    icon: MDI.HEAL,
    action: () => {
      chooseModifierAndMakeHealingRoll("id:" + id, "Regeneration: " + name, name);
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
      items: ["", "x"],
      colspan: 1
    };
    const groupCell: ICell = {
      name: skill.group,
      type: CELL_TYPES.STRING,
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
        if(skills == fightSkills){
          chooseModifierAndMakeSimpleCheck("id:" + id, "Probe: " + skill.name, skill.name);
        }
        else {
          chooseModifierAndMakeTripleCheck("id:" + id, "Probe: " + skill.name, skill.name);
        }
      }
    };
    skillsTable.cells.push([nameCell, propertiesCell, beCell, groupCell, valueCell, checkButtonCell])
  }
  return skillsTable;
}

function stateRow(i: number, name: string = ""){
  const id = i.toString();
  const nameCell: IInputText = {
    id: "id:" + (name == "" ? "state-name-" + id : name + "-name-readonly"),
    name: "Zustand",
    type: CELL_TYPES.INPUT_STRING,
    colspan: 2
  };
  const valueCell: IInputText | ISelect = {
    id: "id:" + (name == "" ? "state-" + id : name + "-readonly"),
    name: "Stufe",
    type: (name == "" ? CELL_TYPES.SELECT : CELL_TYPES.INPUT_STRING),
    items: ["", "I", "II", "III", "IV"],
    colspan: 1
  };
  return [nameCell, valueCell];
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

function weaponRow(i: number){
  const id = i.toString();
  const nameCell: IInputText = {
    id: "id:weapon-name-" + id,
    name: "Rüstzeug",
    type: CELL_TYPES.INPUT_STRING,
    colspan: 1
  };
  const fightSkillCell: ISelect = {
    id: "id:weapon-fightSkill-" + id,
    name: "Kampftechnik",
    type: CELL_TYPES.SELECT,
    items: ["Rüstung"].concat(fightSkills.map(skill => skill.name).sort()),
    colspan: 1
  };
  const rsCell: IInputNumber = {
    id: "id:weapon-RS-" + id,
    name: "RS",
    type: CELL_TYPES.INPUT_NUMBER,
    range: [-10,10],
    colspan: 1
  };
  const beCell: IInputNumber = {
    id: "id:weapon-BE-" + id,
    name: "BE",
    type: CELL_TYPES.INPUT_NUMBER,
    range: [-10,10],
    colspan: 1
  };
  const indentCell: IText = {
    name: "",
    type: CELL_TYPES.STRING,
    colspan: 1
  };
  const modifierCell: IInputNumber = {
    id: "id:weapon-modifier-" + id,
    name: "AT/PA Mod.",
    type: CELL_TYPES.INPUT_NUMBER,
    range: [-10,10],
    colspan: 1
  };
  const damageCell: IInputText = {
    id: "id:weapon-damage-" + id,
    name: "TP",
    type: CELL_TYPES.INPUT_STRING,
    colspan: 1
  };
  const attackCell: IButton = {
    name: "Probe: AT",
    type: CELL_TYPES.BUTTON,
    icon: MDI.MELEE,
    action: () => {
      chooseModifierAndMakeAttackCheck("id:weapon-name-" + id, "Probe: AT");
    },
    colspan: 1
  };
  const defendCell: IButton = {
    name: "Probe: PA",
    type: CELL_TYPES.BUTTON,
    icon: MDI.DEFEND,
    action: () => {
      chooseModifierAndMakeDefenseCheck("id:weapon-name-" + id, "Probe: PA");
    },
    colspan: 1
  };
  return [nameCell, rsCell, beCell, fightSkillCell, modifierCell, damageCell, attackCell, defendCell];
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
                name: "AP (gesamt)",
                type: CELL_TYPES.INPUT_NUMBER,
                colspan: 4
              },
            ],
            [
              propertyField("KL"),
              propertyCheck("KL"),
              {
                id: "id:AP-spent-readonly",
                name: "AP (ausgegeben)",
                type: CELL_TYPES.INPUT_NUMBER,
                colspan: 4
              },
            ],
            [
              propertyField("IN"),
              propertyCheck("IN"),
              propertyStart("LE"),
              propertyField("LE"),
              propertyRegen("LE"),
            ],
            [
              propertyField("CH"),
              propertyCheck("CH"),
              propertyStart("AE"),
              propertyField("AE"),
              propertyRegen("AE"),
            ],
            [
              propertyField("FF"),
              propertyCheck("FF"),
              propertyStart("KE"),
              propertyField("KE"),
              propertyRegen("KE"),
            ],
            [
              propertyField("GE"),
              propertyCheck("GE"),
              {
                id: "id:SK",
                name: "Seelenkraft",
                type: CELL_TYPES.INPUT_NUMBER,
                colspan: 2
              },
              propertyField("AW-readonly"),
              propertyCheck("AW-readonly"),
            ],
            [
              propertyField("KO"),
              propertyCheck("KO"),
              {
                id: "id:ZK",
                name: "Zähigkeit",
                type: CELL_TYPES.INPUT_NUMBER,
                colspan: 2
              },
              propertyField("INI-readonly"),
              propertyCheck("INI-readonly"),
            ],
            [
              propertyField("KK"),
              propertyCheck("KK"),
              {
                id: "id:SP",
                name: "Schicksalspunkte",
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
            emptyLine,
            [
              {
                name: `
                  In den Textfeldern können AP-Kosten für die Berechnung angegeben werden (z. B. »Zauberer (25 AP)«).
                  Dies ist nicht erforderlich für die Vor- und Nachteile »Flink« und »Behäbig« sowie alle namens »Hohe ...« und »Niedrige ...«.
                `,
                type: CELL_TYPES.STRING,
                colspan: 6
              },
            ],
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
        skillsTable("Gesellschaftstalente", "IN/CH/CH", socialSkills),
        skillsTable("Naturtalente", "MU/GE/KO", natureSkills),
        skillsTable("Wissenstalente", "KL/KL/IN", scienceSkills),
        skillsTable("Handwerkstalente", "FF/FF/KO", craftSkills),
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
                id: "id:money-D-readonly",
                name: "D",
                type: CELL_TYPES.INPUT_NUMBER,
                colspan: 1
              },
              {
                id: "id:money-S-readonly",
                name: "S",
                type: CELL_TYPES.INPUT_NUMBER,
                colspan: 1
              },
              {
                id: "id:money-H-readonly",
                name: "H",
                type: CELL_TYPES.INPUT_NUMBER,
                colspan: 1
              },
              {
                id: "id:money-K-readonly",
                name: "K",
                type: CELL_TYPES.INPUT_NUMBER,
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
                id: "id:weight-total-readonly",
                name: " ",
                type: CELL_TYPES.INPUT_STRING,
              },
              {
                name: "Tragkraft",
                type: CELL_TYPES.STRING,
              },
              {
                id: "id:weight-max-readonly",
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
      headline: "Rüstungen, Waffen & Schilde",
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
          ]
        } as IGrid
      ]
    },
    {
      headline: "Zauber & Rituale",
      colspan: 2,
      elements: [
        {
          type: ELEMENT_TYPES.GRID,
          cells: [
            // TODO
          ]
        } as IGrid
      ]
    },
    {
      headline: "Liturgien & Zeremonien",
      colspan: 2,
      elements: [
        {
          type: ELEMENT_TYPES.GRID,
          cells: [
            // TODO
          ]
        } as IGrid
      ]
    },
  ]
} as ISheet;

// initialise "Eigenschaften"
for(const property of ["MU", "KL", "IN", "CH", "FF", "GE", "KO", "KK"]){
  initializeValue("id:" + property, 8);
}

// initialise other stats
initializeValue("id:LE-max", 21);
initializeValue("id:SK", -1);
initializeValue("id:ZK", -1);
initializeValue("id:GS", 8);

// initialise FW and BE for all skills
for(const skills of [physicalSkills, socialSkills, natureSkills, scienceSkills, craftSkills, fightSkills]){
  for(const skill of skills){
    const name = skill.name.replaceAll(" ", "_");
    initializeValue("id:" + name, (skills == fightSkills ? 6 : 0));
    if(skill.be == "ja"){
      initializeValue("id:" + name + "-BE", "x");
    }
  }
}

trackAll();

// add watchers to all input elements
const ids = getInputIds(sheetDef);
for(const id of ids){
  useStore().watch(id, (newValue : any) => {
    trackAll();
  }); 
}
