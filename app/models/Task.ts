import { AppModelWithDate } from "./AppModel"

type Attributes = [
    "title",
    "type",
    "sequence",
    "description",
    "credits",
    "is_training",
    "image"
]
export default class Task extends AppModelWithDate<Attributes> {
    protected readonly accessible: Attributes = [
        "title",
        "type",
        "sequence",
        "description",
        "credits",
        "is_training",
        "image",
    ]
    protected jsonApiType: string = "tasks"

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
}
