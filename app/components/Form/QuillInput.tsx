import React, { MouseEventHandler, useCallback, useEffect, useRef } from "react"
import ReactQuill, { Quill } from "react-quill"
import { useField } from "@unform/core"

import "react-quill/dist/quill.core.css"
import "react-quill/dist/quill.snow.css"

import { StringMap } from "quill"

import UploadImage from "../../helpers/quill/UploadImage/UploadImage"
import LoadingImage from "../../helpers/quill/UploadImage/ImageBlot"

const ImageFormat = Quill.import("formats/image")
Quill.register({
    "formats/image": ImageFormat,
    "formats/imageBlot": LoadingImage,
    "modules/uploadImage": UploadImage,
})

const modules: StringMap = {
    toolbar: [
        [{ header: ["1", "2", "3", false] }],
        ["bold", "italic", "underline", "link"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["clean"],
        ["image"],
    ],
    uploadImage: {
        upload: async (file: File): Promise<string> => {
            const data = new FormData()
            data.append("image", file)

            const resp = await fetch(`${process.env.API_PATH}/yuoshi_images`, {
                method: "post",
                body: data,
            })

            if (resp.status !== 201) {
                throw new Error("could not save image")
            }

            const result = await resp.json()

            console.log(result)

            return result.file as string
        },
    },
}

const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "imageBlot",
]

type QuillInputProps = {
    name: string
}
const QuillInput: React.FC<QuillInputProps> = ({ name }) => {
    const inputRef = useRef<ReactQuill>(null)
    const { fieldName, defaultValue = "", registerField, error } = useField(
        name
    )

    const doSmth = useCallback<MouseEventHandler>((event) => {
        event.preventDefault()
        const current = inputRef.current

        if (!current) {
            return
        }

        const editor = current.editor

        if (!editor) {
            return
        }

        const delta = editor.getContents()

        console.log(delta)
    }, [])

    useEffect(() => {
        registerField({
            name: fieldName,
            ref: inputRef.current,
            path: "value",
            getValue: (ref: ReactQuill) => {
                console.log(ref)
            },
        })
    }, [fieldName, registerField])

    return (
        <>
            <button onClick={doSmth}>Do something</button>
            <ReactQuill modules={modules} ref={inputRef} />
        </>
    )
}

export default QuillInput
