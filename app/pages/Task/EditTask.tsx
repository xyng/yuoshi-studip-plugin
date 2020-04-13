import React, { useCallback } from "react"
import { RouteComponentProps, Link } from "@reach/router"

import { useCurrentTaskContext } from "../../contexts/CurrentTaskContext"
import { useCurrentPackageContext } from "../../contexts/CurrentPackageContext"
import Task from "../../models/Task"

import TaskForm, { TaskFormSubmitHandler } from "./TaskForm"

const EditTask: React.FC<RouteComponentProps> = () => {
    const { currentPackage } = useCurrentPackageContext()
    const { task, updateTask } = useCurrentTaskContext()

    const onSubmit = useCallback<TaskFormSubmitHandler>(
        async (values) => {
            task.patch(values)

            const updated = (await task.save()).getModel()
            if (!updated) {
                // TODO: handle error
                return
            }

            await updateTask(updated as Task)
        },
        [task, updateTask]
    )

    return (
        <>
            <Link to={`/packages/${currentPackage.getApiId()}/tasks`}>
                Zurück
            </Link>
            <h1>Aufgabe bearbeiten: {task.getTitle()}</h1>

            <TaskForm
                defaultValues={{
                    title: task.getTitle(),
                    kind: task.getType(),
                    description: task.getDescription(),
                    credits: task.getCredits(),
                }}
                onSubmit={onSubmit}
            />
        </>
    )
}

export default EditTask
