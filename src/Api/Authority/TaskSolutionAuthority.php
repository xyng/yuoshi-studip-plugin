<?php
namespace Xyng\Yuoshi\Api\Authority;

use SimpleORMap;
use User;
use Xyng\Yuoshi\Helper\AuthorityHelper;
use Xyng\Yuoshi\Model\UserTaskSolutions;

class TaskSolutionAuthority implements AuthorityInterface {
    public static function filterByUsersTasks(): string {
        $tasksJoin = TaskAuthority::filterByUsersPackages();
        return "INNER JOIN yuoshi_tasks on (yuoshi_user_task_solutions.task_id = yuoshi_tasks.id) " . $tasksJoin;
    }

    static function getFilter(): string
    {
        return static::filterByUsersTasks();
    }

    /**
     * @inheritDoc
     *
     * @return UserTaskSolutions[]
     */
    static function findFiltered(array $ids, User $user, array $perms = [], array $conditions = []): array
    {
        return UserTaskSolutions::findWithQuery(
            AuthorityHelper::getFilterQuery(static::getFilter(), 'yuoshi_tasks.id', $ids, $user, $perms, $conditions)
        );
    }

    /**
     * @inheritDoc
     *
     * @return UserTaskSolutions|null
     */
    static function findOneFiltered(string $id, User $user, array $perms = [], array $conditions = []): ?SimpleORMap
    {
        return UserTaskSolutions::findOneWithQuery(
            AuthorityHelper::getFilterQuery(static::getFilter(), 'yuoshi_user_task_solutions.id', $id, $user, $perms, $conditions)
        );
    }
}
