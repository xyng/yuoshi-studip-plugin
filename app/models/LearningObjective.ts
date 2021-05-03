import { AppModelWithDate } from "./AppModel"
import Packages from "./Package"

type Attributes = {
    title: string
    description: string
    image: string
    sort: number
}
export default class LearningObjective extends AppModelWithDate<Attributes> {
    protected readonly accessible: Array<keyof Attributes> = [
        "title",
        "description",
        "image",
        "sort",
    ]
    protected jsonApiType: string = "learning_objectives"

    getTitle(): string {
        return this.getAttribute("title")
    }

    getDescription(): string {
        return this.getAttribute("description")
    }

    getImage(): string {
        return this.getAttribute("image")
    }
    setPackage(packages: Packages) {
        return this.setRelation("package", packages)
    }
    getSort(): number {
        return this.getAttribute("sort")
    }

    setSort(sort: number) {
        return this.setAttribute("sort", sort)
    }
}
