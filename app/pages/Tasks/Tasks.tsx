import React, { Suspense, useCallback } from "react"
import { Link, RouteComponentProps, Router } from "@reach/router"

import { useCurrentPackageContext } from "../../contexts/CurrentPackageContext"
import {
    TasksContextProvider,
    useTasksContext,
} from "../../contexts/TasksContext"
import { CurrentTaskContextProvider } from "../../contexts/CurrentTaskContext"
import EditTask from "../Task/EditTask"
import CreateTask from "../Task/CreateTask"
import Task from "../../models/Task"
import Button from "../../components/Button/Button"

const EditTaskContent = React.lazy(() =>
    import("../Task/EditTaskContent/EditTaskContent")
)

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
                <EditTaskContent path="edit" />
                <EditTask path="meta" />
            </Router>
        </CurrentTaskContextProvider>
    )
}

const TasksIndex: React.FC<RouteComponentProps> = () => {
    const { currentPackage } = useCurrentPackageContext()

    const onClick = useCallback(
        async (values) => {
            // generate export url
            const url = new URL(window.location.href)
            url.search = ""
            url.hash = ""
            url.pathname =
                "jsonapi.php/v1/packages/export/" + currentPackage.getApiId()

            // create xhr request
            try {
                const res = await fetch(url.href, {
                    method: "GET",
                    credentials: "include",
                })
                if (res.status >= 400) {
                    console.log(res.status)
                } else {
                    let json = await res.json()
                    let filename = json.package.title

                    // generate downloadable blob from json
                    let blob = new Blob([JSON.stringify(json)], {
                        type: "application/json",
                    })
                    // create temporary download anchor
                    let a = document.createElement("a")
                    document.body.append(a)
                    // set download url
                    let url = window.URL.createObjectURL(blob)
                    a.href = url
                    // set filename
                    a.download = filename + ".json"
                    // start download
                    a.click()

                    // remove download anchor
                    document.body.removeChild(a)
                    window.URL.revokeObjectURL(url)
                }
            } catch (e) {
                console.log(e)
            }
        },
        [currentPackage]
    )

    return (
        <>
            <h1>Paket: {currentPackage.getTitle()}</h1>
            <Link className="button" to="/packages">
                Zurück
            </Link>
            <Link className="button" to="create">
                Neue Aufgabe
            </Link>
            <button className="button" onClick={onClick}>
                Paket exportieren
            </button>
            <table className="default">
                <caption>Aufgaben</caption>
                <thead>
                    <tr>
                        <th>Position</th>
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
    const { tasks, reloadTasks, mutate } = useTasksContext()

    const onRemove = useCallback(
        (id?: string) => async () => {
            if (!id) {
                return
            }

            const entity = tasks.find((t) => t.getApiId() === id)

            if (!entity) {
                return
            }

            await entity.delete()
            await reloadTasks()
        },
        [tasks, reloadTasks]
    )

    const moveTask = useCallback(
        async (taskId: string, direction: number) => {
            const taskIndex = tasks.findIndex((p) => p.getApiId() === taskId)

            if (taskIndex === -1) {
                return
            }

            if (
                (taskIndex === 0 && direction < 0) ||
                (taskIndex === tasks.length - 1 && direction > 0)
            ) {
                return
            }

            await mutate((tasks) => {
                let current = 0
                return tasks
                    .map((taskItem, index) => {
                        taskItem = taskItem.clone<Task>()

                        if (index === taskIndex) {
                            taskItem.setSort(taskItem.getSort() + direction)
                        }

                        return taskItem
                    })
                    .sort((a, b) => {
                        return a.getSort() - b.getSort()
                    })
                    .map((p) => {
                        p.setSort(current++)
                        p.save()

                        return p
                    })
            }, true)
        },
        [tasks, mutate]
    )

    const taskUp = useCallback(
        (taskId: string) => async () => {
            await moveTask(taskId, -2)
        },
        [moveTask]
    )

    const taskDown = useCallback(
        (taskId: string) => async () => {
            await moveTask(taskId, 2)
        },
        [moveTask]
    )

    return (
        <>
            {tasks &&
                tasks.map((task) => {
                    return (
                        <tr key={`task-${task.getApiId()}`}>
                            <td>
                                <span className="pr">{task.getSort() + 1}</span>
                                {tasks.length > 1 && (
                                    <>
                                        <Button
                                            fixMargin
                                            small
                                            onClick={taskUp(
                                                task.getApiId() as string
                                            )}
                                        >
                                            &uarr;
                                        </Button>
                                        <Button
                                            fixMargin
                                            small
                                            onClick={taskDown(
                                                task.getApiId() as string
                                            )}
                                        >
                                            &darr;
                                        </Button>
                                    </>
                                )}
                            </td>
                            <td>{task.getTitle()}</td>
                            <td>{Task.taskTypes[task.getType()]}</td>
                            <td>{task.getCredits()}</td>
                            <td>{task.getModified().toLocaleString()}</td>
                            <td>
                                <Link
                                    className="button"
                                    to={`${task.getApiId()}/meta`}
                                >
                                    Metadaten Bearbeiten
                                </Link>
                                <Link
                                    className="button"
                                    to={`${task.getApiId()}/edit`}
                                >
                                    Inhalte bearbeiten
                                </Link>
                                <button
                                    className="button"
                                    onClick={onRemove(task.getApiId())}
                                >
                                    Löschen
                                </button>
                            </td>
                        </tr>
                    )
                })}
        </>
    )
}

export default Tasks
