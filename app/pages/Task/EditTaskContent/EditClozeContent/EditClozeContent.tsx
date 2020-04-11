import React, { useMemo } from "react"

import { EditTaskContentView } from "../EditTaskContent"

import Styles from "./EditClozeContent.module.css"

type Part = {
    inputId?: string
    content: string
}

const contentToParts = (content: string): Part[] => {
    const inputRegex = new RegExp(/W*##(\d)##W*/, "gm")
    const inputRegexNoGrp = new RegExp(/W*##\d##W*/, "gm")
    const matches = content.match(inputRegex)
    const parts = content.split(inputRegexNoGrp)

    if (!matches) {
        return [
            {
                content: content,
            },
        ]
    }

    return matches.map((match, index) => {
        return {
            inputId: match,
            content: parts[index],
        }
    })
}

const EditClozeContent: EditTaskContentView = ({ editTaskContext }) => {
    const {
        task,
        contents,
        createContent,
        removeContent,
        onContentInputChange,
        onSave,
    } = editTaskContext

    const contentsWithParts = useMemo(() => {
        return contents.map((content) => {
            return {
                ...content,
                parts: contentToParts(content.content),
            }
        })
    }, [contents])

    return (
        <form className="default">
            <h1>Lückentext-Aufgabe: {task.getTitle()}</h1>

            <button className="button" onClick={onSave}>
                Speichern
            </button>

            <button className="button" onClick={createContent()}>
                Neuer Inhalt
            </button>

            {contentsWithParts.map((content) => {
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
                                <small>
                                    Verwenden Sie das Format <code>##X##</code>{" "}
                                    um eine Lücke zu kennzeichnen.{" "}
                                    <code>X</code> sollte hierbei eine
                                    aufsteigende natürliche Zahl sein.
                                </small>
                            </label>
                        </div>

                        <h4>Vorschau:</h4>
                        <div className={Styles.preview}>
                            {content.parts.map((part, index) => {
                                return (
                                    <div
                                        key={`content-${content.id}-part-${index}`}
                                    >
                                        {part.content}
                                        {part.inputId && (
                                            <input
                                                className="reset"
                                                type="text"
                                                name={`content-${content.id}-input-${part.inputId}`}
                                            />
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <button
                            className="button"
                            onClick={removeContent(content.id)}
                        >
                            Entfernen
                        </button>
                    </div>
                )
            })}
        </form>
    )
}

export default EditClozeContent
