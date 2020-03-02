<?php
namespace Xyng\Yuoshi\Model;

class TaskContentQuestAnswers extends BaseModel {
    protected static function configure($config = []) {
        $config['db_table'] = 'yuoshi_task_content_quest_answers';

        $config['belongs_to']['quest'] = [
            'class_name' => TaskContentQuests::class,
            'foreign_key' => 'quest_id'
        ];

        parent::configure($config);
    }
}
