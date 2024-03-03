<template>
  <v-app
    color="background"
  >
    <v-main>
      <!--<Main :value="sheetDef"></Main>-->
      <Main :value="useConfig().getSheetDef()"></Main>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import Main from '@/components/Main.vue'
//import { sheetDef } from '@/businesslogic/sheetDef';
import { onMounted } from 'vue';
import { useConfig } from './services/config.service';

onMounted(() => {
  (document.querySelector("link[rel~='icon']") as HTMLLinkElement).href = useConfig().getFavicon();
  document.title = useConfig().getPageTitle();
})
</script>
