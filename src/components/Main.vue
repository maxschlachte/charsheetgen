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
        <div class="grid grid-cols-1 gap-4">
          <div v-for="cards in getCardClusters()">
            <div v-if="cards[0].colspan != 2" class="two-columns grid grid-cols-2 gap-4">
              <div>
                <div v-for="(card, index) in cards.filter((crd, idx) => idx % 2 == 0)"
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
                <div v-for="(card, index) in cards.filter((crd, idx) => idx % 2 == 1)"
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
            <div v-if="cards[0].colspan == 2" class="grid grid-cols-1 gap-4">
              <div v-for="card in cards">
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
import { useUtils } from "@/services/utils.service";
import { isCard, isGrid } from "@/types/typeGuards";
import {ICard, IGrid, ISheet} from "@/types/interfaces";
import { onMounted, onUpdated } from "vue";
import { useStore } from "@/services/store.service";
import { SETTINGS } from "@/types/enums";
import { useTheme } from "vuetify";

const theme = useTheme()
theme.global.name.value = useStore().getValueById(SETTINGS.DARKMODE, "light");

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

const getCardClusters = (): (ICard | IGrid)[][] => {
  let currentlyColspans = props.value.cards[0].colspan == 2;
  let idx = 0;
  const cardCluster = [] as (ICard | IGrid)[][];
  for (const card of props.value.cards) {
    if (cardCluster.length < idx + 1) {
      cardCluster.push([])
    }    
    if ((card.colspan == 2 && currentlyColspans) || (card.colspan === undefined && !currentlyColspans)) {
      cardCluster[idx].push(card);
    } else {
      cardCluster.push([card]);
      currentlyColspans = card.colspan == 2;
      idx += 1;
    }
  }
  return cardCluster;
}

useStore().watch(SETTINGS.DARKMODE, (newValue: string) => {
    theme.global.name.value = useStore().getValueById(SETTINGS.DARKMODE, "light");
    useUtils().reapplyTwoColumnStyling();
});

onMounted(() => {
  useUtils().applyTwoColumnStyling();
  // TODO: nextTick does not seem to work in production, using setTimeout as a crutch
  setTimeout(() => {
    useUtils().applyTwoColumnStyling();
  }, 500)
})
</script>