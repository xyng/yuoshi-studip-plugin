import {
    ChangeEventHandler,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react"

import { useEditTaskContext } from "../useEditTaskContent"

const useGlobalContent = (
    editTaskContext: ReturnType<typeof useEditTaskContext>
) => {
    const { createContent, contents, setContents } = editTaskContext

    const [contentTitle, setContentTitle] = useState("")
    const [contentText, setContentText] = useState("")

    useEffect(() => {
        if (!contents.length) {
            createContent()()
            return
        }

        const [content] = contents
        setContentTitle(content.title)
        setContentText(content.content)
    }, [contents, createContent])

    useEffect(() => {
        setContents((contents) =>
            contents.map((content) => {
                return {
                    ...content,
                    title: contentTitle,
                    text: contentText,
                }
            })
        )
    }, [contentTitle, contentText, setContents])

    const changeContentTitle = useCallback<
        ChangeEventHandler<HTMLInputElement>
    >((event) => {
        setContentTitle(event.currentTarget.value)
    }, [])

    const changeContentText = useCallback<
        ChangeEventHandler<HTMLTextAreaElement>
    >((event) => {
        setContentText(event.currentTarget.value)
    }, [])

    const firstContent = useMemo(() => {
        if (!contents.length) {
            return
        }

        return contents[0]
    }, [contents])

    return {
        contentTitle,
        contentText,
        changeContentTitle,
        changeContentText,
        firstContent,
    }
}

export default useGlobalContent
