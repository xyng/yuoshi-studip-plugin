<?php

namespace Xyng\Yuoshi\Api\Authority;

use SimpleORMap;
use User;
use Xyng\Yuoshi\Helper\AuthorityHelper;
use Xyng\Yuoshi\Model\TaskContentQuestAnswers;

class TaskContentQuestAnswerAuthority implements AuthorityInterface {
    public static function filterByUsersQuests(): string {
        $answersJoin = TaskContentQuestAuthority::filterByUsersContents();
        return "INNER JOIN yuoshi_task_content_quests on (yuoshi_task_content_quest_answers.quest_id = yuoshi_task_content_quests.id) " . $answersJoin;
    }

    static function getFilter(): string
    {
        return static::filterByUsersQuests();
    }

    /**
     * @inheritDoc
     */
    static function findFiltered(array $ids, User $user, array $perms = [], array $conditions = []): array
    {
        return TaskContentQuestAnswers::findWithQuery(
            AuthorityHelper::getFilterQuery(static::getFilter(), 'yuoshi_task_content_quest.id', $ids, $user, $perms, $conditions)
        );
    }

    /**
     * @inheritDoc
     */
    static function findOneFiltered(string $id, User $user, array $perms = [], array $conditions = []): ?SimpleORMap
    {
        return TaskContentQuestAnswers::findOneWithQuery(
            AuthorityHelper::getFilterQuery(static::getFilter(), 'yuoshi_task_content_quest_answers.id', $id, $user, $perms, $conditions)
        );
    }
}
