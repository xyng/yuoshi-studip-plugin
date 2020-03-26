import React, { Suspense } from "react"
import { Link, RouteComponentProps, Router } from "@reach/router"

import { useCurrentPackageContext } from "../../contexts/CurrentPackageContext"
import {
    TasksContextProvider,
    useTasksContext,
} from "../../contexts/TasksContext"
import { CurrentTaskContextProvider } from "../../contexts/CurrentTaskContext"
import EditTask from "../Task/EditTask"
import CreateTask from "../Task/CreateTask"

const Tasks: React.FC<RouteComponentProps> = () => {
    return (
        <TasksContextProvider>
            <Router>
                <TasksIndex path="/" />
                <CreateTask path="create" />
                <TaskSubRoute path=":taskId/*" />
            </Router>
        </TasksContextProvider>
    )
}

const TaskSubRoute: React.FC<RouteComponentProps<{
    taskId: string
}>> = ({ taskId }) => {
    return (
        <CurrentTaskContextProvider taskId={taskId}>
            <Router>
                <EditTask path="edit" />
            </Router>
        </CurrentTaskContextProvider>
    )
}

const TasksIndex: React.FC<RouteComponentProps> = () => {
    const { currentPackage } = useCurrentPackageContext()

    return (
        <>
            <Link to="/packages">Zurück</Link>
            <Link to="create">Neue Aufgabe</Link>
            <h1>Paket: {currentPackage.getTitle()}</h1>
            <table className="default">
                <caption>Aufgaben</caption>
                <thead>
                    <tr>
                        <th>Titel</th>
                        <th>Typ</th>
                        <th>Punkte</th>
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
                            <td>{task.getCredits()}</td>
                            <td>{task.getModified().toLocaleString()}</td>
                            <td>
                                <Link to={`${task.getApiId()}/edit`}>
                                    Metadaten Bearbeiten &rarr;
                                </Link>
                            </td>
                        </tr>
                    )
                })}
        </>
    )
}

export default Tasks
