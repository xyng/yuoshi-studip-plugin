import React from "react"
import { Link, RouteComponentProps } from "@reach/router"

import { useCurrentTaskSolutionContext } from "../../../contexts/CurrentTaskSolutionContext"
import RenderSolution from "../../../components/RenderSolution/RenderSolution"

const SolutionShow: React.FC<RouteComponentProps> = () => {
    const { taskSolution } = useCurrentTaskSolutionContext()

    return (
        <form className="default" onSubmit={(event) => event.preventDefault()}>
            <Link className="button" to="../">
                Zurück
            </Link>
            <RenderSolution
                taskSolution={taskSolution}
                task={taskSolution.getTask()}
            />
        </form>
    )
}

export default SolutionShow
