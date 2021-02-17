import React from "react"
import { Link, RouteComponentProps } from "@reach/router"

const Start: React.FC<RouteComponentProps> = () => {
    return (
        <>
            <h1>Startseite</h1>
            <div>
                <ul className="boxed-grid">
                    <li>
                        <Link to="/packages">
                            <h3>Pakete verwalten</h3>
                            <p>
                                Verwalten Sie Lernpakete und die darin
                                enthaltenen Aufgaben
                            </p>
                        </Link>
                    </li>
                    <li>
                        <Link to="/progress">
                            <h3>Gesamtfortschritt</h3>
                            <p>
                                Verfolgen Sie den Lernfortschritt Ihrer
                                Studierenden
                            </p>
                        </Link>
                    </li>
                </ul>
            </div>
        </>
    )
}

export default Start
