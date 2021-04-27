import React from "react"
import { Link, RouteComponentProps, Router } from "@reach/router"

import {
    PackagesContextProvider,
    usePackagesContext,
} from "../../contexts/PackagesContext"
import ProgressBar from "../../components/Progress/Progress"
import { CurrentPackageContextProvider } from "../../contexts/CurrentPackageContext"

import Solutions from "./Solutions/Solutions"
import ProgressPerPackage from "./ProgressPerPackage"

const RenderProgress: React.FC<RouteComponentProps> = () => {
    const { packages } = usePackagesContext()

    return (
        <>
            <Link className="button" to="../">
                Zurück
            </Link>
            <table className="default">
                <caption>Kursfortschritt</caption>
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Fortschritt des Kurses</th>
                    </tr>
                </thead>
                <tbody>
                    {packages.map((pkg) => {
                        return (
                            <tr key={`package-${pkg.getApiId()}`}>
                                <td>
                                    <Link to={`${pkg.getApiId()}`}>
                                        {pkg.getTitle()}
                                    </Link>
                                </td>
                                <td>
                                    {/* <ProgressBar
                                        value={
                                            pkg
                                                .getPackageTotalProgress()
                                                .getProgress() || 0
                                        }
                                        max={100}
                                    /> */}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </>
    )
}

const PackageSubRoute: React.FC<RouteComponentProps<{
    packageId: string
}>> = ({ packageId }) => {
    return (
        <CurrentPackageContextProvider byUser={true} currentPackage={packageId}>
            <Router>
                <ProgressPerPackage path="/" />
                <Solutions path=":userId/*" />
            </Router>
        </CurrentPackageContextProvider>
    )
}

const Progress: React.FC<RouteComponentProps> = () => {
    return (
        <PackagesContextProvider>
            <Router>
                <RenderProgress path="/" />
                <PackageSubRoute path=":packageId/*" />
            </Router>
        </PackagesContextProvider>
    )
}

export default Progress
