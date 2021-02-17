import React, {
    ChangeEventHandler,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react"
import * as Yup from "yup"
import { SubmitHandler } from "@unform/core"

import { EditTaskContentView } from "../EditTaskContent"
import useGlobalContent from "../hooks/useGlobalContent"
import Button from "../../../../components/Button/Button"
import ValidatedForm from "../../../../components/Form/ValidatedForm"
import { findOrFail } from "../../../../helpers/listHelpers"
import Input from "../../../../components/Form/Input"
import TextArea from "../../../../components/Form/Textarea"

import Styles from "./EditDragContent.module.css"

const DragContentSchema = Yup.object().shape({
    contentTitle: Yup.string().required(),
    contentText: Yup.string().required(),
    contents: Yup.array().of(
        Yup.object().shape({
            id: Yup.string().required(),
            quests: Yup.array()
                .of(
                    Yup.object().shape({
                        id: Yup.string().required(),
                        name: Yup.string().required(),
                        requireOrder: Yup.boolean().required(),
                        answers: Yup.array()
                            .of(
                                Yup.object().shape({
                                    id: Yup.string().required(),
                                    content: Yup.string().required(),
                                })
                            )
                            .required(),
                    })
                )
                .required(),
        })
    ),
})
type DragContentData = Yup.InferType<typeof DragContentSchema>

const EditDragContent: EditTaskContentView = () => {
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
        onQuestUp,
        onQuestDown,
        onAnswerUp,
        onAnswerDown,
        firstContent,
    } = useGlobalContent()

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

    const createCorrectAnswer = useCallback(
        (content_id: string, quest_id: string) => {
            return createAnswer(content_id, quest_id, {
                is_correct: true,
            })
        },
        [createAnswer]
    )

    const questCount = useMemo(() => {
        return contents.reduce((acc, value) => {
            return acc + value.quests.length
        }, 0)
    }, [contents])

    const onSubmit = useCallback<SubmitHandler<DragContentData>>(
        async (value) => {
            await onModifyAndSave((contents) => {
                return value.contents.map((content) => {
                    const origContent = findOrFail(contents, "id", content.id)

                    return {
                        ...origContent,
                        title: value.contentTitle,
                        content: value.contentText,
                        quests: content.quests.map((quest) => {
                            const origQuest = findOrFail(
                                origContent.quests,
                                "id",
                                quest.id
                            )

                            return {
                                multiple: true,
                                customAnswer: false,
                                ...origQuest,
                                name: quest.name,
                                question: quest.name,
                                requireOrder: quest.requireOrder,
                                answers: quest.answers.map((answer) => {
                                    const origAnswer = findOrFail(
                                        origQuest.answers,
                                        "id",
                                        answer.id
                                    )

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
        <div>
            <h1>Drag n' Drop Aufgabe: {task.getTitle()}</h1>
            <ValidatedForm
                validation={DragContentSchema}
                initialData={{
                    contentTitle: firstContent?.title,
                    contentText: firstContent?.content,
                    contents,
                }}
                className="default"
                onSubmit={onSubmit}
            >
                <div className={Styles.settingsHeader}>
                    <label className={Styles.requireOrder}>
                        <input
                            checked={!!requireOrder}
                            onChange={updateRequireOrder}
                            type="checkbox"
                        />
                        <span>
                            Reihenfolge der Elemente bei allen Kategorien
                            beachten
                        </span>
                    </label>

                    <div className={Styles.save}>
                        <Button onClick={createQuest(firstContent.id)}>
                            Neue Kategorie
                        </Button>
                        <Button type="submit">Speichern</Button>
                    </div>
                </div>
                <div>
                    <h2>Inhalt</h2>
                    <Input label="Titel" name="contentTitle" type="text" />
                    <TextArea label="Text" name="contentText" />
                </div>
                <div className={Styles.categories}>
                    {!questCount && (
                        <span>
                            Sie müssen mindestens eine Kategorie anlegen.
                        </span>
                    )}
                    {contents.map((content, index) => {
                        const contentPath = `contents[${index}]`
                        return (
                            <React.Fragment key={`content-${content.id}`}>
                                <Input
                                    label=""
                                    name={`${contentPath}.id`}
                                    type="hidden"
                                />
                                {content.quests.map((category, index) => {
                                    const questPath = `${contentPath}.quests[${index}]`
                                    return (
                                        <div
                                            className={Styles.category}
                                            key={`category-${category.id}`}
                                        >
                                            <div>
                                                <Button
                                                    disabled={index === 0}
                                                    onClick={onQuestUp(
                                                        content.id,
                                                        category.id
                                                    )}
                                                >
                                                    &larr;
                                                </Button>
                                                <Button
                                                    disabled={
                                                        index === questCount - 1
                                                    }
                                                    onClick={onQuestDown(
                                                        content.id,
                                                        category.id
                                                    )}
                                                >
                                                    &rarr;
                                                </Button>
                                                <Button
                                                    onClick={removeQuest(
                                                        content.id,
                                                        category.id
                                                    )}
                                                >
                                                    Löschen
                                                </Button>
                                            </div>
                                            <Input
                                                label=""
                                                name={`${questPath}.id`}
                                                type="hidden"
                                            />
                                            <Input
                                                label="Titel"
                                                name={`${questPath}.name`}
                                                type="text"
                                            />
                                            <Input
                                                label="Reihenfolge der Elemente beachten"
                                                name={`${questPath}.requireOrder`}
                                                checked={category.requireOrder}
                                                onChange={onQuestInputChange(
                                                    content.id,
                                                    category.id,
                                                    "requireOrder"
                                                )}
                                                type="checkbox"
                                            />

                                            <p
                                                className={
                                                    Styles.elementsHeader
                                                }
                                            >
                                                Zugehörige Elemente
                                            </p>
                                            <div>
                                                <Button
                                                    onClick={createCorrectAnswer(
                                                        content.id,
                                                        category.id
                                                    )}
                                                >
                                                    Neues Element
                                                </Button>
                                            </div>
                                            <div className={Styles.statements}>
                                                {!category.answers.length && (
                                                    <span>
                                                        Sie müssen mindestens
                                                        ein Element anlegen.
                                                    </span>
                                                )}
                                                {category.answers.map(
                                                    (statement, index) => {
                                                        const answerPath = `${questPath}.answers[${index}]`

                                                        return (
                                                            <div
                                                                className={
                                                                    Styles.statement
                                                                }
                                                                key={`statement-${statement.id}`}
                                                            >
                                                                {category.requireOrder && (
                                                                    <>
                                                                        <Button
                                                                            disabled={
                                                                                index ===
                                                                                0
                                                                            }
                                                                            onClick={onAnswerUp(
                                                                                content.id,
                                                                                category.id,
                                                                                statement.id
                                                                            )}
                                                                        >
                                                                            &uarr;
                                                                        </Button>
                                                                        <Button
                                                                            disabled={
                                                                                index ===
                                                                                category
                                                                                    .answers
                                                                                    .length -
                                                                                    1
                                                                            }
                                                                            onClick={onAnswerDown(
                                                                                content.id,
                                                                                category.id,
                                                                                statement.id
                                                                            )}
                                                                        >
                                                                            &darr;
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                <Button
                                                                    onClick={removeAnswer(
                                                                        content.id,
                                                                        category.id,
                                                                        statement.id
                                                                    )}
                                                                >
                                                                    Löschen
                                                                </Button>

                                                                <Input
                                                                    label=""
                                                                    name={`${answerPath}.id`}
                                                                    type="hidden"
                                                                />
                                                                <Input
                                                                    label=""
                                                                    name={`${answerPath}.content`}
                                                                    type="text"
                                                                />
                                                            </div>
                                                        )
                                                    }
                                                )}
                                            </div>
                                            <div>
                                                <Button
                                                    onClick={createCorrectAnswer(
                                                        content.id,
                                                        category.id
                                                    )}
                                                >
                                                    Neues Element
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </React.Fragment>
                        )
                    })}
                </div>
            </ValidatedForm>
        </div>
    )
}

export default EditDragContent
