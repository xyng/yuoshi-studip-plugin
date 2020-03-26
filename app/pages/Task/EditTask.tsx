import React from "react"
import { RouteComponentProps, Link } from "@reach/router"

import { useCurrentTaskContext } from "../../contexts/CurrentTaskContext"
import { useCurrentPackageContext } from "../../contexts/CurrentPackageContext"
import Task from "../../models/Task"
import useHandleFormSubmit from "../../helpers/useHandleFormSubmit"

const taskTypes = {
    card: "Karteikarte",
    cloze: "Lückentext",
    drag: "Drag n' Drop",
    memory: "Memory",
    multi: "Multiple-Choice",
    survey: "Umfrage",
    tag: "Text markieren",
    training: "Quiz",
}

const EditTask: React.FC<RouteComponentProps> = () => {
    const { currentPackage } = useCurrentPackageContext()
    const { task, updateTask } = useCurrentTaskContext()

    const onSubmit = useHandleFormSubmit(
        ["title", "type", "description", "credits"],
        async (values) => {
            task.patch(values)

            const updated = (await task.save()).getModel()
            if (!updated) {
                // TODO: handle error
                return
            }

            await updateTask(updated as Task)
        }
    )

    return (
        <>
            <Link to={`/packages/${currentPackage.getApiId()}/tasks`}>
                Zurück
            </Link>
            <h1>Aufgabe bearbeiten: {task.getTitle()}</h1>

            <form className="default" onSubmit={onSubmit}>
                <label htmlFor="editTask_title">
                    <p>Titel</p>
                    <input
                        id="editTask_title"
                        type="text"
                        name="title"
                        defaultValue={task.getTitle()}
                    />
                </label>
                <label htmlFor="editTask_slug">
                    <p>Typ</p>
                    <select name="type" defaultValue={task.getType()}>
                        {Object.entries(taskTypes).map(([key, value]) => {
                            return (
                                <option key={`task-type-${key}`} value={key}>
                                    {value}
                                </option>
                            )
                        })}
                    </select>
                </label>
                <label htmlFor="editTask_title">
                    <p>Beschreibung</p>
                    <textarea
                        id="editTask_description"
                        name="description"
                        defaultValue={task.getDescription()}
                    />
                </label>
                <label htmlFor="editTask_credits">
                    <p>Punkte</p>
                    <input
                        id="editTask_credits"
                        type="number"
                        name="credits"
                        defaultValue={task.getCredits()}
                    />
                </label>

                <button className="button" type="submit">
                    Speichern
                </button>
            </form>
        </>
    )
}

export default EditTask
