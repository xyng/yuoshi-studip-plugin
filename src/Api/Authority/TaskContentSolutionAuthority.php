<?php
namespace Xyng\Yuoshi\Api\Authority;

use SimpleORMap;
use User;
use Xyng\Yuoshi\Helper\AuthorityHelper;
use Xyng\Yuoshi\Model\TaskContents;
use Xyng\Yuoshi\Model\UserTaskContentQuestSolutions;
use Xyng\Yuoshi\Model\UserTaskContentSolutions;

class TaskContentSolutionAuthority implements AuthorityInterface {
    static function getFilter(): string
    {
        $tasksJoin = TaskSolutionAuthority::getFilter();
        return "INNER JOIN yuoshi_user_task_solutions on (yuoshi_user_task_content_solutions.solution_id = yuoshi_user_task_solutions.id) " . $tasksJoin;
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

    static function isContentSolutionDone(UserTaskContentSolutions $contentSolution, TaskContents $content = null) {
        $content = $content ?: $contentSolution->content;

        $quests = $content->quests;
        $doneQuests = 0;
        $totalQuests = $quests->count();

        $questsSolutions = $contentSolution->quest_solutions;

        foreach ($quests as $quest) {
            /** @var \SimpleCollection|UserTaskContentQuestSolutions[] $questSolutions */
            $questSolutions = $questsSolutions->findBy('quest_id', $quest->id);
            if (TaskContentQuestSolutionAuthority::areQuestSolutionsDone($questSolutions, $quest)) {
                $doneQuests += 1;
            }
        }

        return $doneQuests === $totalQuests;
    }
}
