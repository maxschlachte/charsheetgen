import { nextTick } from "vue";

class UtilsService {

    private resizeOperations: { id: string, newHeight: number }[];

    constructor() {
        this.resizeOperations = [];
    }

    private applyResizing(element: HTMLElement, sizeModifier: number): void {
        const lastElement = element.children[element.children.length-1] as HTMLElement;
        const lastElementChild = lastElement.children[lastElement.children.length-1] as HTMLElement;
        const height = lastElementChild.offsetHeight;
        const newHeight = height + sizeModifier;
        lastElementChild.style.height = newHeight.toString() + "px";
        if (lastElementChild.id !== undefined && lastElementChild.id !== "") {
            this.resizeOperations.push({
                id: lastElementChild.id,
                newHeight: newHeight
            })
        }
        // check for nested grid
        if (lastElementChild.className.includes("grid")) {
          this.applyResizing(lastElementChild, sizeModifier);
        }
    }

    public applyTwoColumnStyling(): void {
        nextTick().then(() => {
            const twoColumns = document.getElementsByClassName("two-columns");
            for (let x = 0; x < twoColumns.length; x++) {
              const column1 = twoColumns[x].children[0];
              const column2 = twoColumns[x].children[1];
              if (column1.children.length > 0 && column2.children.length > 0) {
                let height1 = 0;
                for(let i = 0; i < column1.children.length; ++i){
                  height1 += (column1.children[i] as HTMLElement).offsetHeight;
                  height1 += parseFloat(window.getComputedStyle(column1.children[i]).getPropertyValue("margin-top").replace("px", ""));
                }
                let height2 = 0;
                for(let i = 0; i < column2.children.length; ++i){
                  height2 += (column2.children[i] as HTMLElement).offsetHeight;
                  height2 += parseFloat(window.getComputedStyle(column2.children[i]).getPropertyValue("margin-top").replace("px", ""));
                }
                const heightDiff = Math.abs(height1 - height2);
                const smallerColumn = (height1 < height2 ? column1 : column2) as HTMLElement;
                this.applyResizing(smallerColumn, heightDiff);
              }
            }
        });
    }

    public reapplyTwoColumnStyling(): void {   
        // needed since darkmode appears to be hiding light elements and showing dark elements (or vice versa),
        // the id is consistent accross the dark/light twin elements
        nextTick().then(() => {     
            for (let i = 0; i < this.resizeOperations.length; i++) {
                const element = document.getElementById(this.resizeOperations[i].id) as HTMLElement;        
                if (element !== undefined) {
                    element.style.height = this.resizeOperations[i].newHeight.toString() + "px";
                } else {
                    console.warn("Unable to find element with attribute " + this.resizeOperations[i].id);
                }
            }
        });
    }
}

const utilsService = new UtilsService()

export function useUtils(): UtilsService {
  return utilsService;
}