import React, { Suspense, useCallback } from "react"
import { Link, RouteComponentProps, Router } from "@reach/router"
import { LearningObjectiveContextProvider } from "contexts/LearningObjectiveContext"

import { CurrentStationContextProvider } from "../../contexts/CurrentStationContext"
import {
    StationContextProvider,
    useStationContext,
} from "../../contexts/StationContext"
import Progress from "../../components/Progress/Progress"
import Station from "../../models/Station"
import Button from "../../components/Button/Button"
import CreateLearningObjective from "../LearningObjectives/CreateLearningObjective"

import { LearningObjectiveTable } from "./LearningObjectiveTable"
import CreateStation from "./CreateStation"

const Tasks = React.lazy(() => import("../Tasks/Tasks"))

const Stations: React.FC<RouteComponentProps> = () => {
    return (
        <StationContextProvider>
            <LearningObjectiveContextProvider>
                <Router>
                    <StationsIndex path="/" />
                    <CreateStation path="create" />
                    <CreateLearningObjective path="objectiveCreate" />
                    <StationSubRoute path=":stationId/*" />
                </Router>
            </LearningObjectiveContextProvider>
        </StationContextProvider>
    )
}

const StationSubRoute: React.FC<RouteComponentProps<{
    stationId: string
}>> = ({ stationId }) => {
    return (
        <CurrentStationContextProvider stationId={stationId}>
            <Router>
                <Tasks path="tasks/*" />
            </Router>
        </CurrentStationContextProvider>
    )
}

const StationsIndex: React.FC<RouteComponentProps> = () => {
    return (
        <>
            <Link className="button" to="/packages">
                Zurück
            </Link>
            <Link className="button" to="create">
                Neue Station
            </Link>

            <Link className="button" to="objectiveCreate">
                Neues Fallbeispiel
            </Link>

            <table className="default">
                <caption>Stationen</caption>
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Name</th>
                        <th>Kursfortschritt</th>
                        <th>Letzte Aktualisierung</th>
                        <th>Aktionen</th>
                    </tr>
                </thead>
                <tbody>
                    <Suspense
                        fallback={
                            <tr>
                                <td colSpan={1000}>
                                    Lade Stationen. Bitte warten.
                                </td>
                            </tr>
                        }
                    >
                        <RenderStationTableData />
                    </Suspense>
                </tbody>
            </table>

            <table className="default">
                <caption>Fallbeispiele</caption>
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Name des/der Schüler:in</th>
                        <th>Letzte Aktualisierung</th>
                        <th>Aktionen</th>
                    </tr>
                </thead>
                <tbody>
                    <Suspense
                        fallback={
                            <tr>
                                <td colSpan={1000}>
                                    Lade Fallbeispiele. Bitte warten.
                                </td>
                            </tr>
                        }
                    >
                        <LearningObjectiveTable />
                    </Suspense>
                </tbody>
            </table>
        </>
    )
}

const RenderStationTableData: React.FC = () => {
    const { station, reloadStations, mutate } = useStationContext()

    const onRemove = useCallback(
        (id?: string) => async () => {
            if (!id) {
                return
            }

            const entity = station.find((p) => p.getApiId() === id)

            if (!entity) {
                return
            }

            await entity.delete()
            await reloadStations()
        },
        [station, reloadStations]
    )

    const moveStation = useCallback(
        async (stationId: string, direction: number) => {
            const stationIndex = station.findIndex(
                (p) => p.getApiId() === stationId
            )

            if (stationIndex === -1) {
                return
            }

            if (
                (stationIndex === 0 && direction < 0) ||
                (stationIndex === station.length - 1 && direction > 0)
            ) {
                return
            }

            await mutate((station) => {
                let current = 0
                return station
                    .map((stationItem, index) => {
                        stationItem = stationItem.clone<Station>()

                        if (index === stationIndex) {
                            stationItem.setSort(
                                stationItem.getSort() + direction
                            )
                        }

                        return stationItem
                    })
                    .sort((a, b) => {
                        return a.getSort() - b.getSort()
                    })
                    .map((p) => {
                        p.setSort(current++)
                        p.save()

                        return p
                    })
            }, true)
        },
        [station, mutate]
    )

    const stationUp = useCallback(
        (stationId: string) => async () => {
            await moveStation(stationId, -2)
        },
        [moveStation]
    )

    const stationDown = useCallback(
        (stationId: string) => async () => {
            await moveStation(stationId, 2)
        },
        [moveStation]
    )

    return (
        <>
            {station.map((stationItem) => {
                return (
                    <tr key={stationItem.getApiId()}>
                        <td>
                            <span className="pr">
                                {stationItem.getSort() + 1}
                            </span>
                            {station.length > 1 && (
                                <>
                                    <Button
                                        fixMargin
                                        small
                                        onClick={stationUp(
                                            stationItem.getApiId() as string
                                        )}
                                    >
                                        &uarr;
                                    </Button>
                                    <Button
                                        fixMargin
                                        small
                                        onClick={stationDown(
                                            stationItem.getApiId() as string
                                        )}
                                    >
                                        &darr;
                                    </Button>
                                </>
                            )}
                        </td>
                        <td>
                            <Link to={`${stationItem.getApiId()}/tasks`}>
                                {stationItem.getTitle()}
                            </Link>
                        </td>
                        <td>
                            <Progress
                                value={
                                    stationItem
                                        .getStationTotalProgress()
                                        .getProgress() || 0
                                }
                                max={100}
                            />
                        </td>
                        <td>{stationItem.getModified().toLocaleString()}</td>
                        <td>
                            <Link
                                className="button"
                                to={`${stationItem.getApiId()}/edit`}
                            >
                                Bearbeiten
                            </Link>
                            <button
                                className="button"
                                onClick={onRemove(stationItem.getApiId())}
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

export default Stations
