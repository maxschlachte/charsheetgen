<template>
    <v-card
        color="secondary"
        class="ma-0 pa-0 rounded overflow-hidden elevation-5"
      >
        <v-sheet
          :color="getData().color !== undefined ? getData().color : 'primary'"
          class="text-h5 py-1 px-4"
        >
          {{ getData().headline }}
        </v-sheet>
        <div class="p-4">
          <div v-if="getData().icon !== undefined" class="w-100 text-center mb-4">
            <p
                :class="getData().icon !== undefined ? `text-h1 mdi ${getData().icon}` : ''"
                :style="`color:${getColor()};`">
            </p>
          </div>
          <div style="white-space: pre;">
            {{ getData().text }}
          </div>
        </div>
        <v-card-actions class="p-4">
          <v-spacer></v-spacer>
          <input
            v-if="getData().input !== undefined"
            :model-value="getModelValue(getDataInput())"
            class="outline outline-1 rounded h-[34px] text-center mr-2"
            :style="`width:${getInputWidth()};`"
            :type="getInputType()"
            :max="getInputMax()"
            :min="getInputMin()"
            :placeholder="getData().input?.placeholder"
            @change="(event: Event) => setModelValue(getDataInput(), event)"
          />
          <v-btn
            v-for="but of getData().buttons"
            :color="getColor()"
            variant="outlined"
            @click="but.callback"
          >
            {{ but.text }}
          </v-btn>
        </v-card-actions>
      </v-card>
</template>

<script setup lang="ts">
import { useStore } from '@/services/store.service';
import { INPUT_TYPES } from '@/types/enums';
import { IDialog, IDialogInput } from '@/types/interfaces';

const props = defineProps<{
  data: IDialog
}>()

const getData = () => {
    return props.data;
}

const getDataInput = () => {
  return props.data.input ? props.data.input : {
    type: INPUT_TYPES.NUMERIC
  };
}

const getInputMax = () => {
    if (props.data.input !== undefined && Array.isArray(props.data.input?.range)) {
        return props.data.input.range[1];
    }
    return undefined;
}

const getInputMin = () => {
    if (props.data.input !== undefined && Array.isArray(props.data.input?.range)) {
        return props.data.input.range[0];
    }
    return undefined;
}

const getInputWidth = () => {
    return props.data.input?.width !== undefined ? props.data.input?.width : "70px";
}

const getInputType = () => {
    return props.data.input?.type !== INPUT_TYPES.NUMERIC ? "text" : "number";
}

const getColor = () => {
    return props.data.color !== undefined ? props.data.color : "";
}
const getDialogInputId = (dialogInput: IDialogInput) => {
    return dialogInput.id !== undefined ? dialogInput.id : "id:dialog-input";
}

const getModelValue = (dialogInput: IDialogInput) => {
    const id = getDialogInputId(dialogInput);
    return useStore().getValueById(id, undefined);
}

const setModelValue = (dialogInput: IDialogInput, event: Event) => {
    console.log("store id " + getDialogInputId(dialogInput) + ": " + (event.target as HTMLButtonElement)?.value);
    useStore().updateLocalValueById(getDialogInputId(dialogInput), (event.target as HTMLButtonElement)?.value);
}

</script>