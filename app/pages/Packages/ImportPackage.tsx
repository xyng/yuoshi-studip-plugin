import React, { useCallback, useState } from "react"
import { RouteComponentProps, Link } from "@reach/router"

import { usePackagesContext } from "../../contexts/PackagesContext"
import { useCourseContext } from "../../contexts/CourseContext"

import PackageForm, { PackageFormSubmitHandler } from "./PackageForm"

const CreatePackage: React.FC<RouteComponentProps> = () => {
    const { course } = useCourseContext()
    const { reloadPackages } = usePackagesContext()

    const [json, setJson] = useState(null)

    const onSubmit = useCallback<PackageFormSubmitHandler>(
        async (values) => {
            if (json === null) {
                return
            }
            // Cause WHY WOULD THAT BE NULL!
            let newJson: any = json
            newJson.package.title = values.title
            newJson.package.slug = values.slug

            const url = new URL(window.location.href)
            url.search = ""
            url.hash = ""
            url.pathname =
                "plugins.php/argonautsplugin/packages/import/" +
                course.getApiId()

            console.log(url.href)
            let xhr = new XMLHttpRequest()
            xhr.open("POST", url.href)
            xhr.withCredentials = true

            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        console.log("OK")
                    }
                }
            }

            let blob = new Blob([JSON.stringify(newJson)], {
                type: "application/json",
            })

            let formData = new FormData()
            formData.append("file", blob)

            xhr.send(formData)

            await reloadPackages()
        },
        [course, json, reloadPackages]
    )

    return (
        <>
            <Link className="button" to="/packages">
                Zurück
            </Link>
            <h1>Neues Paket</h1>

            <input
                type="file"
                id="fileUpload"
                accept="application/json"
                onChange={function (e: any) {
                    let reader = new FileReader()
                    reader.onload = (e: any) => {
                        let json = JSON.parse(e.target.result)
                        setJson(json)
                    }
                    reader.readAsText(e.target.files[0])
                }}
            />

            <PackageForm onSubmit={onSubmit} />
        </>
    )
}

export default CreatePackage
