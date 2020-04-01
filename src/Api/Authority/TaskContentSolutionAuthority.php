<?php
namespace Xyng\Yuoshi\Api\Authority;

use SimpleORMap;
use User;
use Xyng\Yuoshi\Helper\AuthorityHelper;
use Xyng\Yuoshi\Model\UserTaskContentSolutions;

class TaskContentSolutionAuthority implements AuthorityInterface {
    public static function filterByUsersTasks(): string {
        $tasksJoin = TaskAuthority::filterByUsersPackages();
        return "INNER JOIN yuoshi_tasks on (yuoshi_user_task_content_solutions.task_id = yuoshi_user_task_solutions.id) " . $tasksJoin;
    }

    static function getFilter(): string
    {
        return static::filterByUsersTasks();
    }

    /**
     * @inheritDoc
     *
     * @return UserTaskContentSolutions[]
     */
    static function findFiltered(array $ids, User $user, array $perms = [], array $conditions = []): array
    {
        return UserTaskContentSolutions::findWithQuery(
            AuthorityHelper::getFilterQuery(static::getFilter(), 'yuoshi_user_task_solutions.id', $ids, $user, $perms, $conditions)
        );
    }

    /**
     * @inheritDoc
     *
     * @return UserTaskContentSolutions|null
     */
    static function findOneFiltered(string $id, User $user, array $perms = [], array $conditions = []): ?SimpleORMap
    {
        return UserTaskContentSolutions::findOneWithQuery(
            AuthorityHelper::getFilterQuery(static::getFilter(), 'yuoshi_user_task_content_solutions.id', $id, $user, $perms, $conditions)
        );
    }
}
