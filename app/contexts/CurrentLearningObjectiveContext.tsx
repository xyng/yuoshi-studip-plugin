import React, { createContext, useContext } from "react"

import useGetModelFromListOrFetch from "../helpers/useGetModelFromListOrFetch"
import Station from "../models/Station"

import { useStationContext } from "./StationContext"

interface CurrentLearningObjectiveContextInterface {
    station: Station
    updateStation: (station: Station, reload?: boolean) => Promise<void>
}
const CurrentLearningObjective = createContext<CurrentLearningObjectiveContextInterface | null>(
    null
)

export const useCurrentLearningObjectiveContext = () => {
    const ctx = useContext(CurrentLearningObjective)

    if (ctx === null) {
        throw new Error("No CurrentLearningObjective available.")
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

export const CurrentLearningObjectiveProvider: React.FC<{
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
        <CurrentLearningObjective.Provider value={ctx}>
            {children}
        </CurrentLearningObjective.Provider>
    )
}
