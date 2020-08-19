import Parchment from "parchment"
import Quill from "quill"

type ImageData = {
    id: string
    src?: string
}
const InlineBlot: typeof Parchment.Inline = Quill.import("blots/inline")
export default class LoadingImage extends InlineBlot {
    static blotName = "imageBlot"
    static className = "image-uploading"
    static tagName = "span"

    static create(data: ImageData) {
        const { id, src } = data
        const node = super.create(data)

        const image = document.createElement("img")
        if (src) {
            image.setAttribute("src", src)
        } else if (id) {
            fetch(`/${process.env.API_PATH}/yuoshi_images/${id}`)
                .then((resp) => {
                    if (resp.status !== 200) {
                        throw new Error("error requesting image")
                    }

                    return resp.blob()
                })
                .then((file) => {
                    const url = URL.createObjectURL(file)
                    image.setAttribute("src", url)
                })
                .catch(() => {
                    // ignore
                })
        }

        node.appendChild(image)

        return node
    }

    static value(domNode: HTMLElement) {
        const { src, custom } = domNode.dataset
        return { src, custom }
    }
}
