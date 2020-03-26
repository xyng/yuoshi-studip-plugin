import { AppModelWithDate } from "./AppModel"

type Attributes = ["title", "slug"]
export default class Package extends AppModelWithDate<Attributes> {
    protected readonly accessible: Attributes = ["title", "slug"]
    protected jsonApiType: string = "packages"

    getTitle(): string {
        return this.getAttribute("title")
    }

    getSlug(): string {
        return this.getAttribute("slug")
    }

    setTitle(title: string) {
        return this.setAttribute("title", title)
    }

    setSlug(slug: string) {
        return this.setAttribute("slug", slug)
    }
}
