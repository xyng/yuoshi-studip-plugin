import React from "react"

import { SolutionRenderer } from "../RenderSolution"

import Styles from "./DragSolutionRenderer.module.css"
import { answerComparator, groupSolutionsByQuest } from "./helpers"

const DragSolutionRenderer: SolutionRenderer = ({ taskSolution }) => {
    return (
        <div>
            {taskSolution.getContentSolutions().map((content) => {
                const solutionsByQuest = groupSolutionsByQuest(
                    content.getQuestSolutions()
                )

                return (
                    <React.Fragment key={`content-${content.getApiId()}`}>
                        <h2>
                            Zuordnungen in Inhalt:{" "}
                            {content.getContent().getTitle()}
                        </h2>

                        <div className={Styles.quests}>
                            {Object.entries(solutionsByQuest).map(
                                ([quest_id, solutions]) => {
                                    if (solutions.length === 0) {
                                        return null
                                    }

                                    return (
                                        <div
                                            className={Styles.quest}
                                            key={`quest-${quest_id}`}
                                        >
                                            <h3>
                                                Lösungen für Kategorie:{" "}
                                                {solutions[0]
                                                    .getQuest()
                                                    .getName()}
                                            </h3>
                                            {solutions.map(
                                                (solution, index) => {
                                                    return (
                                                        <div
                                                            key={`solution-${solution.getApiId()}`}
                                                        >
                                                            <h4>
                                                                Lösungsversuch #
                                                                {index + 1}
                                                            </h4>
                                                            <ol>
                                                                {solution
                                                                    .getAnswers()
                                                                    .sort(
                                                                        answerComparator
                                                                    )
                                                                    .map(
                                                                        (
                                                                            answer
                                                                        ) => {
                                                                            return (
                                                                                <li
                                                                                    key={`answer-${answer.getApiId()}`}
                                                                                >
                                                                                    {answer
                                                                                        .getAnswer()
                                                                                        .getContent()}
                                                                                </li>
                                                                            )
                                                                        }
                                                                    )}
                                                            </ol>
                                                        </div>
                                                    )
                                                }
                                            )}
                                        </div>
                                    )
                                }
                            )}
                        </div>
                    </React.Fragment>
                )
            })}
        </div>
    )
}

export default DragSolutionRenderer
