import React, { ComponentProps, useCallback, useMemo } from "react"
import * as Yup from "yup"
import { SubmitHandler } from "@unform/core"

import { EditTaskContentView } from "../EditTaskContent"
import Button from "../../../../components/Button/Button"
import { QuizAnswer, QuizContent, QuizQuest } from "../useEditTaskContent"
import ValidatedForm from "../../../../components/Form/ValidatedForm"
import Input from "../../../../components/Form/Input"

import Styles from "./EditQuizContent.module.css"

type EditTaskContext = ComponentProps<EditTaskContentView>["editTaskContext"]

type getInputName = (append: string) => string

const AnswerValidation = Yup.object().shape({
    id: Yup.string().required(),
    content: Yup.string().required(),
    is_correct: Yup.boolean().required(),
})

const RenderAnswerForm: React.FC<{
    content: QuizContent
    quest: QuizQuest
    answer: QuizAnswer
    index: number
    getInputName: getInputName
    editTaskContext: EditTaskContext
}> = ({ content, quest, answer, getInputName, editTaskContext, index }) => {
    const { onAnswerUp, onAnswerDown, removeAnswer } = editTaskContext

    const getAnswerInputName = useCallback<getInputName>(
        (append) => {
            return getInputName(`answers[${index}].${append}`)
        },
        [getInputName, index]
    )

    return (
        <div className={Styles.answer}>
            <div className={Styles.answerHeader}>
                <span className={Styles.answerHeaderText}>
                    Antwort #{index + 1}
                </span>
                <div className={Styles.headerButtons}>
                    {quest.requireOrder && (
                        <>
                            <Button
                                fixMargin
                                disabled={index === 0}
                                onClick={onAnswerUp(
                                    content.id,
                                    quest.id,
                                    answer.id
                                )}
                            >
                                &uarr;
                            </Button>
                            <Button
                                fixMargin
                                disabled={index === quest.answers.length - 1}
                                onClick={onAnswerDown(
                                    content.id,
                                    quest.id,
                                    answer.id
                                )}
                            >
                                &darr;
                            </Button>
                        </>
                    )}
                    <Button
                        fixMargin
                        onClick={removeAnswer(content.id, quest.id, answer.id)}
                    >
                        Entfernen
                    </Button>
                </div>
            </div>
            <Input label="" name={getAnswerInputName("id")} type="hidden" />
            <Input
                label="Antwort"
                name={getAnswerInputName("content")}
                type="text"
            />
            <Input
                label="Korrekte Antwort"
                name={getAnswerInputName("is_correct")}
                type="checkbox"
            />
        </div>
    )
}

const QuestValidation = Yup.object().shape({
    id: Yup.string().required(),
    name: Yup.string().required(),
    question: Yup.string().required(),
    prePhrase: Yup.string().notRequired(),
    requireOrder: Yup.boolean().required(),
    multiple: Yup.boolean().required(),
    customAnswer: Yup.boolean().required(),
    answers: Yup.array().of(AnswerValidation),
})

const RenderQuestForm: React.FC<{
    content: QuizContent
    quest: QuizQuest
    index: number
    getInputName: getInputName
    editTaskContext: EditTaskContext
}> = ({ content, quest, index, getInputName, editTaskContext }) => {
    const {
        onQuestUp,
        onQuestDown,
        removeQuest,
        createAnswer,
    } = editTaskContext

    const getQuestInputName = useCallback<getInputName>(
        (append) => {
            return getInputName(`quests[${index}].${append}`)
        },
        [getInputName, index]
    )

    return (
        <details className={Styles.quest}>
            <summary className={Styles.toggleContent}>
                <span>Frage: {quest.name}</span>
                <div className={Styles.toggleContentButton}>
                    <Button
                        fixMargin
                        disabled={index === 0}
                        onClick={onQuestUp(content.id, quest.id)}
                    >
                        &uarr;
                    </Button>
                    <Button
                        fixMargin
                        disabled={index === content.quests.length - 1}
                        onClick={onQuestDown(content.id, quest.id)}
                    >
                        &darr;
                    </Button>
                    <Button
                        fixMargin
                        onClick={removeQuest(content.id, quest.id)}
                    >
                        Löschen
                    </Button>
                </div>
            </summary>
            <div className={Styles.contentMain}>
                <Input label="" name={getQuestInputName("id")} type="hidden" />
                <Input
                    label="Name"
                    name={getQuestInputName("name")}
                    type="text"
                />
                <Input
                    label="Frage"
                    name={getQuestInputName("question")}
                    type="text"
                />
                <Input
                    label="Text"
                    name={getQuestInputName("prePhrase")}
                    type="text"
                />
                <Input
                    label="Reihenfolge der Antworten beachten"
                    name={getQuestInputName("requireOrder")}
                    type="checkbox"
                />
                <Input
                    label="Mehrere Antworten möglich"
                    name={getQuestInputName("multiple")}
                    type="checkbox"
                />
                <Input
                    label="Eigene Antwort (Freitext) möglich"
                    name={getQuestInputName("customAnswer")}
                    type="checkbox"
                />

                <div className={Styles.header}>
                    <span className={Styles.heading}>Antworten</span>
                    <div className={Styles.headerButtons}>
                        <Button
                            fixMargin
                            onClick={createAnswer(content.id, quest.id)}
                        >
                            Neue Antwort
                        </Button>
                    </div>
                </div>
                <div>
                    {quest.answers.map((answer, index) => (
                        <RenderAnswerForm
                            content={content}
                            quest={quest}
                            answer={answer}
                            index={index}
                            editTaskContext={editTaskContext}
                            key={`quiz-answer-${answer.id}`}
                            getInputName={getQuestInputName}
                        />
                    ))}
                </div>
                {quest.answers.length === 0 && (
                    <span>
                        Es sind noch keine Antworten vorhanden. Legen Sie eine
                        Neue an!
                    </span>
                )}
            </div>
        </details>
    )
}

