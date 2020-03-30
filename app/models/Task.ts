import { NSTaskAdapter } from "@xyng/yuoshi-backend-adapter"
import { ToManyRelation, ToOneRelation } from "coloquent"

import { AppModelWithDate } from "./AppModel"
import Package from "./Package"
import Content from "./Content"
import TaskTypeName = NSTaskAdapter.TaskTypeName

type Attributes = {
    title: string
    kind: TaskTypeName
    sequence: number
    description: string
    credits: string
    is_training: string
    image: string
}
export default class Task extends AppModelWithDate<Attributes> {
    protected readonly accessible: Array<keyof Attributes> = [
        "title",
        "kind",
        "sequence",
        "description",
        "credits",
        "is_training",
        "image",
    ]
    protected jsonApiType: string = "tasks"

    public static readonly taskTypes: {
        [key in TaskTypeName]: string
    } = {
        [TaskTypeName.CARD]: "Karteikarte",
        [TaskTypeName.CLOZE]: "Lückentext",
        [TaskTypeName.DRAG]: "Drag n' Drop",
        [TaskTypeName.MEMORY]: "Memory",
        [TaskTypeName.MULTI]: "Multiple-Choice",
        [TaskTypeName.SURVEY]: "Umfrage",
        [TaskTypeName.TAG]: "Text markieren",
        [TaskTypeName.TRAINING]: "Quiz",
    }

    public getTitle(): string {
        return this.getAttribute("title")
    }

    public getType(): TaskTypeName {
        return this.getAttribute("kind")
    }

    public getSequence(): number {
        return this.getAttribute("sequence")
    }

    public getDescription(): string | undefined {
        return this.getAttribute("description")
    }

    public getCredits(): number {
        return this.getAttribute("credits")
    }

    public getIsTraining(): boolean {
        return this.getAttribute("is_training")
    }

    public getImage(): string | undefined {
        return this.getAttribute("image")
    }

    public setTitle(title: string): void {
        return this.setAttribute("title", title)
    }

    public setType(type: TaskTypeName): void {
        return this.setAttribute("kind", type)
    }

    public setSequence(sequence: number): void {
        return this.setAttribute("sequence", sequence)
    }

    public setDescription(description: string | undefined): void {
        return this.setAttribute("description", description)
    }

    public setCredits(credits: number): void {
        return this.setAttribute("credits", credits)
    }

    public setIsTraining(is_training: boolean): void {
        return this.setAttribute("is_training", is_training)
    }

    public setImage(image: string | undefined): void {
        return this.setAttribute("image", image)
    }

    public setPackage(pckg: Package) {
        return this.setRelation("package", pckg)
    }

    public package(): ToOneRelation {
        return this.hasOne(Package)
    }

    public contents(): ToManyRelation {
        return this.hasMany(Content)
    }

    public getContents(): Content[] {
        return this.getRelation("contents")
    }

    public setContents(contents: Content[]): void {
        return this.setRelation("contents", contents)
    }
}
