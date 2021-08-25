import React, { createContext, useContext } from "react"
import LearningObjective from "models/LearningObjective"

import useGetModelFromListOrFetch from "../helpers/useGetModelFromListOrFetch"

import { useLearningObjectiveContext } from "./LearningObjectiveContext"

interface CurrentLearningObjectiveContextInterface {
    currentLearningObjective: LearningObjective
    updateLearningObjective: (
        learningObjective: LearningObjective,
        reload?: boolean
    ) => Promise<void>
}
const CurrentLearningObjectiveContext = createContext<CurrentLearningObjectiveContextInterface | null>(
    null
)

export const useCurrentLearningObjective = () => {
    const ctx = useContext(CurrentLearningObjectiveContext)
    if (ctx === null) {
        throw new Error("No CurrentLearningObjective available.")
    }

    return ctx
}

const fetchLearningObjective = async (learning_objective_id: string) => {
    const learningObjectiveItem = (
        await LearningObjective.with("package").find(learning_objective_id)
    ).getData() as LearningObjective | null
    if (!learningObjectiveItem) {
        throw new Error("LearningObjective not found")
    }

    return learningObjectiveItem
}

export const CurrentLearningObjectiveProvider: React.FC<{
    learningObjectiveId?: string
}> = ({ children, learningObjectiveId }) => {
    const {
        learningObjectives,
        updateLearningObjectives,
        reloadLearningObjectives,
    } = useLearningObjectiveContext()
    const { entityData, updateEntity } = useGetModelFromListOrFetch(
        learningObjectiveId,
        learningObjectives,
        learningObjectiveId
            ? [learningObjectiveId, "learningObjectiveId"]
            : null,
        fetchLearningObjective,
        updateLearningObjectives,
        reloadLearningObjectives
    )

    const ctx = {
        currentLearningObjective: entityData,
        updateLearningObjective: updateEntity,
    }

    return (
        <CurrentLearningObjectiveContext.Provider value={ctx}>
            {children}
        </CurrentLearningObjectiveContext.Provider>
    )
}