const RenderContentForm: React.FC<{
    index: number
    content: QuizContent
    editTaskContext: EditTaskContext
}> = ({ index, content, editTaskContext }) => {
    const { createQuest, removeContent } = editTaskContext

    const getInputName = useCallback<getInputName>(
        (append) => {
            return `contents[${index}].${append}`
        },
        [index]
    )

    return (
        <details className={Styles.content} open={index === 0}>
            <summary className={Styles.toggleContent}>
                <span>
                    {content.title.length
                        ? `Inhalt: ${content.title}`
                        : "Neuer Inhalt"}
                </span>
                <div className={Styles.toggleContentButton}>
                    <Button fixMargin onClick={removeContent(content.id)}>
                        Löschen
                    </Button>
                </div>
            </summary>
            <div className={Styles.contentMain}>
                <span className={Styles.heading}>Meta-Informationen</span>
                <Input label="" name={`contents[${index}].id`} type="hidden" />
                <Input label="Title" name={getInputName("title")} type="text" />
                <Input
                    label="Text"
                    name={getInputName("content")}
                    type="text"
                />
                <div className={Styles.header}>
                    <span className={Styles.heading}>Fragen</span>
                    <div className={Styles.headerButtons}>
                        <Button fixMargin onClick={createQuest(content.id)}>
                            Neue Frage
                        </Button>
                    </div>
                </div>
                {content.quests.map((quest, index) => (
                    <RenderQuestForm
                        index={index}
                        content={content}
                        quest={quest}
                        editTaskContext={editTaskContext}
                        getInputName={getInputName}
                        key={`quiz-quest-${quest.id}`}
                    />
                ))}
                {content.quests.length === 0 && (
                    <span>
                        Es sind noch keine Fragen vorhanden. Legen Sie eine Neue
                        an!
                    </span>
                )}
            </div>
        </details>
    )
}

export const QuizValidation = Yup.object().shape({
    contents: Yup.array().of(
        Yup.object().shape({
            id: Yup.string().required(),
            title: Yup.string().required(),
            content: Yup.string().required(),
            intro: Yup.string().notRequired(),
            outro: Yup.string().notRequired(),
            quests: Yup.array().of(QuestValidation),
        })
    ),
})

export type QuizFormData = Yup.InferType<typeof QuizValidation>
export type QuizFormSubmitHandler = SubmitHandler<QuizFormData>

export const handleFormSubmit = (
    onModifyAndSave: EditTaskContext["onModifyAndSave"]
): QuizFormSubmitHandler => async (data) => {
    await onModifyAndSave((localContents) =>
        data.contents.map((content) => {
            const localContent = localContents.find((c) => c.id === content.id)

            if (!localContent) {
                throw new Error("data integrity problem")
            }

            return {
                ...content,
                quests: content.quests.map((quest) => {
                    const localQuest = localContent.quests.find(
                        (q) => q.id === quest.id
                    )
                    if (!localQuest) {
                        throw new Error("data integrity problem")
                    }
                    return {
                        ...quest,
                        sort: localQuest.sort,
                        answers: quest.answers.map((answer) => {
                            const localAnswer = localQuest.answers.find(
                                (a) => a.id === answer.id
                            )
                            if (!localAnswer) {
                                throw new Error("data integrity problem")
                            }
                            return {
                                ...answer,
                                sort: localAnswer.sort,
                            }
                        }),
                    }
                }),
            }
        })
    )
}

const EditQuizContent: EditTaskContentView = ({ editTaskContext }) => {
    const { contents, createContent, onModifyAndSave } = editTaskContext

    const onSubmit = useMemo<QuizFormSubmitHandler>(
        () => handleFormSubmit(onModifyAndSave),
        [onModifyAndSave]
    )

    return (
        <ValidatedForm
            validation={QuizValidation}
            initialData={{
                contents,
            }}
            className="default"
            onSubmit={onSubmit}
        >
            <Button onClick={createContent()}>Inhalt hinzufügen</Button>
            <Button type="submit">Speichern</Button>
            <div className={Styles.container}>
                {contents.map((content, index) => (
                    <RenderContentForm
                        index={index}
                        content={content}
                        editTaskContext={editTaskContext}
                        key={`quiz-content-${content.id}`}
                    />
                ))}
            </div>
            {contents.length === 0 && (
                <span>
                    Es sind noch keine Inhalte vorhanden. Legen Sie einen Neuen
                    an!
                </span>
            )}
        </ValidatedForm>
    )
}

export default EditQuizContent
