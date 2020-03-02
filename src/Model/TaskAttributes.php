<?php
namespace Xyng\Yuoshi\Model;

class TaskAttributes extends BaseModel {
    protected static function configure($config = []) {
        $config['db_table'] = 'yuoshi_task_attributes';

        $config['belongs_to']['task'] = [
            'class_name' => Tasks::class,
            'foreign_key' => 'task_id'
        ];

        parent::configure($config);
    }
}
