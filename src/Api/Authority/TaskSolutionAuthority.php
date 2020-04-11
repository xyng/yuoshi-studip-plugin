<?php
namespace Xyng\Yuoshi\Api\Authority;

use JsonApi\Errors\RecordNotFoundException;
use SimpleORMap;
use User;
use Xyng\Yuoshi\Helper\AuthorityHelper;
use Xyng\Yuoshi\Model\UserTaskContentQuestSolutions;
use Xyng\Yuoshi\Model\UserTaskContentSolutions;
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

    static function checkAndMarkDone(UserTaskSolutions $solution) {
        $task = $solution->task;

        $contents = $task->contents;
        $doneContents = 0;
        $totalScore = 0;
        $totalContents = $contents->count();

        $contentSolutions = $solution->content_solutions;

        foreach ($contents as $content) {
            /** @var UserTaskContentSolutions|null $contentSolution */
            $contentSolution = $contentSolutions->findOneBy('content_id', $content->id);

            if (!$contentSolution) {
                continue;
            }

            $score = TaskContentSolutionAuthority::isContentSolutionDone($contentSolution);
            if ($score !== false) {
                $totalScore += $score;
                $doneContents += 1;
            }
        }

        if ($totalContents === $doneContents) {
            $solution->finished = new \DateTimeImmutable();
            $solution->points = (int) round((int) $task->credits * ($totalScore / max($totalContents, 1)));
            $solution->store();
        }
    }
}
