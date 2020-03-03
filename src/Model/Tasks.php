<?php
namespace Xyng\Yuoshi\Model;

use SimpleORMap;

/**
 * Class Tasks
 * @package Xyng\Yuoshi\Model
 *
 * @property string $title
 * @property string $kind
 */
class Tasks extends BaseModel {
    protected static function configure($config = []) {
        $config['db_table'] = 'yuoshi_tasks';

        $config['has_many']['contents'] = [
            'on_store' => true,
            'class_name' => TaskContents::class,
            'assoc_foreign_key' => 'task_id'
        ];

        $config['has_many']['attributes'] = [
            'on_store' => true,
            'class_name' => TaskAttributes::class,
            'assoc_foreign_key' => 'task_id'
        ];

        parent::configure($config);
    }
}
