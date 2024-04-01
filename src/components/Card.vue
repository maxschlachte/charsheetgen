<template>
    <v-sheet 
          :id="id"
          color="secondary"
          :class="`${$attrs} ma-0 p-0 rounded overflow-hidden elevation-5`"
        >
          <v-sheet
            color="primary"
            class="text-h5 py-1 px-4"
            style="font-weight: bold;"
          >
            {{ getCard().headline.toUpperCase() }}
          </v-sheet>
          <div class="grid grid-cols-1 gap-4 px-3 py-4">
            <div
              v-for="(element, idx) in getCard().elements"
            >
              <Grid
                v-if="isGrid(element)"
                :value="element"  
              />
              <Table
                v-if="isTable(element)"
                :value="element"
              />
              <div
                v-if="isElementText(element)"
                :class="idx == 0 ? 'pb-2' : idx == getCard().elements.length-1 ? 'pt-3' : 'py-2'"
              >
                {{ element.value }}
              </div>
            </div>
          </div>
    </v-sheet>
</template>

<script setup lang="ts">
import Table from "@/components/Table.vue";
import Grid from "@/components/Grid.vue";
import { ICard } from "@/types/interfaces";
import {isGrid, isTable, isElementText} from "@/types/typeGuards";

const props = defineProps<{
  value: ICard
}>()

const id: string = self.crypto.randomUUID();

const getCard = () => {
    return props.value;
}
</script>