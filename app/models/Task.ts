import { AppModelWithDate } from "./AppModel"

export default class Task extends AppModelWithDate {
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
}
