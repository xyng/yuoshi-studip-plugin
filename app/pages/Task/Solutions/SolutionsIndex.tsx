import React from "react"
import { Link, RouteComponentProps } from "@reach/router"

import { useTaskSolutionsContext } from "../../../contexts/TaskSolutionsContext"
import { useCurrentTaskContext } from "../../../contexts/CurrentTaskContext"

const SolutionsIndex: React.FC<RouteComponentProps> = () => {
    const { task } = useCurrentTaskContext()
    const { taskSolutions } = useTaskSolutionsContext()

    return (
        <div>
            <Link to="../../">Zurück</Link>
            <table className="default">
                <caption>Lösungen für Aufgabe: {task.getTitle()}</caption>
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Punkte</th>
                        <th>Gespeichert</th>
                        <th>Aktionen</th>
                    </tr>
                </thead>
                <tbody>
                    {taskSolutions.length === 0 && (
                        <tr>
                            <td colSpan={1000}>
                                Für diese Aufgabe wurden noch keine Lösungen
                                abgegeben.
                            </td>
                        </tr>
                    )}
                    {taskSolutions.map((taskSolution) => {
                        return (
                            <tr key={`solution-${taskSolution.getApiId()}`}>
                                <td>
                                    {taskSolution.getUser().getFormattedName()}
                                </td>
                                <td>
                                    {taskSolution.getPoints() ||
                                        "Noch keine Punkte vergeben"}
                                </td>
                                <td>
                                    {taskSolution.getCreated().toLocaleString()}
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
