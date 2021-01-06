import { ToManyRelation } from "coloquent"
import { ToOneRelation } from "coloquent/dist/relation/ToOneRelation"

import { AppModelWithDate } from "./AppModel"
import Course from "./Course"
import Station from "./Station"
import Task from "./Task"
import PackageProgress from "./PackageProgress"

type Attributes = {
    title: string
    slug: string
    sort: number
}
export default class Package extends AppModelWithDate<Attributes> {
    protected readonly accessible: Array<keyof Attributes> = [
        "title",
        "slug",
        "sort",
    ]
    protected jsonApiType: string = "packages"

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

    setCourse(course: Course) {
        return this.setRelation("course", course)
    }

    setStation(station: Station) {
        return this.setRelation("stations", station)
    }

    tasks(): ToManyRelation {
        return this.hasMany(Task, "tasks")
    }

    getTasks(): Task[] {
        return this.getRelation("tasks")
    }

    getStations(): Station[] {
        return this.getRelation("stations")
    }

    packageTotalProgress(): ToOneRelation {
        return this.hasOne(PackageProgress, "packageTotalProgress")
    }

    getPackageTotalProgress(): PackageProgress {
        return this.getRelation("packageTotalProgress")
    }

    packageUserProgress(): ToManyRelation {
        return this.hasMany(PackageProgress, "packageUserProgress")
    }

    getPackageUserProgress(): PackageProgress[] {
        return this.getRelation("packageUserProgress")
    }
}
