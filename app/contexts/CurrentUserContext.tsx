import React, { createContext, useContext } from "react"
import useSWR from "swr"

import User from "../models/User"

interface CurrentUserContextInterface {
    user: User
}
const CurrentUserContext = createContext<CurrentUserContextInterface | null>(
    null
)

export const useCurrentUserContext = () => {
    const ctx = useContext(CurrentUserContext)

    if (ctx === null) {
        throw new Error("No CurrentUserContextProvider available.")
    }

    return ctx
}

const fetchUser = async (userId: string) => {
    const user = (await User.find(userId)).getData() as User | null

    if (!user) {
        throw new Error("user not found")
    }

    return user
}

export const CurrentUserContextProvider: React.FC<{
    userId: string
}> = ({ userId, children }) => {
    const { data } = useSWR([userId, "users"], fetchUser, { suspense: true })

    const ctx = {
        user: data as User,
    }

    return (
        <CurrentUserContext.Provider value={ctx}>
            {children}
        </CurrentUserContext.Provider>
    )
}
