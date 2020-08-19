import Quill, { RangeStatic } from "quill"

import LoadingImage from "./ImageBlot"

type UploadImageOptions = {
    upload: (file: File) => Promise<string>
}

export default class ImageUploader {
    protected range: RangeStatic | null
    protected fileInput?: HTMLInputElement

    constructor(protected quill: Quill, protected options: UploadImageOptions) {
        this.range = null

        const toolbar = this.quill.getModule("toolbar")
        toolbar.addHandler("image", this.selectLocalImage.bind(this))

        this.handleDrop = this.handleDrop.bind(this)
        this.handlePaste = this.handlePaste.bind(this)

        this.quill.root.addEventListener("drop", this.handleDrop, false)
        this.quill.root.addEventListener("paste", this.handlePaste, false)
    }

    selectLocalImage() {
        this.range = this.quill.getSelection()
        this.fileInput = document.createElement("input")
        this.fileInput.setAttribute("type", "file")
        this.fileInput.setAttribute("accept", "image/*")
        this.fileInput.setAttribute("style", "visibility: hidden")

        this.fileInput.addEventListener("change", this.fileChanged.bind(this))

        document.body.appendChild(this.fileInput)

        this.fileInput.click()

        window.requestAnimationFrame(() => {
            const input = this.fileInput

            if (!input) {
                return
            }

            document.body.removeChild(input)
        })
    }

    handleDrop(evt: DragEvent) {
        evt.stopPropagation()
        evt.preventDefault()

        if (!evt.dataTransfer || !evt.dataTransfer.files.length) {
            return
        }

        const selection = document.getSelection()
        const range = document.caretPositionFromPoint(evt.clientX, evt.clientY)
        if (selection && range) {
            selection.setBaseAndExtent(
                range.offsetNode,
                range.offset,
                range.offsetNode,
                range.offset
            )
        }

        this.range = this.quill.getSelection()
        const file = evt.dataTransfer.files[0]

        return this.readAndUploadFile(file)
    }

    handlePaste(evt: ClipboardEvent) {
        const clipboard = evt.clipboardData

        if (!clipboard || !(clipboard.items || clipboard.files)) {
            return
        }

        const items = Array.from(clipboard.items || clipboard.files)
        const allowedImages = new RegExp(/^image\/(jpe?g|gif|png|svg|webp)$/i)

        const promises = items.map((item) => {
            if (!allowedImages.test(item.type)) {
                return
            }

            const file = item instanceof File ? item : item.getAsFile()

            if (!file) {
                return
            }

            this.range = this.quill.getSelection()

            return this.readAndUploadFile(file)
        })

        if (promises.length) {
            evt.preventDefault()
        }

        return promises
    }

    async readAndUploadFile(file: File | null) {
        if (!file) {
            return
        }

        const fileReader = new FileReader()

        const fileAsData = await new Promise<string>((resolve) => {
            fileReader.addEventListener(
                "load",
                () => {
                    resolve(fileReader.result as string)
                },
                false
            )

            fileReader.readAsDataURL(file)
        })

        this.insertBase64Image(fileAsData)

        try {
            const imageId = await this.options.upload(file)

            // TODO: resolve id to url for editor.
            this.insertToEditor(imageId, fileAsData)
        } catch (e) {
            this.removeBase64Image()
        }
    }

    fileChanged() {
        const fileInput = this.fileInput
        if (!fileInput) {
            return
        }

        const file = fileInput.files?.[0]

        if (!file) {
            return
        }

        return this.readAndUploadFile(file)
    }

    insertBase64Image(src: string) {
        const range = this.range

        if (!range) {
            return
        }

        this.quill.insertEmbed(
            range.index,
            LoadingImage.blotName,
            {
                src,
            },
            "user"
        )
    }

    insertToEditor(id: string, src: string) {
        const range = this.range

        if (!range) {
            return
        }

        // Delete the placeholder image
        this.quill.deleteText(range.index, 3, "user")
        // Insert the server saved image
        this.quill.insertEmbed(
            range.index,
            "image",
            {
                id,
                src,
            },
            "user"
        )

        range.index++
        this.quill.setSelection(range, "user")
    }

    removeBase64Image() {
        const range = this.range
        if (!range) {
            return
        }

        this.quill.deleteText(range.index, 3, "user")
    }
}
