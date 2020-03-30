import React, {
    ChangeEventHandler,
    useCallback,
    useEffect,
    useState,
} from "react"
import {
    ensureSequenceForKey,
    Identifiable,
    IdentifiableSortable,
    removeEntityAndSort,
    SetterFn,
    updateEntityAndSort,
} from "helpers/listHelpers"

import { uniqueId } from "../../../helpers/uniqueId"
import Content from "../../../models/Content"
import Quest from "../../../models/Quest"
import Answer from "../../../models/Answer"
import Task from "../../../models/Task"

import Styles from "./EditDragContent.module.css"
import { EditTaskContentView } from "./EditTaskContent"

interface Creatable extends Identifiable {
    isNew?: boolean
}

interface Statement extends IdentifiableSortable, Creatable {
    content: string
}

interface Category extends IdentifiableSortable, Creatable {
    content_id?: string
    title: string
    statements: Statement[]
    requireOrder: boolean
}

const taskToCategories = (task: Task) => {
    const contents = task.getContents()
    return ensureSequenceForKey(
        "sort",
        contents.reduce<Category[]>((acc, value) => {
            return acc.concat(
                value.getQuests().map((quest) => {
                    return {
                        isNew: !quest.getApiId(),
                        id: quest.getApiId() || uniqueId("category_"),
                        content_id: value.getApiId(),
                        title: quest.getQuestion(),
                        sort: quest.getSort(),
                        requireOrder: quest.getRequireOrder(),
                        statements: ensureSequenceForKey(
                            "sort",
                            quest.getAnswers().map((answer) => {
                                return {
                                    isNew: !quest.getApiId(),
                                    id:
                                        answer.getApiId() ||
                                        uniqueId("statement_"),
                                    sort: answer.getSort(),
                                    content: answer.getContent(),
                                }
                            })
                        ),
                    }
                })
            )
        }, [])
    )
}

