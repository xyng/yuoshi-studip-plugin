<?php

class PackageSequence extends Migration {
    function up () {
        $db = DBManager::get();
        $db->exec("ALTER TABLE `studip`.`yuoshi_packages` ADD COLUMN `sort` int NOT NULL DEFAULT 0");
    }

    function down () {
        $db = DBManager::get();
        $db->exec("ALTER TABLE `studip`.`yuoshi_packages` DROP COLUMN `sort`");
    }
}
