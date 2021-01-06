import React, { useCallback, useMemo } from "react"
import {
    matchImage,
    matchInput,
    parseContentMultiple,
} from "@xyng/yuoshi-backend-adapter"
import * as Yup from "yup"
import { SubmitHandler } from "@unform/core"

import { EditTaskContentView } from "../EditTaskContent"
import ValidatedForm from "../../../../components/Form/ValidatedForm"
import Button from "../../../../components/Button/Button"
import Input from "../../../../components/Form/Input"
import TextArea from "../../../../components/Form/Textarea"
import { useEditTaskContext } from "../useEditTaskContent"

import Styles from "./EditClozeContent.module.css"

const ClozeContentSchema = Yup.object().shape({
    contents: Yup.array().of(
        Yup.object().shape({
            id: Yup.string().required(),
            title: Yup.string().required(),
            content: Yup.string().required(),
        })
    ),
})
type ClozeContentData = Yup.InferType<typeof ClozeContentSchema>

const EditClozeContent: EditTaskContentView = () => {
    const {
        task,
        contents,
        createContent,
        removeContent,
        onContentInputChange,
        onModifyAndSave,
    } = useEditTaskContext()

    const contentsWithParts = useMemo(() => {
        return contents.map((content) => {
            return {
                ...content,
                parts: parseContentMultiple(content.content, [
                    matchImage,
                    matchInput,
                ]),
            }
        })
    }, [contents])

    const onSubmit = useCallback<SubmitHandler<ClozeContentData>>(
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
        <ValidatedForm
            validation={ClozeContentSchema}
            initialData={{
                contents,
            }}
            onSubmit={onSubmit}
            className="default"
        >
            <h1>Lückentext-Aufgabe: {task.getTitle()}</h1>

            <Button type="submit">Speichern</Button>

            <Button onClick={createContent()}>Neuer Inhalt</Button>

            {contentsWithParts.map((content, index) => {
                return (
                    <div key={`tag-content-${content.id}`}>
                        <div>
                            <h2>Inhalt</h2>
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
                            <small>
                                Verwenden Sie das Format <code>##X##</code> um
                                eine Lücke zu kennzeichnen. <code>X</code>{" "}
                                sollte hierbei eine aufsteigende natürliche Zahl
                                sein.
                            </small>
                        </div>

                        <h4>Vorschau:</h4>
                        <div className={Styles.preview}>
                            {content.parts.map((part, index) => {
                                return (
                                    <div
                                        key={`content-${content.id}-part-${index}`}
                                    >
                                        {part.content}
                                        {part.name === "input" && part.id && (
                                            <input
                                                className="reset"
                                                type="text"
                                                name={`content-${content.id}-input-${part.id}`}
                                            />
                                        )}
                                        {part.name === "image" && part.id && (
                                            <img alt={`${part.id}`} />
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <Button onClick={removeContent(content.id)}>
                            Entfernen
                        </Button>
                    </div>
                )
            })}
        </ValidatedForm>
    )
}

export default EditClozeContent
