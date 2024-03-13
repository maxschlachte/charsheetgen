<template>
  <!--<v-table 
    class="primary"
    density="compact"
  >-->
  <table class="table-fixed" style="width:100%">
    <thead v-if="getTable().column !== undefined">
      <tr>
        <th
          v-for="(column, idx) of getTable().column"
          :class="`whitespace-nowrap px-2 ${getPositioning(column.position)}`"
          :style="`width:${getColumnWidth(column)}`"
        >
          {{ column.name }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(entry, entryIdx) in getCells()"
      >
        <td 
          v-for="(cell, idx) in entry"
          :class="`px-2 py-[1px]`"
          :style="`background:${entryIdx % 2 == 0 ? 'background' : 'secondary'}`"
        >
          <div
            v-if="isText(cell)"
            :class="`whitespace-nowrap ${getPositioningByIndex(idx)} ${idx % 2 == 0 ? 'primary' : 'secondary'}`"
          >
              {{ cell.name }}
          </div>
          <input
            v-if="isInputNumber(cell) || isInputText(cell)"
            :value="getModelValue(cell)"
            :class="`appearance-none bg-transparent border-none w-full focus:outline-none ${getPositioningByIndex(idx)}`"
            :type="isInputNumber(cell) ? 'number' : 'text'"
            :placeholder="cell.name"
            @change="(event: Event) => { setModelValue(cell, event) }"
          >
          <select
            v-if="isSelect(cell)"
            :value="getModelValue(cell)"
            :class="`appearance-none bg-transparent border-none w-full focus:outline-none ${getPositioningByIndex(idx)}`"
            :placeholder="cell.name"
            @change="(event: Event) => { setModelValue(cell, event) }"
          >
            <option v-for="item of cell.items" :value="item">{{ item }}</option>
          </select>
          <div
            v-if="isButton(cell)"
            class="flex items-center justify-center text-center w-full"
          >
            <v-btn
                @click="cell.action"
                variant="outlined"
                class="h-100 w-[36px]"
            >
                <p v-if="cell.value !== undefined">{{ cell.value }}</p>
                <p v-if="cell.value == undefined && cell.icon !== undefined" :class="cell.icon ? 'text-h5 mdi ' + cell.icon : ''" />
            </v-btn>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
  <!--</v-table>-->
</template>

<script setup lang="ts">
import { useStore } from "@/services/store.service";
import { isInputNumber, isInputText, isTextarea, isButton, isText, isSelect } from "@/types/typeGuards";
import { ICell, ITable, ITableColumn} from "@/types/interfaces";
import { POSITIONING } from "@/types/enums";
import { twPosition } from "@/types/tailwind";
import { ref } from "vue";

const props = defineProps<{
value: ITable
}>()

const getTable = () => {
  return props.value;
}

const getCells = () => {
  return props.value.cells;
}

const getGridElementId = (element: ICell) => {
  return element.id !== undefined ? element.id : "id:" + element.name.toLowerCase().split(" ").join("-");
}

const getModelValue = (element: ICell) => {
  const id = getGridElementId(element);
  return useStore().getValueById(id, undefined);
}

const setModelValue = (element: ICell, event: Event) => {
  console.log("store id " + getGridElementId(element) + ": " + (event.target as HTMLButtonElement)?.value);
  useStore().updateSaveableValueById(getGridElementId(element), (event.target as HTMLButtonElement)?.value);
}

const getColumnWidth = (column: ITableColumn) => {
  if(column.width !== undefined) {
    return `${column.width};`
  } else {
    return "";
  }
}

const getPositioning = (pos: POSITIONING) => {
  if (pos !== undefined) {
    return twPosition[pos];
  }
  return twPosition[POSITIONING.LEFT];
}

const getPositioningByIndex = (index: number) => {
  const column = getTable().column;
  if (column !== undefined) {
    return getPositioning(column[index].position);
  }
  return getPositioning(POSITIONING.LEFT);
}

</script>

<style scoped>
.v-btn {
  min-width: 0;
}

td:first-child div.whitespace-nowrap {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>