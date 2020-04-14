import { ToOneRelation } from "coloquent/dist/relation/ToOneRelation"

import { AppModelWithDate } from "./AppModel"
import Quest from "./Quest"

type Attributes = {
    content: string
    is_correct: boolean
    sort?: number
}
export default class Answer extends AppModelWithDate<Attributes> {
    protected readonly accessible: Array<keyof Attributes> = [
        "content",
        "is_correct",
        "sort",
    ]
    protected jsonApiType: string = "answers"

    public getContent(): string {
        return this.getAttribute("content")
    }

    public getIsCorrect(): boolean {
        return this.getAttribute("is_correct")
    }

    public getSort(): number | undefined {
        return this.getAttribute("sort")
    }

    quest(): ToOneRelation {
        return this.hasOne(Quest, "quest")
    }

    getQuest(): Quest {
        return this.getRelation("quest")
    }

    setQuest(quest: Quest) {
        return this.setRelation("quest", quest)
    }
}
