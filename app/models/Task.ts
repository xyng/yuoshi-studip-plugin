import { AppModelWithDate } from "./AppModel"
import Package from "./Package"

type Attributes = [
    "title",
    "kind",
    "sequence",
    "description",
    "credits",
    "is_training",
    "image"
]
export default class Task extends AppModelWithDate<Attributes> {
    protected readonly accessible: Attributes = [
        "title",
        "kind",
        "sequence",
        "description",
        "credits",
        "is_training",
        "image",
    ]
    protected jsonApiType: string = "tasks"

    public static readonly taskTypes = {
        card: "Karteikarte",
        cloze: "Lückentext",
        drag: "Drag n' Drop",
        memory: "Memory",
        multi: "Multiple-Choice",
        survey: "Umfrage",
        tag: "Text markieren",
        training: "Quiz",
    }

    public getTitle(): string {
        return this.getAttribute("title")
    }

    public getType(): string {
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

    public setType(type: string): void {
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
}
