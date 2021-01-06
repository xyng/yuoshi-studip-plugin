import React from "react"

import { SolutionRenderer } from "../RenderSolution"

import Styles from "./CardSolutionRenderer.module.css"

const CardSolutionRenderer: SolutionRenderer = ({ taskSolution }) => {
    return (
        <div>
            {taskSolution.getContentSolutions().map((content) => {
                return (
                    <details
                        className={Styles.card}
                        key={`content-${content.getApiId()}`}
                    >
                        <summary className={Styles.cardSummary}>
                            Abgegebene Lösung für:{" "}
                            {content.getContent().getTitle()}
                        </summary>

                        <div className={Styles.cardContent}>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: content.getValue()?.value,
                                }}
                            />
                        </div>
                    </details>
                )
            })}
        </div>
    )
}

export default CardSolutionRenderer
