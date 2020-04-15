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

    const { defaultTitle, defaultText } = useMemo(() => {
        if (!contents.length) {
            createContent()()

            return {
                defaultTitle: "",
                defaultText: "",
            }
        }

        const [content] = contents
        return {
            defaultTitle: content.title,
            defaultText: content.content,
        }
    }, [contents, createContent])

    const [contentTitle, setContentTitle] = useState(defaultTitle)
    const [contentText, setContentText] = useState(defaultText)

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
