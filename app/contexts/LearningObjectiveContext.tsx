import React, { createContext, useCallback, useContext } from "react"
import { PluralResponse } from "coloquent"
import useSWR, { responseInterface } from "swr"

import LearningObjective from "../models/LearningObjective"
import updateModelList from "../helpers/updateModelList"

import { useCurrentPackageContext } from "./CurrentPackageContext"

interface LearningObjectiveContextInterface {
    learningObjective: LearningObjective[]
    updateLearningObjective: (
        updated: LearningObjective,
        reload?: boolean
    ) => Promise<void>
    reloadLearningObjective: () => Promise<boolean>
    mutate: responseInterface<LearningObjective[], any>["mutate"]
}
const LearningObjectiveContext = createContext<LearningObjectiveContextInterface | null>(
    null
)

export const useLearningObjectiveContext = () => {
    const ctx = useContext(LearningObjectiveContext)

    if (ctx === null) {
        throw new Error("No LearningObjectiveContextProvider available.")
    }
    return ctx
}
const fetchLearningObjectivesForPackage = async (
    packageId: string
): Promise<LearningObjective[]> => {
    const learningObjectiveItem = (await LearningObjective.where(
        "package",
        packageId
    ).get()) as PluralResponse

    return learningObjectiveItem.getData() as LearningObjective[]
}

export const LearningContextProvider: React.FC = ({ children }) => {
    const { currentPackage } = useCurrentPackageContext()
    const { data, mutate, revalidate } = useSWR(
        () => [
            currentPackage.getApiId(),
            `learning_objectives/${currentPackage.id}`,
        ],
        fetchLearningObjectivesForPackage,
        { suspense: true }
    )

    const updateLearningObjective = useCallback(
        async (
            updatedLearningObjective: LearningObjective,
            reload: boolean = false
        ) => {
            await mutate(updateModelList(updatedLearningObjective), reload)
        },
        [mutate]
    )

    const ctx = {
        learningObjectives: (data as LearningObjective[]).sort((a, b) => {
            return a.getSort() - b.getSort()
        }),
        updateLearningObjective,
        reloadLearningObjective: revalidate,
        mutate,
    }

    return (
        <LearningObjectiveContext.Provider value={ctx}>
            {children}
        </LearningObjectiveContext.Provider>
    )
}
