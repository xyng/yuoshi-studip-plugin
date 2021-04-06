import React, { createContext, useCallback, useContext, useMemo } from "react"
import { PluralResponse } from "coloquent"
import useSWR, { responseInterface } from "swr"

import Station from "../models/Station"
import updateModelList from "../helpers/updateModelList"

import { useCurrentPackageContext } from "./CurrentPackageContext"
interface StationContextInterface {
    station: Station[]
    updateStation: (updated: Station, reload?: boolean) => Promise<void>
    reloadStations: () => Promise<boolean>
    mutate: responseInterface<Station[], any>["mutate"]
}
const StationContext = createContext<StationContextInterface | null>(null)

export const useStationContext = () => {
    const ctx = useContext(StationContext)

    if (ctx === null) {
        throw new Error("No StationContextProvider available.")
    }

    return ctx
}

const fetchStationsForPackage = (byUser: boolean) => async (
    packageId: string
): Promise<Station[]> => {
    let query = Station.where("package", packageId)

    if (byUser) {
        query = query.with("stationUserProgress.user")
    } else {
        query = query.with("stationTotalProgress")
    }

    const stationItem = (await query.get()) as PluralResponse

    return stationItem.getData() as Station[]
}

export const StationContextProvider: React.FC<{
    byUser?: boolean
}> = ({ children, byUser }) => {
    const { currentPackage } = useCurrentPackageContext()
    const cacheKey = useMemo(
        () => (byUser ? "package/stations_by_user" : "package/stations"),
        [byUser]
    )
    const fetch = useMemo(() => fetchStationsForPackage(!!byUser), [byUser])

    const { data, mutate, revalidate } = useSWR(
        () =>
            currentPackage.getApiId()
                ? [currentPackage.getApiId(), cacheKey]
                : null,
        fetch,
        { suspense: true }
    )

    const updateStation = useCallback(
        async (updatedStation: Station, reload: boolean = false) => {
            await mutate(updateModelList(updatedStation), reload)
        },
        [mutate]
    )

    const ctx = {
        station: (data as Station[]).sort((a, b) => {
            return a.getSort() - b.getSort()
        }),
        updateStation,
        reloadStations: revalidate,
        mutate,
    }

    return (
        <StationContext.Provider value={ctx}>
            {children}
        </StationContext.Provider>
    )
}
