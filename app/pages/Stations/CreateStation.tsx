import React, { useCallback } from "react"
import { RouteComponentProps, Link } from "@reach/router"

import Station from "../../models/Station"
import { useStationContext } from "../../contexts/StationContext"
import { useCurrentPackageContext } from "../../contexts/CurrentPackageContext"

import StationForm, { StationFormSubmitHandler } from "./StationForm"

const CreateStation: React.FC<RouteComponentProps> = () => {
    const { currentPackage } = useCurrentPackageContext()
    const { reloadStations } = useStationContext()

    const onSubmit = useCallback<StationFormSubmitHandler>(
        async (values) => {
            console.log("submit")

            const newStation = new Station()
            newStation.patch(values)
            newStation.setPackage(currentPackage)

            const updated = (await newStation.save()).getModel()
            if (!updated) {
                // TODO: handle error
                return
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

export default CreateStation
