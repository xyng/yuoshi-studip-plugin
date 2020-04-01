import React from "react"
import { RouteComponentProps, Router } from "@reach/router"

import { TaskSolutionsContextProvider } from "../../../contexts/TaskSolutionsContext"
import { CurrentTaskSolutionContextProvider } from "../../../contexts/CurrentTaskSolutionContext"

import SolutionsIndex from "./SolutionsIndex"
import SolutionShow from "./SolutionShow"
import SolutionRate from "./SolutionRate"

const Solutions: React.FC<RouteComponentProps> = () => {
    return (
        <TaskSolutionsContextProvider>
            <Router>
                <SolutionsIndex path="/" />
                <SolutionRoutes path=":solutionId/*" />
            </Router>
        </TaskSolutionsContextProvider>
    )
}

const SolutionRoutes: React.FC<RouteComponentProps<{
    solutionId: string
}>> = ({ solutionId }) => {
    if (!solutionId) {
        return null
    }

    return (
        <CurrentTaskSolutionContextProvider taskSolutionId={solutionId}>
            <Router>
                <SolutionShow path="/" />
                <SolutionRate path="rate" />
            </Router>
        </CurrentTaskSolutionContextProvider>
    )
}

export default Solutions
