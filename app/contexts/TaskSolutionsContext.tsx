import React, { createContext, useCallback, useContext, useMemo } from "react"
import useSWR from "swr/esm/use-swr"
import { PluralResponse } from "coloquent"

import TaskSolution from "../models/TaskSolution"
import updateModelList from "../helpers/updateModelList"

import { useTasksContext } from "./TasksContext"
import { useCurrentUserContext } from "./CurrentUserContext"

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

const fetchSolutionsForTasks = async (
    tasks: string,
    userId: string
): Promise<TaskSolution[]> => {
    const taskSolutions = (await TaskSolution.where("task", tasks)
        .where("user", userId)
        .with("task")
        .get()) as PluralResponse

    return taskSolutions.getData() as TaskSolution[]
}

export const TaskSolutionsContextProvider: React.FC = ({ children }) => {
    const { user } = useCurrentUserContext()
    const { tasks } = useTasksContext()

    const taskIds = useMemo(() => {
        return tasks
            .map((t) => t.getApiId())
            .filter(Boolean)
            .join(",")
    }, [tasks])

    const { data, mutate, revalidate } = useSWR(
        [taskIds, user.getApiId(), "tasks/solutions"],
        fetchSolutionsForTasks,
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
