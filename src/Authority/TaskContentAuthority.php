<?php
namespace Xyng\Yuoshi\Authority;

use SimpleORMap;
use User;
use Xyng\Yuoshi\Helper\AuthorityHelper;
use Xyng\Yuoshi\Model\TaskContents;

class TaskContentAuthority implements AuthorityInterface {
    public static function filterByUsersTasks(): string {
        $tasksJoin = TaskAuthority::filterByUsersPackages();
        return "INNER JOIN yuoshi_tasks on (yuoshi_task_contents.task_id = yuoshi_tasks.id) " . $tasksJoin;
    }

    static function getFilter(): string
    {
        return static::filterByUsersTasks();
    }

    /**
     * @inheritDoc
     */
    static function findFiltered(array $ids, User $user, array $perms = [], array $conditions = []): array
    {
        return TaskContents::findWithQuery(
            AuthorityHelper::getFilterQuery(static::getFilter(), 'yuoshi_tasks.id', $ids, $user, $perms, $conditions)
        );
    }

    /**
     * @inheritDoc
     */
    static function findOneFiltered(string $id, User $user, array $perms = [], array $conditions = []): ?SimpleORMap
    {
        return TaskContents::findOneWithQuery(
            AuthorityHelper::getFilterQuery(static::getFilter(), 'yuoshi_task_contents.id', $id, $user, $perms, $conditions)
        );
    }
}
