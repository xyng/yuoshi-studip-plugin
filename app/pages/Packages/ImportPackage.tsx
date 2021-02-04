import React, { useCallback, useState } from "react"
import { RouteComponentProps, Link } from "@reach/router"

import { usePackagesContext } from "../../contexts/PackagesContext"
import { useCourseContext } from "../../contexts/CourseContext"

import PackageForm, { PackageFormSubmitHandler } from "./PackageForm"

const ImportPackage: React.FC<RouteComponentProps> = () => {
    const { course } = useCourseContext()
    const { reloadPackages } = usePackagesContext()

    const [json, setJson] = useState(null)

    const onSubmit = useCallback<PackageFormSubmitHandler>(
        async (values) => {
            if (!json) {
                return
            }

            // create API url
            const url = new URL(window.location.href)
            url.search = ""
            url.hash = ""
            url.pathname = "jsonapi.php/v1/packages/import/" + course.getApiId()

            // create formData object and its content
            const newJson: any = json
            newJson.package.title = values.title
            newJson.package.slug = values.slug

            const blob = new Blob([JSON.stringify(newJson)], {
                type: "application/json",
            })
            const formData = new FormData()
            formData.append("file", blob)

            // post formData to server

            try {
                const res = await fetch(url.href, {
                    method: "POST",
                    credentials: "include",
                    body: formData,
                })
                if (res.status >= 400) {
                    console.log(res.status)
                }
            } catch (e) {
                console.log(e)
            }

            // wenn response-body benötigt wird
            // await res.json() // oder .text() wenn es plaintext-inhalt ist

            await reloadPackages()
        },
        [course, json, reloadPackages]
    )

    const onChange = useCallback(async (event) => {
        const reader = new FileReader()
        reader.onload = (event: any) => {
            setJson(JSON.parse(event.target.result))
        }
        reader.readAsText(event.target.files[0])
    }, [])

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
                onChange={onChange}
            />

            <PackageForm onSubmit={onSubmit} />
        </>
    )
}

export default ImportPackage
