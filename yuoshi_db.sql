-- -------------------------------------------------------------
-- TablePlus 2.12(282)
--
-- https://tableplus.com/
--
-- Database: studip
-- Generation Time: 2020-02-25 18:28:27.2450
-- -------------------------------------------------------------


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


CREATE TABLE `yuoshi_tasks` (
  `id` varchar(32) NOT NULL,
  `package_id` varchar(32) DEFAULT NULL,
  `is_training` tinyint(1) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `type` varchar(32) DEFAULT NULL,
  `title` varchar(32) DEFAULT NULL,
  `description` varchar(32) DEFAULT NULL,
  `credits` int(11) DEFAULT NULL,
  `mkdate` datetime DEFAULT NULL,
  `chdate` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `yuoshi_packages` (
  `id` varchar(32) NOT NULL,
  `course_id` varchar(32) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `mkdate` datetime DEFAULT NULL,
  `chdate` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `yuoshi_task_contents` (
  `id` varchar(32) NOT NULL,
  `task_id` varchar(32) DEFAULT NULL,
  `intro` text DEFAULT NULL,
  `outro` text DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `mkdate` datetime DEFAULT NULL,
  `chdate` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `yuoshi_task_attributes` (
  `id` varchar(32) NOT NULL,
  `task_id` varchar(32) DEFAULT NULL,
  `item` varchar(255) DEFAULT NULL,
  `value` text DEFAULT NULL,
  `mkdate` datetime DEFAULT NULL,
  `chdate` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `yuoshi_task_content_quests` (
  `id` varchar(32) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `prePhrase` text DEFAULT NULL,
  `question` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `multiple` tinyint(1) DEFAULT NULL,
  `content_id` varchar(32) DEFAULT NULL,
  `mkdate` datetime DEFAULT NULL,
  `chdate` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `yuoshi_task_content_quest_answers` (
  `id` varchar(32) NOT NULL,
  `content` text DEFAULT NULL,
  `is_correct` tinyint(1) DEFAULT NULL,
  `quest_id` varchar(32) DEFAULT NULL,
  `mkdate` datetime DEFAULT NULL,
  `chdate` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;




/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;