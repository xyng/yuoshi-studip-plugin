import React, { useCallback, useState } from "react"
import { RouteComponentProps, Link } from "@reach/router"

import { useCurrentPackageContext } from "../../contexts/CurrentPackageContext"
import Task from "../../models/Task"
import { useTasksContext } from "../../contexts/TasksContext"
import Alert from "../../components/Alert/Alert"

import TaskForm, { TaskFormSubmitHandler } from "./TaskForm"

const CreateTask: React.FC<RouteComponentProps> = () => {
    const { currentPackage } = useCurrentPackageContext()
    const { reloadTasks } = useTasksContext()
    const [success, setSuccess] = useState<boolean>()
    const [saving, setSaving] = useState(false)

    const onSubmit = useCallback<TaskFormSubmitHandler>(
        async (values) => {
            const task = new Task()
            task.patch(values)
            task.setPackage(currentPackage)

            setSuccess(undefined)
            setSaving(true)
            const updated = (await task.save()).getModel()
            if (!updated) {
                setSuccess(false)
                setSaving(false)
                return
            }

            await reloadTasks()
            setSuccess(true)
            setSaving(false)
        },
        [reloadTasks, currentPackage]
    )

    return (
        <>
            <Link to={`/packages/${currentPackage.getApiId()}/tasks`}>
                Zurück
            </Link>
            <h1>Neue Aufgabe</h1>
            {success === false && (
                <Alert label="Fehler." appearance="error">
                    Die Aufgabe konnte nicht gespeichert werden.
                </Alert>
            )}
            {success === true && (
                <Alert label="Alles klar." appearance="success">
                    Die Aufgabe wurde erfolgreich gespeichert.
                </Alert>
            )}
            <TaskForm onSubmit={onSubmit} saving={saving} />
        </>
    )
}

export default CreateTask
