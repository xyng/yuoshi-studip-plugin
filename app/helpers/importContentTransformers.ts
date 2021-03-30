import { NSTaskAdapter } from "@xyng/yuoshi-backend-adapter"

import Content from "../models/Content"
import Quest from "../models/Quest"
import Answer from "../models/Answer"

import TaskTypeName = NSTaskAdapter.TaskTypeName

const contentTransform: {
    [key in TaskTypeName]: (data: any) => Content[]
} = {
    [TaskTypeName.MEMORY]: function (data) {
        const { content: contents } = data
        if (!(contents instanceof Array)) {
            throw new Error("invalid data given")
        }
        const contentModel = new Content()

        const quests = contents.map((content, index) => {
            const question = new Quest()
            question.patch({
                name: content.question,
                question: content.question,
                multiple: !!content.multi,
                require_order: false,
                custom_answer: false,
                sort: index++,
            })

            const answers = content.answerSet
                .map((answer: string, index: number) => {
                    const answerModel = new Answer()
                    answerModel.patch({
                        content: answer,
                        sort: index,
                        is_correct: true, //TODO
                    })

                    return answerModel
                })
                .filter(Boolean)

            question.setAnswers(answers)

            return question
        })

        contentModel.patch({
            title: data.title,
            content: data.description,
        })
        contentModel.setQuests(quests)

        return [contentModel]
    },
    [TaskTypeName.CARD]: function (content) {
        return []
    },

    [TaskTypeName.CLOZE]: function (data) {
        const { content: contents } = data
        if (!(contents instanceof Array)) {
            throw new Error("invalid data given")
        }
        const contentModel = new Content()

        const quests = contents.map((content, index) => {
            const question = new Quest()
            question.patch({
                name: content.question,
                question: content.question,
                multiple: !!content.multi,
                require_order: false,
                custom_answer: false,
                sort: index++,
            })

            const answers = content.answerSet
                .map((answer: string, index: number) => {
                    const answerModel = new Answer()
                    answerModel.patch({
                        content: answer,
                        sort: index,
                        is_correct: true, //TODO
                    })

                    return answerModel
                })
                .filter(Boolean)

            question.setAnswers(answers)

            return question
        })
        contentModel.patch({
            title: data.title,
            content: data.description,
        })
        contentModel.setQuests(quests)

        return [contentModel]
    },
    [TaskTypeName.DRAG]: function (data) {
        const { content: contents } = data
        if (!(contents instanceof Array)) {
            throw new Error("invalid data given")
        }
        const contentModel = new Content()

        const quests = contents.map((content, index) => {
            const question = new Quest()
            question.patch({
                name: content.question,
                question: content.question,
                multiple: !!content.multi,
                require_order: false,
                custom_answer: false,
                sort: index++,
            })

            const answers = content.answerSet
                .map((answer: string, index: number) => {
                    const answerModel = new Answer()
                    answerModel.patch({
                        content: answer,
                        sort: index,
                        is_correct: true, //TODO
                    })

                    return answerModel
                })
                .filter(Boolean)

            question.setAnswers(answers)

            return question
        })
        contentModel.patch({
            title: data.title,
            content: data.description,
        })
        contentModel.setQuests(quests)

        return [contentModel]
    },
    [TaskTypeName.MULTI]: function (data) {
        const { content: contents } = data
        if (!(contents instanceof Array)) {
            throw new Error("invalid data given")
        }

        const contentModel = new Content()

        const quests = contents.map((content, index) => {
            const question = new Quest()
            question.patch({
                name: content.question,
                question: content.question,
                multiple: !!content.multi,
                require_order: false,
                custom_answer: false,
                sort: index++,
            })

            const answers = content.answerSet
                .map((answer: string, index: number) => {
                    const answerModel = new Answer()
                    answerModel.patch({
                        content: answer,
                        sort: index,
                        is_correct: true, //TODO
                    })

                    return answerModel
                })
                .filter(Boolean)

            question.setAnswers(answers)

            return question
        })

        contentModel.patch({
            title: data.title,
            content: data.description,
        })
        contentModel.setQuests(quests)

        return [contentModel]
    },
    [TaskTypeName.SURVEY]: function (content) {
        return []
    },
    [TaskTypeName.TAG]: function (data) {
        const { content: contents } = data
        if (!(contents instanceof Array)) {
            throw new Error("invalid data given")
        }
        const contentModel = new Content()

        const quests = contents.map((content, index) => {
            const question = new Quest()
            question.patch({
                name: content.question,
                question: content.question,
                multiple: !!content.multi,
                require_order: false,
                custom_answer: false,
                sort: index++,
            })

            const answers = content.answerSet
                .map((answer: string, index: number) => {
                    const answerModel = new Answer()
                    answerModel.patch({
                        content: answer,
                        sort: index,
                        is_correct: true, //TODO
                    })

                    return answerModel
                })
                .filter(Boolean)

            question.setAnswers(answers)

            return question
        })
        contentModel.patch({
            title: data.title,
            content: data.description,
        })
        contentModel.setQuests(quests)

        return [contentModel]
    },
    [TaskTypeName.TRAINING]: function (content) {
        return []
    },
}

export default contentTransform
