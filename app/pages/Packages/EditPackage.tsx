import React, { FormEventHandler, useCallback } from "react"
import { RouteComponentProps, Link } from "@reach/router";

import { useCurrentPackageContext } from "../../contexts/CurrentPackageContext";

const EditPackage: React.FC<RouteComponentProps> = () => {
    const { currentPackage, updateCurrentPackage } = useCurrentPackageContext()

    const onSubmit = useCallback<FormEventHandler<HTMLFormElement>>(async (event) => {
        event.preventDefault()

        const { elements } = event.currentTarget
        const title = elements.namedItem("title") as HTMLInputElement
        const slug = elements.namedItem("slug") as HTMLInputElement

        await updateCurrentPackage({
            title: title.value,
            slug: slug.value
        })
    }, [])

    return <>
        <Link to="/packages">Zurück</Link>
        <h1>Paket bearbeiten: {currentPackage.getTitle()}</h1>

        <form
            className="default"
            onSubmit={onSubmit}
        >
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

            <button className="button" type="submit">Speichern</button>
        </form>
    </>
}

export default EditPackage
