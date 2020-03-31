import React from "react"

import { EditTaskContentView } from "../EditTaskContent"

const EditCardContent: EditTaskContentView = ({ editTaskContext }) => {
    const {
        task,
        contents,
        createContent,
        removeContent,
        onSave,
        onContentInputChange,
    } = editTaskContext

    return (
        <div>
            <h1>Karteikarten Aufgabe: {task.getTitle()}</h1>
            <div>
                <button className="button" onClick={createContent()}>
                    Karteikarte hinzufügen
                </button>
                <button className="button" onClick={onSave}>
                    Speichern
                </button>
            </div>
            <form
                className="default"
                onSubmit={(event) => event.preventDefault()}
            >
                {contents.map((content) => {
                    return (
                        <div key={`card-content-${content.id}`}>
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
                        </div>
                    )
                })}
            </form>
        </div>
    )
}

export default EditCardContent
