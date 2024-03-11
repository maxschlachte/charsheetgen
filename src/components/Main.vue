<template>
  <v-container>
    <Header :value="getHeadline()" class="mb-5 px-0 flex justify-center items-center max-w-[600px] md:max-w-[1200px]" />
    <div class="flex justify-center items-center">
      <div class="block md:hidden">
        <div class="grid grid-cols-1 gap-4">
          <div v-for="card in getCards()"
            class="max-w-[600px]"
          >
            <Card
              v-if="isCard(card)"
              :value="card"
            />
            <Grid
              v-if="isGrid(card)"
              :value="card"
            />
          </div>
        </div>
      </div>
      <div class="hidden md:block max-w-[1200px]">
        <div id="two-columns" class="grid grid-cols-2 gap-4">
          <div>
            <div v-for="(card, index) in getCards().filter((crd, idx) => crd.colspan != 2 && idx % 2 == 0)"
              :class="`${index != 0 ? 'mt-4' : ''}`"
            >
              <Card
                v-if="isCard(card)"
                :value="card"
              />
              <Grid
                v-if="isGrid(card)"
                :value="card"
              />
            </div>
          </div>
          <div>
            <div v-for="(card, index) in getCards().filter((crd, idx) => crd.colspan != 2 && idx % 2 == 1)"
              :class="`${index != 0 ? 'mt-4' : ''}`"
            >
              <Card
                v-if="isCard(card)"
                :value="card"
              />
              <Grid
                v-if="isGrid(card)"
                :value="card"
              />
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4">
          <div>
            <div v-for="(card, index) in getCards().filter((crd, idx) => crd.colspan == 2)"
              :class="`${'mt-4'}`"
            >
              <Card
                v-if="isCard(card)"
                :value="card"
              />
              <Grid
                v-if="isGrid(card)"
                :value="card"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <v-dialog
      v-model="showDialog"
      persistent
      width="auto"
    >
      <DialogContent :data="dialogData" />
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import Card from "@/components/Card.vue";
import Grid from "@/components/Grid.vue";
import Header from '@/components/Header.vue';
import DialogContent from "@/components/DialogContent.vue";
import { useDialog } from "@/services/dialog.service";
import { isCard, isGrid } from "@/types/typeGuards";
import {ISheet} from "@/types/interfaces";
import { onMounted } from 'vue';

const props = defineProps<{
  value: ISheet
}>()

const showDialog = useDialog().getDialogState();
const dialogData = useDialog().getDialogData();

const getHeadline = () => {
  return props.value.headline;
}

const getCards = () => {
  return props.value.cards;
}

onMounted(() => {
  // make the two columns the same height
  setTimeout(function() {
    const twoColumns = document.getElementById("two-columns");
    if(!(twoColumns == null)){
      const column1 = twoColumns.children[0];
      const column2 = twoColumns.children[1];
      let height1 = 0;
      for(var i = 0; i < column1.children.length; ++i){
        height1 += (column1.children[i] as HTMLElement).offsetHeight;
        height1 += parseFloat(window.getComputedStyle(column1.children[i]).getPropertyValue("margin-top").replace("px", ""));
      }
      let height2 = 0;
      for(var i = 0; i < column2.children.length; ++i){
        height2 += (column2.children[i] as HTMLElement).offsetHeight;
        height2 += parseFloat(window.getComputedStyle(column2.children[i]).getPropertyValue("margin-top").replace("px", ""));
      }
      const heightDiff = Math.abs(height1 - height2);
      const smallerColumn = (height1 < height2 ? column1 : column2);
      const lastElement = smallerColumn.children[smallerColumn.children.length-1];
      const lastElementChild = lastElement.children[lastElement.children.length-1];
      const height = (lastElementChild as HTMLElement).offsetHeight;
      (lastElementChild as HTMLElement).style.height = (height + heightDiff).toString() + "px";
    }
  }, 3000);
})
</script>
