import React, { useCallback } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { useCurrentPackageContext } from "contexts/CurrentPackageContext"

import { useCurrentStationContext } from "../../contexts/CurrentStationContext"
import Station from "../../models/Station"

import StationForm, { StationFormSubmitHandler } from "./StationForm"

const EditStation: React.FC<RouteComponentProps> = () => {
    const { station, updateStation } = useCurrentStationContext()
    const { currentPackage } = useCurrentPackageContext()
    const onSubmit = useCallback<StationFormSubmitHandler>(
        async (values) => {
            station.patch(values)

            const updated = (await station.save()).getModel()
            if (!updated) {
                // TODO: handle error
                return
            }

            await updateStation(updated as Station)
        },
        [station, updateStation]
    )

    return (
        <>
            <Link
                className="button"
                to={`/packages/${currentPackage.getApiId()}/stations`}
            >
                Zurück
            </Link>
            <h1>Station bearbeiten: {station.getTitle()}</h1>

            <StationForm
                defaultValues={{
                    title: station.getTitle(),
                    slug: station.getSlug(),
                }}
                onSubmit={onSubmit}
            />
        </>
    )
}

export default EditStation
