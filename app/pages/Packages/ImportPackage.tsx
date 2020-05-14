import React, { ChangeEvent, useCallback } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { NSTaskAdapter } from "@xyng/yuoshi-backend-adapter"

import Package from "../../models/Package"
import Quest from "../../models/Quest"
import Task from "../../models/Task"
import Answer from "../../models/Answer"
import Content from "../../models/Content"
import { usePackagesContext } from "../../contexts/PackagesContext"
import { useCourseContext } from "../../contexts/CourseContext"

import TaskTypeName = NSTaskAdapter.TaskTypeName
//TODO Vscode
const contentTransform: {
    [key in TaskTypeName]: (content: Content, data: any) => Content
} = {
    [TaskTypeName.MEMORY]: function (content, data) {
        return content
    },
    [TaskTypeName.CARD]: function (content, data) {
        return content
    },
    [TaskTypeName.CLOZE]: function (content, data) {
        return content
    },
    [TaskTypeName.DRAG]: function (content, data) {
        return content
    },

    [TaskTypeName.MULTI]: function (contentModel, data) {
        data.content.forEach(async (content: any, index: number) => {
            const question = new Quest()
            question.patch({
                name: content.question,
                question: content.question,
                multiple: content.multiple,
                require_order: false,
                custom_answer: false,
                sort: index,
            })
            question.setContent(contentModel)
            const updated = (
                await question.save()
            ).getModel() as typeof question
            if (!updated) {
                return
            }
            question.setAnswers(
                await Promise.all(
                    content.answerSet
                        .map(async (answer: string, index: number) => {
                            const answerModel = new Answer()
                            answerModel.setQuest(question)
                            answerModel.patch({
                                content: answer,
                                sort: index,
                                is_correct: true, //TODO
                            })
                            const updated = (
                                await answerModel.save()
                            ).getModel() as typeof answerModel
                            if (!updated) {
                                return
                            }
                            return answerModel
                        })
                        .filter(Boolean)
                )
            )
        })
        return contentModel
    },
    [TaskTypeName.SURVEY]: function (content, data) {
        return content
    },
    [TaskTypeName.TAG]: function (content, data) {
        return content
    },
    [TaskTypeName.TRAINING]: function (content, data) {
        return content
    },
}
const ImportPackage: React.FC<RouteComponentProps> = () => {
    // const { setContents } = useEditTaskContext
    const { mutate: mutatePackages } = usePackagesContext()
    const { course } = useCourseContext()

    const createPackage = useCallback(async function (
        title: string,
        slug: string
    ) {
        const values = { title, slug }

        const newPackage = new Package()
        newPackage.patch(values)
        newPackage.setCourse(course)

        const updated = (await newPackage.save()).getModel()
        if (!updated) {
            return
        }
        await mutatePackages((packages) => {
            return [...packages, newPackage]
        })
        return newPackage
    },
    [])

    const createContents = useCallback(async function (data: any, task: Task) {
        let content = new Content()
        content.setTask(task)

        switch (data.kind) {
            case "multi":
                content = contentTransform.multi(content, data)
                break
        }
        const updated = (await content.save()).getModel()
        if (!updated) {
            return
        }
        return updated
    }, [])

    const createTasks = useCallback(
        function (tasks: any[], currentPackage: Package) {
            return Promise.all(
                tasks.map(async (values: any) => {
                    const task = new Task()
                    task.patch(values)
                    task.setPackage(currentPackage)

                    const updated = (
                        await task.save()
                    ).getModel() as typeof task
                    if (!updated) {
                        return
                    }
                    await createContents(values, updated)

                    return updated
                })
            )
        },
        [createContents]
    )

    const onImport = useCallback(
        async function (e: ChangeEvent<HTMLInputElement>) {
            if (e.target.files == null) return false

            for (let i = 0; i < e.target.files.length; i++) {
                const file = e.target.files[i] as Blob
                // @ts-ignore
                const json = JSON.parse(await file.text())

                const title = json.tasks[0].package
                const packageItem = await createPackage(
                    title,
                    title.toLowerCase()
                )
                if (!packageItem) {
                    return
                }
                const tasks = await createTasks(json.tasks, packageItem)
            }
        },
        [createPackage, createTasks]
    )

    return (
        <>
            <Link className="button" to="/packages">
                Zurück
            </Link>
            <h1>Neues Paket</h1>
            <input
                className="button"
                type="file"
                onChange={(e) => onImport(e)}
                multiple
            />
        </>
    )
}

export default ImportPackage
