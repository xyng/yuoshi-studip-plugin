import React from "react"

import TaskSolution from "../../../models/TaskSolution"
import Task from "../../../models/Task"

const DefaultSolutionRenderer: React.FC<{
    taskSolution: TaskSolution
    task: Task
}> = ({ taskSolution }) => {
    return (
        <div>
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
                                                let answerText:
                                                    | string
                                                    | undefined

                                                const answer = answer_solution.getAnswer()
                                                if (!answer) {
                                                    answerText = answer_solution.getCustom()
                                                } else {
                                                    answerText = answer.getContent()
                                                }

                                                return (
                                                    <div
                                                        key={`quest-solution-${answer_solution.getApiId()}`}
                                                    >
                                                        <p>
                                                            {answerText ||
                                                                "Keine Antwort eingegeben"}
                                                        </p>
                                                        {!answer && (
                                                            <small>
                                                                Freitext-Antwort
                                                            </small>
                                                        )}
                                                        {quest.getRequireOrder() && (
                                                            <span>
                                                                {answer.getSort() ===
                                                                answer_solution.getSort()
                                                                    ? "Richtige Reihenfolge"
                                                                    : "Falsche Reihenfolge"}
                                                            </span>
                                                        )}
                                                        {answer && (
                                                            <span>
                                                                {answer.getIsCorrect() &&
                                                                answer
                                                                    .getQuest()
                                                                    .getApiId() ===
                                                                    quest.getApiId()
                                                                    ? "Richtig"
                                                                    : "Falsch"}
                                                            </span>
                                                        )}
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

export default DefaultSolutionRenderer
