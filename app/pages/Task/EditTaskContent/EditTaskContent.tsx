import React from "react"
import { Link, RouteComponentProps } from "@reach/router"
import { NSTaskAdapter } from "@xyng/yuoshi-backend-adapter"
import { useCurrentTaskContext } from "contexts/CurrentTaskContext"

import { useEditTaskContext } from "./useEditTaskContent"

import TaskTypeName = NSTaskAdapter.TaskTypeName

const EditQuizContent = React.lazy(() =>
    import("./EditQuizContent/EditQuizContent")
)
const EditDragContent = React.lazy(() =>
    import("./EditDragContent/EditDragContent")
)
const EditCardContent = React.lazy(() =>
    import("./EditCardContent/EditCardContent")
)
const EditMemoryContent = React.lazy(() =>
    import("./EditMemoryContent/EditMemoryContent")
)
const EditTagContent = React.lazy(() =>
    import("./EditTagContent/EditTagContent")
)
const EditClozeContent = React.lazy(() =>
    import("./EditClozeContent/EditClozeContent")
)

export type EditTaskContentView<T = {}> = React.FC<
    {
        editTaskContext: ReturnType<typeof useEditTaskContext>
    } & T
>

const RenderTaskViews: React.FC = () => {
    const currentTaskContext = useCurrentTaskContext()
    const editTaskContext = useEditTaskContext(currentTaskContext)

    const { task } = currentTaskContext

    switch (task.getType()) {
        case TaskTypeName.DRAG:
            return <EditDragContent editTaskContext={editTaskContext} />
        case TaskTypeName.CARD:
            return <EditCardContent editTaskContext={editTaskContext} />
        case TaskTypeName.MULTI:
        case TaskTypeName.SURVEY:
        case TaskTypeName.TRAINING:
            return <EditQuizContent editTaskContext={editTaskContext} />
        case TaskTypeName.MEMORY:
            return <EditMemoryContent editTaskContext={editTaskContext} />
        case TaskTypeName.TAG:
            return <EditTagContent editTaskContext={editTaskContext} />
        case TaskTypeName.CLOZE:
            return <EditClozeContent editTaskContext={editTaskContext} />
        default:
            return null
    }
}

const EditTaskContent: React.FC<RouteComponentProps> = () => {
    return (
        <div>
            <Link className="button" to="../../">
                Zurück
            </Link>
            <RenderTaskViews />
        </div>
    )
}

export default EditTaskContent
