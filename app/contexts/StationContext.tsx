import React, { createContext, useCallback, useContext, useMemo } from "react"
import { PluralResponse } from "coloquent"
import useSWR, { responseInterface } from "swr"

import Station from "../models/Station"
import updateModelList from "../helpers/updateModelList"

import { useCurrentStationContext } from "./CurrentStationContext"
import { useCurrentPackageContext } from "./CurrentPackageContext"
// TODO check reloadTasks and compare to reloadStation
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

const fetchStationsForPackage = async (
    packageId: string
): Promise<Station[]> => {
    const packageItem = (await Station.where(
        "package",
        packageId
    ).get()) as PluralResponse

    return packageItem.getData() as Station[]
}

export const StationContextProvider: React.FC = ({ children }) => {
    const { currentPackage } = useCurrentPackageContext()

    const { data, mutate, revalidate } = useSWR(
        () => [currentPackage.getApiId(), "packages/station"],
        fetchStationsForPackage,
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
