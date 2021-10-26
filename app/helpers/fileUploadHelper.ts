export const uploadImage = async (
    file: File,
    model: string,
    model_id: string,
    group?: string
) => {
    const data = new FormData()
    data.append("model", model)
    data.append("key", model_id)
    if (group) {
        data.append("group", group)
    }
    data.append("file", file)

    const resp = await fetch(`${process.env.API_PATH}/yuoshi_images`, {
        method: "post",
        body: data,
    })
    if (resp.status !== 201) {
        throw new Error("could not save image")
    }

    const result = await resp.json()

    return result
}
