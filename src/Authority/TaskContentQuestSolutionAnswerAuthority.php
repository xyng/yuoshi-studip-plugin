<?php
namespace Xyng\Yuoshi\Authority;

use SimpleORMap;
use User;
use Xyng\Yuoshi\Helper\AuthorityHelper;
use Xyng\Yuoshi\Model\UserTaskContentQuestSolutionAnswers;

class TaskContentQuestSolutionAnswerAuthority implements AuthorityInterface {
    static function getFilter(): string
    {
        $tasksJoin = TaskContentQuestSolutionAuthority::getFilter();
        return "INNER JOIN yuoshi_user_task_content_quest_solutions on (yuoshi_user_task_content_quest_solution_answers.quest_solution_id = yuoshi_user_task_content_quest_solutions.id) " . $tasksJoin;
    }

    /**
     * @inheritDoc
     *
     * @return UserTaskContentQuestSolutionAnswers[]
     */
    static function findFiltered(array $ids, User $user, array $perms = [], array $conditions = []): array
    {
        return UserTaskContentQuestSolutionAnswers::findWithQuery(
            AuthorityHelper::getFilterQuery(static::getFilter(), 'yuoshi_user_task_content_solutions.id', $ids, $user, $perms, $conditions)
        );
    }

    /**
     * @inheritDoc
     *
     * @return UserTaskContentQuestSolutionAnswers|null
     */
    static function findOneFiltered(string $id, User $user, array $perms = [], array $conditions = []): ?SimpleORMap
    {
        return UserTaskContentQuestSolutionAnswers::findOneWithQuery(
            AuthorityHelper::getFilterQuery(static::getFilter(), 'yuoshi_user_task_content_quest_solutions.id', $id, $user, $perms, $conditions)
        );
    }
}
