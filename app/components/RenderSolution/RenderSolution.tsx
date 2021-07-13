import React from "react"
import { NSTaskAdapter } from "@xyng/yuoshi-backend-adapter"

import TaskSolution from "../../models/TaskSolution"
import Task from "../../models/Task"

import DefaultSolutionRenderer from "./SolutionRenderers/DefaultSolutionRenderer"
import TagSolutionRenderer from "./SolutionRenderers/TagSolutionRenderer"
import DragSolutionRenderer from "./SolutionRenderers/DragSolutionRenderer"
import CardSolutionRenderer from "./SolutionRenderers/CardSolutionRenderer"
import MemorySolutionRenderer from "./SolutionRenderers/MemorySolutionRenderer"
import ClozeSlutionRenderer from "./SolutionRenderers/ClozeSolutionRenderer"
import QuizSolutionRenderer from "./SolutionRenderers/QuizSolutionRenderer"

import TaskTypeName = NSTaskAdapter.TaskTypeName

export type SolutionRenderer = React.FC<{
    taskSolution: TaskSolution
    task: Task
}>

const RenderWithSolutionRenderer: SolutionRenderer = ({
    task,
    taskSolution,
}) => {
    switch (task.getType()) {
        case TaskTypeName.TAG:
            return (
                <TagSolutionRenderer taskSolution={taskSolution} task={task} />
            )
        case TaskTypeName.DRAG:
            return (
                <DragSolutionRenderer taskSolution={taskSolution} task={task} />
            )
        case TaskTypeName.MEMORY:
            return (
                <MemorySolutionRenderer
                    taskSolution={taskSolution}
                    task={task}
                />
            )
        case TaskTypeName.CLOZE:
            return (
                <ClozeSlutionRenderer taskSolution={taskSolution} task={task} />
            )
        case TaskTypeName.MULTI:
        case TaskTypeName.SURVEY:
            return (
                <QuizSolutionRenderer taskSolution={taskSolution} task={task} />
            )
        default:
            return (
                <DefaultSolutionRenderer
                    taskSolution={taskSolution}
                    task={task}
                />
            )
    }
}

const RenderSolution: SolutionRenderer = ({ taskSolution, task }) => {
    return (
        <div>
            <h1>Abgegebene Lösung für Task: {task.getTitle()}</h1>
            <RenderWithSolutionRenderer
                task={task}
                taskSolution={taskSolution}
            />
        </div>
    )
}

export default RenderSolution
