import React, { useCallback, useMemo } from "react"
import {
    matchImage,
    matchInput,
    parseContentMultiple,
} from "@xyng/yuoshi-backend-adapter"
import * as Yup from "yup"
import { SubmitHandler } from "@unform/core"

import { EditTaskContentView } from "../EditTaskContent"
import ValidatedForm from "../../../../components/Form/ValidatedForm"
import Button from "../../../../components/Button/Button"
import Input from "../../../../components/Form/Input"
import TextArea from "../../../../components/Form/Textarea"
import { useEditTaskContext } from "../useEditTaskContent"
import { uploadImage } from "../../../../helpers/fileUploadHelper"
import { useCourseContext } from "../../../../contexts/CourseContext"

const ClozeContentSchema = Yup.object().shape({
    contents: Yup.array().of(
        Yup.object().shape({
            id: Yup.string().required(),
            title: Yup.string().required(),
            content: Yup.string().required(),
            file: Yup.mixed<FileList>(),
        })
    ),
})
type ClozeContentData = Yup.InferType<typeof ClozeContentSchema>

const EditClozeContent: EditTaskContentView = () => {
    const {
        task,
        contents,
        createContent,
        removeContent,
        onContentInputChange,
        onModifyAndSave,
    } = useEditTaskContext()

    const { course } = useCourseContext()
    const course_id = useMemo(() => course.getApiId(), [course])

    const contentsWithParts = useMemo(() => {
        return contents.map((content) => {
            return {
                ...content,
                parts: parseContentMultiple(content.content, [
                    matchImage,
                    matchInput,
                ]),
            }
        })
    }, [contents])

    const onSubmit = useCallback<SubmitHandler<ClozeContentData>>(
        async (value) => {
            if (!course_id) {
                return
            }

            await onModifyAndSave((contents) => {
                return Promise.all(
                    value.contents.map(async (content) => {
                        const fileList = content.file
                        let file_id: string | undefined = undefined
                        if (fileList && fileList.length > 0) {
                            file_id = await uploadImage(fileList[0], 'contents', content.id, 'image')
                        }

                        const origContent = contents.find(
                            (c) => c.id === content.id
                        )

                        if (!origContent) {
                            throw new Error("data integrity is broken")
                        }

                        return {
                            ...origContent,
                            title: content.title,
                            content: content.content,
                            file: file_id,
                        }
                    })
                )
            })
        },
        [onModifyAndSave, course_id]
    )

    return (
        <ValidatedForm
            validation={ClozeContentSchema}
            initialData={{
                contents,
            }}
            onSubmit={onSubmit}
            className="default"
        >
            <h1>Lückentext-Aufgabe: {task.getTitle()}</h1>

            <Button type="submit">Speichern</Button>

            <Button onClick={createContent()}>Neuer Inhalt</Button>

            {contentsWithParts.map((content, index) => {
                return (
                    <div key={`tag-content-${content.id}`}>
                        <div>
                            <h2>Inhalt</h2>
                            <Input
                                label=""
                                name={`contents[${index}].id`}
                                type="hidden"
                            />
                            <Input
                                label=""
                                name={`contents[${index}].title`}
                                value="Lückentext"
                                type="hidden"
                            />
                            <Input
                                label="Datei"
                                name={`contents[${index}].file`}
                                type="file"
                            />
                            <TextArea
                                label="Text"
                                name={`contents[${index}].content`}
                                onChange={onContentInputChange(
                                    content.id,
                                    "content"
                                )}
                            />
                            <small>
                                Verwenden Sie das Format <code>##X##</code> um
                                eine Lücke zu kennzeichnen. <code>X</code>{" "}
                                sollte hierbei eine aufsteigende natürliche Zahl
                                sein.
                            </small>
                        </div>

                        <Button onClick={removeContent(content.id)}>
                            Entfernen
                        </Button>
                    </div>
                )
            })}
        </ValidatedForm>
    )
}

export default EditClozeContent
