import { Model } from "coloquent"

import { ObjectWithKeysOf } from "../helpers/types"

export abstract class AppModel<T extends string[]> extends Model {
    protected abstract readonly accessible: T

    getJsonApiBaseUrl(): string {
        const url = new URL(window.location.href)
        url.search = ""
        url.hash = ""
        url.pathname = "plugins.php/argonautsplugin"

        return url.href
    }

    public patch(values: Partial<ObjectWithKeysOf<T>>) {
        for (const key of this.accessible) {
            // the following would emit an ts error but should work.
            // @ts-ignore
            const value = values[key] as string

            if (value === undefined) {
                continue
            }

            this.setAttribute(key as string, value)
        }
    }
}

export abstract class AppModelWithDate<T extends string[]> extends AppModel<T> {
    getCreated(): Date {
        return this.getAttributeAsDate("mkdate")
    }

    getModified(): Date {
        return this.getAttributeAsDate("chdate")
    }
}
