import type { TableRow } from "@nuxt/ui"

export const headerClass = 'px-5 py-4 text-left text-xs font-semibold uppercase text-texto/70'
export const cellClass = 'px-5 py-4 align-top text-texto/70'

export const defaultColumnMeta = {
    class: {
        th: headerClass,
        td: cellClass
    }
}

export const createTableMeta = <T>() => ({
    class: {
        tr: (_row: TableRow<T>) => 'cursor-pointer transition-colors duration-150 hover:bg-fondo-login/50',
    }
})