<?php
namespace Xyng\Yuoshi\Model;

use SimpleORMapCollection;
use User;
use Xyng\Yuoshi\Api\Authority\TaskContentSolutionAuthority;

/**
 * Class UserTaskSolutions
 * @package Xyng\Yuoshi\Model
 *
 * @property string $task_id
 * @property string $user_id
 * @property number|null $points
 * @property boolean $is_correct
 * @property \DateTimeImmutable $finished
 *
 * @property Tasks $task
 * @property User $user
 * @property SimpleORMapCollection|UserTaskContentSolutions[] $content_solutions
 * @property UserTaskContentSolutions|null $current_content_solution
 * @property SimpleORMapCollection|UserTaskContentSolutions[] $done_content_solutions
 */
class UserTaskSolutions extends BaseModel {
    protected $dateFields = ['mkdate', 'chdate', 'finished'];

    protected static function configure($config = []) {
        $config['db_table'] = 'yuoshi_user_task_solutions';

        $config['has_many']['content_solutions'] = [
            'on_store' => true,
            'class_name' => UserTaskContentSolutions::class,
            'assoc_foreign_key' => 'solution_id'
        ];

        $config['belongs_to']['task'] = [
            'class_name' => Tasks::class,
            'foreign_key' => 'task_id'
        ];
        $config['belongs_to']['user'] = [
            'class_name' => User::class,
            'foreign_key' => 'user_id'
        ];

        $config['additional_fields']['is_correct'] = [
            'get' => function (UserTaskSolutions $solution) {
                return $solution->points && $solution->points === $solution->task->credits;
            }
        ];

        $config['additional_fields']['done_content_solutions'] = [
            'get' => function (UserTaskSolutions $solution) {
                return $solution->content_solutions->filter(function ($contentSolution) {
                    return TaskContentSolutionAuthority::isContentSolutionDone($contentSolution);
                });
            }
        ];

        $config['additional_fields']['current_content_solution'] = [
            'get' => function (UserTaskSolutions $solution) {
                if ($solution->finished) {
                    return null;
                }

                // TODO: maybe rebuild this as join query?

                $contents = $solution->task->contents;

                foreach ($contents as $content) {
                    /** @var UserTaskContentSolutions $contentSolution */
                    $contentSolution = $solution->content_solutions->findOneBy('content_id', $content->id);

                    if (!$contentSolution) {
                        $contentSolution = new UserTaskContentSolutions();

                        $contentSolution->content_id = $content->id;
                        $contentSolution->solution_id = $solution->id;

                        // content cannot be set with magic setter here, because content is also a protected property of SimpleORMap
                        // and since we are in a Model-Class here, we would access that instead of the magic accessor / setter.
                        $contentSolution->setValue('content', $content);
                        $contentSolution->task_solution = $solution;

                        // set temporary id
                        $contentSolution->id = 'temp_' . $contentSolution->getNewId();
                    }

                    if (!TaskContentSolutionAuthority::isContentSolutionDone($contentSolution, $content)) {
                        return $contentSolution;
                    }
                }

                return null;
            }
        ];

        parent::configure($config);
    }
}
