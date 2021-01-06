import React from "react"

import { SolutionRenderer } from "../RenderSolution"

import { groupSolutionsByQuest } from "./helpers"
import Styles from "./DragSolutionRenderer.module.css"

const MemorySolutionRenderer: SolutionRenderer = ({ taskSolution }) => {
    return (
        <div>
            {taskSolution.getContentSolutions().map((content) => {
                const solutionsByQuest = groupSolutionsByQuest(
                    content.getQuestSolutions()
                )

                return (
                    <div key={`content-${content.getApiId()}`}>
                        <h3>
                            Abgegebene Lösung für Inhalt:{" "}
                            {content.getContent().getTitle()}
                        </h3>
                        <div className={Styles.quests}>
                            {Object.entries(solutionsByQuest).map(
                                ([quest_id, solutions], index) => {
                                    return (
                                        <div
                                            className={Styles.quest}
                                            key={`quest-${quest_id}`}
                                        >
                                            <h3>Tupel #{index + 1}</h3>
                                            {solutions.map(
                                                (solution, index) => {
                                                    const correct = solution
                                                        .getAnswers()
                                                        .reduce(
                                                            (acc, val) =>
                                                                acc &&
                                                                val
                                                                    .getAnswer()
                                                                    .getQuest()
                                                                    .getApiId() ===
                                                                    quest_id,
                                                            true
                                                        )
                                                    return (
                                                        <div
                                                            className={
                                                                Styles.pair
                                                            }
                                                            key={`solution-${solution.getApiId()}`}
                                                        >
                                                            <h4>
                                                                Lösungsversuch #
                                                                {index + 1}
                                                            </h4>
                                                            <div
                                                                className={
                                                                    Styles.answers
                                                                }
                                                            >
                                                                {solution
                                                                    .getAnswers()
                                                                    .map(
                                                                        (
                                                                            answer
                                                                        ) => {
                                                                            return (
                                                                                <span
                                                                                    className={
                                                                                        Styles.answer
                                                                                    }
                                                                                    key={`answer-${answer.getApiId()}`}
                                                                                >
                                                                                    {answer
                                                                                        .getAnswer()
                                                                                        .getContent()}
                                                                                </span>
                                                                            )
                                                                        }
                                                                    )}
                                                            </div>
                                                            <small>
                                                                Das
                                                                Antwort-Tupel
                                                                ist{" "}
                                                                {correct
                                                                    ? "Richtig"
                                                                    : "Falsch"}
                                                            </small>
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
            })}
        </div>
    )
}

export default MemorySolutionRenderer
