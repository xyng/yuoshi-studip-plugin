import { ToManyRelation } from "coloquent/dist/relation/ToManyRelation"

import { AppModel } from "./AppModel"
import Package from "./Package"

// we only use this model to load data - we won't patch stuff here
// therefore, the Attribute type can be empty.
type Attributes = []
export default class Course extends AppModel<Attributes> {
    protected readonly accessible: Attributes = []
    protected jsonApiType: string = "courses"

    getTitle(): string {
        return this.getAttribute("title")
    }

    getSubTitle(): string | undefined {
        return this.getAttribute("subtitle")
    }

    getCourseType(): string {
        return this.getAttribute("course-type")
    }

    getDescription(): string | undefined {
        return this.getAttribute("description")
    }

    getLocation(): string | undefined {
        return this.getAttribute("location")
    }

    getCourseNumber(): string | undefined {
        return this.getAttribute("course-number")
    }

    getMiscellaneous(): string | undefined {
        return this.getAttribute("miscellaneous")
    }

    packages(): ToManyRelation {
        return this.hasMany(Package)
    }

    getPackages(): Package[] {
        return this.getRelation("packages")
    }
}
