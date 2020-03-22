import { AppModelWithDate } from "./AppModel";

export default class Package extends AppModelWithDate {
    protected jsonApiType: string = "packages";

    getTitle(): string {
        return this.getAttribute("title")
    }
}
