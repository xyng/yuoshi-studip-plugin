import React, { createContext, useCallback, useContext, useMemo } from "react"
import useSWR from "swr"

import Package from "../models/Package"

import { usePackagesContext } from "./PackagesContext"

type updatePackageFn = (
    data: Partial<{
        title: string
        slug: string
    }>,
    reload?: boolean
) => Promise<void>

interface CurrentPackageContextInterface {
    currentPackage: Package
    updateCurrentPackage: updatePackageFn
}
const CurrentPackageContext = createContext<CurrentPackageContextInterface | null>(
    null
)

export const useCurrentPackageContext = () => {
    const ctx = useContext(CurrentPackageContext)

    if (ctx === null) {
        throw new Error("No CurrentPackageContextProvider available.")
    }

    return ctx
}

const fetchPackage = async (packageId: string) => {
    const packageItem = (await Package.find(packageId)).getData()

    if (!packageItem) {
        throw new Error("package not found")
    }

    return packageItem as Package
}

export const CurrentPackageContextProvider: React.FC<{
    currentPackage?: string
}> = ({ currentPackage, children }) => {
    const { packages, reloadPackages, updatePackage } = usePackagesContext()

    const currentPackageFromList = useMemo(() => {
        if (!currentPackage) {
            return
        }

        return packages.find((elem) => elem.getApiId() === currentPackage)
    }, [currentPackage, packages])

    const { data: currentPackageFetched, mutate } = useSWR(
        () =>
            !currentPackageFromList && currentPackage
                ? [currentPackage, "package"]
                : null,
        fetchPackage,
        { suspense: true }
    )

    const currentPackageData = useMemo(() => {
        return currentPackageFromList || (currentPackageFetched as Package)
    }, [currentPackageFromList, currentPackageFetched])

    const updateCurrentPackage = useCallback(
        async ({ title, slug }, reload = false) => {
            if (!currentPackageData) {
                throw new Error("currentPackage is not available")
            }

            if (title) {
                currentPackageData.setTitle(title)
            }

            if (slug) {
                currentPackageData.setSlug(slug)
            }

            const newData = (
                await currentPackageData.save()
            ).getModel() as Package

            // update item in list if we've got it from there
            if (currentPackageFromList) {
                return updatePackage(
                    newData.getApiId() as string,
                    newData,
                    reload
                )
            }

            // update or own fetched package
            await mutate(newData, reload)

            // update package list after item mutation - just in case...
            // (this does not respect the `reload`-parameter. it's meant to be that way.)
            await reloadPackages()
        },
        [
            currentPackageData,
            currentPackageFromList,
            mutate,
            reloadPackages,
            updatePackage,
        ]
    )

    const ctx = {
        currentPackage: currentPackageData as Package,
        updateCurrentPackage,
    }

    return (
        <CurrentPackageContext.Provider value={ctx}>
            {children}
        </CurrentPackageContext.Provider>
    )
}
