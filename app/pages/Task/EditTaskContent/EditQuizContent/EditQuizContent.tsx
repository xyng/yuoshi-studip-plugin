import React from "react"

import { EditTaskContentView } from "../EditTaskContent"

const EditQuizContent: EditTaskContentView = ({ editTaskContext }) => {
    const {
        contents,
        createContent,
        createQuest,
        createAnswer,
        removeContent,
        removeQuest,
        removeAnswer,
        onContentInputChange,
        onQuestInputChange,
        onAnswerInputChange,
        onQuestUp,
        onQuestDown,
        onAnswerUp,
        onAnswerDown,
        onSave,
    } = editTaskContext
    return (
        <form className="default" onSubmit={(event) => event.preventDefault()}>
            <button className="button" onClick={createContent()}>
                Inhalt hinzufügen
            </button>
            <button className="button" onClick={onSave}>
                Speichern
            </button>
            {contents.map((content) => {
                return (
                    <div key={`quiz-content-${content.id}`}>
                        <h2>
                            {content.title.length
                                ? `Inhalt: ${content.title}`
                                : "Neuer Inhalt"}
                        </h2>
                        <button
                            className="button"
                            onClick={createQuest(content.id)}
                        >
                            Neue Frage
                        </button>
                        <details>
                            <summary className="button">
                                Meta-Informationen
                            </summary>
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
                            <div>
                                <button
                                    className="button"
                                    onClick={removeContent(content.id)}
                                >
                                    Entfernen
                                </button>
                            </div>
                        </details>
                        <details>
                            <summary className="button">Fragen</summary>
                            <div>
                                {content.quests.map((quest) => {
                                    return (
                                        <div key={`quiz-quest-${quest.id}`}>
                                            <label>
                                                <p>Name:</p>
                                                <input
                                                    type="text"
                                                    value={quest.name}
                                                    onChange={onQuestInputChange(
                                                        content.id,
                                                        quest.id,
                                                        "name"
                                                    )}
                                                />
                                            </label>
                                            <label>
                                                <p>Text:</p>
                                                <input
                                                    type="text"
                                                    value={
                                                        quest.prePhrase || ""
                                                    }
                                                    onChange={onQuestInputChange(
                                                        content.id,
                                                        quest.id,
                                                        "prePhrase"
                                                    )}
                                                />
                                            </label>
                                            <label>
                                                <p>Frage:</p>
                                                <input
                                                    type="text"
                                                    value={quest.question}
                                                    onChange={onQuestInputChange(
                                                        content.id,
                                                        quest.id,
                                                        "question"
                                                    )}
                                                />
                                            </label>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={quest.requireOrder}
                                                    onChange={onQuestInputChange(
                                                        content.id,
                                                        quest.id,
                                                        "requireOrder"
                                                    )}
                                                />
                                                <span>
                                                    Reihenfolge der Antworten
                                                    beachten
                                                </span>
                                            </label>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={quest.multiple}
                                                    onChange={onQuestInputChange(
                                                        content.id,
                                                        quest.id,
                                                        "multiple"
                                                    )}
                                                />
                                                <span>
                                                    Mehrere Antworten möglich
                                                </span>
                                            </label>
                                            <button
                                                onClick={onQuestUp(
                                                    content.id,
                                                    quest.id
                                                )}
                                            >
                                                &uarr;
                                            </button>
                                            <button
                                                onClick={onQuestDown(
                                                    content.id,
                                                    quest.id
                                                )}
                                            >
                                                &darr;
                                            </button>
                                            <button
                                                onClick={removeQuest(
                                                    content.id,
                                                    quest.id
                                                )}
                                            >
                                                Entfernen
                                            </button>

                                            <div>
                                                {quest.answers.map((answer) => {
                                                    return (
                                                        <div
                                                            key={`quiz-answer-${answer.id}`}
                                                        >
                                                            <label>
                                                                <p>Antwort:</p>
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
                                                            <label>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        answer.is_correct
                                                                    }
                                                                    onChange={onAnswerInputChange(
                                                                        content.id,
                                                                        quest.id,
                                                                        answer.id,
                                                                        "is_correct"
                                                                    )}
                                                                />
                                                                <span>
                                                                    Korrekte
                                                                    Antwort
                                                                </span>
                                                            </label>
                                                            <button
                                                                onClick={onAnswerUp(
                                                                    content.id,
                                                                    quest.id,
                                                                    answer.id
                                                                )}
                                                            >
                                                                &uarr;
                                                            </button>
                                                            <button
                                                                onClick={onAnswerDown(
                                                                    content.id,
                                                                    quest.id,
                                                                    answer.id
                                                                )}
                                                            >
                                                                &darr;
                                                            </button>
                                                            <button
                                                                onClick={removeAnswer(
                                                                    content.id,
                                                                    quest.id,
                                                                    answer.id
                                                                )}
                                                            >
                                                                Entfernen
                                                            </button>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            <button
                                                onClick={createAnswer(
                                                    content.id,
                                                    quest.id
                                                )}
                                            >
                                                Neue Antwort
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </details>
                    </div>
                )
            })}
        </form>
    )
}

export default EditQuizContent
