import TaskContentQuestSolution from "../../../models/TaskContentQuestSolution"
import TaskContentQuestSolutionAnswer from "../../../models/TaskContentQuestSolutionAnswer"

export const answerComparator = (
    a: TaskContentQuestSolutionAnswer,
    b: TaskContentQuestSolutionAnswer
) => {
    return (a.getSort() || 0) - (b.getSort() || 0)
}

export const questComparator = (
    a: TaskContentQuestSolution,
    b: TaskContentQuestSolution
) => {
    return (a.getQuest().getSort() || 0) - (b.getQuest().getSort() || 0)
}

export const groupSolutionsByQuest = (
    questSolutions: TaskContentQuestSolution[]
) =>
    questSolutions.sort(questComparator).reduce<{
        [key: string]: TaskContentQuestSolution[]
    }>((acc, solution) => {
        const id = solution.getQuest().getApiId() || ""

        acc[id] = acc[id] || []
        acc[id].push(solution)

        return acc
    }, {})
