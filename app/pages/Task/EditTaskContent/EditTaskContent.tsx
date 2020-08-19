import React from "react"
import { Link, RouteComponentProps } from "@reach/router"
import { NSTaskAdapter } from "@xyng/yuoshi-backend-adapter"
import { useCurrentTaskContext } from "contexts/CurrentTaskContext"

import { EditTaskContentProvider } from "./useEditTaskContent"

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

export type EditTaskContentView<T = {}> = React.FC<T>

const RenderTaskViews: React.FC = () => {
    const currentTaskContext = useCurrentTaskContext()

    const { task } = currentTaskContext

    switch (task.getType()) {
        case TaskTypeName.DRAG:
            return <EditDragContent />
        case TaskTypeName.CARD:
            return <EditCardContent />
        case TaskTypeName.MULTI:
        case TaskTypeName.SURVEY:
        case TaskTypeName.TRAINING:
            return <EditQuizContent />
        case TaskTypeName.MEMORY:
            return <EditMemoryContent />
        case TaskTypeName.TAG:
            return <EditTagContent />
        case TaskTypeName.CLOZE:
            return <EditClozeContent />
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
            <EditTaskContentProvider>
                <RenderTaskViews />
            </EditTaskContentProvider>
        </div>
    )
}

export default EditTaskContent
