import { AppModel } from "./AppModel"

type Attributes = {}
export default class User extends AppModel<Attributes> {
    protected readonly accessible: Array<keyof Attributes> = []
    protected jsonApiType: string = "users"

    getFormattedName(): string {
        return this.getAttribute("formatted-name")
    }

    getFirstName(): string {
        return this.getAttribute("given-name")
    }

    getLastName(): string {
        return this.getAttribute("family-name")
    }
}
