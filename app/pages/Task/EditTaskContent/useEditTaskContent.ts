import { ChangeEventHandler, useCallback, useEffect, useState } from "react"

import {
    Creatable,
    ensureSequenceForKey,
    removeEntity,
    removeEntityAndSort,
    SetterFn,
    Sortable,
    updateEntity,
    updateEntityAndSort,
} from "../../../helpers/listHelpers"
import { uniqueId } from "../../../helpers/uniqueId"
import Content from "../../../models/Content"
import Quest from "../../../models/Quest"
import Answer from "../../../models/Answer"
import { useCurrentTaskContext } from "../../../contexts/CurrentTaskContext"

export interface QuizAnswer extends Creatable, Sortable {
    content: string
    is_correct: boolean
}

export interface QuizQuest extends Creatable, Sortable {
    name: string
    question: string
    multiple: boolean
    requireOrder: boolean
    customAnswer: boolean
    prePhrase?: string
    answers: QuizAnswer[]
}

export interface QuizContent extends Creatable {
    title: string
    content: string
    intro?: string
    outro?: string
    quests: QuizQuest[]
}

function handleChangeEvent(element: Element) {
    if (element instanceof HTMLInputElement) {
        if (element.type === "checkbox") {
            return element.checked
        }

        if (element.type === "number") {
            return element.valueAsNumber
        }

        return element.value
    }

    if (element instanceof HTMLTextAreaElement) {
        return element.value
    }

    if (element instanceof HTMLSelectElement) {
        return element.value
    }
}

