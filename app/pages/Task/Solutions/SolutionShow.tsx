import React from "react"
import { Link, RouteComponentProps } from "@reach/router"

import { useCurrentTaskSolutionContext } from "../../../contexts/CurrentTaskSolutionContext"
import { useCurrentTaskContext } from "../../../contexts/CurrentTaskContext"
import RenderSolution from "../../../components/RenderSolution/RenderSolution"

const SolutionShow: React.FC<RouteComponentProps> = () => {
    const { task } = useCurrentTaskContext()
    const { taskSolution } = useCurrentTaskSolutionContext()

    return (
        <form className="default" onSubmit={(event) => event.preventDefault()}>
            <Link to="../">Zurück</Link>
            <RenderSolution taskSolution={taskSolution} task={task} />
        </form>
    )
}

export default SolutionShow
