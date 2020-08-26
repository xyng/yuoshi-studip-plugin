import React, { useCallback } from "react"
import { RouteComponentProps, Link } from "@reach/router"

import Package from "../../models/Package"
import { usePackagesContext } from "../../contexts/PackagesContext"
import { useCourseContext } from "../../contexts/CourseContext"

import PackageForm, { PackageFormSubmitHandler } from "./PackageForm"

const CreatePackage: React.FC<RouteComponentProps> = (props) => {
    const { course } = useCourseContext()
    const { reloadPackages } = usePackagesContext()

    const onSubmit = useCallback<PackageFormSubmitHandler>(
        async (values) => {
            const newPackage = new Package()
            newPackage.patch(values)
            newPackage.setCourse(course)

            const updated = (await newPackage.save()).getModel()
            if (!updated) {
                // TODO: handle error
                return
            }

            await reloadPackages()

            if (props !== undefined && props.navigate !== undefined) {
                props.navigate("../" + newPackage.getApiId() + "/tasks")
            }
        },
        [course, reloadPackages]
    )

    return (
        <>
            <Link className="button" to="/packages">
                Zurück
            </Link>
            <h1>Neues Paket</h1>

            <PackageForm onSubmit={onSubmit} />
        </>
    )
}

export default CreatePackage
