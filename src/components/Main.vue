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
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div v-for="(card, index) in getCards().filter((crd, idx) => idx % 2 == 0)"
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
            <div v-for="(card, index) in getCards().filter((crd, idx) => idx % 2 == 1)"
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
</script>
