<?php
namespace Xyng\Yuoshi\Model;

use User;

/**
 * Class UserStationProgress
 * @package Xyng\Yuoshi\Model
 *
 * @property User $user
 */
class UserStationProgress extends Stations {
    protected static function configure($config = []) {
        $config['belongs_to']['user'] = [
            'class_name' => User::class,
            'foreign_key' => 'user_id'
        ];

        parent::configure($config);
    }
}