const EditDragContent: EditTaskContentView = ({ task, updateTask }) => {
    const [categories, setCategories] = useState<Category[]>([])
    const [requireOrder, setRequireOrder] = useState<boolean>()
    const [isSaving, setIsSaving] = useState(false)
    const [contentTitle, setContentTitle] = useState("")
    const [contentText, setContentText] = useState("")

    useEffect(() => {
        if (requireOrder === undefined) {
            return
        }

        setCategories((categories) => {
            return categories.map((category) => {
                return {
                    ...category,
                    requireOrder: requireOrder,
                }
            })
        })
    }, [requireOrder])

    useEffect(() => {
        setCategories(taskToCategories(task))
        const contents = task.getContents()

        if (!contents.length) {
            return
        }

        const [content] = contents
        setContentTitle(content.getTitle())
        setContentText(content.getContent())
    }, [task])

    const onSave = useCallback(async () => {
        setIsSaving(true)

        const contents = task.getContents() || []

        const fallbackContent = new Content()
        const categoriesByObject: {
            [key: string]: Category[]
        } = {}

        for (const category of categories) {
            const key = category.content_id || "new"
            categoriesByObject[key] = categoriesByObject[key] || []

            categoriesByObject[key].push(category)
        }

        const newContents = await Promise.all(
            Object.entries(categoriesByObject).map(
                async ([content_id, categories]) => {
                    let content: Content
                    if (content_id === "new") {
                        let foundContent:
                            | Content
                            | null
                            | undefined = contents.length
                            ? contents[0]
                            : undefined

                        if (!foundContent) {
                            foundContent = (
                                await task.contents().first()
                            ).getData() as Content | null
                        }

                        content = foundContent || fallbackContent
                    } else {
                        let foundContent:
                            | Content
                            | null
                            | undefined = contents.find(
                            (content) => content.getApiId() === content_id
                        )

                        if (!foundContent) {
                            foundContent = (
                                await task.contents().find(content_id)
                            ).getData() as Content | null
                        }

                        if (!foundContent) {
                            throw new Error(
                                "could not find content for category. something is wrong with data integrity"
                            )
                        }

                        content = foundContent
                    }

                    content.patch({
                        title: contentTitle,
                        content: contentText,
                    })
                    content.setTask(task)

                    // fetch quests before save as they won't be available afterwards
                    const quests = content.getQuests()

                    let savedContent = (
                        await content.save()
                    ).getModel() as Content | null

                    if (!savedContent) {
                        throw new Error("could not save content")
                    }

                    content = savedContent

                    const newQuests: Quest[] = []

                    for (const category of categories) {
                        let quest: Quest

                        if (category.isNew) {
                            quest = new Quest()
                        } else {
                            let foundQuest:
                                | Quest
                                | null
                                | undefined = quests.find(
                                (quest) => quest.getApiId() === category.id
                            )

                            if (!foundQuest) {
                                foundQuest = (
                                    await content.quests().find(category.id)
                                ).getData() as Quest | null
                            }

                            if (!foundQuest) {
                                throw new Error(
                                    "could not find quest for content. something is wrong with data integrity"
                                )
                            }

                            quest = foundQuest
                        }

                        quest.patch({
                            name: category.title,
                            question: category.title,
                            sort: category.sort,
                            require_order: category.requireOrder,
                            multiple: true,
                        })
                        quest.setContentRelation(content)

                        // fetch answers before save as they wont be available afterwards
                        const answers = quest.getAnswers() || []

                        let saved = (
                            await quest.save()
                        ).getModel() as Quest | null

                        if (!saved) {
                            throw new Error("could not save quest")
                        }

                        quest = saved

                        const newAnswers: Answer[] = []

                        for (const statement of category.statements) {
                            let answer: Answer

                            if (statement.isNew) {
                                answer = new Answer()
                            } else {
                                let foundAnswer:
                                    | Answer
                                    | null
                                    | undefined = answers.find(
                                    (answer) =>
                                        answer.getApiId() === statement.id
                                )

                                if (!foundAnswer) {
                                    foundAnswer = (
                                        await quest.answers().find(statement.id)
                                    ).getData() as Answer | null
                                }

                                if (!foundAnswer) {
                                    throw new Error(
                                        "could not find answer for content. something is wrong with data integrity"
                                    )
                                }

                                answer = foundAnswer
                            }

                            answer.patch({
                                content: statement.content,
                                sort: statement.sort,

                                // statements are always true
                                is_correct: true,
                            })
                            answer.setQuest(quest)

                            const saved = (
                                await answer.save()
                            ).getModel() as Answer | null

                            if (!saved) {
                                throw new Error("could not save answer")
                            }

                            newAnswers.push(saved)
                        }

                        await Promise.all(
                            answers
                                .filter((answer) => {
                                    return (
                                        newAnswers.findIndex((newAnswer) => {
                                            return (
                                                newAnswer.getApiId() ===
                                                answer.getApiId()
                                            )
                                        }) === -1
                                    )
                                })
                                .map((answer) => {
                                    return answer.delete()
                                })
                        )

                        quest.setAnswers(newAnswers)

                        saved = (await quest.save()).getModel() as Quest | null

                        if (!saved) {
                            throw new Error("could not save quest")
                        }

                        newQuests.push(saved)
                    }

                    await Promise.all(
                        quests
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
                }
            )
        )

        task.setContents(newContents)

        await updateTask(task)
        setIsSaving(false)
    }, [task, categories, contentTitle, contentText, updateTask])

    const changeContentTitle = useCallback<
        ChangeEventHandler<HTMLInputElement>
    >((event) => {
        setContentTitle(event.currentTarget.value)
    }, [])

    const changeContentText = useCallback<
        ChangeEventHandler<HTMLTextAreaElement>
    >((event) => {
        setContentText(event.currentTarget.value)
    }, [])

    const createCategory = useCallback(() => {
        if (isSaving) {
            return
        }

        setCategories((categories) => {
            return ensureSequenceForKey<Category>("sort", [
                ...categories,
                {
                    isNew: true,
                    id: uniqueId("category"),
                    title: "",
                    requireOrder: !!requireOrder,
                    statements: [],
                },
            ])
        })
    }, [isSaving, requireOrder])

    const updateRequireOrder = useCallback<
        ChangeEventHandler<HTMLInputElement>
    >(
        (event) => {
            if (isSaving) {
                return
            }

            setRequireOrder(event.currentTarget.checked)
        },
        [isSaving]
    )

    const removeCategory = useCallback(
        (category_id: string) => () => {
            if (isSaving) {
                return
            }

            setCategories(removeEntityAndSort(category_id))
        },
        [isSaving]
    )

    // TODO: check if we can strictly type value. its currently just union of all types for any key of Category
    const updateCategory = useCallback(
        (
            id: string,
            key: keyof Category,
            value: SetterFn<Category[keyof Category]>
        ) => {
            if (isSaving) {
                return
            }

            setCategories(updateEntityAndSort(id, key, value))
        },
        [isSaving]
    )

    const onCategoryLeft = useCallback(
        (id: string) => () => {
            updateCategory(id, "sort", (val: number) => {
                return val - 2
            })
        },
        [updateCategory]
    )

    const onCategoryRight = useCallback(
        (id: string) => () => {
            updateCategory(id, "sort", (val: number) => {
                return val + 2
            })
        },
        [updateCategory]
    )

    const onCategoryTextChange = useCallback(
        (id: string): ChangeEventHandler<HTMLInputElement> => (event) => {
            updateCategory(id, "title", event.currentTarget.value)
        },
        [updateCategory]
    )

    const onCategoryRequireOrder = useCallback(
        (id: string): ChangeEventHandler<HTMLInputElement> => (event) => {
            const val = event.currentTarget.checked

            if (!val) {
                setRequireOrder(undefined)
            }

            updateCategory(id, "requireOrder", val)
        },
        [updateCategory]
    )

    const createStatement = useCallback(
        (category_id: string) => () => {
            updateCategory(
                category_id,
                "statements",
                (statements: Statement[]) => {
                    return ensureSequenceForKey("sort", [
                        ...statements,
                        {
                            isNew: true,
                            id: uniqueId("statements_"),
                            content: "",
                        },
                    ])
                }
            )
        },
        [updateCategory]
    )

    const removeStatement = useCallback(
        (category_id: string, statement_id: string) => () => {
            updateCategory(
                category_id,
                "statements",
                removeEntityAndSort(statement_id)
            )
        },
        [updateCategory]
    )

    const updateStatement = useCallback(
        (
            category_id: string,
            statement_id: string,
            key: keyof Statement,
            value: SetterFn<Statement[keyof Statement]>
        ) => {
            updateCategory(
                category_id,
                "statements",
                updateEntityAndSort<Statement>(statement_id, key, value)
            )
        },
        [updateCategory]
    )

    const onStatementUp = useCallback(
        (category_id: string, statement_id: string) => () => {
            updateStatement(
                category_id,
                statement_id,
                "sort",
                (val: number) => {
                    return val - 2
                }
            )
        },
        [updateStatement]
    )

    const onStatementDown = useCallback(
        (category_id: string, statement_id: string) => () => {
            updateStatement(
                category_id,
                statement_id,
                "sort",
                (val: number) => {
                    return val + 2
                }
            )
        },
        [updateStatement]
    )

    const onStatementTextChange = useCallback(
        (
            category_id: string,
            statement_id: string
        ): ChangeEventHandler<HTMLInputElement> => (event) => {
            updateStatement(
                category_id,
                statement_id,
                "content",
                event.currentTarget.value
            )
        },
        [updateStatement]
    )

    return (
        <div>
            <h1>Drag n' Drop Aufgabe: {task.getTitle()}</h1>
            <div className={Styles.settingsHeader}>
                <label className={Styles.requireOrder}>
                    <input
                        checked={!!requireOrder}
                        onChange={updateRequireOrder}
                        type="checkbox"
                    />
                    <span>
                        Reihenfolge der Elemente bei allen Kategorien beachten
                    </span>
                </label>

                <div className={Styles.save}>
                    <button className="button" onClick={createCategory}>
                        Neue Kategorie
                    </button>
                    <button className="button" onClick={onSave}>
                        Speichern
                    </button>
                </div>
            </div>
            <form
                className="default"
                onSubmit={(event) => event.preventDefault()}
            >
                <div>
                    <h2>Inhalt</h2>
                    <label>
                        <p>Titel</p>
                        <input
                            type="text"
                            value={contentTitle}
                            onChange={changeContentTitle}
                        />
                    </label>
                    <label>
                        <p>Text</p>
                        <textarea
                            value={contentText}
                            onChange={changeContentText}
                        />
                    </label>
                </div>
                <div className={Styles.categories}>
                    {categories.map((category) => {
                        return (
                            <div
                                className={Styles.category}
                                key={`category-${category.id}`}
                            >
                                <label
                                    htmlFor={`category-${category.id}-input`}
                                >
                                    <p>Titel</p>
                                    <input
                                        id={`category-${category.id}-input`}
                                        type="text"
                                        value={category.title}
                                        onChange={onCategoryTextChange(
                                            category.id
                                        )}
                                    />
                                </label>
                                <label>
                                    <input
                                        checked={!!category.requireOrder}
                                        onChange={onCategoryRequireOrder(
                                            category.id
                                        )}
                                        type="checkbox"
                                    />
                                    <span>
                                        Reihenfolge der Elemente beachten
                                    </span>
                                </label>

                                <div>
                                    <button
                                        onClick={onCategoryLeft(category.id)}
                                    >
                                        &larr;
                                    </button>
                                    <button
                                        onClick={onCategoryRight(category.id)}
                                    >
                                        &rarr;
                                    </button>
                                </div>
                                <div>
                                    <button
                                        onClick={removeCategory(category.id)}
                                    >
                                        &minus;
                                    </button>
                                </div>

                                <p>Zugehörige Elemente</p>
                                <div className={Styles.statements}>
                                    {category.statements.map((statement) => {
                                        return (
                                            <div
                                                className={Styles.statement}
                                                key={`statement-${statement.id}`}
                                            >
                                                {category.requireOrder && (
                                                    <>
                                                        <button
                                                            onClick={onStatementUp(
                                                                category.id,
                                                                statement.id
                                                            )}
                                                        >
                                                            &uarr;
                                                        </button>
                                                        <button
                                                            onClick={onStatementDown(
                                                                category.id,
                                                                statement.id
                                                            )}
                                                        >
                                                            &darr;
                                                        </button>
                                                    </>
                                                )}

                                                <input
                                                    type="text"
                                                    value={statement.content}
                                                    onChange={onStatementTextChange(
                                                        category.id,
                                                        statement.id
                                                    )}
                                                />
                                                <button
                                                    onClick={removeStatement(
                                                        category.id,
                                                        statement.id
                                                    )}
                                                >
                                                    &minus;
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div>
                                    <button
                                        onClick={createStatement(category.id)}
                                    >
                                        Neues Element
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </form>
        </div>
    )
}

export default EditDragContent
