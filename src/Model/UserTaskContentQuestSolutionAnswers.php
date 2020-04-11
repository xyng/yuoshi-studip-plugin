<?php
namespace Xyng\Yuoshi\Model;

/**
 * Class UserTaskContentQuestSolutions
 * @package Xyng\Yuoshi\Model
 *
 * @property string $quest_solution_id
 * @property string $answer_id
 * @property string $custom
 * @property number|null $sort
 *
 * @property UserTaskContentQuestSolutions $content_solution
 * @property TaskContentQuestAnswers|null $answer
 */
class UserTaskContentQuestSolutionAnswers extends BaseModel {
    protected static function configure($config = []) {
        $config['db_table'] = 'yuoshi_user_task_content_quest_solution_answers';

        $config['belongs_to']['quest_solution'] = [
            'class_name' => UserTaskContentQuestSolutions::class,
            'foreign_key' => 'quest_solution_id'
        ];
        $config['belongs_to']['answer'] = [
            'class_name' => TaskContentQuestAnswers::class,
            'foreign_key' => 'answer_id'
        ];

        parent::configure($config);
    }
}
