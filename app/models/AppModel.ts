import { Model } from "coloquent"

export abstract class AppModel extends Model {
    getJsonApiBaseUrl(): string {
        const url = new URL(window.location.href)
        url.search = ""
        url.hash = ""
        url.pathname = "plugins.php/argonautsplugin"

        return url.href
    }
}

export abstract class AppModelWithDate extends AppModel {
    getCreated(): Date {
        return this.getAttributeAsDate("mkdate")
    }

    getModified(): Date {
        return this.getAttributeAsDate("chdate")
    }
}
