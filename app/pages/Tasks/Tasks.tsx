import React from "react"
import { Link, RouteComponentProps } from "@reach/router"
import { PluralResponse } from "coloquent"
import useSWR from "swr"

import Task from "../../models/Task"
import { useCurrentPackageContext } from "../../contexts/CurrentPackageContext"

const fetchTasksForPackage = async (packageId: string): Promise<Task[]> => {
    const packageItem = (await Task.where(
        "package",
        packageId
    ).get()) as PluralResponse

    return packageItem.getData() as Task[]
}

const Tasks: React.FC<RouteComponentProps> = () => {
    const { currentPackage } = useCurrentPackageContext()

    const { data: tasks, error } = useSWR(
        () => [currentPackage.getApiId(), `package/tasks`],
        fetchTasksForPackage
    )

    if (error) {
        return <div>Ein Fehler ist aufgetreten.</div>
    }

    return (
        <>
            <Link to="/packages">Zurück</Link>
            <h1>Paket: {currentPackage.getTitle()}</h1>
            <table className="default">
                <caption>Aufgaben</caption>
                <thead>
                    <tr>
                        <th>Titel</th>
                        <th>Typ</th>
                        <th>Letzte Aktualisierung</th>
                        <th>Aktionen</th>
                    </tr>
                </thead>
                <tbody>
                    {!tasks && (
                        <tr>
                            <td colSpan={10000}>
                                Lade Aufgaben. Bitte warten.
                            </td>
                        </tr>
                    )}
                    {tasks &&
                        tasks.map((task) => {
                            return (
                                <tr key={`task-${task.getApiId()}`}>
                                    <td>{task.getTitle()}</td>
                                    <td>{task.getType()}</td>
                                    <td>
                                        {task.getModified().toLocaleString()}
                                    </td>
                                    <td>Bearbeiten &rarr;</td>
                                </tr>
                            )
                        })}
                </tbody>
            </table>
        </>
    )
}

export default Tasks
