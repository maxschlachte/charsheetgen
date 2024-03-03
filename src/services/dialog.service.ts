import { Ref, ref } from "vue";
import { IDialog } from "@/types/interfaces";
import { useStore } from "./store.service";

class DialogService {
    private dialogState;
    private dialogData;

    constructor() {
        this.dialogState = ref(false);
        this.dialogData = ref({} as IDialog);
    }

    public openDialog(dialog: IDialog): void {
        if (dialog.input?.id !== undefined) {
            useStore().updateLocalValueById(dialog.input?.id, undefined);
        }
        this.dialogData.value = dialog;
        this.dialogState.value = true;
    }

    public closeDialog(): void {
        this.dialogState.value = false;
    }

    public getDialogState(): Ref<boolean> {
        return this.dialogState;
    }

    public getDialogData(): Ref<IDialog> {
        return this.dialogData;
    }
}

const dialogService = new DialogService()

export function useDialog(): DialogService {
  return dialogService;
}