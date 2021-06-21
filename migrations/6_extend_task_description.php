<?php

require_once __DIR__ . '/../vendor/autoload.php';

class ExtendTaskDescription extends Migration
{
    public function up()
    {
        $db = DBManager::get();
        $db->exec("ALTER TABLE `yuoshi_tasks` CHANGE `description` `description` VARCHAR(255)");
    }

    public function down()
    {
        //nothing so far
    }
}
