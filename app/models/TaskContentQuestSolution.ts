import { ToOneRelation } from "coloquent/dist/relation/ToOneRelation"
import { ToManyRelation } from "coloquent/dist/relation/ToManyRelation"

import { AppModelWithDate } from "./AppModel"
import TaskContentSolution from "./TaskContentSolution"
import Quest from "./Quest"
import TaskContentQuestSolutionAnswer from "./TaskContentQuestSolutionAnswer"

type Attributes = {}
export default class TaskContentQuestSolution extends AppModelWithDate<
    Attributes
> {
    protected readonly accessible: Array<keyof Attributes> = []
    protected jsonApiType: string = "quest_solutions"

    getIsCorrect(): boolean {
        return this.getAttribute("is_correct")
    }

    getScore(): number {
        return this.getAttribute("score")
    }

    getSentSolution(): boolean {
        return this.getAttribute("sent_solution")
    }

    answers(): ToManyRelation {
        return this.hasMany(TaskContentQuestSolutionAnswer)
    }

    getAnswers(): TaskContentQuestSolutionAnswer[] {
        return this.getRelation("answers")
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
}
