<?php
class ExtendTaskTitleLength extends Migration {
    function up () {
        $db = DBManager::get();
        $db->exec("ALTER TABLE `studip`.`yuoshi_tasks` CHANGE `title` `title` varchar(255) NOT NULL");
    }

    function down () {
        // no downgrading - doing this may cut off strings
        // while doing nothing will not affect other migrations.
    }
}
