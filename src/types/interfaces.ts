import { CELL_TYPES, ELEMENT_TYPES, INPUT_TYPES, POSITIONING } from "./enums"

export interface IBase {
    id?: string
}

export interface ISheet {
    headline: string,
    saveNameFieldId: string,
    config?: IConfig,
    cards: (ICard | IGrid)[]
}

export interface IConfig {
    gap?: number,
    favicon?: string,
    pageTitle?: string,
}

export interface ICard {
    headline: string,
    colspan?: number,
    rowspan?: number,
    elements: IElement[]
}

export interface IElement extends IBase {
    type: ELEMENT_TYPES,
    gap?: number,
    colspan?: number,
    rowspan?: number,
    marginTop?: number,
    marginBottom?: number,
}

export interface IElementText extends IElement {
    type: ELEMENT_TYPES.TEXT,
    value: string
}

export interface ITable extends IElement {
    type: ELEMENT_TYPES.TABLE,
    column?: ITableColumn[],
    cells: ICell[][]
}

export interface ITableColumn {
    name: string,
    width?: string,
    position: POSITIONING
}

export interface IGrid extends IElement {
    type: ELEMENT_TYPES.GRID,
    cells: TGridCells[][]
}

export type TGridCells = ICell | IElement | ICard;

export interface ICell extends IBase {
    name: string,
    type: CELL_TYPES | ELEMENT_TYPES,
    colspan?: number,
    rowspan?: number,
    marginTop?: number,
    marginBottom?: number,
}

export interface IButton extends ICell {
    type: CELL_TYPES.BUTTON,
    value?: string,
    icon?: string,
    action: Function
}

export interface IInputNumber extends ICell {
    type: CELL_TYPES.INPUT_NUMBER,
    value?: number,
    range?: [number, number]
}

export interface ISelect extends ICell {
    type: CELL_TYPES.SELECT,
    items: string[]
}

export interface IInputText extends ICell {
    type: CELL_TYPES.INPUT_STRING,
    value?: string
}

export interface IText extends ICell {
    type: CELL_TYPES.STRING,
}

export interface ITextArea extends ICell {
    type: CELL_TYPES.TEXTAREA,
    rows?: number,
    value?: string
}

export interface IDialog {
    headline: string,
    icon?: string,
    color?: string,
    text: string,
    input?: IDialogInput,
    buttons: IDialogButton[]
}

export interface IDialogInput extends IBase {
    type: INPUT_TYPES,
    width?: string,
    value?: number,
    range?: [number, number]
    placeholder?: string
}

export interface IDialogButton {
    text: string,
    callback: Function
}