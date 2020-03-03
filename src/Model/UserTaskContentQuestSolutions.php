<?php
namespace Xyng\Yuoshi\Model;

/**
 * Class UserTaskContentQuestSolutions
 * @package Xyng\Yuoshi\Model
 *
 * @property string $content_solution_id
 * @property string $quest_id
 * @property string $answer_id
 */
class UserTaskContentQuestSolutions extends BaseModel {
    protected static function configure($config = []) {
        $config['db_table'] = 'yuoshi_user_task_content_quest_solutions';

        $config['belongs_to']['content_solution'] = [
            'class_name' => UserTaskContentSolutions::class,
            'foreign_key' => 'content_solution_id'
        ];
        $config['belongs_to']['quest'] = [
            'class_name' => TaskContentQuests::class,
            'foreign_key' => 'quest_id'
        ];
        $config['belongs_to']['answer'] = [
            'class_name' => TaskContentQuestAnswers::class,
            'foreign_key' => 'answer_id'
        ];

        parent::configure($config);
    }
}
