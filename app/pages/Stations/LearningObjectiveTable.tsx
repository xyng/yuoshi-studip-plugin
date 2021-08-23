import React, { useCallback } from "react"
import { Link } from "@reach/router"

import { useLearningObjectiveContext } from "../../contexts/LearningObjectiveContext"
import Button from "../../components/Button/Button"

export const LearningObjectiveTable: React.FC = () => {
    const {
        learningObjectives,
        reloadLearningObjectives,
    } = useLearningObjectiveContext()

    // const LearningObjectiveSubRoute: React.FC<RouteComponentProps<{
    //     learningObjectiveId: string
    // }>> = ({ learningObjectiveId }) => {
    //     return (
    //         <CurrentLearningObjectiveContextProvider
    //             learningObjectiveId={learningObjectiveId}
    //         >
    //             <Router>
    //                 <EditLearningObjective path="edit" />
    //             </Router>
    //         </CurrentLearningObjectiveContextProvider>
    //     )
    // }

    const onRemove = useCallback(
        (id?: string) => async () => {
            if (!id) {
                return
            }

            const entity = learningObjectives.find((p) => p.getApiId() === id)

            if (!entity) {
                return
            }

            await entity.delete()
            await reloadLearningObjectives()
        },
        [learningObjectives, reloadLearningObjectives]
    )

    return (
        <>
            {learningObjectives.map((learningObjectiveItem) => {
                return (
                    <tr key={learningObjectiveItem.getApiId()}>
                        <td>
                            <span className="pr">
                                {learningObjectiveItem.getSort() + 1}
                            </span>
                            {learningObjectives.length > 1 && (
                                <>
                                    <Button
                                        fixMargin
                                        small
                                        onClick={() => null}
                                    >
                                        &uarr;
                                    </Button>
                                    <Button
                                        fixMargin
                                        small
                                        onClick={() => null}
                                    >
                                        &darr;
                                    </Button>
                                </>
                            )}
                        </td>
                        <td>
                            <Link to={`${learningObjectiveItem.getApiId()}`}>
                                {learningObjectiveItem.getTitle()}
                            </Link>
                        </td>

                        <td>
                            {learningObjectiveItem
                                .getModified()
                                .toLocaleString()}
                        </td>
                        <td>
                            <Link
                                className="button"
                                to={`/learning_objectives/${learningObjectiveItem.getApiId()}/edit`}
                            >
                                Bearbeiten
                            </Link>
                            <button
                                className="button"
                                onClick={onRemove(
                                    learningObjectiveItem.getApiId()
                                )}
                            >
                                Löschen
                            </button>
                        </td>
                    </tr>
                )
            })}
        </>
    )
}
