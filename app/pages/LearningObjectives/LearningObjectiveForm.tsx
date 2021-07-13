import React from "react"
import * as Yup from "yup"
import { SubmitHandler } from "@unform/core"
import TextArea from "components/Form/Textarea"

import ValidatedForm from "../../components/Form/ValidatedForm"
import Input from "../../components/Form/Input"
import Button from "../../components/Button/Button"

const LearningObjectiveFormSchema = Yup.object().shape({
    title: Yup.string().required(),
    description: Yup.string().required(),
})
type LearningObjectiveFormData = Yup.InferType<
    typeof LearningObjectiveFormSchema
>
export type LearningObjectiveFormSubmitHandler = SubmitHandler<
    LearningObjectiveFormData
>

const LearningObjectiveForm: React.FC<{
    defaultValues?: Partial<LearningObjectiveFormData>
    onSubmit: LearningObjectiveFormSubmitHandler
}> = ({ defaultValues, onSubmit }) => {
    return (
        <ValidatedForm
            initialData={defaultValues}
            validation={LearningObjectiveFormSchema}
            className="default"
            onSubmit={onSubmit}
        >
            <Input label="Name des/der Schüler:in" name="title" type="text" />
            <TextArea label="Beschreibung" name="description" />

            <Button type="submit">Speichern</Button>
        </ValidatedForm>
    )
}

export default LearningObjectiveForm
