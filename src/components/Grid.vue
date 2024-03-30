<template>
    <div :class="`grid ${getGapClass()} ${twGridCols[getGridWidth()]}`">
        <div v-for="cell in getCells()" :class="getCellClass(cell)">
            <div v-if="isText(cell)" class="h-full w-full flex items-center">
                {{ cell.name }}
            </div>
            <v-text-field
                v-if="isInputNumber(cell) || isInputText(cell)"
                :model-value="getModelValue(cell)"
                :label="cell.name"
                :readonly="String(cell.id).split('-').includes('readonly') ? true : false"
                hide-details
                flat
                variant="outlined"
                @change="(event: Event) => { setModelValue(cell, event) }"
            ></v-text-field>
            <v-select
                v-if="isSelect(cell)"
                :model-value="getModelValue(cell)"
                :items="cell.items"
                :label="cell.name"
                hide-details
                flat
                variant="outlined"
                @update:modelValue="(event: string | null) => { setModelValue(cell, event) }"
            ></v-select>
            <v-textarea
                v-if="isTextarea(cell)"
                :model-value="getModelValue(cell)"
                :label="cell.name"
                :rows="cell.rows !== undefined ? cell.rows : 5"
                hide-details
                no-resize
                flat
                variant="outlined"
                spellcheck="false"
                @change="(event: Event) => setModelValue(cell, event)"
            ></v-textarea>
            <Table
                v-if="isTable(cell)"
                :value="cell"
            />
            <v-btn
                v-if="isButton(cell)"
                @click="cell.action"
                variant="outlined"
                class="h-100 w-100"
            >
                <p v-if="cell.value !== undefined">{{ cell.value }}</p>
                <p v-if="cell.value == undefined && cell.icon !== undefined" :class="cell.icon ? 'text-h5 mdi ' + cell.icon : ''" />
            </v-btn>
            <Grid
                v-if="isGrid(cell)"
                :value="cell"
            />
            <Card
                v-if="isCard(cell)"
                :value="cell"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import Card from "@/components/Card.vue";
import Grid from "@/components/Grid.vue";
import Table from "@/components/Table.vue";
import { useConfig } from "@/services/config.service";
import { useStore } from "@/services/store.service";
import { isCard, isInputNumber, isInputText, isTextarea, isButton, isText, isSelect, isGrid, isCell, isElement, isTable } from "@/types/typeGuards";
import { ICell, IGrid, TGridCells} from "@/types/interfaces";
import { twGridCols, twColSpans, twRowSpans, twGap, twMarginTop, twMarginBottom } from "@/types/tailwind";

const props = defineProps<{
  value: IGrid
}>()

const getCells = () => {
    let cells: TGridCells[] = []
    for (const c of props.value.cells) {
        cells = [...cells, ...c];
    }
    return cells;
}

const getCellClass = (cell: TGridCells): string => {
    let clss = [];
    if (isCell(cell) || isElement(cell)) {
        if (cell.colspan !== undefined) {
            clss.push(twColSpans[cell.colspan]);
        }
        if (cell.rowspan !== undefined) {
            clss.push(twRowSpans[cell.rowspan]);
        }
        if (cell.marginTop !== undefined) {
            clss.push(twMarginTop[cell.marginTop])
        }
        if (cell.marginBottom !== undefined) {
            clss.push(twMarginBottom[cell.marginBottom])
        }
    }
    return clss.join(" ");
}

const getGridWidth = () => {
    return props.value.cells.reduce((maxLength, currentArray) => {
        const currentLength = currentArray.reduce((acc, val) => {
            if (val.colspan !== undefined) {
                return acc + val.colspan;
            } else {
                return acc + 1;
            }
        }, 0);
        return currentLength > maxLength ? currentLength : maxLength;
    }, 0);
}

const getGapClass = () => {
    const gap = props.value.gap !== undefined ? props.value.gap : useConfig().getGap();
    return twGap[gap];
}

const getGridElementId = (element: ICell) => {
    return element.id !== undefined ? element.id : "id:" + element.name.toLowerCase().split(" ").join("-");
}

const getModelValue = (element: ICell) => {
    const id = getGridElementId(element);
    return useStore().getValueById(id, undefined);
}

const setModelValue = (element: ICell, event: Event | string | null) => {
    if (event !== null) {
        if (typeof event !== "string") {
            event = (event.target as HTMLButtonElement)?.value;
        }
        console.log("store id " + getGridElementId(element) + ": " + event);
        useStore().updateSaveableValueById(getGridElementId(element), event);
    } else {
        console.error("Invalid event value null!");
    }
}
</script>

<style scoped>
.v-btn {
  min-width: 0;
}
</style>