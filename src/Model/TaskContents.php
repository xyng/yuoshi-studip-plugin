<?php
namespace Xyng\Yuoshi\Model;

/**
 * Class TaskContents
 * @package Xyng\Yuoshi\Model
 *
 * @property \SimpleCollection|TaskContentKeywords[] $keywords
 * @property \SimpleCollection|TaskContentImages[] $images
 */
class TaskContents extends BaseModel {
    protected static function configure($config = []) {
        $config['db_table'] = 'yuoshi_task_contents';

        $config['has_many']['quests'] = [
            'on_store' => true,
            'class_name' => TaskContentQuests::class,
            'assoc_foreign_key' => 'content_id'
        ];

        $config['has_many']['keywords'] = [
            'on_store' => true,
            'class_name' => TaskContentKeywords::class,
            'assoc_foreign_key' => 'content_id'
        ];

        $config['has_many']['images'] = [
            'on_store' => true,
            'class_name' => TaskContentImages::class,
            'assoc_foreign_key' => 'content_id'
        ];

        $config['belongs_to']['task'] = [
            'class_name' => Tasks::class,
            'foreign_key' => 'task_id'
        ];

        parent::configure($config);
    }
}
