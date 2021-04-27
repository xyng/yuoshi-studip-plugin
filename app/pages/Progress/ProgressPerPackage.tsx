import React from "react"
import { Link, RouteComponentProps } from "@reach/router"

import { useCurrentPackageContext } from "../../contexts/CurrentPackageContext"
import Progress from "../../components/Progress/Progress"

const ProgressPerPackage: React.FC<RouteComponentProps> = () => {
    const { currentPackage } = useCurrentPackageContext()

    const progress = currentPackage.getPackageUserProgress()

    return (
        <>
            <Link className="button" to="../">
                Zurück
            </Link>
            <table className="default">
                <caption>
                    Kursfortschritt für Paket: {currentPackage.getTitle()}
                </caption>
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Fortschritt</th>
                    </tr>
                </thead>
                <tbody>
                    {progress.map((pkg) => {
                        return (
                            <tr key={`progress-${pkg.getApiId()}`}>
                                <td>
                                    <Link to={`${pkg.getUser().getApiId()}`}>
                                        {pkg.getUser().getFormattedName()}
                                    </Link>
                                </td>
                                <td>
                                    {/* <Progress
                                        value={pkg.getProgress() || 0}
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

export default ProgressPerPackage
