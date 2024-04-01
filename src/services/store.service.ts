import { ref, watch } from 'vue'
import { useConfig } from './config.service';
//import { sheetDef } from '@/businesslogic/sheetDef';

class StoreService {
  private static STORAGE_ID = "CHARSHEET-STORAGE";
  private static SAVEABLE = "SAVEABLE";
  private static LOCAL = "LOCAL";
  private store;

  constructor() {
    this.store = ref(this.loadFromLocalStorage() as Record<string, Record<string, any>>)
  }

  public watch(id: string, callback: Function) {
    watch(() => this.getValueById(id, 0), (newValue, oldValue) => {
      callback(newValue);
    })
  }

  public getValueById<Type>(id: string, def: Type): Type {
    if (this.store.value[StoreService.LOCAL] !== undefined &&
      this.store.value[StoreService.LOCAL][id] !== undefined) {
        return this.store.value[StoreService.LOCAL][id];
    } else if (this.store.value[StoreService.SAVEABLE] !== undefined &&
      this.store.value[StoreService.SAVEABLE][id] !== undefined) {
        return this.store.value[StoreService.SAVEABLE][id];
    } else {
        return def;
    }
  }

  public updateLocalValueById<Type>(id: string, value: Type): void {
    this.updateValueById(id, value, StoreService.LOCAL);
  }

  public updateSaveableValueById<Type>(id: string, value: Type): void {
    this.updateValueById(id, value, StoreService.SAVEABLE);
  }

  private updateValueById<Type>(id: string, value: Type, category: string) {
    if (this.store.value[category] == undefined) {
      this.store.value[category] = {};
    }
    this.store.value[category][id] = value;
    this.saveToLocalStorage();
  }

  public saveToFile() {
    const data = JSON.stringify(this.store.value[StoreService.SAVEABLE]);
    const type = "text/plain;charset=utf-8";
    //const filename = this.getValueById(sheetDef.value.saveNameFieldId, "unknown") + ".char";
    const filename = this.getValueById(useConfig().getSheetDef().saveNameFieldId, "unknown") + ".char";
    const file = new Blob([data], {type: type});
    // @ts-ignore
    if (window.navigator.msSaveOrOpenBlob) // IE10+
      // @ts-ignore
      window.navigator.msSaveOrOpenBlob(file, filename);
    else {
        const a = document.createElement("a"),
          url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
  }
  
  public loadFromFile(inputElement: HTMLInputElement) {
    if (inputElement.files !== null) {
      let file = inputElement.files[0];
      let fileReader = new FileReader();
      fileReader.readAsText(file); 
      fileReader.onload = () => {
        if (fileReader.result !== null && typeof fileReader.result === "string") {
          try {
            this.store.value[StoreService.SAVEABLE] = JSON.parse(fileReader.result);
            console.log(this.store.value[StoreService.SAVEABLE]);
          } catch(e) {
            console.error("Unable to parse file input!")
          }
        }
      }; 
      fileReader.onerror = function() {
        console.error(fileReader.error)
      };
    }
  }

  public resetSaveables() {
    this.store.value[StoreService.SAVEABLE] = {};
  }

  private saveToLocalStorage() {
    localStorage.setItem(StoreService.STORAGE_ID, JSON.stringify(this.store.value));
  }

  private loadFromLocalStorage() {
      const storedData = localStorage.getItem(StoreService.STORAGE_ID);
      try {
        return storedData ? JSON.parse(storedData) : {};
      } catch(e) {
        console.warn("Unable to parse stored data!");
        return {};
      }
  }
}

const storeService = new StoreService()

export function useStore(): StoreService {
  return storeService;
}