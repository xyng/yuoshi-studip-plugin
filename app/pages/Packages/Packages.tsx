import React, { Suspense, useCallback } from "react"
import { Link, RouteComponentProps, Router } from "@reach/router"

import { CurrentPackageContextProvider } from "../../contexts/CurrentPackageContext"
import Tasks from "../Tasks/Tasks"
import {
    PackagesContextProvider,
    usePackagesContext,
} from "../../contexts/PackagesContext"
import Progress from "../../components/Progress/Progress"

import EditPackage from "./EditPackage"
import CreatePackage from "./CreatePackage"

const Packages: React.FC<RouteComponentProps> = () => {
    return (
        <PackagesContextProvider>
            <Router basepath="/packages">
                <PackagesIndex path="/" />
                <CreatePackage path="create" />
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
                <Tasks path="tasks/*" />
            </Router>
        </CurrentPackageContextProvider>
    )
}

const PackagesIndex: React.FC<RouteComponentProps> = () => {
    return (
        <>
            <Link to="/">Zurück</Link>
            <Link to="create">Neues Paket</Link>
            <table className="default">
                <caption>Pakete</caption>
                <thead>
                    <tr>
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
    const { packages, reloadPackages } = usePackagesContext()

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

    return (
        <>
            {packages.map((packageItem) => {
                return (
                    <tr key={packageItem.getApiId()}>
                        <td>
                            <Link to={`${packageItem.getApiId()}/tasks`}>
                                {packageItem.getTitle()}
                            </Link>
                        </td>
                        <td>
                            <Progress
                                value={packageItem.getProgress() || 0}
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
