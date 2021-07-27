import React, { useCallback } from "react"
import { SubmitHandler } from "@unform/core"
import * as Yup from "yup"

import { EditTaskContentView } from "../EditTaskContent"
import { uniqueId } from "../../../../helpers/uniqueId"
import ValidatedForm from "../../../../components/Form/ValidatedForm"
import Button from "../../../../components/Button/Button"
import Input from "../../../../components/Form/Input"
import { findOrFail } from "../../../../helpers/listHelpers"
import TextArea from "../../../../components/Form/Textarea"
import { useEditTaskContext } from "../useEditTaskContent"
import Styles from "../EditQuizContent/EditQuizContent.module.css"

const TagContentSchema = Yup.object().shape({
    contents: Yup.array().of(
        Yup.object().shape({
            id: Yup.string().required(),
            title: Yup.string().required(),
            content: Yup.string().required(),
        })
    ),
})
type TagContentData = Yup.InferType<typeof TagContentSchema>

const EditTagContent: EditTaskContentView = () => {
    const {
        task,
        contents,
        createContent,
        removeContent,
        onModifyAndSave,
    } = useEditTaskContext()

    const createTagContent = useCallback(() => {
        return createContent({
            quests: [
                {
                    id: uniqueId("quest_"),
                    isNew: true,
                    name: "Tags",
                    question: "Tags",
                    multiple: true,
                    requireOrder: false,
                    customAnswer: false,
                    answers: [],
                },
            ],
        })()
    }, [createContent])

    const onSubmit = useCallback<SubmitHandler<TagContentData>>(
        async (value) => {
            await onModifyAndSave((contents) => {
                return value.contents.map((content) => {
                    const origContent = findOrFail(contents, "id", content.id)

                    // findOrFail(origContent.quests, "id")
                    return {
                        ...origContent,
                        title: content.title,
                        content: content.content,
                        quests: [
                            {
                                name: "Tags",
                                question: "Tags",
                                multiple: true,
                                requireOrder: false,
                                customAnswer: false,
                                answers: [
                                    {
                                        content: " ",
                                        is_correct: "true",
                                    },
                                ],
                            },
                        ],
                    }
                })
            })
        },
        [onModifyAndSave]
    )

    return (
        <ValidatedForm
            validation={TagContentSchema}
            initialData={{
                contents,
            }}
            onSubmit={onSubmit}
            className="default"
        >
            <h1>Text lesen Aufgabe: {task.getTitle()}</h1>

            <Button type="submit">Speichern</Button>

            <Button onClick={createTagContent}>Neuer Inhalt</Button>

            {contents.map((content, index) => {
                const contentPath = `contents[${index}]`

                return (
                    <details
                        className={Styles.content}
                        key={`tag-content-${content.id}`}
                    >
                        <summary className={Styles.toggleContent}>
                            <span>Inhalt</span>
                            <div className={Styles.toggleContentButton}>
                                <Button
                                    fixMargin
                                    onClick={removeContent(content.id)}
                                >
                                    Löschen
                                </Button>
                            </div>
                        </summary>

                        <div className={Styles.contentMain}>
                            <Input
                                label=""
                                name={`${contentPath}.id`}
                                type="hidden"
                            />
                            <Input
                                label=""
                                name={`${contentPath}.title`}
                                value="text lesen"
                                type="hidden"
                            />
                            <TextArea
                                label="Text"
                                name={`${contentPath}.content`}
                            />
                        </div>
                    </details>
                )
            })}
        </ValidatedForm>
    )
}

export default EditTagContent
