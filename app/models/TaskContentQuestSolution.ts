import { ToOneRelation } from "coloquent/dist/relation/ToOneRelation"

import { AppModelWithDate } from "./AppModel"
import TaskContentSolution from "./TaskContentSolution"
import Quest from "./Quest"
import Answer from "./Answer"

type Attributes = {}
export default class TaskContentQuestSolution extends AppModelWithDate<
    Attributes
> {
    protected readonly accessible: Array<keyof Attributes> = []
    protected jsonApiType: string = "quest_solutions"

    getSort(): number | undefined {
        return this.getAttribute("sort")
    }

    getCustom(): string | undefined {
        return this.getAttribute("custom")
    }

    content_solution(): ToOneRelation {
        return this.hasOne(TaskContentSolution)
    }

    getContentSolution(): TaskContentSolution {
        return this.getRelation("content_solution")
    }

    quest(): ToOneRelation {
        return this.hasOne(Quest)
    }

    getQuest(): Quest {
        return this.getRelation("quest")
    }

    answer(): ToOneRelation {
        return this.hasOne(Answer)
    }

    getAnswer(): Answer {
        return this.getRelation("answer")
    }
}
