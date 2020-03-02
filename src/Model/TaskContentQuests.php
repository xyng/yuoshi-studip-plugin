<?php
namespace Xyng\Yuoshi\Model;

class TaskContentQuests extends BaseModel {
    protected static function configure($config = []) {
        $config['db_table'] = 'yuoshi_task_content_quests';

        $config['has_many']['answers'] = [
            'on_store' => true,
            'class_name' => TaskContentQuestAnswers::class,
            'assoc_foreign_key' => 'quest_id'
        ];

        $config['belongs_to']['content'] = [
            'class_name' => TaskContents::class,
            'foreign_key' => 'content_id'
        ];

        parent::configure($config);
    }
}
