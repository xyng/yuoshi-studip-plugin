import React, { createContext, useCallback, useContext } from "react"
import useSWR from "swr/esm/use-swr"
import { PluralResponse } from "coloquent"

import TaskSolution from "../models/TaskSolution"
import updateModelList from "../helpers/updateModelList"

import { useCurrentTaskContext } from "./CurrentTaskContext"

interface TaskSolutionsContextInterface {
    taskSolutions: TaskSolution[]
    updateTaskSolution: (
        updated: TaskSolution,
        reload?: boolean
    ) => Promise<void>
    reloadTaskSolutions: () => Promise<boolean>
}
const TaskSolutionsContext = createContext<TaskSolutionsContextInterface | null>(
    null
)

export const useTaskSolutionsContext = () => {
    const ctx = useContext(TaskSolutionsContext)

    if (ctx === null) {
        throw new Error("No TaskSolutionsContextProvider available.")
    }

    return ctx
}

const fetchTasksForPackage = async (
    taskId: string
): Promise<TaskSolution[]> => {
    const taskSolutions = (await TaskSolution.where("task", taskId)
        .with("user")
        .get()) as PluralResponse

    return taskSolutions.getData() as TaskSolution[]
}

export const TaskSolutionsContextProvider: React.FC = ({ children }) => {
    const { task } = useCurrentTaskContext()
    const { data, mutate, revalidate } = useSWR(
        () => [task.getApiId(), "tasks/solutions"],
        fetchTasksForPackage,
        { suspense: true }
    )

    const updateTaskSolution = useCallback(
        async (updatedTask: TaskSolution, reload: boolean = false) => {
            await mutate(updateModelList(updatedTask), reload)
        },
        [mutate]
    )

    const ctx = {
        taskSolutions: data as TaskSolution[],
        updateTaskSolution,
        reloadTaskSolutions: revalidate,
    }

    return (
        <TaskSolutionsContext.Provider value={ctx}>
            {children}
        </TaskSolutionsContext.Provider>
    )
}
