<?php

require_once __DIR__ . '/../vendor/autoload.php';

class LearningObjectiveAdd extends Migration
{
    public function up()
    {
        $db = DBManager::get();
        $db->exec("CREATE TABLE IF NOT EXISTS `yuoshi_learning_objectives` (
            `id` varchar(32) NOT NULL,
            `package_id` varchar(32) NOT NULL,
            `title` varchar(64) DEFAULT NULL,
            `image` varchar(64) DEFAULT NULL,
            `description` varchar(255) NOT NULL,
            `sort` int NOT NULL,
            `mkdate` datetime NOT NULL DEFAULT current_timestamp(),
            `chdate` datetime NOT NULL DEFAULT current_timestamp(),
            PRIMARY KEY (`id`),
            FOREIGN KEY (`package_id`) REFERENCES `yuoshi_packages` (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=latin1");

        $db->exec("CREATE TABLE IF NOT EXISTS `yuoshi_objectives_users` (
            `user_id` varchar(32) NOT NULL,
            `objective_id` varchar(32) NOT NULL,
            PRIMARY KEY (`user_id`, `objective_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=latin1");

        $db->exec("ALTER TABLE `studip`.`yuoshi_stations` 
            ADD COLUMN `is_objective_exam` boolean, 
            ADD COLUMN `learning_objective_id` varchar(32), ADD FOREIGN KEY (`learning_objective_id`) 
            REFERENCES `yuoshi_learning_objectives` (`id`)");
    }

    public function down()
    {
        //nothing so far
    }
}
