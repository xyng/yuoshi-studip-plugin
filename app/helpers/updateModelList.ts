import { Model } from "coloquent"

export default function updateModelList<T extends Model>(updated: T) {
    return (content: T[]) => {
        const index = content.findIndex(
            (elem) => elem.getApiId() === updated.getApiId()
        )

        if (index === -1) {
            // no match no update
            return content
        }

        return [
            ...content.slice(0, index),
            updated,
            ...content.slice(index + 1),
        ]
    }
}
