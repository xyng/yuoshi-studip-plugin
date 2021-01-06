<?php

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
    }
    
    public function down()
    {
        // Nothing so far
    }
}
