import React, { FormEventHandler } from "react"

import Task from "../../models/Task"

const TaskForm: React.FC<{
    defaultValues?: Partial<{
        title: string
        kind: string
        description: string
        credits: number
    }>
    onSubmit: FormEventHandler<HTMLFormElement>
}> = ({ onSubmit, defaultValues }) => {
    return (
        <form className="default" onSubmit={onSubmit}>
            <label htmlFor="editTask_title">
                <p>Titel</p>
                <input
                    id="editTask_title"
                    type="text"
                    name="title"
                    defaultValue={defaultValues?.title}
                />
            </label>
            <label htmlFor="editTask_kind">
                <p>Typ</p>
                <select
                    id="editTask_kind"
                    name="kind"
                    defaultValue={defaultValues?.kind}
                >
                    {Object.entries(Task.taskTypes).map(([key, value]) => {
                        return (
                            <option key={`task-type-${key}`} value={key}>
                                {value}
                            </option>
                        )
                    })}
                </select>
            </label>
            <label htmlFor="editTask_description">
                <p>Beschreibung</p>
                <textarea
                    id="editTask_description"
                    name="description"
                    defaultValue={defaultValues?.description}
                />
            </label>
            <label htmlFor="editTask_credits">
                <p>Punkte</p>
                <input
                    id="editTask_credits"
                    type="number"
                    name="credits"
                    defaultValue={defaultValues?.credits}
                />
            </label>

            <button className="button" type="submit">
                Speichern
            </button>
        </form>
    )
}

export default TaskForm
