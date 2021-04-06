import { ToOneRelation } from "coloquent"

import { AppModel } from "./AppModel"
import User from "./User"

type Attributes = {}
export default class StationProgress extends AppModel<Attributes> {
    protected readonly accessible: Array<keyof Attributes> = []

    protected jsonApiType: string = "stationProgress"
    readOnlyAttributes = ["progress"]

    public getProgress(): number | undefined {
        return this.getAttribute("progress")
    }

    user(): ToOneRelation {
        return this.hasOne(User, "user")
    }

    getUser(): User {
        return this.getRelation("user")
    }
}
