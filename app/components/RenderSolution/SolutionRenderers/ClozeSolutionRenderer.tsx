import React from "react"
import {
    matchImage,
    matchInput,
    parseContentMultiple,
} from "@xyng/yuoshi-backend-adapter"

import { SolutionRenderer } from "../RenderSolution"

import Style from "./ClozeSolutionRenderer.module.css"

const parseContent = (content: string) =>
    parseContentMultiple(content, [matchImage, matchInput])

const ClozeSlutionRenderer: SolutionRenderer = ({ task, taskSolution }) => {
    return (
        <div>
            {taskSolution.getContentSolutions().map((content) => {
                const parts = parseContent(content.getContent().getContent())
                return (
                    <React.Fragment key={`content-${content.getApiId()}`}>
                        {parts.map(({ id, name, content: text }, index) => {
                            let value = undefined
                            if (name === "input" && id) {
                                value = content.getValue()[`input-${id}`]
                            }

                            return (
                                <p
                                    key={`part-${
                                        id ? `${name}-${id}` : `index-${index}`
                                    }`}
                                >
                                    <span>{text}</span>
                                    {value && (
                                        <span className={Style.huge}>
                                            {value}
                                        </span>
                                    )}
                                </p>
                            )
                        })}
                    </React.Fragment>
                )
            })}
        </div>
    )
}

export default ClozeSlutionRenderer
