<?php
namespace Xyng\Yuoshi\Model;

/**
 * Class TaskContentImages
 * @package Xyng\Yuoshi\Model
 *
 * @property string $content_id
 * @property string $title
 * @property string $meta
 * @property string $path
 */
class TaskContentImages extends BaseModel {
    protected static function configure($config = []) {
        $config['db_table'] = 'yuoshi_task_content_images';

        $config['belongs_to']['content'] = [
            'class_name' => TaskContents::class,
            'foreign_key' => 'content_id'
        ];

        parent::configure($config);
    }
}
