import React, { useEffect, useState } from "react"
import { parse as qsParse } from "querystring";
import Package from "../models/Package";
import { PluralResponse } from "coloquent/dist/response/PluralResponse";

const fetchPackages = async (): Promise<Package[]> => {
    const query = qsParse(window.location.search.replace("?", ""))

    const cid = query.cid as string
    const packageItem = await Package.where("course", cid).get() as PluralResponse

    return packageItem.getData() as Package[]
}

const Packages: React.FC = () => {
    const [packages, setPackages] = useState<Package[]>([])

    useEffect(() => {
        fetchPackages().then(packages => {
            setPackages(packages)
        })
    }, [])

    return <div>
        {packages.map((packageItem) => {
            return <div key={packageItem.getApiId()}>
                <p>{packageItem.getTitle()}</p>
                <span>Geändert: {packageItem.getModified().toLocaleString()}</span>
            </div>
        })}
    </div>
}

export default Packages
