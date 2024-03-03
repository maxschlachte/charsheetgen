<template>
    <v-container class="d-flex">
        <div class="text-h3" style="font-weight: bold;">
            {{ getHeadline() }}
        </div>
        <v-spacer></v-spacer>
        <v-menu open-on-click>
            <template v-slot:activator="{ props }">
                <v-btn
                color="primary"
                v-bind="props"
                >
                    <i class="mdi mdi-menu text-h5"></i>
                </v-btn>
            </template>
            <v-list>
                <v-list-item
                    v-for="entry in menuEntries"
                >
                    <v-list-item-title
                        class="d-flex" 
                        @click="entry.callback"
                    >
                        <v-sheet :class="'mdi ' + entry.icon" />
                        <v-sheet class="pl-2">
                            {{ entry.title }}
                        </v-sheet>
                    </v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </v-container>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import { SETTINGS } from "@/types/enums";
import { useStore } from '@/services/store.service';
import { useDialog } from '@/services/dialog.service';
import { IDialog } from '@/types/interfaces';

const theme = useTheme()
theme.global.name.value = useStore().getValueById(SETTINGS.DARKMODE, "light");

const props = defineProps<{
  value: string
}>()

const menuEntries = [
    {
        icon: "mdi-file-document-plus-outline",
        title: "Neu",
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
        icon: "mdi-folder-arrow-up-outline",
        title: "Öffnen",
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
        icon: "mdi-content-save-outline",
        title: "Speichern",
        callback: () => { useStore().saveToFile() }
    },
    {
        icon: "mdi mdi-brightness-6",
        title: "Hell/Dunkel",
        callback: () => { toggleDarkmode() }
    }
]

const getHeadline = () => {
  return props.value;
}

const toggleDarkmode = () => {
    theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
    useStore().updateLocalValueById(SETTINGS.DARKMODE, theme.global.name.value);
}
</script>