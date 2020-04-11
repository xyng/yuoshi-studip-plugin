import React, { createContext, useContext } from "react"

import useGetModelFromListOrFetch from "../helpers/useGetModelFromListOrFetch"
import TaskSolution from "../models/TaskSolution"

import { useTaskSolutionsContext } from "./TaskSolutionsContext"

interface CurrentTaskSolutionContextInterface {
    taskSolution: TaskSolution
    updateTaskSolution: (task: TaskSolution, reload?: boolean) => Promise<void>
}
const CurrentTaskSolutionContext = createContext<CurrentTaskSolutionContextInterface | null>(
    null
)

export const useCurrentTaskSolutionContext = () => {
    const ctx = useContext(CurrentTaskSolutionContext)

    if (ctx === null) {
        throw new Error("No CurrentTaskSolutionContextProvider available.")
    }

    return ctx
}

const fetchTaskSolution = async (taskId: string) => {
    const task = (
        await TaskSolution.with("user")
            .with("content_solutions.quest_solutions.quest")
            .with("content_solutions.quest_solutions.answers.answer.quest")
            .with("content_solutions.content")
            .find(taskId)
    ).getData() as TaskSolution | null

    if (!task) {
        throw new Error("Task not found")
    }

    return task
}

export const CurrentTaskSolutionContextProvider: React.FC<{
    taskSolutionId: string
}> = ({ children, taskSolutionId }) => {
    const {
        taskSolutions,
        updateTaskSolution,
        reloadTaskSolutions,
    } = useTaskSolutionsContext()

    const { entityData, updateEntity } = useGetModelFromListOrFetch(
        taskSolutionId,
        taskSolutions,
        taskSolutionId ? [taskSolutionId, "taskSolutions"] : null,
        fetchTaskSolution,
        updateTaskSolution,
        reloadTaskSolutions
    )

    const ctx = {
        taskSolution: entityData,
        updateTaskSolution: updateEntity,
    }

    return (
        <CurrentTaskSolutionContext.Provider value={ctx}>
            {children}
        </CurrentTaskSolutionContext.Provider>
    )
}