export const useEditTaskContext = () => {
    const { task, updateTask } = useCurrentTaskContext()
    const [contents, setContents] = useState<QuizContent[]>([])
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        setContents(
            task.getContents().map((content) => {
                return {
                    id: content.getApiId() || uniqueId("content_"),
                    title: content.getTitle(),
                    content: content.getContent(),
                    quests: ensureSequenceForKey(
                        "sort",
                        content.getQuests().map((quest) => {
                            return {
                                id: quest.getApiId() || uniqueId("quest_"),
                                name: quest.getName(),
                                question: quest.getQuestion(),
                                multiple: quest.getMultiple(),
                                customAnswer: quest.getCustomAnswer(),
                                requireOrder: quest.getRequireOrder(),
                                prePhrase: quest.getPrePhrase(),
                                sort: quest.getSort(),
                                answers: ensureSequenceForKey(
                                    "sort",
                                    quest.getAnswers().map((answer) => {
                                        return {
                                            id:
                                                answer.getApiId() ||
                                                uniqueId("answer_"),
                                            content: answer.getContent(),
                                            is_correct: answer.getIsCorrect(),
                                            sort: answer.getSort(),
                                        }
                                    })
                                ),
                            }
                        })
                    ),
                }
            })
        )
    }, [task])

    const onModifyAndSave = useCallback(
        async (mapper?: (content: QuizContent[]) => QuizContent[]) => {
            setIsSaving(true)

            const localContents = mapper ? mapper(contents) : contents

            try {
                const apiContents = task.getContents() || []

                const newContents = await Promise.all(
                    localContents.map(async (content) => {
                        let apiContent: Content
                        if (content.isNew) {
                            apiContent = new Content()
                        } else {
                            let foundContent:
                                | Content
                                | null
                                | undefined = apiContents.find(
                                (apiContent) =>
                                    apiContent.getApiId() === content.id
                            )

                            if (!foundContent) {
                                foundContent = (
                                    await task.contents().find(content.id)
                                ).getData() as Content | null
                            }

                            if (!foundContent) {
                                throw new Error(
                                    "could not find content for category. something is wrong with data integrity"
                                )
                            }

                            apiContent = foundContent
                        }

                        apiContent.patch({
                            title: content.title,
                            content: content.content || "",
                            intro: content.intro,
                            outro: content.outro,
                        })
                        apiContent.setTask(task)

                        // fetch quests before save as they won't be available afterwards
                        const apiQuests = apiContent.getQuests()

                        let savedContent = (
                            await apiContent.save()
                        ).getModel() as Content | null

                        if (!savedContent) {
                            throw new Error("could not save content")
                        }

                        apiContent = savedContent

                        const newQuests: Quest[] = await Promise.all(
                            content.quests.map(async (quest) => {
                                let apiQuest: Quest

                                if (quest.isNew) {
                                    apiQuest = new Quest()
                                } else {
                                    let foundQuest:
                                        | Quest
                                        | null
                                        | undefined = apiQuests.find(
                                        (apiQuest) =>
                                            apiQuest.getApiId() === quest.id
                                    )

                                    if (!foundQuest) {
                                        foundQuest = (
                                            await apiContent
                                                .quests()
                                                .find(quest.id)
                                        ).getData() as Quest | null
                                    }

                                    if (!foundQuest) {
                                        throw new Error(
                                            "could not find quest for content. something is wrong with data integrity"
                                        )
                                    }

                                    apiQuest = foundQuest
                                }

                                apiQuest.patch({
                                    name: quest.name,
                                    question: quest.question,
                                    sort: quest.sort,
                                    require_order: quest.requireOrder,
                                    multiple: quest.multiple,
                                    custom_answer: quest.customAnswer,
                                })
                                apiQuest.setContent(apiContent)

                                // fetch answers before save as they wont be available afterwards
                                const apiAnswers = apiQuest.getAnswers() || []

                                let saved = (
                                    await apiQuest.save()
                                ).getModel() as Quest | null

                                if (!saved) {
                                    throw new Error("could not save quest")
                                }

                                apiQuest = saved

                                const newAnswers: Answer[] = await Promise.all(
                                    quest.answers.map(async (answer) => {
                                        let apiAnswer: Answer

                                        if (answer.isNew) {
                                            apiAnswer = new Answer()
                                        } else {
                                            let foundAnswer:
                                                | Answer
                                                | null
                                                | undefined = apiAnswers.find(
                                                (apiAnswer) =>
                                                    apiAnswer.getApiId() ===
                                                    answer.id
                                            )

                                            if (!foundAnswer) {
                                                foundAnswer = (
                                                    await apiQuest
                                                        .answers()
                                                        .find(answer.id)
                                                ).getData() as Answer | null
                                            }

                                            if (!foundAnswer) {
                                                throw new Error(
                                                    "could not find answer for content. something is wrong with data integrity"
                                                )
                                            }

                                            apiAnswer = foundAnswer
                                        }

                                        apiAnswer.patch({
                                            content: answer.content,
                                            sort: answer.sort,
                                            is_correct: answer.is_correct,
                                        })
                                        apiAnswer.setQuest(apiQuest)

                                        const saved = (
                                            await apiAnswer.save()
                                        ).getModel() as Answer | null

                                        if (!saved) {
                                            throw new Error(
                                                "could not save answer"
                                            )
                                        }

                                        return saved
                                    })
                                )

                                await Promise.all(
                                    apiAnswers
                                        .filter((answer) => {
                                            return (
                                                newAnswers.findIndex(
                                                    (newAnswer) => {
                                                        return (
                                                            newAnswer.getApiId() ===
                                                            answer.getApiId()
                                                        )
                                                    }
                                                ) === -1
                                            )
                                        })
                                        .map((answer) => {
                                            return answer.delete()
                                        })
                                )

                                saved = (
                                    await apiQuest.save()
                                ).getModel() as Quest | null

                                if (!saved) {
                                    throw new Error("could not save quest")
                                }

                                saved.setAnswers(newAnswers)

                                return saved
                            })
                        )

                        await Promise.all(
                            apiQuests
                                .filter((quest) => {
                                    return (
                                        newQuests.findIndex((newQuest) => {
                                            return (
                                                newQuest.getApiId() ===
                                                quest.getApiId()
                                            )
                                        }) === -1
                                    )
                                })
                                .map((quest) => {
                                    return quest.delete()
                                })
                        )

                        savedContent.setQuests(newQuests)

                        return savedContent
                    })
                )

                await Promise.all(
                    apiContents
                        .filter((content) => {
                            return (
                                newContents.findIndex((newContent) => {
                                    return (
                                        newContent.getApiId() ===
                                        content.getApiId()
                                    )
                                }) === -1
                            )
                        })
                        .map((content) => {
                            return content.delete()
                        })
                )

                task.setContents(newContents)

                await updateTask(task)
            } catch (error) {
                // TODO: validation? error message?
            }
            setIsSaving(false)
        },
        [task, contents, updateTask]
    )

    const onSave = useCallback(() => {
        return onModifyAndSave()
    }, [onModifyAndSave])

    const createContent = useCallback(
        (defaults?: Partial<QuizContent>) => () => {
            if (isSaving) {
                return
            }

            setContents((contents) => {
                return [
                    ...contents,
                    {
                        id: uniqueId("content_"),
                        isNew: true,
                        title: "",
                        content: "",
                        quests: [],
                        ...defaults,
                    },
                ]
            })
        },
        [isSaving]
    )

    const removeContent = useCallback(
        (id: string) => () => {
            if (isSaving) {
                return
            }

            setContents(removeEntity(id))
        },
        [isSaving]
    )

    const updateContent = useCallback(
        <TKey extends keyof QuizContent>(
            id: string,
            key: TKey,
            value: SetterFn<QuizContent[TKey]>
        ) => {
            if (isSaving) {
                return
            }

            setContents(updateEntity(id, key, value))
        },
        [isSaving]
    )

    const updateQuest = useCallback(
        <TKey extends keyof QuizQuest>(
            content_id: string,
            quest_id: string,
            key: TKey,
            value: SetterFn<QuizQuest[TKey]>
        ) => {
            updateContent(
                content_id,
                "quests",
                updateEntityAndSort(quest_id, key, value)
            )
        },
        [updateContent]
    )

    const updateAnswer = useCallback(
        <TKey extends keyof QuizAnswer>(
            content_id: string,
            quest_id: string,
            answer_id: string,
            key: TKey,
            value: SetterFn<QuizAnswer[TKey]>
        ) => {
            updateQuest(
                content_id,
                quest_id,
                "answers",
                updateEntityAndSort(answer_id, key, value)
            )
        },
        [updateQuest]
    )

    const createQuest = useCallback(
        (content_id: string, defaults?: Partial<QuizQuest>) => () => {
            return updateContent(
                content_id,
                "quests",
                (quests: QuizQuest[]) => {
                    return ensureSequenceForKey("sort", [
                        ...quests,
                        {
                            isNew: true,
                            id: uniqueId("quest_"),
                            name: "",
                            question: "",
                            multiple: false,
                            requireOrder: false,
                            customAnswer: false,
                            answers: [],
                            ...defaults,
                        },
                    ])
                }
            )
        },
        [updateContent]
    )

    const removeQuest = useCallback(
        (content_id: string, quest_id: string) => () => {
            return updateContent(
                content_id,
                "quests",
                removeEntityAndSort(quest_id)
            )
        },
        [updateContent]
    )

    const createAnswer = useCallback(
        (
            content_id: string,
            quest_id: string,
            defaults?: Partial<QuizAnswer>
        ) => () => {
            return updateQuest(
                content_id,
                quest_id,
                "answers",
                (answers: QuizAnswer[]) => {
                    return ensureSequenceForKey("sort", [
                        ...answers,
                        {
                            isNew: true,
                            id: uniqueId("answer_"),
                            content: "",
                            is_correct: false,
                            ...defaults,
                        },
                    ])
                }
            )
        },
        [updateQuest]
    )

    const removeAnswer = useCallback(
        (content_id: string, quest_id: string, answer_id: string) => () => {
            return updateQuest(
                content_id,
                quest_id,
                "answers",
                removeEntityAndSort(answer_id)
            )
        },
        [updateQuest]
    )

    const onContentInputChange = useCallback(
        (content_id: string, key: keyof QuizContent): ChangeEventHandler => (
            event
        ) => {
            if (key === "quests") {
                return
            }

            const value = handleChangeEvent(event.currentTarget) as any

            updateContent(content_id, key, value)
        },
        [updateContent]
    )

    const onQuestInputChange = useCallback(
        (
            content_id: string,
            quest_id: string,
            key: keyof QuizQuest
        ): ChangeEventHandler => (event) => {
            if (key === "answers") {
                return
            }

            const value = handleChangeEvent(event.currentTarget) as any

            updateQuest(content_id, quest_id, key, value)
        },
        [updateQuest]
    )

    const onAnswerInputChange = useCallback(
        (
            content_id: string,
            quest_id: string,
            answer_id: string,
            key: keyof QuizAnswer
        ): ChangeEventHandler => (event) => {
            const value = handleChangeEvent(event.currentTarget) as any

            updateAnswer(content_id, quest_id, answer_id, key, value)
        },
        [updateAnswer]
    )

    const onQuestUp = useCallback(
        (content_id: string, quest_id: string) => () => {
            updateQuest(content_id, quest_id, "sort", (sort) => sort - 2)
        },
        [updateQuest]
    )
    const onQuestDown = useCallback(
        (content_id: string, quest_id: string) => () => {
            updateQuest(content_id, quest_id, "sort", (sort) => sort + 2)
        },
        [updateQuest]
    )

    const onAnswerUp = useCallback(
        (content_id: string, quest_id: string, answer_id: string) => () => {
            updateAnswer(
                content_id,
                quest_id,
                answer_id,
                "sort",
                (sort) => sort - 2
            )
        },
        [updateAnswer]
    )
    const onAnswerDown = useCallback(
        (content_id: string, quest_id: string, answer_id: string) => () => {
            updateAnswer(
                content_id,
                quest_id,
                answer_id,
                "sort",
                (sort) => sort + 2
            )
        },
        [updateAnswer]
    )

    return {
        task,
        contents,
        setContents,
        createContent,
        createQuest,
        createAnswer,
        removeContent,
        removeQuest,
        removeAnswer,
        updateContent,
        updateQuest,
        updateAnswer,
        onContentInputChange,
        onQuestInputChange,
        onAnswerInputChange,
        onQuestUp,
        onQuestDown,
        onAnswerUp,
        onAnswerDown,
        onSave,
        onModifyAndSave,
        isSaving,
    }
}
