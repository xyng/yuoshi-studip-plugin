<?php
declare(strict_types=1);
require_once __DIR__ . '/../vendor/autoload.php';

class YuoshiFiles extends Migration
{
    public function up()
    {
        $db = DBManager::get();
        $db->exec(<<<SQLSTR
CREATE TABLE `yuoshi_files` (
  `id` varchar(32) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `fk_model` varchar(255) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `fk_key` varchar(32) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `file_id` varchar(32) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `mkdate` datetime DEFAULT NULL,
  `chdate` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `file_id` (`file_id`),
  KEY `fk_index` (`fk_model`,`fk_key`) USING BTREE,
  CONSTRAINT `yuoshi_files_ibfk_1` FOREIGN KEY (`file_id`) REFERENCES `file_refs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
SQLSTR
);
    }

    public function down()
    {
        $db = DBManager::get();
        $db->exec('DROP TABLE IF EXISTS `yuoshi_files`;');
    }
}
