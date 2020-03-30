import { ToManyRelation } from "coloquent"
import { ToOneRelation } from "coloquent/dist/relation/ToOneRelation"

import { AppModelWithDate } from "./AppModel"
import Quest from "./Quest"
import Task from "./Task"

type Attributes = {
    intro?: string
    outro?: string
    title: string
    content: string
}
export default class Content extends AppModelWithDate<Attributes> {
    protected readonly accessible: Array<keyof Attributes> = [
        "intro",
        "outro",
        "title",
        "content",
    ]
    protected jsonApiType: string = "contents"

    public getIntro(): string | undefined {
        return this.getAttribute("intro")
    }

    public getOutro(): string | undefined {
        return this.getAttribute("outro")
    }

    public getTitle(): string {
        return this.getAttribute("title")
    }

    public getContent(): string {
        return this.getAttribute("content")
    }

    quests(): ToManyRelation {
        return this.hasMany(Quest)
    }

    public getQuests(): Quest[] {
        return this.getRelation("quests")
    }

    public setQuests(quests: Quest[]) {
        return this.setRelation("quests", quests)
    }

    task(): ToOneRelation {
        return this.hasOne(Task)
    }

    getTask(): Task {
        return this.getRelation("task")
    }

    setTask(task: Task) {
        return this.setRelation("task", task)
    }
}
