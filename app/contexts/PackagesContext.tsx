import React, { createContext, useCallback, useContext } from "react"
import useSWR from "swr/esm/use-swr"
import { PluralResponse } from "coloquent"

import Package from "../models/Package"
import updateModelList from "../helpers/updateModelList"

import { useCourseContext } from "./CourseContext"

interface PackagesContextInterface {
    packages: Package[]
    updatePackage: (
        updatedPackage: Package,
        reload?: boolean
    ) => void | Promise<void>
    reloadPackages: () => Promise<boolean>
}
const PackagesContext = createContext<PackagesContextInterface | null>(null)

export const usePackagesContext = () => {
    const ctx = useContext(PackagesContext)

    if (ctx === null) {
        throw new Error("No PackagesContextProvider available.")
    }

    return ctx
}

const fetchPackages = async (courseId: string): Promise<Package[]> => {
    const packageItem = (await Package.where(
        "course",
        courseId
    ).get()) as PluralResponse

    return packageItem.getData() as Package[]
}

export const PackagesContextProvider: React.FC = ({ children }) => {
    const { course } = useCourseContext()
    const { data, mutate, revalidate } = useSWR(
        () =>
            course.getApiId() ? [course.getApiId(), "course/packages"] : null,
        fetchPackages,
        { suspense: true }
    )

    const updatePackage = useCallback(
        async (updatedPackage: Package, reload: boolean = false) => {
            await mutate(updateModelList(updatedPackage), reload)
        },
        [mutate]
    )

    const ctx = {
        packages: data as Package[],
        updatePackage,
        reloadPackages: revalidate,
    }

    return (
        <PackagesContext.Provider value={ctx}>
            {children}
        </PackagesContext.Provider>
    )
}
