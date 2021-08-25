import { Link, RouteComponentProps } from "@reach/router"
import { useCurrentLearningObjective } from "contexts/CurrentLearningObjectiveContext"
import { useCurrentPackageContext } from "contexts/CurrentPackageContext"
import LearningObjective from "models/LearningObjective"
import React, { useCallback } from "react"

import LearningObjectiveForm, {
    LearningObjectiveFormSubmitHandler,
} from "./LearningObjectiveForm"

const EditLearningObjective: React.FC<RouteComponentProps> = () => {
    const { currentPackage } = useCurrentPackageContext()
    const {
        currentLearningObjective,
        updateLearningObjective,
    } = useCurrentLearningObjective()
    const onSubmit = useCallback<LearningObjectiveFormSubmitHandler>(
        async (values) => {
            currentLearningObjective.patch(values)
            const updated = (await currentLearningObjective.save()).getModel()
            if (!updated) {
                // TODO: handle error
                return
            }

            await updateLearningObjective(updated as LearningObjective)
        },
        [currentLearningObjective, updateLearningObjective]
    )
    if (!currentLearningObjective) return <p> test </p>
    return (
        <>
            <Link
                className="button"
                to={`/packages/${currentPackage.getApiId()}/stations`}
            >
                Zurück
            </Link>
            <h1>
                Fallbeispiel bearbeiten: {currentLearningObjective.getTitle()}
            </h1>

            <LearningObjectiveForm
                defaultValues={{
                    title: currentLearningObjective.getTitle(),
                    description: currentLearningObjective.getDescription(),
                }}
                onSubmit={onSubmit}
            />
        </>
    )
}

export default EditLearningObjective
