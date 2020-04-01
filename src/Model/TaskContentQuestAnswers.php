<?php
namespace Xyng\Yuoshi\Model;

/**
 * Class TaskContentQuestAnswers
 * @package Xyng\Yuoshi\Model
 *
 * @property string quest_id
 * @property string content
 * @property boolean is_correct
 * @property int|null sort
 *
 * @property TaskContentQuests $quest
 */
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
