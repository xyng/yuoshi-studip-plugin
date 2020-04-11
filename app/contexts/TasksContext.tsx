import React, { createContext, useCallback, useContext } from "react"
import { PluralResponse } from "coloquent"
import useSWR from "swr"

import Task from "../models/Task"
import updateModelList from "../helpers/updateModelList"

import { useCurrentPackageContext } from "./CurrentPackageContext"

interface TasksContextInterface {
    tasks: Task[]
    updateTask: (updated: Task, reload?: boolean) => Promise<void>
    reloadTasks: () => Promise<boolean>
}
const TasksContext = createContext<TasksContextInterface | null>(null)

export const useTasksContext = () => {
    const ctx = useContext(TasksContext)

    if (ctx === null) {
        throw new Error("No TasksContextProvider available.")
    }

    return ctx
}

const fetchTasksForPackage = async (packageId: string): Promise<Task[]> => {
    const packageItem = (await Task.where(
        "package",
        packageId
    ).get()) as PluralResponse

    return packageItem.getData() as Task[]
}

export const TasksContextProvider: React.FC = ({ children }) => {
    const { currentPackage } = useCurrentPackageContext()
    const { data, mutate, revalidate } = useSWR(
        () => [currentPackage.getApiId(), "package/tasks"],
        fetchTasksForPackage,
        { suspense: true }
    )

    const updateTask = useCallback(
        async (updatedTask: Task, reload: boolean = false) => {
            await mutate(updateModelList(updatedTask), reload)
        },
        [mutate]
    )

    const ctx = {
        tasks: data as Task[],
        updateTask,
        reloadTasks: revalidate,
    }

    return <TasksContext.Provider value={ctx}>{children}</TasksContext.Provider>
}
