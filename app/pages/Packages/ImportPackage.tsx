import React, { ChangeEventHandler, useCallback } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { Model } from "coloquent"
import { NSTaskAdapter } from "@xyng/yuoshi-backend-adapter"

import Package from "../../models/Package"
import Quest from "../../models/Quest"
import Task from "../../models/Task"
import Answer from "../../models/Answer"
import Content from "../../models/Content"
import { usePackagesContext } from "../../contexts/PackagesContext"
import { useCourseContext } from "../../contexts/CourseContext"

import TaskTypeName = NSTaskAdapter.TaskTypeName

async function saveAndGetModelOrFail<T extends Model>(model: T): Promise<T> {
    const res = (await model.save()).getModel() as T | null

    if (!res) {
        throw new Error("could not save model.")
    }

    return res
}

//TODO Vscode
const contentTransform: {
    [key in TaskTypeName]: (data: any) => Promise<Content[]>
} = {
    [TaskTypeName.MEMORY]: async function (content) {
        return []
    },
    [TaskTypeName.CARD]: async function (content) {
        return []
    },
    [TaskTypeName.CLOZE]: async function (content) {
        return []
    },
    [TaskTypeName.DRAG]: async function (content) {
        return []
    },
    [TaskTypeName.MULTI]: async function (data) {
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
        contentModel.setQuests(await Promise.all(quests))

        return [contentModel]
    },
    [TaskTypeName.SURVEY]: async function (content) {
        return []
    },
    [TaskTypeName.TAG]: async function (content) {
        return []
    },
    [TaskTypeName.TRAINING]: async function (content) {
        return []
    },
}

const saveContentWithRelations = async (content: Content): Promise<Content> => {
    const savedContent = await saveAndGetModelOrFail(content)

    const savedQuests = content.getQuests().map(async (quest) => {
        quest.setContent(savedContent)
        const savedQuest = await saveAndGetModelOrFail(quest)

        savedQuest.setAnswers(
            await Promise.all(
                quest.getAnswers().map((answer) => {
                    answer.setQuest(savedQuest)

                    return saveAndGetModelOrFail(answer)
                })
            )
        )

        return savedQuest
    })
    savedContent.setQuests(await Promise.all(savedQuests))

    return savedContent
}

const ImportPackage: React.FC<RouteComponentProps> = () => {
    const { mutate: mutatePackages } = usePackagesContext()
    const { course } = useCourseContext()

    const createPackage = useCallback(
        async function (title: string, slug: string) {
            const values = { title, slug }

            const newPackage = new Package()
            newPackage.patch(values)
            newPackage.setCourse(course)

            const updated = saveAndGetModelOrFail(newPackage)

            await mutatePackages((packages) => {
                return [...packages, newPackage]
            })

            return updated
        },
        [course, mutatePackages]
    )

    const createContents = useCallback(async function (data: any, task: Task) {
        let contents: Content[] | null = null

        switch (data.kind) {
            case "multi":
                contents = await contentTransform.multi(data)
                break
        }

        if (!contents) {
            throw new Error(`no contents created for type ${data.kind}`)
        }

        return Promise.all(
            contents.map((content) => {
                content.setTask(task)

                return saveContentWithRelations(content)
            })
        )
    }, [])

    const createTasks = useCallback(
        function (tasks: any[], currentPackage: Package) {
            return Promise.all(
                tasks.map(async (values: any) => {
                    const task = new Task()
                    task.patch(values)

                    // disable description for now as it may be too long
                    task.patch({
                        description: "",
                    })
                    task.setPackage(currentPackage)

                    const updated = await saveAndGetModelOrFail(task)

                    task.setContents(await createContents(values, updated))

                    return updated
                })
            )
        },
        [createContents]
    )

    const onImport = useCallback<ChangeEventHandler<HTMLInputElement>>(
        async function (e) {
            if (e.target.files == null) {
                return false
            }

            for (const file of e.target.files) {
                const fileContent = new Promise<string>((resolve, reject) => {
                    const reader = new FileReader()

                    reader.onload = (event) => {
                        resolve((event.target?.result || "") as string)
                    }
                    reader.onerror = reject
                    reader.onabort = reject

                    reader.readAsText(file)
                })

                const json = JSON.parse(await fileContent)

                const title = json.tasks[0].package
                const packageItem = await createPackage(
                    title,
                    title.toLowerCase()
                )

                // we don't have to update the tasks cache as
                // that cannot exist for tasks of a new package.
                await createTasks(json.tasks, packageItem)
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
                onChange={onImport}
                multiple
            />
        </>
    )
}

export default ImportPackage
