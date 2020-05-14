import React, { ChangeEventHandler, useCallback } from "react"
import { Link, RouteComponentProps } from "@reach/router"
import { Model } from "coloquent"
import { NSTaskAdapter } from "@xyng/yuoshi-backend-adapter"

import Package from "../../models/Package"
import Task from "../../models/Task"
import Content from "../../models/Content"
import { usePackagesContext } from "../../contexts/PackagesContext"
import { useCourseContext } from "../../contexts/CourseContext"
import contentTransform from "../../helpers/importContentTransformers"
import TaskTypeName = NSTaskAdapter.TaskTypeName

async function saveAndGetModelOrFail<T extends Model>(model: T): Promise<T> {
    const res = (await model.save()).getModel() as T | null

    if (!res) {
        throw new Error("could not save model.")
    }

    return res
}

function getTaskType(type: string): TaskTypeName {
    switch (type) {
        case "multi":
            return TaskTypeName.MULTI
        // TODO: add missing types
        default:
            throw new Error(`unknown task type: ${type}`)
    }
}

async function createTasks(tasks: any[], currentPackage: Package) {
    return Promise.all(
        tasks.map(async (data: any) => {
            const task = new Task()
            task.patch(data)

            // disable description for now as it may be too long for database
            task.patch({
                description: "",
            })
            task.setPackage(currentPackage)

            const savedTask = await saveAndGetModelOrFail(task)

            const taskType = getTaskType(data.kind)
            const savedContents = contentTransform[taskType](data).map(
                (content) => {
                    content.setTask(savedTask)

                    return saveContentWithRelations(content)
                }
            )

            task.setContents(await Promise.all(savedContents))

            return savedTask
        })
    )
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

            const savedPackage = await saveAndGetModelOrFail(newPackage)

            await mutatePackages((packages) => {
                return [...packages, savedPackage]
            })

            return savedPackage
        },
        [course, mutatePackages]
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
        [createPackage]
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
