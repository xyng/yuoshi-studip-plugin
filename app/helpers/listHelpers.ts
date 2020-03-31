export interface Identifiable {
    id: string
}

export interface Creatable extends Identifiable {
    isNew?: boolean
}

export interface Sortable {
    sort?: number
}

export interface IdentifiableSortable extends Identifiable, Sortable {}

export type SetterFn<T> = T | ((arg: any) => T)

export function sortItemsByKey<T>(key: keyof T, array: T[]): T[] {
    return array.sort((a, b) => {
        if (a[key] === undefined) {
            return 1
        }

        if (b[key] === undefined) {
            return -1
        }

        if (a[key] < b[key]) {
            return -1
        }

        if (a[key] > b[key]) {
            return 1
        }

        return 0
    })
}

export function ensureSequenceForKey<T>(
    key: keyof T,
    array: T[],
    sort = true
): T[] {
    const ret: T[] = []
    let counter = 0

    // make sure array is sorted (if not disabled by flag)
    if (sort) {
        array = sortItemsByKey(key, array)
    }

    for (let i = 0; i < array.length; i++) {
        ret.push({
            ...array[i],
            [key]: counter++,
        })
    }

    return ret
}

export function updateEntity<T extends Identifiable>(
    id: string,
    key: keyof T,
    value: SetterFn<T[keyof T]>
) {
    return (entities: T[]): T[] => {
        const index = entities.findIndex((entity) => entity.id === id)

        if (index === -1) {
            return entities
        }

        const entity = {
            ...entities[index],
            [key]:
                value instanceof Function ? value(entities[index][key]) : value,
        }

        return [
            ...entities.slice(0, index),
            entity,
            ...entities.slice(index + 1),
        ]
    }
}

export function updateEntityAndSort<T extends IdentifiableSortable>(
    id: string,
    key: keyof T,
    value: SetterFn<T[keyof T]>
) {
    return (entities: T[]): T[] => {
        const updated = updateEntity(id, key, value)(entities)

        // only resort if necessary
        if (key !== "sort") {
            return updated
        }

        return ensureSequenceForKey("sort", updated)
    }
}

export function removeEntity<T extends Identifiable>(id: string) {
    return (entities: T[]): T[] => {
        const index = entities.findIndex((entity) => entity.id === id)

        if (index === -1) {
            return entities
        }

        return [...entities.slice(0, index), ...entities.slice(index + 1)]
    }
}

export function removeEntityAndSort<T extends IdentifiableSortable>(
    id: string
) {
    return (entities: T[]): T[] => {
        return ensureSequenceForKey("sort", removeEntity<T>(id)(entities))
    }
}
