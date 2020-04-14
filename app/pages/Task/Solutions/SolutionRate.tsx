import React, { ChangeEventHandler, useCallback, useState } from "react"
import { Link, RouteComponentProps } from "@reach/router"

import { useCurrentTaskSolutionContext } from "../../../contexts/CurrentTaskSolutionContext"
import { useCurrentTaskContext } from "../../../contexts/CurrentTaskContext"
import RenderSolution from "../../../components/RenderSolution/RenderSolution"

import Styles from "./SolutionRate.module.css"

const SolutionRate: React.FC<RouteComponentProps> = () => {
    const { task } = useCurrentTaskContext()
    const { taskSolution, updateTaskSolution } = useCurrentTaskSolutionContext()

    const [points, setPoints] = useState(taskSolution.getPoints())

    const onChangePoints = useCallback<ChangeEventHandler<HTMLInputElement>>(
        (event) => {
            setPoints(event.currentTarget.valueAsNumber)
        },
        []
    )

    const onSave = useCallback(async () => {
        taskSolution.patch({
            points,
        })

        await taskSolution.save()

        await updateTaskSolution(taskSolution, true)
    }, [taskSolution, points, updateTaskSolution])

    return (
        <form className="default" onSubmit={(event) => event.preventDefault()}>
            <Link className="button" to="../../">
                Zurück
            </Link>
            <div className={Styles.rateWrap}>
                <div className={Styles.points}>
                    <label>
                        Punkte:
                        <input
                            type="number"
                            value={points}
                            onChange={onChangePoints}
                        />
                    </label>
                </div>
                <div className={Styles.save}>
                    <button className="button" onClick={onSave}>
                        Speichern
                    </button>
                </div>
            </div>
            <RenderSolution taskSolution={taskSolution} task={task} />
        </form>
    )
}

export default SolutionRate
