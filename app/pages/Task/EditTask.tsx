import React, { useCallback, useState } from "react"
import { RouteComponentProps, Link } from "@reach/router"

import { useCurrentTaskContext } from "../../contexts/CurrentTaskContext"
import { useCurrentPackageContext } from "../../contexts/CurrentPackageContext"
import Task from "../../models/Task"
import Alert from "../../components/Alert/Alert"

import TaskForm, { TaskFormSubmitHandler } from "./TaskForm"

const EditTask: React.FC<RouteComponentProps> = () => {
    const { currentPackage } = useCurrentPackageContext()
    const { task, updateTask } = useCurrentTaskContext()
    const [success, setSuccess] = useState<boolean>()
    const [saving, setSaving] = useState(false)

    const onSubmit = useCallback<TaskFormSubmitHandler>(
        async (values) => {
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

            await updateTask(updated as Task)
            setSuccess(true)
            setSaving(false)
        },
        [task, updateTask]
    )

    return (
        <>
            <Link to={`/packages/${currentPackage.getApiId()}/tasks`}>
                Zurück
            </Link>
            <h1>Aufgabe bearbeiten: {task.getTitle()}</h1>
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

            <TaskForm
                defaultValues={{
                    title: task.getTitle(),
                    kind: task.getType(),
                    description: task.getDescription(),
                    credits: task.getCredits(),
                }}
                saving={saving}
                onSubmit={onSubmit}
            />
        </>
    )
}

export default EditTask
