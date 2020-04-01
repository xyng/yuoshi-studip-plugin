import { ToOneRelation } from "coloquent/dist/relation/ToOneRelation"
import { ToManyRelation } from "coloquent/dist/relation/ToManyRelation"

import { AppModelWithDate } from "./AppModel"
import TaskSolution from "./TaskSolution"
import Content from "./Content"
import TaskContentQuestSolution from "./TaskContentQuestSolution"

type Attributes = {}
export default class TaskContentSolution extends AppModelWithDate<Attributes> {
    protected readonly accessible: Array<keyof Attributes> = []
    protected jsonApiType: string = "content_solutions"

    getValue(): string | undefined {
        return this.getAttribute("value")
    }

    task_solution(): ToOneRelation {
        return this.hasOne(TaskSolution)
    }

    getTaskSolution(): TaskSolution {
        return this.getRelation("task_solution")
    }

    content(): ToOneRelation {
        return this.hasOne(Content)
    }

    getContent(): Content {
        return this.getRelation("content")
    }

    quest_solutions(): ToManyRelation {
        return this.hasMany(TaskContentQuestSolution)
    }

    getQuestSolutions(): TaskContentQuestSolution[] {
        return this.getRelation("quest_solutions")
    }
}
