import React, {
    ChangeEventHandler,
    useCallback,
    useEffect,
    useState,
} from "react"

import { EditTaskContentView } from "../EditTaskContent"
import { Creatable, updateEntity } from "../../../../helpers/listHelpers"
import { uniqueId } from "../../../../helpers/uniqueId"
import Content from "../../../../models/Content"

interface Card extends Creatable {
    title: string
    content: string
}

const EditCardContent: EditTaskContentView = ({ task, updateTask }) => {
    const [cards, setCards] = useState<Card[]>([])

    useEffect(() => {
        setCards(
            task.getContents().map((content) => {
                return {
                    isNew: !content.getApiId(),
                    id: content.getApiId() || uniqueId("content_"),
                    title: content.getTitle(),
                    content: content.getContent(),
                }
            })
        )
    }, [task])

    const createCard = useCallback(() => {
        setCards((cards) => {
            return [
                ...cards,
                {
                    id: uniqueId("content_"),
                    isNew: true,
                    title: "",
                    content: "",
                },
            ]
        })
    }, [])

    const removeCard = useCallback(
        (id: string) => () => {
            setCards((cards) => {
                const index = cards.findIndex((card) => card.id === id)

                if (index === -1) {
                    return cards
                }

                return [...cards.slice(0, index), ...cards.slice(index + 1)]
            })
        },
        []
    )

    const updateContentTitle = useCallback(
        (id: string): ChangeEventHandler<HTMLInputElement> => (event) => {
            setCards(updateEntity(id, "title", event.currentTarget.value))
        },
        []
    )

    const updateContentText = useCallback(
        (id: string): ChangeEventHandler<HTMLTextAreaElement> => (event) => {
            setCards(updateEntity(id, "content", event.currentTarget.value))
        },
        []
    )

    const onSave = useCallback(async () => {
        const oldContents = task.getContents()

        await Promise.all(
            oldContents
                .filter((content) => {
                    return (
                        cards.findIndex(
                            (card) => content.getApiId() === card.id
                        ) === -1
                    )
                })
                .map((content) => {
                    return content.delete()
                })
        )

        task.setContents(
            await Promise.all(
                cards.map(async (card) => {
                    let content: Content
                    if (card.isNew) {
                        content = new Content()
                        content.setTask(task)
                    } else {
                        let findContent:
                            | Content
                            | undefined
                            | null = oldContents.find(
                            (content) => content.getApiId() === card.id
                        )

                        if (!findContent) {
                            findContent = (
                                await task.contents().find(card.id)
                            ).getData() as Content | null
                        }

                        if (!findContent) {
                            throw new Error("could not find entity")
                        }

                        content = findContent
                    }

                    content.patch({
                        title: card.title,
                        content: card.content,
                    })

                    const savedContent = (
                        await content.save()
                    ).getModel() as Content | null

                    if (!savedContent) {
                        throw new Error("could not persist entity")
                    }

                    return savedContent
                })
            )
        )

        await task.save()
        await updateTask(task)
    }, [cards, task, updateTask])

    return (
        <div>
            <h1>Karteikarten Aufgabe: {task.getTitle()}</h1>
            <div>
                <button className="button" onClick={createCard}>
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
                {cards.map((content) => {
                    return (
                        <div key={`card-content-${content.id}`}>
                            <label>
                                <p>Titel</p>
                                <input
                                    type="text"
                                    value={content.title}
                                    onChange={updateContentTitle(content.id)}
                                />
                            </label>
                            <label>
                                <p>Text</p>
                                <textarea
                                    value={content.content}
                                    onChange={updateContentText(content.id)}
                                />
                            </label>
                            <div>
                                <button
                                    className="button"
                                    onClick={removeCard(content.id)}
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
