import React, { createContext, useContext } from "react"

import useGetModelFromListOrFetch from "../helpers/useGetModelFromListOrFetch"
import Task from "../models/Task"

import { useTasksContext } from "./TasksContext"

interface CurrentTaskContextInterface {
    task: Task
    updateTask: (task: Task, reload?: boolean) => Promise<void>
}
const CurrentTaskContext = createContext<CurrentTaskContextInterface | null>(
    null
)

export const useCurrentTaskContext = () => {
    const ctx = useContext(CurrentTaskContext)

    if (ctx === null) {
        throw new Error("No CurrentTaskContextProvider available.")
    }

    return ctx
}

const fetchTask = async (taskId: string) => {
    const task = (await Task.find(taskId)).getData() as Task | null

    if (!task) {
        throw new Error("Task not found")
    }

    return task
}

export const CurrentTaskContextProvider: React.FC<{
    taskId?: string
}> = ({ children, taskId }) => {
    const { tasks, updateTask, reloadTasks } = useTasksContext()
    const { entityData, updateEntity } = useGetModelFromListOrFetch(
        taskId,
        tasks,
        taskId ? [taskId, "tasks"] : null,
        fetchTask,
        updateTask,
        reloadTasks
    )

    const ctx = {
        task: entityData,
        updateTask: updateEntity,
    }

    return (
        <CurrentTaskContext.Provider value={ctx}>
            {children}
        </CurrentTaskContext.Provider>
    )
}
