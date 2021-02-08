<?php
class ExtendTaskTitleLength extends Migration
{
    public function up()
    {
        $db = DBManager::get();
        $db->exec("ALTER TABLE `studip`.`yuoshi_tasks` CHANGE `title` `title` varchar(255) NOT NULL");
    }

    public function down()
    {
        // no downgrading - doing this may cut off strings
        // while doing nothing will not affect other migrations.
    }
}
