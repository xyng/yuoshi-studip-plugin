import React, { createContext, useCallback, useContext, useMemo } from "react"
import useSWR from "swr/esm/use-swr"
import { PluralResponse } from "coloquent"
import { responseInterface } from "swr"

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
    mutate: responseInterface<Package[], any>["mutate"]
}
const PackagesContext = createContext<PackagesContextInterface | null>(null)

export const usePackagesContext = () => {
    const ctx = useContext(PackagesContext)

    if (ctx === null) {
        throw new Error("No PackagesContextProvider available.")
    }

    return ctx
}

const fetchPackages = (byUser: boolean) => async (
    courseId: string
): Promise<Package[]> => {
    let query = Package.where("course", courseId)

    if (byUser) {
        query = query.with("packageUserProgress.user")
    } else {
        query = query.with("packageTotalProgress")
    }

    const packageItem = (await query.get()) as PluralResponse

    return packageItem.getData() as Package[]
}

export const PackagesContextProvider: React.FC<{
    byUser?: boolean
}> = ({ children, byUser }) => {
    const cacheKey = useMemo(
        () => (byUser ? "course/packages_by_user" : "course/packages"),
        [byUser]
    )
    const fetch = useMemo(() => fetchPackages(!!byUser), [byUser])

    const { course } = useCourseContext()
    const { data, mutate, revalidate } = useSWR(
        () => (course.getApiId() ? [course.getApiId(), cacheKey] : null),
        fetch,
        { suspense: true }
    )

    const updatePackage = useCallback(
        async (updatedPackage: Package, reload: boolean = false) => {
            await mutate(updateModelList(updatedPackage), reload)
        },
        [mutate]
    )

    const ctx = {
        packages: (data as Package[]).sort((a, b) => {
            return a.getSort() - b.getSort()
        }),
        updatePackage,
        reloadPackages: revalidate,
        mutate,
    }

    return (
        <PackagesContext.Provider value={ctx}>
            {children}
        </PackagesContext.Provider>
    )
}
