import { Link, RouteComponentProps } from "@reach/router"
import { useCurrentLearningObjective } from "contexts/CurrentLearningObjectiveContext"
import { useCurrentPackageContext } from "contexts/CurrentPackageContext"
import LearningObjective from "models/LearningObjective"
import React, {
    ChangeEventHandler,
    ReactNode,
    useCallback,
    useEffect,
    useState,
} from "react"

import { uploadImage } from "../../helpers/fileUploadHelper"
import { useCourseContext } from "../../contexts/CourseContext"

import Styles from "./LearningObjective.module.css"
import LearningObjectiveForm, {
    LearningObjectiveFormSubmitHandler,
} from "./LearningObjectiveForm"

const EditLearningObjective: React.FC<RouteComponentProps> = () => {
    const { course } = useCourseContext()
    const { currentPackage } = useCurrentPackageContext()
    const [imageName, setImageName] = useState("")
    const [imageFileRefId, setImageFileRefId] = useState("")
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
    const handleFile = useCallback<ChangeEventHandler<HTMLInputElement>>(
        async (event) => {
            const file = event.currentTarget.files?.[0]
            if (!file) {
                return
            }

            const ref = await uploadImage(
                file,
                currentLearningObjective.getJsonApiType(),
                currentLearningObjective.getApiId() as string,
                "image"
            )
            setImageName(ref.fileName)
            setImageFileRefId(ref.fileRefId)
        },
        [course, currentLearningObjective]
    )
    useEffect(() => {
        async function fetchImage() {
            const imageId = currentLearningObjective.getAttributes().image
            // TODO: @Daniel how to get file-ref from relation???
            const imageRefRaw = await fetch(
                `${process.env.API_PATH}/files/${imageId}/file-refs`,
                {
                    method: "get",
                }
            )
            const imageRef = await imageRefRaw.json()
            setImageName(imageRef.data[0].attributes.name)
            setImageFileRefId(imageRef.data[0].id)
        }
        fetchImage()
    }, [currentLearningObjective])
    function renderLearningObjectiveImage() {
        const imageIsSelected = !!currentLearningObjective.getAttributes().image
        if (!imageIsSelected) return null
        return (
            <>
                <p> Dein zuletzt ausgewähltes Bild: </p>
                <img
                    src={`http://localhost/sendfile.php?type=0&file_id=${imageFileRefId}&;file_name=${imageName}`}
                    alt="#"
                    className={Styles.imagePreview}
                ></img>
            </>
        )
    }

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
            <div className="learningObjective-image">
                {renderLearningObjectiveImage()}
            </div>
            <p> Neues Bild hinzufügen: </p>
            <span> (Bitte nur JPEG und PNG)</span>
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
