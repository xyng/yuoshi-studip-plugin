import { ToManyRelation } from "coloquent"
import { ToOneRelation } from "coloquent/dist/relation/ToOneRelation"

import { AppModelWithDate } from "./AppModel"
import Packages from "./Package"
import Task from "./Task"
import StationProgress from "./StationProgress"

type Attributes = {
    title: string
    slug: string
    sort: number
}
export default class Station extends AppModelWithDate<Attributes> {
    protected readonly accessible: Array<keyof Attributes> = [
        "title",
        "slug",
        "sort",
    ]
    protected jsonApiType: string = "stations"

    getTitle(): string {
        return this.getAttribute("title")
    }

    getSlug(): string {
        return this.getAttribute("slug")
    }

    getSort(): number {
        return this.getAttribute("sort")
    }

    setTitle(title: string) {
        return this.setAttribute("title", title)
    }

    setSlug(slug: string) {
        return this.setAttribute("slug", slug)
    }

    setSort(sort: number) {
        return this.setAttribute("sort", sort)
    }

    setPackage(packages: Packages) {
        return this.setRelation("package", packages)
    }

    tasks(): ToManyRelation {
        return this.hasMany(Task, "tasks")
    }

    getTasks(): Task[] {
        return this.getRelation("tasks")
    }

    stationUserProgress(): ToManyRelation {
        return this.hasMany(StationProgress, "stationUserProgress")
    }

    geStationUserProgress(): StationProgress[] {
        return this.getRelation("stationUserProgress")
    }
}
