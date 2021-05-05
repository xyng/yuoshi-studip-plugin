<?php
namespace Xyng\Yuoshi\Model;

use SimpleORMap;
use Xyng\Yuoshi\Model\Packages;
use Xyng\Yuoshi\Model\Stations;
use Xyng\Yuoshi\Model\Tasks;

/**
 * Class LearningObjective
 * @package Xyng\Yuoshi\Model
 * @property Stations $station
 * @property Packages $station
 * @property \SimpleORMapCollection|TaskContents[] $contents
 */
class LearningObjectives extends BaseModel
{
    protected static function configure($config = [])
    {
        $config['db_table'] = 'yuoshi_learning_objectives';

        $config['belongs_to']['package'] = [
            'class_name' => Packages::class,
            'foreign_key' => 'package_id'
        ];

        $config['has_many']['station'] = [
            'on_store' => true,
            'class_name' => Stations::class,
            'assoc_foreign_key' => 'learning_objective_id',
            'on_delete' => true,
        ];

        // $config['belongs_to_many']['users'] = [
        //     'class_name' => \User::class,
        //     'foreign_key' => 'user_id'
        // ];

        parent::configure($config);
    }
}
