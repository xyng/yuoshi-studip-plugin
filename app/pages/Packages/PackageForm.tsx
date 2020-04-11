import React, { FormEventHandler } from "react"

const PackageForm: React.FC<{
    defaultValues?: Partial<{
        title: string
        slug: string
    }>
    onSubmit: FormEventHandler<HTMLFormElement>
}> = ({ defaultValues, onSubmit }) => {
    return (
        <form className="default" onSubmit={onSubmit}>
            <label htmlFor="editPackage_title">
                <p>Titel</p>
                <input
                    id="editPackage_title"
                    type="text"
                    name="title"
                    defaultValue={defaultValues?.title}
                />
            </label>
            <label htmlFor="editPackage_slug">
                <p>Kürzel</p>
                <input
                    id="editPackage_slug"
                    type="text"
                    name="slug"
                    defaultValue={defaultValues?.slug}
                />
            </label>

            <button className="button" type="submit">
                Speichern
            </button>
        </form>
    )
}

export default PackageForm
