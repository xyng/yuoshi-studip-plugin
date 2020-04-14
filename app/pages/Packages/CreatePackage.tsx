import React from "react"
import { RouteComponentProps, Link } from "@reach/router"

import useHandleFormSubmit from "../../helpers/useHandleFormSubmit"
import Package from "../../models/Package"
import { usePackagesContext } from "../../contexts/PackagesContext"
import { useCourseContext } from "../../contexts/CourseContext"

import PackageForm from "./PackageForm"

const CreatePackage: React.FC<RouteComponentProps> = () => {
    const { course } = useCourseContext()
    const { reloadPackages } = usePackagesContext()

    const onSubmit = useHandleFormSubmit(["title", "slug"], async (values) => {
        const newPackage = new Package()
        newPackage.patch(values)
        newPackage.setCourse(course)

        const updated = (await newPackage.save()).getModel()
        if (!updated) {
            // TODO: handle error
            return
        }

        await reloadPackages()
    })

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
