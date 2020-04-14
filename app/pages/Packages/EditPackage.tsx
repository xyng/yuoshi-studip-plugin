import React from "react"
import { RouteComponentProps, Link } from "@reach/router"

import { useCurrentPackageContext } from "../../contexts/CurrentPackageContext"
import useHandleFormSubmit from "../../helpers/useHandleFormSubmit"
import Package from "../../models/Package"

import PackageForm from "./PackageForm"

const EditPackage: React.FC<RouteComponentProps> = () => {
    const { currentPackage, updateCurrentPackage } = useCurrentPackageContext()

    const onSubmit = useHandleFormSubmit(["title", "slug"], async (values) => {
        currentPackage.patch(values)

        const updated = (await currentPackage.save()).getModel()
        if (!updated) {
            // TODO: handle error
            return
        }

        await updateCurrentPackage(updated as Package)
    })

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
