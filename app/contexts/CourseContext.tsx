import React, { createContext, useContext, useMemo } from "react"
import useSWR from "swr"
import { parse as qsParse } from "query-string"

import Course from "../models/Course"

interface CourseContextInterface {
    course: Course
}
const CourseContext = createContext<CourseContextInterface | null>(null)

export const useCourseContext = () => {
    const ctx = useContext(CourseContext)

    if (ctx === null) {
        throw new Error("No CourseContextProvider available.")
    }

    return ctx
}

const fetchCourse = async (courseId: string): Promise<Course> => {
    const course = (await Course.find(courseId)).getData() as Course | null

    if (!course) {
        throw new Error("course not found")
    }

    return course
}

export const CourseContextProvider: React.FC = ({ children }) => {
    const courseId = useMemo(() => {
        // parse courseId from query params - this wont change in runtime
        const query = qsParse(window.location.search.replace("?", ""))

        return query.cid as string
    }, [])

    const { data: course } = useSWR(
        () => (courseId ? [courseId, "course"] : null),
        fetchCourse,
        { suspense: true }
    )

    const ctx = {
        // course is never undefined when using suspense mode
        course: course as Course,
    }

    return (
        <CourseContext.Provider value={ctx}>{children}</CourseContext.Provider>
    )
}
