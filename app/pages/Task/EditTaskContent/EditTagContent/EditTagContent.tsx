import React, { useCallback } from "react"

import { EditTaskContentView } from "../EditTaskContent"
import { uniqueId } from "../../../../helpers/uniqueId"

const EditTagContent: EditTaskContentView = ({ editTaskContext }) => {
    const {
        task,
        contents,
        createContent,
        createAnswer,
        onContentInputChange,
        onAnswerInputChange,
        onSave,
    } = editTaskContext

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

    return (
        <form className="default">
            <h1>Memory Aufgabe: {task.getTitle()}</h1>

            <button className="button" onClick={onSave}>
                Speichern
            </button>

            <button className="button" onClick={createTagContent}>
                Neuer Inhalt
            </button>

            {contents.map((content) => {
                return (
                    <div key={`tag-content-${content.id}`}>
                        <div>
                            <h2>Inhalt</h2>
                            <label>
                                <p>Titel</p>
                                <input
                                    type="text"
                                    value={content.title}
                                    onChange={onContentInputChange(
                                        content.id,
                                        "title"
                                    )}
                                />
                            </label>
                            <label>
                                <p>Text</p>
                                <textarea
                                    value={content.content}
                                    onChange={onContentInputChange(
                                        content.id,
                                        "content"
                                    )}
                                />
                            </label>
                        </div>

                        {/* content always has at least one quest (probably exactly one */}
                        <button
                            className="button"
                            onClick={createTag(content.id)}
                        >
                            Tag hinzufügen
                        </button>

                        <div>
                            {content.quests.map((quest) => {
                                return quest.answers.map((answer) => {
                                    return (
                                        <div key={`tags-tag-${answer.id}`}>
                                            <label>
                                                <span>Tag</span>
                                                <input
                                                    type="text"
                                                    value={answer.content}
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
                                })
                            })}
                        </div>
                    </div>
                )
            })}
        </form>
    )
}

export default EditTagContent
