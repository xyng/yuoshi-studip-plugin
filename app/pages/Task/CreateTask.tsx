import React, { useCallback } from "react"
import { RouteComponentProps, Link } from "@reach/router"

import { useCurrentStationContext } from "../../contexts/CurrentStationContext"
import { useCurrentPackageContext } from "../../contexts/CurrentPackageContext"
import Task from "../../models/Task"
import { useTasksContext } from "../../contexts/TasksContext"

import TaskForm, { TaskFormSubmitHandler } from "./TaskForm"

const CreateTask: React.FC<RouteComponentProps> = () => {
    const { station } = useCurrentStationContext()
    const { currentPackage } = useCurrentPackageContext()

    const { reloadTasks } = useTasksContext()

    const onSubmit = useCallback<TaskFormSubmitHandler>(
        async (values) => {
            const task = new Task()
            task.patch(values)
            task.setStation(station)

            const updated = (await task.save()).getModel()
            if (!updated) {
                return
            }

            await reloadTasks()
        },
        [reloadTasks, station]
    )

    return (
        <>
            <Link
                className="button"
                to={`/packages/${currentPackage.getApiId()}/stations/${station.getApiId()}/tasks`}
            >
                Zurück
            </Link>
            <h1>Neue Aufgabe</h1>
            <TaskForm onSubmit={onSubmit} />
        </>
    )
}

export default CreateTask
