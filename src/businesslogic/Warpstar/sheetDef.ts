import { CELL_TYPES, ELEMENT_TYPES, POSITIONING } from "@/types/enums";
import { IButton, ICell, IElement, IElementText, IGrid, IInputNumber, IInputText, ISelect, ISheet, ITable, ITextArea } from "@/types/interfaces";
import { chooseModifierAndMakeCheck, getSkillId, makeCheckWithFixedModifier, makePluckCheck, modifyValue } from "./utils";
import { skills } from "./staticData";
import { buildArmorGrid, buildWeaponElement } from "./builder";
import { FAVICON } from "./assets/favicon";

const skillsTable: ITable = {
  type: ELEMENT_TYPES.TABLE,
  column: [
    {
      name: "Max.",
      position: POSITIONING.CENTER
    },
    {
      name: "Adventuring Skill",
      width: "100%",
      position: POSITIONING.LEFT
    },
    {
      name: "Value",
      position: POSITIONING.CENTER
    },
    {
      name: "Check",
      position: POSITIONING.CENTER
    }
  ],
  cells: []
}

for (const skill of skills) {
  const id = getSkillId(skill);
  const maxCell: IInputNumber = {
    id: `${id}-max`,
    name: "Max.",
    type: CELL_TYPES.INPUT_NUMBER,
    range: [0,20]
  };
  const nameCell: ICell = {
    name: skill,
    type: CELL_TYPES.STRING
  };
  const valueCell: IInputNumber = {
    id: id,
    name: "Value",
    type: CELL_TYPES.INPUT_NUMBER,
    range: [0,20]
  };
  const checkButtonCell: IButton = {
    name: skill,
    type: CELL_TYPES.BUTTON,
    icon: "mdi-dice-d20-outline",
    action: () => {
      chooseModifierAndMakeCheck(id, skill + "-Check", skill);
    }
  };
  skillsTable.cells.push([maxCell, nameCell, valueCell, checkButtonCell])
}

for (let i = 0; i < 10; i++) {
  
}

const meleeWeaponsGrids: IElement[] = [];
const rangedWeaponsGrids: IElement[] = [];

for (let i = 0; i < 3; i++) {
  meleeWeaponsGrids.push(buildWeaponElement("Melee", i));
  meleeWeaponsGrids[i].marginBottom = 2
}
for (let i = 0; i < 3; i++) {
  rangedWeaponsGrids.push(buildWeaponElement("Ranged", i));
  if(i != 1) rangedWeaponsGrids[i].marginBottom = 2
}

const armorGrid: IGrid = buildArmorGrid("id:stamina-current");
armorGrid.marginBottom = 2;
const armorGridElements: IElement[] = [];
armorGridElements.push(buildArmorGrid("id:stamina-current"));

//export const sheetDef = ref({
export const sheetDef: ISheet = {
  headline: "WARPSTAR",
  saveNameFieldId: "id:name",
  config: {
    gap: 2,
    favicon: FAVICON,
    pageTitle: "Warpstar Character Sheet"
  },
  cards: [
    {
      headline: "Charakter",
      elements: [
        {
          type: ELEMENT_TYPES.GRID,
          cells: [
            [
              {
                id: "id:name",
                name: "Name",
                type: CELL_TYPES.INPUT_STRING,
                colspan: 4
              },
              {
                name: "Community",
                type: CELL_TYPES.INPUT_STRING,
                colspan: 4
              },
            ],
            [
              {
                name: "Background",
                type: CELL_TYPES.INPUT_STRING,
                colspan: 4
              },
              {
                name: "Career",
                type: CELL_TYPES.INPUT_STRING,
                colspan: 4
              },
            ],
            [
              {
                name: "Talent",
                type: CELL_TYPES.TEXTAREA,
                colspan: 4
              },
              {
                name: "Past Careers",
                type: CELL_TYPES.TEXTAREA,
                colspan: 4
              },
            ],
            [
              {
                id: "id:stamina-current",
                name: "Stamina (current)",
                type: CELL_TYPES.INPUT_NUMBER,
                colspan: 4
              },
              {
                name: "Stamina (max)",
                type: CELL_TYPES.INPUT_NUMBER,
                colspan: 4
              },
            ],
            [
              {
                id: "id:luck",
                name: "Luck",
                type: CELL_TYPES.INPUT_NUMBER,
                colspan: 2
              },
              {
                id: "id:luck-max",
                name: "Luck (max)",
                type: CELL_TYPES.INPUT_NUMBER,
                colspan: 2
              },
              {
                name: "Roll Pluck",
                type: CELL_TYPES.BUTTON,
                icon: "mdi-dice-d20-outline",
                action: () => {
                  makeCheckWithFixedModifier("id:luck", "Luck-Check", "Luck", 0, () => {
                    modifyValue("id:luck", -1);
                  });
                }
              },
              {
                id: "id:pluck",
                name: "Pluck",
                type: CELL_TYPES.INPUT_NUMBER,
                colspan: 2
              },
              {
                name: "Roll Pluck",
                type: CELL_TYPES.BUTTON,
                icon: "mdi-dice-multiple-outline",
                action: () => {
                  makePluckCheck("id:pluck", "Pluck-Check");
                }
              },
            ],
          ]
        } as IGrid,
      ]
    },
    {
      headline: "Adventuring Skills",
      elements: [
        skillsTable,
      ]
    },
    {
      type:ELEMENT_TYPES.GRID,
      gap: 4,
      cells: [
        [
          {
            headline: "Possessions",
            elements: [
              {
                type: ELEMENT_TYPES.GRID,
                cells: [
                  [
                    {
                      name: "Possessions",
                      type: CELL_TYPES.TEXTAREA
                    },
                  ],
                  [
                    {
                      name: "Armour",
                      type: CELL_TYPES.STRING,
                      marginTop: 2
                    }
                  ],
                  [
                    armorGrid,
                  ],
                  [
                    {
                      name: "Melee Weapons",
                      type: CELL_TYPES.STRING
                    }
                  ],
                  [
                    meleeWeaponsGrids[0]
                  ],
                  [
                    meleeWeaponsGrids[1]
                  ],
                  [
                    meleeWeaponsGrids[2]
                  ],
                  [
                    {
                      name: "Ranged Weapons",
                      type: CELL_TYPES.STRING
                    }
                  ],
                  [
                    rangedWeaponsGrids[0]
                  ],
                  [
                    rangedWeaponsGrids[1]
                  ]
                ]
              } as IGrid,
            ]
          },
        ],
        [
          {
            headline: "Critical Wounds",
            elements: [
              {
                type: ELEMENT_TYPES.GRID,
                cells: [
                  [
                    {
                      name: "Critical Wounds",
                      type: CELL_TYPES.TEXTAREA,
                      rows: 8
                    } as ITextArea,
                  ]
                ]
              } as IGrid,
            ]
          },
        ]
      ]
    },
    {
      headline: "Warp Glyphs",
      elements: [
        {
          type: ELEMENT_TYPES.GRID,
          cells: [
            [
              {
                name: "Spells",
                type: CELL_TYPES.TEXTAREA,
                rows: 21
              } as ITextArea,
            ]
          ]
        } as IGrid,
      ]
    }
  ]
} as ISheet;
