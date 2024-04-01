import { IDialog, IMenuButton, IMenuEntry } from "@/types/interfaces";
import { useDialog } from "./dialog.service";
import { useStore } from "./store.service";
import { HOOKS, MENU_ENTRY_TYPES, SETTINGS } from '@/types/enums';
import { useHooks } from './hooks.service';
import { isMenuCheckbox } from "@/types/typeGuards";

class MenuService {
    private menuEntries: IMenuEntry[];

    constructor() {
        this.menuEntries = [
            {
                type: MENU_ENTRY_TYPES.BUTTON,
                icon: "mdi-file-document-plus-outline",
                title: "New",
                callback: () => {
                    const dialog: IDialog = {
                        headline: "New Document",
                        text: "Are you sure you want to create a new document? Unsaved changes will be discarded!",
                        buttons: [
                            {
                                text: "Ok",
                                callback: () => {
                                    useStore().resetSaveables();
                                    useDialog().closeDialog();
                                    useHooks().execute(HOOKS.NEW);
                                }
                            },
                            {
                                text: "Abort",
                                callback: () => {
                                    useDialog().closeDialog();
                                }
                            }
                        ]
                    }
                    useDialog().openDialog(dialog);
                }
            },
            {
                type: MENU_ENTRY_TYPES.BUTTON,
                icon: "mdi-folder-arrow-up-outline",
                title: "Open file...",
                callback: () => { 
                    const fileInput = document.createElement("input");
                    fileInput.type = "file";
                    document.body.appendChild(fileInput);
                    fileInput.onchange = () => {
                        useStore().loadFromFile(fileInput);
                        document.body.removeChild(fileInput);
                    }
                    fileInput.click();
                }
            },
            {
                type: MENU_ENTRY_TYPES.BUTTON,
                icon: "mdi-content-save-outline",
                title: "Save",
                callback: () => { useStore().saveToFile() }
            },
            {
                type: MENU_ENTRY_TYPES.BUTTON,
                icon: "mdi mdi-brightness-6",
                title: "Light/Dark",
                callback: () => {
                    // @ts-ignore
                    useStore().updateLocalValueById(SETTINGS.DARKMODE, useStore().getValueById(SETTINGS.DARKMODE, 'light') == 'dark' ? 'light' : 'dark');
                }
            }
        ]
    }

    public addEntry(entry: IMenuEntry): void {
        this.menuEntries.push(entry);
    }

    public changeIconForNew(icon: string) {
        this.setIconForEntryAt(icon, 0);
    }

    public changeIconForOpen(icon: string) {
        this.setIconForEntryAt(icon, 1);
    }

    public changeIconForSave(icon: string) {
        this.setIconForEntryAt(icon, 2);
    }

    public changeIconForDarkmode(icon: string) {
        this.setIconForEntryAt(icon, 3);
    }

    public changeIconForCustomEntry(icon: string, index: number) {
        if (index + 4 >= this.menuEntries.length) {
            console.warn(`Invalid index for custom menu entry! Index range from 0 to ${this.menuEntries.length - 4}!`);
        } else {
            this.setIconForEntryAt(icon, index + 4);
        }
    }

    private setIconForEntryAt(icon: string, index: number) {
        if (!icon.includes("mdi-")) {
            console.warn(`Invalid icon format '${icon}' for menu entry '${this.menuEntries[index].title}', use material design icon format 'mdi-icon-name'. Will use default icon!`);
        } else if (isMenuCheckbox(this.menuEntries[index])) {
            console.warn("Cannot set icon for Checkbox!");
        } else {
            (this.menuEntries[index] as IMenuButton).icon = icon;
        }
    }

    public changeTextForNew(title:string, dialogHeadline: string, dialogText: string, dialogOk: string, dialogAbort: string) {
        this.menuEntries[0].title = title;
        (this.menuEntries[0] as IMenuButton).callback = () => {
            const dialog: IDialog = {
                headline: dialogHeadline,
                text: dialogText,
                buttons: [
                    {
                        text: dialogOk,
                        callback: () => {
                            useStore().resetSaveables();
                            useDialog().closeDialog();
                            useHooks().execute(HOOKS.NEW);
                        }
                    },
                    {
                        text: dialogAbort,
                        callback: () => {
                            useDialog().closeDialog();
                        }
                    }
                ]
            }
            useDialog().openDialog(dialog);
        }
    }

    public changeTextForOpen(title: string) {
        this.menuEntries[1].title = title;
    }

    public changeTextForSave(title:string) {
        this.menuEntries[2].title = title;
    }

    public changeTextForDarkmode(title:string) {
        this.menuEntries[3].title = title;
    }

    public getMenuEntries() {
        return this.menuEntries;
    }
}

const menuService = new MenuService()

export function useMenu(): MenuService {
  return menuService;
}