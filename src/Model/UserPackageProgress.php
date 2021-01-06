<?php
namespace Xyng\Yuoshi\Model;

use User;

/**
 * Class UserPackageProgress
 * @package Xyng\Yuoshi\Model
 *
 * @property User $user
 */
class UserPackageProgress extends Packages {
    protected static function configure($config = []) {
        $config['belongs_to']['user'] = [
            'class_name' => User::class,
            'foreign_key' => 'user_id'
        ];

        parent::configure($config);
    }
}
