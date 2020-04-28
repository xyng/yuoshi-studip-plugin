<?php
namespace Xyng\Yuoshi\Model;

use JSONArrayObject;
use SimpleORMapCollection;
use Xyng\Yuoshi\Authority\TaskContentQuestSolutionAuthority;

/**
 * Class UserTaskContentSolutions
 * @package Xyng\Yuoshi\Model
 *
 * @property string $solution_id
 * @property string $content_id
 * @property JSONArrayObject $value
 *
 * @property TaskContents $content
 * @property UserTaskSolutions $task_solution
 * @property SimpleORMapCollection|UserTaskContentQuestSolutions[] $quest_solutions
 * @property TaskContentQuests|null $current_quest
 * @property SimpleORMapCollection|UserTaskContentQuestSolutions[] $done_quests
 */
class UserTaskContentSolutions extends BaseModel {
    protected static function configure($config = []) {
        $config['db_table'] = 'yuoshi_user_task_content_solutions';

        $config['has_many']['quest_solutions'] = [
            'on_store' => true,
            'class_name' => UserTaskContentQuestSolutions::class,
            'assoc_foreign_key' => 'content_solution_id'
        ];

        $config['belongs_to']['content'] = [
            'class_name' => TaskContents::class,
            'foreign_key' => 'content_id'
        ];

        $config['belongs_to']['task_solution'] = [
            'class_name' => UserTaskSolutions::class,
            'foreign_key' => 'solution_id'
        ];

        $config['serialized_fields']['value'] = JSONArrayObject::class;

        $config['additional_fields']['done_quests'] = [
            'get' => function (UserTaskContentSolutions $contentSolution) {
                // group by quest_id. we cannot use the group function of the SimpleCollection as that would cast
                // the entities to arrays.
                $questsSolutions = [];
                foreach ($contentSolution->quest_solutions as $quest_solution) {
                    $questsSolutions[$quest_solution->quest_id] = $quest_solution;
                }

                return array_filter($questsSolutions, function ($questSolutions) {
                    return TaskContentQuestSolutionAuthority::areQuestSolutionsDone($questSolutions);
                });
            }
        ];

        $config['additional_fields']['current_quest'] = [
            'get' => function (UserTaskContentSolutions $contentSolution) {
                // call getValue explicitly - magic function wont work here because 'content' is a protected field in models
                // which is accessible here as this is a model class
                /** @var TaskContents $content */
                $content = $contentSolution->getValue('content');
                $questsSolutions = $contentSolution->quest_solutions;

                $quests = $content->quests;

                foreach ($quests as $quest) {
                    /** @var \SimpleCollection|UserTaskContentQuestSolutions[] $questSolutions */
                    $questSolutions = $questsSolutions->findBy('quest_id', $quest->id);

                    if (TaskContentQuestSolutionAuthority::areQuestSolutionsDone($questSolutions) === false) {
                        return $quest;
                    }
                }

                return null;
            }
        ];

        parent::configure($config);
    }
}
