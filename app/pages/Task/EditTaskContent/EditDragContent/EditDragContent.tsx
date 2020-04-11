import React, {
    ChangeEventHandler,
    useCallback,
    useEffect,
    useState,
} from "react"

import { EditTaskContentView } from "../EditTaskContent"
import useGlobalContent from "../hooks/useGlobalContent"

import Styles from "./EditDragContent.module.css"

const EditDragContent: EditTaskContentView = ({ editTaskContext }) => {
    const {
        task,
        contents,
        setContents,
        createQuest,
        removeQuest,
        createAnswer,
        removeAnswer,
        onModifyAndSave,
        isSaving,
        onQuestInputChange,
        onAnswerInputChange,
        onQuestUp,
        onQuestDown,
        onAnswerUp,
        onAnswerDown,
    } = editTaskContext

    const {
        firstContent,
        contentTitle,
        contentText,
        changeContentText,
        changeContentTitle,
    } = useGlobalContent(editTaskContext)

    const [requireOrder, setRequireOrder] = useState<boolean>()

    useEffect(() => {
        if (requireOrder === undefined) {
            return
        }

        setContents((contents) => {
            return contents.map((content) => {
                return {
                    ...content,
                    quests: content.quests.map((quest) => {
                        return {
                            ...quest,
                            requireOrder: requireOrder,
                        }
                    }),
                }
            })
        })
    }, [requireOrder, setContents])

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

    const onSave = useCallback(() => {
        // ensure that answer is set to be correct
        return onModifyAndSave((contents) => {
            return contents.map((content) => {
                return {
                    ...content,
                    quests: content.quests.map((quest) => {
                        return {
                            ...quest,
                            answers: quest.answers.map((answer) => {
                                return {
                                    ...answer,
                                    is_correct: true,
                                }
                            }),
                        }
                    }),
                }
            })
        })
    }, [onModifyAndSave])

    const createCorrectAnswer = useCallback(
        (content_id: string, quest_id: string) => {
            return createAnswer(content_id, quest_id, {
                is_correct: true,
            })
        },
        [createAnswer]
    )

    const changeQuestTitle = useCallback(
        (content_id: string, category_id: string): ChangeEventHandler => (
            event
        ) => {
            onQuestInputChange(content_id, category_id, "name")(event)
            onQuestInputChange(content_id, category_id, "question")(event)
        },
        [onQuestInputChange]
    )

    if (!firstContent) {
        return null
    }

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
                    <button
                        className="button"
                        onClick={createQuest(firstContent.id)}
                    >
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
                    {contents.map((content) => {
                        return content.quests.map((category) => {
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
                                            value={category.name}
                                            onChange={changeQuestTitle(
                                                content.id,
                                                category.id
                                            )}
                                        />
                                    </label>
                                    <label>
                                        <input
                                            checked={category.requireOrder}
                                            onChange={onQuestInputChange(
                                                content.id,
                                                category.id,
                                                "requireOrder"
                                            )}
                                            type="checkbox"
                                        />
                                        <span>
                                            Reihenfolge der Elemente beachten
                                        </span>
                                    </label>

                                    <div>
                                        <button
                                            onClick={onQuestUp(
                                                content.id,
                                                category.id
                                            )}
                                        >
                                            &larr;
                                        </button>
                                        <button
                                            onClick={onQuestDown(
                                                content.id,
                                                category.id
                                            )}
                                        >
                                            &rarr;
                                        </button>
                                    </div>
                                    <div>
                                        <button
                                            onClick={removeQuest(
                                                content.id,
                                                category.id
                                            )}
                                        >
                                            &minus;
                                        </button>
                                    </div>

                                    <p>Zugehörige Elemente</p>
                                    <div className={Styles.statements}>
                                        {category.answers.map((statement) => {
                                            return (
                                                <div
                                                    className={Styles.statement}
                                                    key={`statement-${statement.id}`}
                                                >
                                                    {category.requireOrder && (
                                                        <>
                                                            <button
                                                                onClick={onAnswerUp(
                                                                    content.id,
                                                                    category.id,
                                                                    statement.id
                                                                )}
                                                            >
                                                                &uarr;
                                                            </button>
                                                            <button
                                                                onClick={onAnswerDown(
                                                                    content.id,
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
                                                        value={
                                                            statement.content
                                                        }
                                                        onChange={onAnswerInputChange(
                                                            content.id,
                                                            category.id,
                                                            statement.id,
                                                            "content"
                                                        )}
                                                    />
                                                    <button
                                                        onClick={removeAnswer(
                                                            content.id,
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
                                            onClick={createCorrectAnswer(
                                                content.id,
                                                category.id
                                            )}
                                        >
                                            Neues Element
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    })}
                </div>
            </form>
        </div>
    )
}

export default EditDragContent
