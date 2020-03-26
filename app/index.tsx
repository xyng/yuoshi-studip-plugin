import React from "react"
import ReactDOM from "react-dom"

import App from "./App"

let rendered = false
function renderApp() {
    if (rendered) {
        return
    }

    rendered = true

    const yuoshi = document.getElementById("yuoshi-app")

    ReactDOM.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
        yuoshi
    )
}

document.addEventListener("DOMContentLoaded", () => {
    renderApp()
})

if (document.readyState === "interactive") {
    renderApp()
}
