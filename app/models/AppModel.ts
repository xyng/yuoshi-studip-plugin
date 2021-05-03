import { Model } from "coloquent"

export abstract class AppModel<T extends {}> extends Model {
    protected abstract readonly accessible: Array<keyof T>
    protected abstract jsonApiType: string

    getJsonApiBaseUrl(): string {
        const url = new URL(window.location.href)
        url.search = ""
        url.hash = ""
        url.pathname = process.env.API_PATH as string

        console.log(url.href)
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

    public clone<C extends AppModel<T>>() {
        const clone = new (this.constructor as any)() as C

        clone.setApiId(this.getApiId())

        const attrs = this.getAttributes()
        Object.entries(attrs).forEach(([key, val]) => {
            clone.setAttribute(key, val)
        })

        const rel = this.getRelations()
        Object.entries(rel).forEach(([key, val]) => {
            clone.setRelation(key, val)
        })

        return clone
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
