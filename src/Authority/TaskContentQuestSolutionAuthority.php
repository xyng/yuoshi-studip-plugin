<?php
namespace Xyng\Yuoshi\Authority;

use SimpleCollection;
use SimpleORMap;
use User;
use Xyng\Yuoshi\Helper\AuthorityHelper;
use Xyng\Yuoshi\Model\TaskContentQuests;
use Xyng\Yuoshi\Model\UserTaskContentQuestSolutions;

class TaskContentQuestSolutionAuthority implements AuthorityInterface
{
    public static function getFilter(): string
    {
        $tasksJoin = TaskContentSolutionAuthority::getFilter();
        return "INNER JOIN yuoshi_user_task_content_solutions on (yuoshi_user_task_content_quest_solutions.content_solution_id = yuoshi_user_task_content_solutions.id) " . $tasksJoin;
    }

    /**
     * @inheritDoc
     *
     * @return UserTaskContentQuestSolutions[]
     */
    public static function findFiltered(array $ids, User $user, array $perms = [], array $conditions = []): array
    {
        return UserTaskContentQuestSolutions::findWithQuery(
            AuthorityHelper::getFilterQuery(static::getFilter(), 'yuoshi_user_task_content_solutions.id', $ids, $user, $perms, $conditions)
        );
    }

    /**
     * @inheritDoc
     *
     * @return UserTaskContentQuestSolutions|null
     */
    public static function findOneFiltered(string $id, User $user, array $perms = [], array $conditions = []): ?SimpleORMap
    {
        return UserTaskContentQuestSolutions::findOneWithQuery(
            AuthorityHelper::getFilterQuery(static::getFilter(), 'yuoshi_user_task_content_quest_solutions.id', $id, $user, $perms, $conditions)
        );
    }

    /**
     * @param UserTaskContentQuestSolutions[] $questSolutions
     * @return double|bool
     */
    public static function areQuestSolutionsDone($questSolutions)
    {
        foreach ($questSolutions as $questSolution) {
            if ($questSolution->is_correct || $questSolution->sent_solution) {
                return (double) $questSolution->score;
            }
        }

        return false;
    }
}
