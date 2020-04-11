<?php
namespace Xyng\Yuoshi\Model;

use SimpleORMap;

/**
 * Class Tasks
 * @package Xyng\Yuoshi\Model
 *
 * @property string $title
 * @property string $kind
 * @property number $credits
 * @property Packages $package
 * @property \SimpleORMapCollection|TaskContents[] $contents
 */
class Tasks extends BaseModel {
    public static $types = ['card', 'cloze', 'drag', 'memory', 'multi', 'survey', 'tag', 'training'];
    protected static function configure($config = []) {
        $config['db_table'] = 'yuoshi_tasks';

        $config['belongs_to']['package'] = [
            'class_name' => Packages::class,
            'foreign_key' => 'package_id'
        ];

        $config['has_many']['contents'] = [
            'on_store' => true,
            'class_name' => TaskContents::class,
            'assoc_foreign_key' => 'task_id'
        ];

        $config['has_many']['solutions'] = [
            'on_store' => true,
            'class_name' => UserTaskSolutions::class,
            'assoc_foreign_key' => 'task_id'
        ];

        parent::configure($config);
    }
}
