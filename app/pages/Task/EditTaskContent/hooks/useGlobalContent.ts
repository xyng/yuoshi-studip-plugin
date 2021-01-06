import {
    ChangeEventHandler,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react"

import { useEditTaskContext } from "../useEditTaskContent"

const useGlobalContent = () => {
    const editTaskContext = useEditTaskContext()
    const { createContent, contents, setContents } = editTaskContext

    useEffect(() => {
        console.log(contents)
        if (contents.length > 0) {
            return
        }

        createContent()()
    }, [contents, createContent])

    const { defaultTitle, defaultText } = useMemo(() => {
        if (!contents.length) {
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
    }, [contents])

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
        ...editTaskContext,
        contentTitle,
        contentText,
        changeContentTitle,
        changeContentText,
        firstContent,
    }
}

export default useGlobalContent
