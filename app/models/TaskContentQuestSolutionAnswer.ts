import { ToOneRelation } from "coloquent"

import { AppModelWithDate } from "./AppModel"
import Answer from "./Answer"

type Attributes = {}
export default class TaskContentQuestSolutionAnswer extends AppModelWithDate<
    Attributes
> {
    protected readonly accessible: Array<keyof Attributes> = []
    protected jsonApiType: string = "task_content_solution_answers"

    getSort(): number | undefined {
        return this.getAttribute("sort")
    }

    getCustom(): string | undefined {
        return this.getAttribute("custom")
    }

    answer(): ToOneRelation {
        return this.hasOne(Answer, "answer")
    }

    getAnswer(): Answer {
        return this.getRelation("answer")
    }
}
