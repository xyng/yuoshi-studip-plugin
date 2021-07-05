<?php

require_once __DIR__ . '/../vendor/autoload.php';

class NullifyTaskContentQuestions extends Migration
{
    public function up()
    {
        $db = DBManager::get();
        $db->exec("ALTER TABLE `yuoshi_task_content_quests` CHANGE `question` `question` TEXT CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL");
        $db->exec("ALTER TABLE `yuoshi_task_content_quests` CHANGE `name` `name` TEXT CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL");

    }

    public function down()
    {
        //nothing so far
    }
}
