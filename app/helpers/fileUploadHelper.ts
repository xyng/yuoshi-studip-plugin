export const uploadImage = async (file: File, course_id: string) => {
    const data = new FormData()
    data.append("course", course_id)
    data.append("image", file)

    const resp = await fetch(`${process.env.API_PATH}/yuoshi_images`, {
        method: "post",
        body: data,
    })

    if (resp.status !== 201) {
        throw new Error("could not save image")
    }

    const result = await resp.json()

    return result.file as string
}
