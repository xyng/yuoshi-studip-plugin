import React from "react"
import * as Yup from "yup"
import { SubmitHandler } from "@unform/core"

import ValidatedForm from "../../components/Form/ValidatedForm"
import Input from "../../components/Form/Input"
import Button from "../../components/Button/Button"

const PackageFormSchema = Yup.object().shape({
    title: Yup.string().required(),
    slug: Yup.string().required(),
})
type PackageFormData = Yup.InferType<typeof PackageFormSchema>
export type PackageFormSubmitHandler = SubmitHandler<PackageFormData>

const PackageForm: React.FC<{
    defaultValues?: Partial<PackageFormData>
    onSubmit: PackageFormSubmitHandler
}> = ({ defaultValues, onSubmit }) => {
    return (
        <ValidatedForm
            initialData={defaultValues}
            validation={PackageFormSchema}
            className="default"
            onSubmit={onSubmit}
        >
            <Input label="Titel" name="title" type="text" />
            <Input label="Kürzel" name="slug" type="text" />

            <Button type="submit">Speichern</Button>
        </ValidatedForm>
    )
}

export default PackageForm
