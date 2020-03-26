import React, { Suspense } from "react"
import { Link, RouteComponentProps, Router } from "@reach/router"

import { useCurrentPackageContext } from "../../contexts/CurrentPackageContext"
import {
    TasksContextProvider,
    useTasksContext,
} from "../../contexts/TasksContext"

const Tasks: React.FC<RouteComponentProps> = () => {
    return (
        <TasksContextProvider>
            <Router>
                <TasksIndex path="/" />
            </Router>
        </TasksContextProvider>
    )
}

const TasksIndex: React.FC<RouteComponentProps> = () => {
    const { currentPackage } = useCurrentPackageContext()

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
                    <Suspense
                        fallback={
                            <tr>
                                <td colSpan={10000}>
                                    Lade Aufgaben. Bitte warten.
                                </td>
                            </tr>
                        }
                    >
                        <RenderTaskTableContent />
                    </Suspense>
                </tbody>
            </table>
        </>
    )
}

const RenderTaskTableContent: React.FC = () => {
    const { tasks } = useTasksContext()

    return (
        <>
            {tasks &&
                tasks.map((task) => {
                    return (
                        <tr key={`task-${task.getApiId()}`}>
                            <td>{task.getTitle()}</td>
                            <td>{task.getType()}</td>
                            <td>{task.getModified().toLocaleString()}</td>
                            <td>Bearbeiten &rarr;</td>
                        </tr>
                    )
                })}
        </>
    )
}

export default Tasks
