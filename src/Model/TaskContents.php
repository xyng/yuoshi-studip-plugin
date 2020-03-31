<?php
namespace Xyng\Yuoshi\Model;

use eTask\Task;

/**
 * Class TaskContents
 * @package Xyng\Yuoshi\Model
 *
 * @property \SimpleORMap|Task $task
 * @property \SimpleCollection|TaskContentQuests[] $quests
 */
class TaskContents extends BaseModel {
    protected static function configure($config = []) {
        $config['db_table'] = 'yuoshi_task_contents';

        $config['has_many']['quests'] = [
            'on_store' => true,
            'class_name' => TaskContentQuests::class,
            'assoc_foreign_key' => 'content_id'
        ];

        $config['belongs_to']['task'] = [
            'class_name' => Tasks::class,
            'foreign_key' => 'task_id'
        ];

        parent::configure($config);
    }
}
