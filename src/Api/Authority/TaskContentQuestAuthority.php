<?php


namespace Xyng\Yuoshi\Api\Authority;


use SimpleORMap;
use User;
use Xyng\Yuoshi\Helper\AuthorityHelper;
use Xyng\Yuoshi\Model\TaskContentQuests;

class TaskContentQuestAuthority implements AuthorityInterface {
    public static function filterByUsersContents(): string {
        $contentsJoin = TaskContentAuthority::filterByUsersTasks();
        return "INNER JOIN yuoshi_task_contents on (yuoshi_task_content_quests.content_id = yuoshi_task_contents.id) " . $contentsJoin;
    }

    static function getFilter(): string
    {
        return static::filterByUsersContents();
    }

    /**
     * @inheritDoc
     */
    static function findFiltered(array $ids, User $user, array $perms = [], array $conditions = []): array
    {
        return TaskContentQuests::findWithQuery(
            AuthorityHelper::getFilterQuery(static::getFilter(), 'yuoshi_task_content.id', $ids, $user, $perms, $conditions)
        );
    }

    /**
     * @inheritDoc
     */
    static function findOneFiltered(string $id, User $user, array $perms = [], array $conditions = []): ?SimpleORMap
    {
        return TaskContentQuests::findOneWithQuery(
            AuthorityHelper::getFilterQuery(static::getFilter(), 'yuoshi_task_content_quests.id', $id, $user, $perms, $conditions)
        );
    }
}
