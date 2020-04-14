import React, { useMemo } from "react"
import { Link, RouteComponentProps } from "@reach/router"

import { useTaskSolutionsContext } from "../../../contexts/TaskSolutionsContext"
import { useCurrentPackageContext } from "../../../contexts/CurrentPackageContext"
import { useCurrentUserContext } from "../../../contexts/CurrentUserContext"
import { useTasksContext } from "../../../contexts/TasksContext"

const SolutionsIndex: React.FC<RouteComponentProps> = () => {
    const { currentPackage } = useCurrentPackageContext()
    const { tasks } = useTasksContext()
    const { taskSolutions } = useTaskSolutionsContext()
    const { user } = useCurrentUserContext()

    const solutionsByTask = useMemo(() => {
        return taskSolutions.reduce<{
            [key: string]: typeof taskSolutions[0]
        }>((acc, solution) => {
            acc[solution.getTask().getApiId() || ""] = solution
            return acc
        }, {})
    }, [taskSolutions])

    return (
        <div>
            <Link className="button" to="../">
                Zurück
            </Link>
            <table className="default">
                <caption>
                    Abgaben zu Aufgaben in Paket: {currentPackage.getTitle()}
                    <br />
                    <small>von {user.getFormattedName()}</small>
                </caption>
                <thead>
                    <tr>
                        <th>Aufgabe</th>
                        <th>Punkte</th>
                        <th>Max. Punkte</th>
                        <th>Start</th>
                        <th>Ende</th>
                        <th>Aktionen</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task) => {
                        const taskSolution =
                            solutionsByTask[task.getApiId() || ""]

                        if (!taskSolution) {
                            return (
                                <tr key={`solution-${task.getApiId()}`}>
                                    <td>{task.getTitle()}</td>
                                    <td>Noch nichts abgegeben.</td>
                                    <td>{task.getCredits()}</td>
                                    <td>Noch nichts abgegeben.</td>
                                    <td>Noch nichts abgegeben.</td>
                                    <td />
                                </tr>
                            )
                        }

                        const finishedDate = taskSolution.getFinished()

                        return (
                            <tr key={`solution-${task.getApiId()}`}>
                                <td>{task.getTitle()}</td>
                                <td>
                                    {taskSolution.getPoints() ||
                                        "Noch keine Punkte vergeben"}
                                </td>
                                <td>{task.getCredits()}</td>
                                <td>
                                    {taskSolution.getCreated().toLocaleString()}
                                </td>
                                <td>
                                    {finishedDate
                                        ? finishedDate.toLocaleString()
                                        : "Noch nicht abgegeben."}
                                </td>
                                <td>
                                    <Link
                                        to={`${taskSolution.getApiId()}`}
                                        className="button"
                                    >
                                        Anzeigen
                                    </Link>
                                    <Link
                                        to={`${taskSolution.getApiId()}/rate`}
                                        className="button"
                                    >
                                        Bewertung apassen
                                    </Link>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default SolutionsIndex
