import React, { ChangeEvent } from "react"
import { RouteComponentProps, Link } from "@reach/router"

import Package from "../../models/Package"
import Task from "../../models/Task"
import { usePackagesContext } from "../../contexts/PackagesContext"
import { useCourseContext } from "../../contexts/CourseContext"

const ImportPackage: React.FC<RouteComponentProps> = () => {
    const { reloadPackages } = usePackagesContext()
    const { course } = useCourseContext()
    let currentPackage: Package

    const createPackage = async function (title: string, slug: string) {
        const values = { title, slug }
        const newPackage = new Package()
        newPackage.patch(values)
        newPackage.setCourse(course)

        const updated = (await newPackage.save()).getModel()
        if (!updated) {
            // TODO: handle error
            return
        }

        await reloadPackages()
        currentPackage = await newPackage
        console.log(currentPackage)
    }

    const createTasks = function (tasks: Array<JSON>) {
        async function addTask(values: any) {
            const task = new Task()
            task.patch(values)
            task.setPackage(currentPackage)
            console.log(task)

            const updated = (await task.save()).getModel()
            if (!updated) {
                return
            }
        }

        tasks.map((values: any) => {
            addTask(values)
            return false
        })
    }

    const onImport = function (e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files == null) return false
        for (let i = 0; i < e.target.files.length; i++) {
            const file = e.target.files[i]
            file.text().then((text: string) => {
                const json = JSON.parse(text)
                console.log(json.title)

                createPackage(json.title, json.slug).then(() => {
                    createTasks(json.tasks)
                })
            })
        }
    }

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
