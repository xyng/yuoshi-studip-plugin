import React from "react"

import { SolutionRenderer } from "../RenderSolution"

const TagSolutionRenderer: SolutionRenderer = ({ taskSolution }) => {
    return (
        <div>
            {taskSolution.getContentSolutions().map((content) => {
                return (
                    <React.Fragment key={`content-${content.getApiId()}`}>
                        <h2>
                            Gefundene Tags im Inhalt:{" "}
                            {content.getContent().getTitle()}
                        </h2>
                        {content
                            .getQuestSolutions()
                            .map((questSolution, index) => {
                                return (
                                    <React.Fragment
                                        key={`solution-${questSolution.getApiId()}`}
                                    >
                                        <div>
                                            <h3>Lösungsversuch #{index + 1}</h3>
                                            <ul>
                                                {questSolution
                                                    .getAnswers()
                                                    .map((answer) => {
                                                        return (
                                                            <li
                                                                key={`answer-${answer.getApiId()}`}
                                                            >
                                                                {answer
                                                                    .getAnswer()
                                                                    .getContent()}
                                                            </li>
                                                        )
                                                    })}
                                            </ul>
                                        </div>
                                    </React.Fragment>
                                )
                            })}
                    </React.Fragment>
                )
            })}
        </div>
    )
}

export default TagSolutionRenderer
