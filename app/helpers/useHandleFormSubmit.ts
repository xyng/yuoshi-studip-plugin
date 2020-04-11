import { FormEventHandler, useCallback } from "react"

import { ObjectWithKeysOf } from "./types"

export default function useHandleFormSubmit<T extends string[]>(
    fields: T,
    handleSubmit: (values: ObjectWithKeysOf<T>) => void
) {
    return useCallback<FormEventHandler<HTMLFormElement>>(
        (event) => {
            event.preventDefault()

            const { elements } = event.currentTarget

            const values: any = {}
            for (const field of fields) {
                const elem = elements.namedItem(field) as HTMLInputElement
                values[field] = elem.value
            }

            handleSubmit(values as ObjectWithKeysOf<T>)
        },
        [fields, handleSubmit]
    )
}
