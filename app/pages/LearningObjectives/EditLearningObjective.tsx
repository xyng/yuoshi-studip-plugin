import { Link, RouteComponentProps } from "@reach/router"
import { useCurrentLearningObjective } from "contexts/CurrentLearningObjectiveContext"
import { useCurrentPackageContext } from "contexts/CurrentPackageContext"
import LearningObjective from "models/LearningObjective"
import React, { ChangeEventHandler, useCallback } from "react"

import LearningObjectiveForm, {
    LearningObjectiveFormSubmitHandler,
} from "./LearningObjectiveForm"
import { uploadImage } from "../../helpers/fileUploadHelper"
import { useCourseContext } from "../../contexts/CourseContext"

const EditLearningObjective: React.FC<RouteComponentProps> = () => {
    const { course } = useCourseContext()
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

    const handleFile = useCallback<ChangeEventHandler<HTMLInputElement>>(async (event) => {
        const file = event.currentTarget.files?.[0]

        if (!file) {
            return
        }

        const ref = await uploadImage(file, currentLearningObjective.getJsonApiType(), currentLearningObjective.getApiId() as string, 'image')

        console.log(ref)
    }, [course, currentLearningObjective])

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

            <input type="file" onChange={handleFile} />

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
