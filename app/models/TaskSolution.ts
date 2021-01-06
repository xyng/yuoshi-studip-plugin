import { ToOneRelation } from "coloquent/dist/relation/ToOneRelation"
import { ToManyRelation } from "coloquent/dist/relation/ToManyRelation"

import { AppModelWithDate } from "./AppModel"
import Task from "./Task"
import TaskContentSolution from "./TaskContentSolution"
import User from "./User"

type Attributes = {
    points: number | undefined
}
export default class TaskSolution extends AppModelWithDate<Attributes> {
    protected readonly accessible: Array<keyof Attributes> = ["points"]
    protected jsonApiType: string = "task_solutions"

    getPoints(): number | undefined {
        return this.getAttribute("points")
    }

    getFinished(): Date | undefined {
        return this.getAttribute("finished")
            ? this.getAttributeAsDate("finished")
            : undefined
    }

    user(): ToOneRelation {
        return this.hasOne(User, "user")
    }

    getUser(): User {
        return this.getRelation("user")
    }

    task(): ToOneRelation {
        return this.hasOne(Task, "task")
    }

    getTask(): Task {
        return this.getRelation("task")
    }

    content_solutions(): ToManyRelation {
        return this.hasMany(TaskContentSolution, "content_solutions")
    }

    getContentSolutions(): TaskContentSolution[] {
        return this.getRelation("content_solutions")
    }
}
