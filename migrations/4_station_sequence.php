<?php

class StationSequence extends Migration
{
    public function up()
    {
        $db = DBManager::get();
        $db->exec("ALTER TABLE  `studip`.`yuoshi_stations` ADD  COLUMN `sort` int NOT NULL DEFAULT 0");
    }

    public function down()
    {
        $db = DBManager::get();
        $db->exec("ALTER TABLE `studip`.`yuoshi_stations` ADD COLUMN `sort`");
    }
}
