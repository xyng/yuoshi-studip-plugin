import React, { createContext, useCallback, useContext, useMemo } from "react"
import { PluralResponse } from "coloquent"
import useSWR, { responseInterface } from "swr"

import LearningObjective from "../models/LearningObjective"
import updateModelList from "../helpers/updateModelList"

import { useCurrentPackageContext } from "./CurrentPackageContext"

interface LearningObjectiveContextInterface {
    learningObjectives: LearningObjective[]
    updateLearningObjectives: (
        updated: LearningObjective,
        reload?: boolean
    ) => Promise<void>
    reloadLearningObjectives: () => Promise<boolean>
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
const fetchLearningObjectivesForPackage = (byUser: boolean) => async (
    packageId: string
): Promise<LearningObjective[]> => {
    const learningObjectiveItem = (await LearningObjective.where(
        "package",
        packageId
    ).get()) as PluralResponse

    return learningObjectiveItem.getData() as LearningObjective[]
}

export const LearningObjectiveContextProvider: React.FC<{
    byUser?: boolean
}> = ({ children, byUser }) => {
    const { currentPackage } = useCurrentPackageContext()

    const cacheKey = useMemo(
        () =>
            byUser
                ? `learning_objectives/${currentPackage.getApiId()}`
                : "learning_objectives/packages",
        [byUser]
    )

    const fetch = useMemo(() => fetchLearningObjectivesForPackage(!!byUser), [
        byUser,
    ])

    const { data, mutate, revalidate } = useSWR(
        () =>
            currentPackage.getApiId()
                ? [currentPackage.getApiId(), cacheKey]
                : null,
        fetch,
        { suspense: true }
    )
    console.log(data)

    const updateLearningObjectives = useCallback(
        async (
            updatedLearningObjectives: LearningObjective,
            reload: boolean = false
        ) => {
            await mutate(updateModelList(updatedLearningObjectives), reload)
        },
        [mutate]
    )

    const ctx = {
        learningObjectives: (data as LearningObjective[]).sort((a, b) => {
            return a.getSort() - b.getSort()
        }),
        updateLearningObjectives,
        reloadLearningObjectives: revalidate,
        mutate,
    }

    return (
        <LearningObjectiveContext.Provider value={ctx}>
            {children}
        </LearningObjectiveContext.Provider>
    )
}
