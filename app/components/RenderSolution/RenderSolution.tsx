import React, { useMemo } from "react"
import { groupBy, orderBy } from "lodash"

import TaskSolution from "../../models/TaskSolution"
import Task from "../../models/Task"

const RenderSolution: React.FC<{
    taskSolution: TaskSolution
    task: Task
}> = ({ taskSolution, task }) => {
    const mappedData = useMemo(() => {
        return taskSolution.getContentSolutions().map((contentSolution) => {
            return {
                model: contentSolution,
                solutionsByQuest: Object.values(
                    groupBy(contentSolution.getQuestSolutions(), (s) => {
                        return s.getQuest().getApiId()
                    })
                ).map((solutions) => {
                    return {
                        quest: solutions[0].getQuest(),
                        solutions: orderBy(solutions, (s) => s.getSort()),
                    }
                }),
            }
        })
    }, [taskSolution])

    return (
        <div>
            <h1>Abgegebene Lösung für Task: {task.getTitle()}</h1>
            {mappedData.map(({ model: contentSolution, solutionsByQuest }) => {
                return (
                    <div key={`content-solution-${contentSolution.getApiId()}`}>
                        <h2>
                            Abgegebene Lösung für Inhalt:{" "}
                            {contentSolution.getContent().getTitle()}
                        </h2>
                        <textarea
                            disabled
                            value={
                                contentSolution.getValue() || "Keine Eingabe"
                            }
                        />

                        {solutionsByQuest.map(({ quest, solutions }) => {
                            return (
                                <div
                                    key={`solutions-for-quest-${quest.getApiId()}`}
                                >
                                    <h3>
                                        Abgegebene Lösung für Quest:{" "}
                                        {quest.getName()}
                                    </h3>
                                    {solutions.map((quest_solution) => {
                                        const answer = quest_solution.getAnswer()

                                        return (
                                            <div
                                                key={`quest-solution-${quest_solution.getApiId()}`}
                                            >
                                                <p>{answer.getContent()}</p>
                                                {quest.getRequireOrder() && (
                                                    <span>
                                                        {answer.getSort() ===
                                                        quest_solution.getSort()
                                                            ? "Richtige Reihenfolge"
                                                            : "Falsche Reihenfolge"}
                                                    </span>
                                                )}
                                                <span>
                                                    {answer.getIsCorrect() &&
                                                    answer
                                                        .getQuest()
                                                        .getApiId() ===
                                                        quest.getApiId()
                                                        ? "Richtig"
                                                        : "Falsch"}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </div>
                )
            })}
        </div>
    )
}

export default RenderSolution
