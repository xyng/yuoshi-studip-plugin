import React, { useCallback } from "react"
import * as Yup from "yup"
import { SubmitHandler } from "@unform/core"

import { EditTaskContentView } from "../EditTaskContent"
import Input from "../../../../components/Form/Input"
import TextArea from "../../../../components/Form/Textarea"
import Button from "../../../../components/Button/Button"
import ValidatedForm from "../../../../components/Form/ValidatedForm"

const CardContentSchema = Yup.object().shape({
    contents: Yup.array().of(
        Yup.object().shape({
            id: Yup.string().required(),
            title: Yup.string().required(),
            content: Yup.string().required(),
        })
    ),
})
type CardContentData = Yup.InferType<typeof CardContentSchema>

const EditCardContent: EditTaskContentView = ({ editTaskContext }) => {
    const {
        task,
        contents,
        createContent,
        removeContent,
        onModifyAndSave,
        onContentInputChange,
    } = editTaskContext

    const onSubmit = useCallback<SubmitHandler<CardContentData>>(
        async (value) => {
            await onModifyAndSave((contents) => {
                return value.contents.map((content) => {
                    const origContent = contents.find(
                        (c) => c.id === content.id
                    )

                    if (!origContent) {
                        throw new Error("data integrity is broken")
                    }

                    return {
                        ...origContent,
                        title: content.title,
                        content: content.content,
                    }
                })
            })
        },
        [onModifyAndSave]
    )

    return (
        <div>
            <h1>Karteikarten Aufgabe: {task.getTitle()}</h1>
            <div>
                <Button onClick={createContent()}>
                    Karteikarte hinzufügen
                </Button>
                <Button type="submit">Speichern</Button>
            </div>
            <ValidatedForm
                validation={CardContentSchema}
                initialData={{
                    contents,
                }}
                onSubmit={onSubmit}
                className="default"
            >
                {contents.map((content, index) => {
                    return (
                        <div key={`card-content-${content.id}`}>
                            <Input
                                label=""
                                name={`contents[${index}].id`}
                                type="hidden"
                            />
                            <Input
                                label="Titel"
                                name={`contents[${index}].title`}
                                type="text"
                            />
                            <TextArea
                                label="Text"
                                name={`contents[${index}].content`}
                                onChange={onContentInputChange(
                                    content.id,
                                    "content"
                                )}
                            />
                            <div>
                                <Button onClick={removeContent(content.id)}>
                                    Entfernen
                                </Button>
                            </div>
                        </div>
                    )
                })}
            </ValidatedForm>
        </div>
    )
}

export default EditCardContent
