import AppModel from "./AppModel";
import { ToManyRelation } from "coloquent/dist/relation/ToManyRelation";
import Package from "./Package";

export default class Course extends AppModel {
    protected jsonApiType: string = "courses";

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
