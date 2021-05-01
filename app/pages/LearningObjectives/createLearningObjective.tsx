import React, { useCallback } from "react"
import { RouteComponentProps, Link } from "@reach/router"

import Station from "../../models/Station"
import { useStationContext } from "../../contexts/StationContext"
import { useCurrentPackageContext } from "../../contexts/CurrentPackageContext"

import StationForm, { StationFormSubmitHandler } from "./StationForm"

const CreateLearningObjective: React.FC<RouteComponentProps> = () => {
    const { currentPackage } = useCurrentPackageContext()
    const { reloadLearningObjectives } = useLear()

    const onSubmit = useCallback<StationFormSubmitHandler>(
        async (values) => {
            const newLearningObjective = new LearningObjective()
            newLearningObjective.patch(values)
            newLearningObjective.setPackage(currentPackage)

            const updated = (await newLearningObjective.save()).getModel()
            if (!updated) {
                throw new Error("Wasn't able to update station")
            }

            await reloadStations()
        },
        [currentPackage, reloadStations]
    )

    return (
        <>
            <Link
                className="button"
                to={`/packages/${currentPackage.getApiId()}/stations`}
            >
                Zurück
            </Link>
            <h1>Neue Station</h1>

            <StationForm onSubmit={onSubmit} />
        </>
    )
}

export default CreateLearningObjective
