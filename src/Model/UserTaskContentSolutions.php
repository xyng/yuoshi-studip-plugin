<?php
namespace Xyng\Yuoshi\Model;

use JSONArrayObject;

/**
 * Class UserTaskContentSolutions
 * @package Xyng\Yuoshi\Model
 *
 * @property string $solution_id
 * @property string $content_id
 * @property JSONArrayObject $value
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

        $config['serialized_fields']['value'] = JSONArrayObject::class;

        parent::configure($config);
    }
}
