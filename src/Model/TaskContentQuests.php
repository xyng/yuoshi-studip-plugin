<?php
namespace Xyng\Yuoshi\Model;

/**
 * Class TaskContentQuests
 * @package Xyng\Yuoshi\Model
 *
 * @property string $content_id
 * @property string $name
 * @property string|null $image
 * @property string|null $prePhrase
 * @property string $question
 * @property boolean $multiple
 * @property boolean $require_order
 * @property boolean $custom_answer
 * @property number|null $sort
 *
 * @property \SimpleORMapCollection|TaskContentQuestAnswers[] $answers
 * @property TaskContents $content
 */
class TaskContentQuests extends BaseModel {
    protected static function configure($config = []) {
        $config['db_table'] = 'yuoshi_task_content_quests';

        $config['has_many']['answers'] = [
            'on_store' => true,
            'class_name' => TaskContentQuestAnswers::class,
            'assoc_foreign_key' => 'quest_id',
            'on_delete' => true,
        ];

        $config['has_many']['quest_solutions'] = [
            'class_name' => UserTaskContentQuestSolutions::class,
            'assoc_foreign_key' => 'quest_id',
            'on_delete' => true,
        ];

        $config['belongs_to']['content'] = [
            'class_name' => TaskContents::class,
            'foreign_key' => 'content_id'
        ];

        $config['file_groups'] = [
            'images' => 'images',
        ];

        parent::configure($config);
    }
}
