import React, { useCallback } from "react"
import { RouteComponentProps, Link } from "@reach/router"

import { useCurrentPackageContext } from "../../contexts/CurrentPackageContext"
import Package from "../../models/Package"

import PackageForm, { PackageFormSubmitHandler } from "./PackageForm"

const EditPackage: React.FC<RouteComponentProps> = () => {
    const { currentPackage, updateCurrentPackage } = useCurrentPackageContext()

    const onSubmit = useCallback<PackageFormSubmitHandler>(
        async (values) => {
            currentPackage.patch(values)

            const updated = (await currentPackage.save()).getModel()
            if (!updated) {
                // TODO: handle error
                return
            }

            await updateCurrentPackage(updated as Package)
        },
        [currentPackage, updateCurrentPackage]
    )

    return (
        <>
            <Link className="button" to="/packages">
                Zurück
            </Link>
            <h1>Paket bearbeiten: {currentPackage.getTitle()}</h1>

            <PackageForm
                defaultValues={{
                    title: currentPackage.getTitle(),
                    slug: currentPackage.getSlug(),
                }}
                onSubmit={onSubmit}
            />
        </>
    )
}

export default EditPackage
