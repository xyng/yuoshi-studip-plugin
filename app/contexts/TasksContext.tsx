import React, { createContext, useCallback, useContext } from "react"
import { PluralResponse } from "coloquent"
import useSWR, { responseInterface } from "swr"

import Task from "../models/Task"
import updateModelList from "../helpers/updateModelList"

import { useCurrentStationContext } from "./CurrentStationContext"

interface TasksContextInterface {
    tasks: Task[]
    updateTask: (updated: Task, reload?: boolean) => Promise<void>
    reloadTasks: () => Promise<boolean>
    mutate: responseInterface<Task[], any>["mutate"]
}
const TasksContext = createContext<TasksContextInterface | null>(null)

export const useTasksContext = () => {
    const ctx = useContext(TasksContext)

    if (ctx === null) {
        throw new Error("No TasksContextProvider available.")
    }

    return ctx
}

const fetchTasksForStations = async (stationId: string): Promise<Task[]> => {
    const stationItem = (await Task.where(
        "station",
        stationId
    ).get()) as PluralResponse

    return stationItem.getData() as Task[]
}

export const TasksContextProvider: React.FC = ({ children }) => {
    const { station } = useCurrentStationContext()
    const { data, mutate, revalidate } = useSWR(
        () => [station.getApiId(), "station/tasks"],
        fetchTasksForStations,
        { suspense: true }
    )

    const updateTask = useCallback(
        async (updatedTask: Task, reload: boolean = false) => {
            await mutate(updateModelList(updatedTask), reload)
        },
        [mutate]
    )

    const ctx = {
        tasks: (data as Task[]).sort((a, b) => {
            return a.getSort() - b.getSort()
        }),
        updateTask,
        reloadTasks: revalidate,
        mutate,
    }

    return <TasksContext.Provider value={ctx}>{children}</TasksContext.Provider>
}
