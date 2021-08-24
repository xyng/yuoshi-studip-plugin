import React, { useCallback } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import LearningObjective from "models/LearningObjective"

import { useLearningObjectiveContext } from "../../contexts/LearningObjectiveContext"
import { useCurrentPackageContext } from "../../contexts/CurrentPackageContext"

import LearningObjectiveForm, {
    LearningObjectiveFormSubmitHandler,
} from "./LearningObjectiveForm"

const CreateLearningObjective: React.FC<RouteComponentProps> = () => {
    const { currentPackage } = useCurrentPackageContext()
    const { reloadLearningObjectives } = useLearningObjectiveContext()

    const onSubmit = useCallback<LearningObjectiveFormSubmitHandler>(
        async (values) => {
            const newLearningObjective = new LearningObjective()
            newLearningObjective.patch(values)
            newLearningObjective.setPackage(currentPackage)
            const updated = (await newLearningObjective.save()).getModel()
            if (!updated) {
                throw new Error("Wasn't able to update learning objective")
            }

            await reloadLearningObjectives()
        },
        [currentPackage, reloadLearningObjectives]
    )

    return (
        <>
            <Link
                className="button"
                to={`/packages/${currentPackage.getApiId()}/stations`}
            >
                Zurück
            </Link>
            <h1>Neues Fallbeispiel</h1>

            <LearningObjectiveForm onSubmit={onSubmit} />
        </>
    )
}

export default CreateLearningObjective
