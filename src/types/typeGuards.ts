import { ELEMENT_TYPES, CELL_TYPES } from "./enums";
import {IElement, IButton, IText, ITable, IGrid, IInputNumber, IInputText, IBase, ICard, ICell, IDialog, IDialogButton, ISheet, ITextArea, ISelect, IElementText} from "./interfaces";

export function isBase(obj: any): obj is IBase {
    return 'id' in obj || !obj.hasOwnProperty('id');
  }
  
  export function isSheet(obj: any): obj is ISheet {
    return 'headline' in obj && 'cards' in obj;
  }
  
  export function isCard(obj: any): obj is ICard {
    return 'headline' in obj && 'elements' in obj;
  }
  
  export function isElement(obj: any): obj is IElement {
    return 'type' in obj;
  }
  
  export function isTable(obj: any): obj is ITable {
    return isElement(obj) && obj.type === ELEMENT_TYPES.TABLE && 'cells' in obj;
  }

  export function isElementText(obj: any): obj is IElementText {
    return isElement(obj) && obj.type === ELEMENT_TYPES.TEXT && 'value' in obj;
  }
  
  export function isGrid(obj: any): obj is IGrid {
    return isElement(obj) && obj.type === ELEMENT_TYPES.GRID && 'cells' in obj;
  }
  
  export function isCell(obj: any): obj is ICell {
    return 'name' in obj && 'type' in obj;
  }
  
  export function isButton(obj: any): obj is IButton {
    return isCell(obj) && obj.type === CELL_TYPES.BUTTON && 'action' in obj;
  }

  export function isSelect(obj: any): obj is ISelect {
    return isCell(obj) && obj.type === CELL_TYPES.SELECT && Array.isArray((obj as ISelect).items);
  }
  
  export function isInputNumber(obj: any): obj is IInputNumber {
    return isCell(obj) && obj.type === CELL_TYPES.INPUT_NUMBER;
  }
  
  export function isInputText(obj: any): obj is IInputText {
    return isCell(obj) && obj.type === CELL_TYPES.INPUT_STRING;
  }
  
  export function isText(obj: any): obj is IText {
    return isCell(obj) && obj.type === CELL_TYPES.STRING;
  }
  
  export function isTextarea(obj: any): obj is ITextArea {
    return isCell(obj) && obj.type === CELL_TYPES.TEXTAREA;
  }
  
  export function isDialog(obj: any): obj is IDialog {
    return 'headline' in obj && 'color' in obj && 'text' in obj && 'buttons' in obj;
  }
  
  export function isDialogButton(obj: any): obj is IDialogButton {
    return 'text' in obj && 'callback' in obj;
  }

  export function isStringOrNumber(value: unknown): value is string | number {
    return typeof value === 'string' || typeof value === 'number';
  }