import React from "react"
import { Link, RouteComponentProps } from "@reach/router"

const Start: React.FC<RouteComponentProps> = () => {
    return (
        <>
            <h1>Startseite</h1>
            <div>
                <Link to="/packages">Pakete verwalten</Link>
            </div>
        </>
    )
}

export default Start
