<?php
namespace Xyng\Yuoshi\Model;

use eTask\Task;

/**
 * Class TaskContents
 * @package Xyng\Yuoshi\Model
 *
 * @property string $task_id
 *
 * @property \SimpleORMap|Task $task
 * @property \SimpleORMapCollection|TaskContentQuests[] $quests
 * @property \SimpleORMapCollection|Files[] $images
 */
class TaskContents extends BaseModel {
    protected static function configure($config = []) {
        $config['db_table'] = 'yuoshi_task_contents';

        $config['has_many']['quests'] = [
            'on_store' => true,
            'class_name' => TaskContentQuests::class,
            'assoc_foreign_key' => 'content_id',
            'on_delete' => true,
        ];

        $config['has_many']['content_solutions'] = [
            'class_name' => UserTaskContentSolutions::class,
            'assoc_foreign_key' => 'content_id',
            'on_delete' => true,
        ];

        $config['belongs_to']['task'] = [
            'class_name' => Tasks::class,
            'foreign_key' => 'task_id'
        ];

        $config['file_groups'] = [
            'images' => 'images',
        ];

        parent::configure($config);
    }
}
