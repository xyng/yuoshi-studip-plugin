import React from "react"
import { RouteComponentProps, Link } from "@reach/router"

import { useCurrentPackageContext } from "../../contexts/CurrentPackageContext"
import useHandleFormSubmit from "../../helpers/useHandleFormSubmit"
import Package from "../../models/Package"

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
            <Link to="/packages">Zurück</Link>
            <h1>Paket bearbeiten: {currentPackage.getTitle()}</h1>

            <form className="default" onSubmit={onSubmit}>
                <label htmlFor="editPackage_title">
                    <p>Titel</p>
                    <input
                        id="editPackage_title"
                        type="text"
                        name="title"
                        defaultValue={currentPackage.getTitle()}
                    />
                </label>
                <label htmlFor="editPackage_slug">
                    <p>Kürzel</p>
                    <input
                        id="editPackage_slug"
                        type="text"
                        name="slug"
                        defaultValue={currentPackage.getSlug()}
                    />
                </label>

                <button className="button" type="submit">
                    Speichern
                </button>
            </form>
        </>
    )
}

export default EditPackage
