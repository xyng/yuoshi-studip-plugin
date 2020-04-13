import React from "react"

import { CenterSpinner } from "../Spinner/Spinner"

const Loading: React.FC = () => {
    return (
        <div>
            <h2>Initialisiere Applikation. Bitte warten.</h2>
            <CenterSpinner />
        </div>
    )
}

export default Loading
