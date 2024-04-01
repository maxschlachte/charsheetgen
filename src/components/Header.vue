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
                    v-for="entry in getEntries()"
                >
                    <v-list-item-title
                        v-if="isMenuButton(entry)"
                        class="d-flex" 
                        @click="entry.callback"
                    >
                        <v-sheet :class="'mdi ' + entry.icon" />
                        <v-sheet class="pl-2">
                            {{ entry.title }}
                        </v-sheet>
                    </v-list-item-title>
                    <v-list-item-title
                        v-if="isMenuCheckbox(entry)"
                        class="d-flex" 
                        @click="makeCheckboxCallback(entry)"
                    >
                        <v-sheet :class="`mdi ${getCheckboxState(entry) ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline'}`" />
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
import { useMenu } from '@/services/menu.service';
import { useStore } from '@/services/store.service';
import { IMenuCheckbox } from '@/types/interfaces';
import { isMenuButton, isMenuCheckbox } from '@/types/typeGuards';

const props = defineProps<{
  value: string
}>()

const makeCheckboxCallback = (checkboxEntry: IMenuCheckbox) => {
    useStore().updateLocalValueById(checkboxEntry.storeId, getCheckboxState(checkboxEntry) ? false : true);
    checkboxEntry.callback();
}

const getCheckboxState = (checkboxEntry: IMenuCheckbox) => {
    return useStore().getValueById(checkboxEntry.storeId, false);
}

const getHeadline = () => {
    return props.value;
}

const getEntries = () => {
    return useMenu().getMenuEntries();
}
</script>