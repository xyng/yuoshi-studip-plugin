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
    file?: string
}
export default class Content extends AppModelWithDate<Attributes> {
    protected readonly accessible: Array<keyof Attributes> = [
        "intro",
        "outro",
        "title",
        "content",
        "file",
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

    public getFile(): string | undefined {
        return this.getAttribute("file")
    }

    quests(): ToManyRelation {
        return this.hasMany(Quest, "quests")
    }

    public getQuests(): Quest[] {
        return this.getRelation("quests")
    }

    public setQuests(quests: Quest[]) {
        return this.setRelation("quests", quests)
    }

    task(): ToOneRelation {
        return this.hasOne(Task, "task")
    }

    getTask(): Task {
        return this.getRelation("task")
    }

    setTask(task: Task) {
        return this.setRelation("task", task)
    }
}
