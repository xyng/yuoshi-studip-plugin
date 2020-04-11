import React from "react"

import TaskSolution from "../../models/TaskSolution"
import Task from "../../models/Task"

const RenderSolution: React.FC<{
    taskSolution: TaskSolution
    task: Task
}> = ({ taskSolution, task }) => {
    return (
        <div>
            <h1>Abgegebene Lösung für Task: {task.getTitle()}</h1>
            {taskSolution.getContentSolutions().map((contentSolution) => {
                let value = contentSolution.getValue()
                if (value) {
                    value = JSON.stringify(value, undefined, 4)
                }

                return (
                    <div key={`content-solution-${contentSolution.getApiId()}`}>
                        <h2>
                            Abgegebene Lösung für Inhalt:{" "}
                            {contentSolution.getContent().getTitle()}
                        </h2>
                        <textarea disabled value={value || "Keine Eingabe"} />

                        {contentSolution
                            .getQuestSolutions()
                            .map((questSolution) => {
                                const quest = questSolution.getQuest()
                                return (
                                    <div
                                        key={`solutions-for-quest-${questSolution.getApiId()}`}
                                    >
                                        <h3>
                                            Abgegebene Lösung für Quest:{" "}
                                            {questSolution.getQuest().getName()}
                                        </h3>
                                        {questSolution
                                            .getAnswers()
                                            .map((answer_solution) => {
                                                const answer = answer_solution.getAnswer()

                                                return (
                                                    <div
                                                        key={`quest-solution-${answer_solution.getApiId()}`}
                                                    >
                                                        <p>
                                                            {answer.getContent()}
                                                        </p>
                                                        {quest.getRequireOrder() && (
                                                            <span>
                                                                {answer.getSort() ===
                                                                answer_solution.getSort()
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
