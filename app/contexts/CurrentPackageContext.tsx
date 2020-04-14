import React, { createContext, useContext, useMemo } from "react"

import Package from "../models/Package"
import useGetModelFromListOrFetch from "../helpers/useGetModelFromListOrFetch"

import { usePackagesContext } from "./PackagesContext"

type updatePackageFn = (data: Package, reload?: boolean) => Promise<void>

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

const fetchPackage = (byUser: boolean) => async (packageId: string) => {
    let query = Package.query()

    if (byUser) {
        query = query.with("packageUserProgress.user")
    }

    const packageItem = (await query.find(packageId)).getData()

    if (!packageItem) {
        throw new Error("package not found")
    }

    return packageItem as Package
}

export const CurrentPackageContextProvider: React.FC<{
    currentPackage?: string
    byUser?: boolean
}> = ({ byUser, currentPackage, children }) => {
    const cacheKey = useMemo(() => (byUser ? "package_by_user" : "package"), [
        byUser,
    ])
    const fetch = useMemo(() => fetchPackage(!!byUser), [byUser])

    const { packages, reloadPackages, updatePackage } = usePackagesContext()
    const {
        entityData: currentPackageData,
        updateEntity,
    } = useGetModelFromListOrFetch(
        currentPackage,
        packages,
        currentPackage ? [currentPackage, cacheKey] : null,
        fetch,
        updatePackage,
        reloadPackages
    )

    const ctx = {
        currentPackage: currentPackageData as Package,
        updateCurrentPackage: updateEntity,
    }

    return (
        <CurrentPackageContext.Provider value={ctx}>
            {children}
        </CurrentPackageContext.Provider>
    )
}
