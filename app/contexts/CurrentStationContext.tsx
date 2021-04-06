import React, { createContext, useContext } from "react"

import useGetModelFromListOrFetch from "../helpers/useGetModelFromListOrFetch"
import Station from "../models/Station"

import { useStationContext } from "./StationContext"

interface CurrentStationContextInterface {
    station: Station
    updateStation: (station: Station, reload?: boolean) => Promise<void>
}
const CurrentStationContext = createContext<CurrentStationContextInterface | null>(
    null
)

export const useCurrentStationContext = () => {
    const ctx = useContext(CurrentStationContext)

    if (ctx === null) {
        throw new Error("No CurrentStationContext available.")
    }

    return ctx
}

const fetchStation = async (stationId: string) => {
    const station = (
        await Station.with("station").find(stationId)
    ).getData() as Station | null

    if (!station) {
        throw new Error("Station not found")
    }

    return station
}

export const CurrentStationContextProvider: React.FC<{
    stationId?: string
}> = ({ children, stationId }) => {
    const { station, updateStation, reloadStations } = useStationContext()
    const { entityData, updateEntity } = useGetModelFromListOrFetch(
        stationId,
        station,
        stationId ? [stationId, "stationId"] : null,
        fetchStation,
        updateStation,
        reloadStations
    )

    const ctx = {
        station: entityData,
        updateStation: updateEntity,
    }

    return (
        <CurrentStationContext.Provider value={ctx}>
            {children}
        </CurrentStationContext.Provider>
    )
}
