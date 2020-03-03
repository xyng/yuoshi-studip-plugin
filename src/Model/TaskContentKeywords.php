<?php
namespace Xyng\Yuoshi\Model;

/**
 * Class TaskContentKeywords
 * @package Xyng\Yuoshi\Model
 *
 * @property string $content_id
 * @property string $keyword
 *
 * @property TaskContents[] $contents
 */
class TaskContentKeywords extends BaseModel {
    protected static function configure($config = []) {
        $config['db_table'] = 'yuoshi_task_content_keywords';

        $config['belongs_to']['content'] = [
            'class_name' => TaskContents::class,
            'foreign_key' => 'content_id'
        ];

        parent::configure($config);
    }
}
