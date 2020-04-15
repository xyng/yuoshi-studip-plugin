import React from "react"

import TaskSolution from "../../../models/TaskSolution"
import Task from "../../../models/Task"

import { groupSolutionsByQuest } from "./helpers"
import Styles from "./DragSolutionRenderer.module.css"

const QuizSolutionRenderer: React.FC<{
    taskSolution: TaskSolution
    task: Task
}> = ({ taskSolution }) => {
    return (
        <div>
            {taskSolution.getContentSolutions().map((contentSolution) => {
                const solutionsByQuest = groupSolutionsByQuest(
                    contentSolution.getQuestSolutions()
                )
                return (
                    <div key={`content-solution-${contentSolution.getApiId()}`}>
                        <h2>
                            Abgegebene Lösung für Inhalt:{" "}
                            {contentSolution.getContent().getTitle()}
                        </h2>

                        {Object.entries(solutionsByQuest).map(
                            ([quest_id, solutions]) => {
                                if (!solutions.length) {
                                    return null
                                }

                                const questSolution = solutions[0]
                                return (
                                    <div key={`quest-${quest_id}`}>
                                        <h3>
                                            Abgegebene Lösung für Quest:{" "}
                                            {questSolution.getQuest().getName()}
                                        </h3>
                                        <div className={Styles.quests}>
                                            {solutions.map(
                                                (questSolution, index) => {
                                                    const quest = questSolution.getQuest()
                                                    return (
                                                        <div
                                                            className={
                                                                Styles.quest
                                                            }
                                                            key={`solutions-for-quest-${questSolution.getApiId()}`}
                                                        >
                                                            <h3>
                                                                Lösungsversuch #
                                                                {index + 1}
                                                            </h3>
                                                            {questSolution
                                                                .getAnswers()
                                                                .map(
                                                                    (
                                                                        answer_solution
                                                                    ) => {
                                                                        let answerText:
                                                                            | string
                                                                            | undefined

                                                                        const answer = answer_solution.getAnswer()
                                                                        if (
                                                                            !answer
                                                                        ) {
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
                                                                    }
                                                                )}
                                                        </div>
                                                    )
                                                }
                                            )}
                                        </div>
                                    </div>
                                )
                            }
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default QuizSolutionRenderer
