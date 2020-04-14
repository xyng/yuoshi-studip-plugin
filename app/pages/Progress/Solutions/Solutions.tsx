import React from "react"
import { RouteComponentProps, Router } from "@reach/router"

import { TaskSolutionsContextProvider } from "../../../contexts/TaskSolutionsContext"
import { CurrentTaskSolutionContextProvider } from "../../../contexts/CurrentTaskSolutionContext"
import { TasksContextProvider } from "../../../contexts/TasksContext"
import { CurrentUserContextProvider } from "../../../contexts/CurrentUserContext"

import SolutionsIndex from "./SolutionsIndex"
import SolutionShow from "./SolutionShow"
import SolutionRate from "./SolutionRate"

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

const Solutions: React.FC<RouteComponentProps<{
    userId: string
}>> = ({ userId }) => {
    if (!userId) {
        return null
    }

    return (
        <TasksContextProvider>
            <CurrentUserContextProvider userId={userId}>
                <TaskSolutionsContextProvider>
                    <Router>
                        <SolutionsIndex path="/" />
                        <SolutionRoutes path=":solutionId/*" />
                    </Router>
                </TaskSolutionsContextProvider>
            </CurrentUserContextProvider>
        </TasksContextProvider>
    )
}

export default Solutions
