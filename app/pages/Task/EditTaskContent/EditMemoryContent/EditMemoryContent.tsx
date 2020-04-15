import React, { ChangeEventHandler, useCallback, useEffect } from "react"

import { EditTaskContentView } from "../EditTaskContent"
import { uniqueId } from "../../../../helpers/uniqueId"
import { ensureSequenceForKey } from "../../../../helpers/listHelpers"
import { QuizAnswer } from "../useEditTaskContent"
import useGlobalContent from "../hooks/useGlobalContent"
import Button from "../../../../components/Button/Button"

import Styles from "./EditMemoryContent.module.css"

const createNewAnswer = (): QuizAnswer => {
    return {
        isNew: true,
        id: uniqueId("answer_"),
        content: "",
        is_correct: true,
    }
}

const EditMemoryContent: EditTaskContentView = ({ editTaskContext }) => {
    const {
        task,
        contents,
        setContents,
        createQuest,
        onQuestInputChange,
        onAnswerInputChange,
        onSave,
    } = editTaskContext

    const {
        firstContent,
        contentText,
        contentTitle,
        changeContentTitle,
        changeContentText,
    } = useGlobalContent(editTaskContext)

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
        <form className="default">
            <h1>Memory Aufgabe: {task.getTitle()}</h1>

            <button className="button" onClick={onSave}>
                Speichern
            </button>

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

            {contents.map((content) => {
                return (
                    <div
                        className={Styles.pairs}
                        key={`memory-content-${content.id}`}
                    >
                        {content.quests.map((quest, index) => {
                            return (
                                <details
                                    className={Styles.pair}
                                    key={`memory-quest-${quest.id}`}
                                >
                                    <summary className={Styles.pairSummary}>
                                        Paar {index + 1}: {quest.name}
                                    </summary>

                                    <div className={Styles.pairContent}>
                                        <label>
                                            <span>Paar-Name</span>
                                            <input
                                                type="text"
                                                value={quest.name}
                                                onChange={changeQuestTitle(
                                                    content.id,
                                                    quest.id
                                                )}
                                            />
                                        </label>
                                        {quest.answers.map((answer, index) => {
                                            return (
                                                <div
                                                    key={`memory-answer-${answer.id}`}
                                                >
                                                    <h3>Teil {index + 1}</h3>
                                                    <label>
                                                        <span>Text</span>
                                                        <input
                                                            type="text"
                                                            value={
                                                                answer.content
                                                            }
                                                            onChange={onAnswerInputChange(
                                                                content.id,
                                                                quest.id,
                                                                answer.id,
                                                                "content"
                                                            )}
                                                        />
                                                    </label>
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
            <Button onClick={createPair(firstContent.id)}>Neues Paar</Button>
        </form>
    )
}

export default EditMemoryContent
