import React, { useCallback } from "react"
import { RouteComponentProps, Link } from "@reach/router"

import { useCurrentPackageContext } from "../../contexts/CurrentPackageContext"
import Task from "../../models/Task"
import { useTasksContext } from "../../contexts/TasksContext"

import TaskForm, { TaskFormSubmitHandler } from "./TaskForm"

const CreateTask: React.FC<RouteComponentProps> = () => {
    const { currentPackage } = useCurrentPackageContext()
    const { reloadTasks } = useTasksContext()

    const onSubmit = useCallback<TaskFormSubmitHandler>(
        async (values) => {
            const task = new Task()
            task.patch(values)
            task.setPackage(currentPackage)

            const updated = (await task.save()).getModel()
            if (!updated) {
                // TODO: handle error
                return
            }

            await reloadTasks()
        },
        [reloadTasks, currentPackage]
    )

    return (
        <>
            <Link to={`/packages/${currentPackage.getApiId()}/tasks`}>
                Zurück
            </Link>
            <h1>Neuer Task</h1>

            <TaskForm onSubmit={onSubmit} />
        </>
    )
}

export default CreateTask
