<?php

class ContentFile extends Migration
{
    public function up()
    {
        $db = DBManager::get();
        $db->exec("ALTER TABLE  `studip`.`yuoshi_task_contents` ADD  COLUMN `file` varchar(32) NULL");
     //   $db->exec("ALTER TABLE  `studip`.`yuoshi_task_contents` ADD foreign key (`file`) references `studip`.`file_refs`(`id`)");
    }

    public function down()
    {
        $db = DBManager::get();
        $db->exec("ALTER TABLE `studip`.`yuoshi_task_contents` DROP COLUMN `file`");
    }
}
