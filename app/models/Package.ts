import { AppModelWithDate } from "./AppModel";

export default class Package extends AppModelWithDate {
    protected jsonApiType: string = "packages";

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
