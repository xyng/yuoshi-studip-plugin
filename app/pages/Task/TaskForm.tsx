import React from "react"
import { NSTaskAdapter } from "@xyng/yuoshi-backend-adapter"
import * as Yup from "yup"
import { SubmitHandler } from "@unform/core"

import Task from "../../models/Task"
import ValidatedForm from "../../components/Form/ValidatedForm"
import Input from "../../components/Form/Input"
import Select from "../../components/Form/Select"
import TextArea from "../../components/Form/Textarea"
import TaskTypeName = NSTaskAdapter.TaskTypeName

const TaskValidation = Yup.object().shape({
    title: Yup.string().required(),
    kind: Yup.string()
        .oneOf(Object.keys(TaskTypeName))
        .required() as Yup.StringSchema<TaskTypeName>,
    description: Yup.string().required(),
    credits: Yup.number().required(),
})
type TaskFormData = Yup.InferType<typeof TaskValidation>

export type TaskFormSubmitHandler = SubmitHandler<TaskFormData>

const TaskForm: React.FC<{
    defaultValues?: Partial<TaskFormData>
    onSubmit: TaskFormSubmitHandler
}> = ({ onSubmit, defaultValues }) => {
    return (
        <ValidatedForm
            validation={TaskValidation}
            className="default"
            onSubmit={onSubmit}
        >
            <Input name="title" label="Title" type="text" />
            <Select label="Typ" name="kind">
                {Object.entries(Task.taskTypes).map(([key, value]) => {
                    return (
                        <option key={`task-type-${key}`} value={key}>
                            {value}
                        </option>
                    )
                })}
            </Select>
            <TextArea label="Beschreibung" name="description" />
            <Input label="Punkte" name="credits" type="number" />
            <button className="button" type="submit">
                Speichern
            </button>
        </ValidatedForm>
    )
}

export default TaskForm
