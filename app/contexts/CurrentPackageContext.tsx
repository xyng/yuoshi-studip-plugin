import React, { createContext, useContext } from "react"

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
    const {
        entityData: currentPackageData,
        updateEntity,
    } = useGetModelFromListOrFetch(
        currentPackage,
        packages,
        currentPackage ? [currentPackage, "package"] : null,
        fetchPackage,
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
