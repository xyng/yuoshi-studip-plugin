import { Model } from "coloquent"

export abstract class AppModel<T extends {}> extends Model {
    protected abstract readonly accessible: Array<keyof T>
    protected abstract jsonApiType: string

    getJsonApiBaseUrl(): string {
        const url = new URL(window.location.href)
        url.search = ""
        url.hash = ""
        url.pathname = "plugins.php/argonautsplugin"

        return url.href
    }

    public patch(values: Partial<T>) {
        for (const key in values) {
            if (!values.hasOwnProperty(key) || !this.accessible.includes(key)) {
                continue
            }

            const value = values[key]

            this.setAttribute(key as string, value)
        }
    }
}

export abstract class AppModelWithDate<T extends {}> extends AppModel<T> {
    getCreated(): Date {
        return this.getAttributeAsDate("mkdate")
    }

    getModified(): Date {
        return this.getAttributeAsDate("chdate")
    }
}
