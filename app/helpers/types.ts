export type ValuesOf<T extends string[]> = T[number]
export type ObjectWithKeysOf<T extends string[]> = {
    [key in ValuesOf<T>]: string
}
