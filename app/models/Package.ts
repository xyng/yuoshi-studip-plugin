import { ToManyRelation } from "coloquent"

import { AppModelWithDate } from "./AppModel"
import Course from "./Course"
import Task from "./Task"

type Attributes = {
    title: string
    slug: string
}
export default class Package extends AppModelWithDate<Attributes> {
    protected readonly accessible: Array<keyof Attributes> = ["title", "slug"]
    protected jsonApiType: string = "packages"
    readOnlyAttributes = ["progress"]

    getTitle(): string {
        return this.getAttribute("title")
    }

    getSlug(): string {
        return this.getAttribute("slug")
    }

    public getProgress(): number | undefined {
        return this.getAttribute("progress")
    }

    setTitle(title: string) {
        return this.setAttribute("title", title)
    }

    setSlug(slug: string) {
        return this.setAttribute("slug", slug)
    }

    setCourse(course: Course) {
        return this.setRelation("course", course)
    }

    tasks(): ToManyRelation {
        return this.hasMany(Task, "tasks")
    }

    getTasks(): Task[] {
        return this.getRelation("tasks")
    }
}
