<?php
namespace Xyng\Yuoshi\Model;

use SimpleORMap;
use Xyng\Yuoshi\Model\Stations;

/**
 * Class Tasks
 * @package Xyng\Yuoshi\Model
 *
 * @property string $title
 * @property string $kind
 * @property number $credits
 * @property Stations $station
 * @property \SimpleORMapCollection|TaskContents[] $contents
 */
class Tasks extends BaseModel
{
    public static $types = ['card', 'cloze', 'drag', 'memory', 'multi', 'survey', 'tag', 'training'];
    protected static function configure($config = [])
    {
        $config['db_table'] = 'yuoshi_tasks';

        $config['belongs_to']['station'] = [
            'class_name' => Stations::class,
            'foreign_key' => 'station_id'
        ];

        $config['has_many']['contents'] = [
            'on_store' => true,
            'class_name' => TaskContents::class,
            'assoc_foreign_key' => 'task_id',
            'on_delete' => true,
        ];

        $config['has_many']['solutions'] = [
            'on_store' => true,
            'class_name' => UserTaskSolutions::class,
            'assoc_foreign_key' => 'task_id',
            'on_delete' => true,
        ];

        parent::configure($config);
    }
    public function getSolutionForUser($user_id)
    {
        return UserTaskSolutions::findOneWithQuery([
            'conditions' => [
                'task_id' => $this->id,
                'user_id' => $user_id
            ],
            'order' => [
                'chdate DESC'
            ]
        ]);
    }
}
