import React from "react"
import * as Yup from "yup"
import { SubmitHandler } from "@unform/core"

import ValidatedForm from "../../components/Form/ValidatedForm"
import Input from "../../components/Form/Input"
import Button from "../../components/Button/Button"

const StationFormSchema = Yup.object().shape({
    title: Yup.string().required(),
    slug: Yup.string().required(),
})
type StationFormData = Yup.InferType<typeof StationFormSchema>
export type StationFormSubmitHandler = SubmitHandler<StationFormData>

const StationForm: React.FC<{
    defaultValues?: Partial<StationFormData>
    onSubmit: StationFormSubmitHandler
}> = ({ defaultValues, onSubmit }) => {
    return (
        <ValidatedForm
            initialData={defaultValues}
            validation={StationFormSchema}
            className="default"
            onSubmit={onSubmit}
        >
            <Input label="Titel" name="title" type="text" />
            <Input label="Kürzel" name="slug" type="text" />

            <Button type="submit">Speichern</Button>
        </ValidatedForm>
    )
}

export default StationForm
