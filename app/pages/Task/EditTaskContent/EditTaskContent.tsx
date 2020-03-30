import React from "react"
import { RouteComponentProps } from "@reach/router"
import { NSTaskAdapter } from "@xyng/yuoshi-backend-adapter"
import { useCurrentTaskContext } from "contexts/CurrentTaskContext"

import Task from "../../../models/Task"

import EditDragContent from "./EditDragContent"

import TaskTypeName = NSTaskAdapter.TaskTypeName

export type EditTaskContentView = React.FC<{
    task: Task
    updateTask: ReturnType<typeof useCurrentTaskContext>["updateTask"]
}>

const EditTaskContent: React.FC<RouteComponentProps> = () => {
    const { task, updateTask } = useCurrentTaskContext()

    switch (task.getType()) {
        case TaskTypeName.DRAG:
            return <EditDragContent task={task} updateTask={updateTask} />
        default:
            return null
    }
}

export default EditTaskContent
