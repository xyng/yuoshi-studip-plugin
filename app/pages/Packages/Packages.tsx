import React, { Suspense, useCallback } from "react"
import { Link, RouteComponentProps, Router } from "@reach/router"

import { CurrentPackageContextProvider } from "../../contexts/CurrentPackageContext"
import {
    PackagesContextProvider,
    usePackagesContext,
} from "../../contexts/PackagesContext"
import Progress from "../../components/Progress/Progress"
import Package from "../../models/Package"
import Button from "../../components/Button/Button"

import EditPackage from "./EditPackage"
import CreatePackage from "./CreatePackage"
import ImportPackage from "./ImportPackage"

const Station = React.lazy(() => import("../Stations/Station"))

const Packages: React.FC<RouteComponentProps> = () => {
    return (
        <PackagesContextProvider>
            <Router basepath="/packages">
                <PackagesIndex path="/" />
                <CreatePackage path="create" />
                <ImportPackage path="import" />
                <PackageSubRoute path=":packageId/*" />
            </Router>
        </PackagesContextProvider>
    )
}

const PackageSubRoute: React.FC<RouteComponentProps<{
    packageId: string
}>> = ({ packageId }) => {
    return (
        <CurrentPackageContextProvider currentPackage={packageId}>
            <Router>
                <EditPackage path="edit" />
                <Station path="stations/*" />
            </Router>
        </CurrentPackageContextProvider>
    )
}

const PackagesIndex: React.FC<RouteComponentProps> = () => {
    return (
        <>
            <Link className="button" to="/">
                Zurück
            </Link>
            <Link className="button" to="create">
                Neues Paket
            </Link>
            <Link className="button" to="import">
                Paket importieren
            </Link>
            <table className="default">
                <caption>Pakete</caption>
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
                                    Lade Pakete. Bitte warten.
                                </td>
                            </tr>
                        }
                    >
                        <RenderPackageTableData />
                    </Suspense>
                </tbody>
            </table>
        </>
    )
}

const RenderPackageTableData: React.FC = () => {
    const { packages, reloadPackages, mutate } = usePackagesContext()

    const onRemove = useCallback(
        (id?: string) => async () => {
            if (!id) {
                return
            }

            const entity = packages.find((p) => p.getApiId() === id)

            if (!entity) {
                return
            }

            await entity.delete()
            await reloadPackages()
        },
        [packages, reloadPackages]
    )

    const movePackage = useCallback(
        async (packageId: string, direction: number) => {
            const packageIndex = packages.findIndex(
                (p) => p.getApiId() === packageId
            )

            if (packageIndex === -1) {
                return
            }

            if (
                (packageIndex === 0 && direction < 0) ||
                (packageIndex === packages.length - 1 && direction > 0)
            ) {
                return
            }

            await mutate((packages) => {
                let current = 0
                return packages
                    .map((packageItem, index) => {
                        packageItem = packageItem.clone<Package>()

                        if (index === packageIndex) {
                            packageItem.setSort(
                                packageItem.getSort() + direction
                            )
                        }

                        return packageItem
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
        [packages, mutate]
    )

    const packageUp = useCallback(
        (packageId: string) => async () => {
            await movePackage(packageId, -2)
        },
        [movePackage]
    )

    const packageDown = useCallback(
        (packageId: string) => async () => {
            await movePackage(packageId, 2)
        },
        [movePackage]
    )

    return (
        <>
            {packages.map((packageItem) => {
                return (
                    <tr key={packageItem.getApiId()}>
                        <td>
                            <span className="pr">
                                {packageItem.getSort() + 1}
                            </span>
                            {packages.length > 1 && (
                                <>
                                    <Button
                                        fixMargin
                                        small
                                        onClick={packageUp(
                                            packageItem.getApiId() as string
                                        )}
                                    >
                                        &uarr;
                                    </Button>
                                    <Button
                                        fixMargin
                                        small
                                        onClick={packageDown(
                                            packageItem.getApiId() as string
                                        )}
                                    >
                                        &darr;
                                    </Button>
                                </>
                            )}
                        </td>
                        <td>
                            <Link to={`${packageItem.getApiId()}/stations`}>
                                {packageItem.getTitle()}
                            </Link>
                        </td>
                        <td>
                            <Progress
                                value={
                                    packageItem
                                        .getPackageTotalProgress()
                                        .getProgress() || 0
                                }
                                max={100}
                            />
                        </td>
                        <td>{packageItem.getModified().toLocaleString()}</td>
                        <td>
                            <Link
                                className="button"
                                to={`${packageItem.getApiId()}/edit`}
                            >
                                Bearbeiten
                            </Link>
                            <button
                                className="button"
                                onClick={onRemove(packageItem.getApiId())}
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

export default Packages
