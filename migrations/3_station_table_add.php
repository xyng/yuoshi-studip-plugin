<?php

require_once __DIR__ . '/../vendor/autoload.php';

class StationTableAdd extends Migration
{
    public function up()
    {
         $db = DBManager::get();
         $db->exec("CREATE TABLE IF NOT EXISTS `yuoshi_stations` (
             `id` varchar(32) NOT NULL,
             `package_id` varchar(32) NOT NULL,
             `slug` varchar(64) DEFAULT NULL,
             `title` varchar(255) NOT NULL,
             `mkdate` datetime NOT NULL DEFAULT current_timestamp(),
             `chdate` datetime NOT NULL DEFAULT current_timestamp(),
             PRIMARY KEY (`id`),
             UNIQUE KEY `slug` (`slug`) USING BTREE
           ) ENGINE=InnoDB DEFAULT CHARSET=latin1");

        $packages = \Xyng\Yuoshi\Model\Packages::getAllPackages();
        foreach ($packages as &$package) {
            $station = \Xyng\Yuoshi\Model\Stations::build(
                [
                    'title' => $package->title,
                    'slug' => $package->slug,
                    'package_id' => $package->id
                ]
            );
            $station->store();
        }

        $db->exec("ALTER TABLE `studip`.`yuoshi_tasks` ADD COLUMN station_id varchar(32) NULL");
        $db->exec("UPDATE `studip`.`yuoshi_tasks` SET station_id = (select id from `studip`.`yuoshi_stations` where `yuoshi_stations`.package_id = `yuoshi_tasks`.package_id limit 1)");
        $db->exec("ALTER TABLE `studip`.`yuoshi_tasks` MODIFY COLUMN `station_id` varchar(32) NOT NULL, DROP FOREIGN KEY `yuoshi_tasks_ibfk_1`, DROP COLUMN package_id, ADD FOREIGN KEY (`station_id`) REFERENCES `yuoshi_stations` (`id`)");
    }

    public function down()
    {
        // Nothing so far
    }
}
