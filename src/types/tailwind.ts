import { POSITIONING } from "./enums"

export const twColSpans: Record<number, string> = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
    7: 'col-span-7',
    8: 'col-span-8',
}

export const twRowSpans: Record<number, string> = {
    1: 'row-span-1',
    2: 'row-span-2',
    3: 'row-span-3',
    4: 'row-span-4',
    5: 'row-span-5',
    6: 'row-span-6',
    7: 'row-span-7',
    8: 'row-span-8',
}

export const twGridCols: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
    8: 'grid-cols-8',
}

export const twGap: Record<number, string> = {
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
}

export const twMarginTop: Record<number, string> = {
    1: 'mt-1',
    2: 'mt-2',
    3: 'mt-3',
    4: 'mt-4',
    5: 'mt-5',
    6: 'mt-6',
}

export const twMarginBottom: Record<number, string> = {
    1: 'mb-1',
    2: 'mb-2',
    3: 'mb-3',
    4: 'mb-4',
    5: 'mb-5',
    6: 'mb-6',
}

export const twPosition: Record<POSITIONING, string> = {
    [POSITIONING.CENTER]: 'text-center',
    [POSITIONING.LEFT]: 'text-left',
    [POSITIONING.RIGHT]: 'text-right',
}