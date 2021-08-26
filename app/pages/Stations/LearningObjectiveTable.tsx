import { Link } from "@reach/router"
import { useCurrentPackageContext } from "contexts/CurrentPackageContext"
import React, { useCallback } from "react"

import Button from "../../components/Button/Button"
import { useLearningObjectiveContext } from "../../contexts/LearningObjectiveContext"

export const LearningObjectiveTable: React.FC = () => {
    const {
        learningObjectives,
        reloadLearningObjectives,
    } = useLearningObjectiveContext()

    const { currentPackage } = useCurrentPackageContext()
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
                            <Link
                                to={`learningObjectives/${learningObjectiveItem.getApiId()}`}
                            >
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
                                to={`learningObjectives/${learningObjectiveItem.getApiId()}`}
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
