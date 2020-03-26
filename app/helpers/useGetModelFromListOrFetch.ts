import { useCallback, useMemo } from "react"
import { Model } from "coloquent"
import useSWR from "swr"
import { keyInterface, fetcherFn } from "swr/esm/types"

export default function useGetModelFromListOrFetch<T extends Model>(
    entityId: string | undefined,
    list: T[],
    fallbackFetcherKey: keyInterface,
    fallbackFetcher: fetcherFn<T>,
    updateList: (entity: T, reload: boolean) => void | Promise<void>,
    reloadList: () => Promise<any>
) {
    const entityFromList = useMemo(() => {
        if (!entityId) {
            return
        }

        return list.find((elem) => elem.getApiId() === entityId)
    }, [entityId, list])

    const keyFetcher = useCallback(() => {
        if (entityFromList) {
            return null
        }

        if (fallbackFetcherKey instanceof Function) {
            return fallbackFetcherKey()
        }

        return fallbackFetcherKey
    }, [fallbackFetcherKey, entityFromList])

    const { data: entityFetched, mutate } = useSWR(
        keyFetcher,
        fallbackFetcher,
        { suspense: true }
    )

    const entityData = useMemo(() => {
        return entityFromList || (entityFetched as T)
    }, [entityFromList, entityFetched])

    const updateEntity = useCallback(
        async (updated: T, reload = false) => {
            // update item in list if we've got it from there
            if (entityFromList) {
                return updateList(updated, reload)
            }

            // update or own fetched package
            await mutate(updated, reload)

            // update package list after item mutation - just in case...
            // (this does not respect the `reload`-parameter. it's meant to be that way.)
            await reloadList()
        },
        [entityFromList, mutate, updateList, reloadList]
    )

    return {
        entityData,
        updateEntity,
    }
}
