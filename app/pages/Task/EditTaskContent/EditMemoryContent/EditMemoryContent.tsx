import React, { useCallback, useEffect } from "react"
import * as Yup from "yup"
import { SubmitHandler } from "@unform/core"

import { EditTaskContentView } from "../EditTaskContent"
import { uniqueId } from "../../../../helpers/uniqueId"
import { ensureSequenceForKey } from "../../../../helpers/listHelpers"
import { QuizAnswer } from "../useEditTaskContent"
import useGlobalContent from "../hooks/useGlobalContent"
import Button from "../../../../components/Button/Button"
import ValidatedForm from "../../../../components/Form/ValidatedForm"
import Input from "../../../../components/Form/Input"

import Styles from "./EditMemoryContent.module.css"

const createNewAnswer = (): QuizAnswer => {
    return {
        isNew: true,
        id: uniqueId("answer_"),
        content: "",
        is_correct: true,
    }
}

const MemoryContentSchema = Yup.object().shape({
    contentTitle: Yup.string(),
    contentText: Yup.string(),
    contents: Yup.array().of(
        Yup.object().shape({
            id: Yup.string().required(),
            quests: Yup.array().of(
                Yup.object().shape({
                    id: Yup.string().required(),
                    name: Yup.string(),
                    answers: Yup.array()
                        .min(2)
                        .max(2)
                        .of(
                            Yup.object().shape({
                                id: Yup.string().required(),
                                content: Yup.string().required(),
                            })
                        ),
                })
            ),
        })
    ),
})

type MemoryContentData = Yup.InferType<typeof MemoryContentSchema>

const EditMemoryContent: EditTaskContentView = () => {
    const {
        task,
        contents,
        setContents,
        createQuest,
        onModifyAndSave,
        firstContent,
    } = useGlobalContent()

    useEffect(() => {
        if (contents.length) {
            return
        }

        setContents([
            {
                isNew: true,
                id: uniqueId("content_"),
                title: "Standard-Inhalt",
                content: "Standard-Beschreibung",
                quests: [],
            },
        ])
    }, [contents, setContents])

    useEffect(() => {
        let allOk = true
        const newContents = contents.map((content) => {
            return {
                ...content,
                quests: content.quests.map((quest) => {
                    // we only want the first two answers. always.
                    let answers = quest.answers.slice(0, 2).map((answer) => {
                        return {
                            ...answer,
                            // ensure that answer is always correct
                            is_correct: true,
                        }
                    })

                    allOk = allOk && answers.length === 2

                    while (answers.length < 2) {
                        answers = [
                            ...answers,
                            {
                                id: uniqueId("answer_"),
                                content: "",
                                is_correct: true,
                                isNew: true,
                            },
                        ]
                    }

                    return {
                        ...quest,
                        answers: ensureSequenceForKey("sort", answers),
                    }
                }),
            }
        })

        if (allOk) {
            // prevent unnecessary state updates
            return
        }

        setContents(newContents)
    }, [contents, setContents])

    const createPair = useCallback(
        (content_id: string) => {
            return createQuest(content_id, {
                answers: ensureSequenceForKey("sort", [
                    createNewAnswer(),
                    createNewAnswer(),
                ]),
            })
        },
        [createQuest]
    )

    const onSubmit = useCallback<SubmitHandler<MemoryContentData>>(
        async (value) => {
            value.contentText = "-"
            value.contentTitle = "-"
            await onModifyAndSave((contents) => {
                return value.contents.map((content) => {
                    const origContent = contents.find(
                        (c) => c.id === content.id
                    )

                    if (!origContent) {
                        throw new Error("data integrity broken")
                    }

                    return {
                        ...origContent,
                        quests: content.quests.map((quest) => {
                            const origQuest = origContent.quests.find(
                                (q) => q.id === quest.id
                            )

                            if (!origQuest) {
                                throw new Error("data integrity broken")
                            }
                            origQuest.name = "-"
                            origQuest.question = "-"

                            return {
                                ...origQuest,
                                answers: quest.answers.map((answer) => {
                                    const origAnswer = origQuest.answers.find(
                                        (a) => a.id === answer.id
                                    )

                                    if (!origAnswer) {
                                        throw new Error("data integrity broken")
                                    }

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

    if (!firstContent) {
        return null
    }

    return (
        <ValidatedForm
            validation={MemoryContentSchema}
            initialData={{
                contents,
            }}
            onSubmit={onSubmit}
            className="default"
        >
            <h1>Memory Aufgabe: {task.getTitle()}</h1>

            <Button type="submit">Speichern</Button>
            <Button onClick={createPair(firstContent.id)}>Neues Paar</Button>

            <div>
                <h2>Inhalt</h2>
            </div>

            {contents.map((content, contentIndex) => {
                const contentPath = `contents[${contentIndex}]`
                return (
                    <div
                        className={Styles.pairs}
                        key={`memory-content-${content.id}`}
                    >
                        <Input
                            label=""
                            name={`${contentPath}.id`}
                            type="hidden"
                        />
                        {content.quests.map((quest, index) => {
                            const questPath = `${contentPath}.quests[${index}]`

                            return (
                                <details
                                    className={Styles.pair}
                                    key={`memory-quest-${quest.id}`}
                                >
                                    <summary className={Styles.pairSummary}>
                                        Paar {index + 1}
                                    </summary>

                                    <div className={Styles.pairContent}>
                                        <Input
                                            label=""
                                            name={`${questPath}.id`}
                                            type="hidden"
                                        />
                                        {quest.answers.map((answer, index) => {
                                            return (
                                                <div
                                                    key={`memory-answer-${answer.id}`}
                                                >
                                                    <h3>Karte {index + 1}</h3>
                                                    <Input
                                                        label=""
                                                        name={`${questPath}.answers[${index}].id`}
                                                        type="hidden"
                                                    />
                                                    <Input
                                                        label=""
                                                        name={`${questPath}.answers[${index}].content`}
                                                        type="text"
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </details>
                            )
                        })}
                    </div>
                )
            })}
        </ValidatedForm>
    )
}

export default EditMemoryContent
