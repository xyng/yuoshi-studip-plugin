<?php
namespace Xyng\Yuoshi\Model;

use Course;
use SimpleORMap;

/**
 * Class Packages
 * @package Xyng\Yuoshi\Model
 *
 * @property string $course_id
 * @property Course $course
 * @property Tasks[] $tasks
 *
 * @method static Packages find(string $id)
 */
class Packages extends BaseModel {
    protected static function configure($config = []) {
        $config['db_table'] = 'yuoshi_packages';

        $config['has_many']['tasks'] = [
            'class_name' => Tasks::class,
            'assoc_func' => 'findByPackage_id'
        ];

        $config['belongs_to']['course'] = [
            'class_name' => Course::class,
            'foreign_key' => 'course_id'
        ];

        parent::configure($config);
    }

    // TODO: check in db if this package is playable by user.
    public $playable = true;
}
