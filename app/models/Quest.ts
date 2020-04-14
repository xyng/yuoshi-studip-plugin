import { ToManyRelation } from "coloquent"
import { ToOneRelation } from "coloquent/dist/relation/ToOneRelation"

import { AppModelWithDate } from "./AppModel"
import Answer from "./Answer"
import Content from "./Content"

type Attributes = {
    name: string
    image?: string
    prePhrase?: string
    question: string
    multiple: boolean
    sort?: number
    require_order: boolean
}
export default class Quest extends AppModelWithDate<Attributes> {
    protected readonly accessible: Array<keyof Attributes> = [
        "name",
        "image",
        "prePhrase",
        "question",
        "multiple",
        "sort",
        "require_order",
    ]
    protected jsonApiType: string = "quests"

    public getName(): string {
        return this.getAttribute("name")
    }

    public getImage(): string | undefined {
        return this.getAttribute("image")
    }

    public getPrePhrase(): string | undefined {
        return this.getAttribute("prePhrase")
    }

    public getQuestion(): string {
        return this.getAttribute("question")
    }

    public getMultiple(): boolean {
        return this.getAttribute("multiple")
    }

    public getSort(): number | undefined {
        return this.getAttribute("sort")
    }

    public getRequireOrder(): boolean {
        return this.getAttribute("require_order")
    }

    answers(): ToManyRelation {
        return this.hasMany(Answer, "answers")
    }

    getAnswers(): Answer[] {
        return this.getRelation("answers")
    }

    setAnswers(answers: Answer[]): void {
        return this.setRelation("answers", answers)
    }

    content(): ToOneRelation {
        return this.hasOne(Content, "content")
    }

    getContent(): Content {
        return this.getRelation("content")
    }

    setContent(content: Content) {
        return this.setRelation("content", content)
    }
}
