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
            quests: Yup.array()
                .of(
                    Yup.object().shape({
                        id: Yup.string().required(),
                        answers: Yup.array()
                            .of(
                                Yup.object().shape({
                                    id: Yup.string().required(),
                                    content: Yup.string().required(),
                                })
                            )
                            .required(),
                    })
                )
                .required(),
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
        createAnswer,
        removeAnswer,
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

    const createTag = useCallback(
        (content_id: string) => {
            const content = contents.find((c) => c.id === content_id)

            if (!content || !content.quests.length) {
                return
            }

            return createAnswer(content_id, content.quests[0].id, {
                is_correct: true,
            })
        },
        [contents, createAnswer]
    )

    const onSubmit = useCallback<SubmitHandler<TagContentData>>(
        async (value) => {
            await onModifyAndSave((contents) => {
                return value.contents.map((content) => {
                    const origContent = findOrFail(contents, "id", content.id)

                    return {
                        ...origContent,
                        title: content.title,
                        content: content.content,
                        quests: content.quests.map((quest) => {
                            const origQuest = findOrFail(
                                origContent.quests,
                                "id",
                                quest.id
                            )

                            return {
                                name: "Tags",
                                question: "Tags",
                                multiple: true,
                                requireOrder: false,
                                customAnswer: false,
                                ...origQuest,
                                answers: quest.answers.map((answer) => {
                                    const origAnswer = findOrFail(
                                        origQuest.answers,
                                        "id",
                                        answer.id
                                    )

                                    return {
                                        ...origAnswer,
                                        content: answer.content,
                                        is_correct: true,
                                    }
                                }),
                            }
                        }),
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
            <h1>Tag Aufgabe: {task.getTitle()}</h1>

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
                            <span>
                                {content.title.length
                                    ? `Inhalt: ${content.title}`
                                    : "Neuer Inhalt"}
                            </span>
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
                                label="Title"
                                name={`${contentPath}.title`}
                                type="text"
                            />
                            <TextArea
                                label="Text"
                                name={`${contentPath}.content`}
                            />

                            {/* content always has at least one quest (probably exactly one */}
                            <Button onClick={createTag(content.id)}>
                                Tag hinzufügen
                            </Button>

                            <div>
                                {content.quests.map((quest, index) => {
                                    const questPath = `${contentPath}.quests[${index}]`

                                    return (
                                        <div key={`tags-${quest.id}`}>
                                            <Input
                                                label=""
                                                name={`${questPath}.id`}
                                                type="hidden"
                                            />
                                            {!quest.answers.length && (
                                                <span>
                                                    Sie müssen mindestens einen
                                                    Tag anlegen.
                                                </span>
                                            )}
                                            {quest.answers.map(
                                                (answer, index) => {
                                                    const answerPath = `${questPath}.answers[${index}]`
                                                    return (
                                                        <div
                                                            key={`tags-tag-${answer.id}`}
                                                        >
                                                            <Input
                                                                label=""
                                                                name={`${answerPath}.id`}
                                                                type="hidden"
                                                            />
                                                            <Input
                                                                label="Tag"
                                                                name={`${answerPath}.content`}
                                                                type="text"
                                                            />

                                                            <button
                                                                className="button"
                                                                onClick={removeAnswer(
                                                                    content.id,
                                                                    quest.id,
                                                                    answer.id
                                                                )}
                                                            >
                                                                Tag Entfernen
                                                            </button>
                                                        </div>
                                                    )
                                                }
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </details>
                )
            })}
        </ValidatedForm>
    )
}

export default EditTagContent
