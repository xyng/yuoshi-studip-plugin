-- -------------------------------------------------------------
-- TablePlus 2.12(282)
--
-- https://tableplus.com/
--
-- Database: studip
-- Generation Time: 2020-03-10 12:04:52.8100
-- -------------------------------------------------------------


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


CREATE TABLE `yuoshi_packages` (
  `id` varchar(32) NOT NULL,
  `course_id` varchar(32) NOT NULL,
  `slug` varchar(64) NOT NULL,
  `title` varchar(255) NOT NULL,
  `mkdate` datetime NOT NULL DEFAULT current_timestamp(),
  `chdate` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `yuoshi_task_content_quest_answers` (
  `id` varchar(32) NOT NULL,
  `content` text NOT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT 0,
  `quest_id` varchar(32) NOT NULL,
  `mkdate` datetime NOT NULL DEFAULT current_timestamp(),
  `chdate` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `quest_id` (`quest_id`),
  CONSTRAINT `yuoshi_task_content_quest_answers_ibfk_1` FOREIGN KEY (`quest_id`) REFERENCES `yuoshi_task_content_quests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `yuoshi_task_content_quests` (
  `id` varchar(32) NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `prePhrase` text DEFAULT NULL,
  `question` text NOT NULL,
  `content` text DEFAULT NULL,
  `multiple` tinyint(1) NOT NULL DEFAULT 0,
  `content_id` varchar(32) NOT NULL,
  `mkdate` datetime NOT NULL DEFAULT current_timestamp(),
  `chdate` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `content_id` (`content_id`),
  CONSTRAINT `yuoshi_task_content_quests_ibfk_1` FOREIGN KEY (`content_id`) REFERENCES `yuoshi_task_contents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `yuoshi_task_contents` (
  `id` varchar(32) NOT NULL,
  `task_id` varchar(32) NOT NULL,
  `intro` text DEFAULT NULL,
  `outro` text DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `mkdate` datetime NOT NULL DEFAULT current_timestamp(),
  `chdate` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `task_id` (`task_id`),
  CONSTRAINT `yuoshi_task_contents_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `yuoshi_tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `yuoshi_tasks` (
  `id` varchar(32) NOT NULL,
  `package_id` varchar(32) NOT NULL,
  `sort` int(4) NOT NULL,
  `is_training` tinyint(1) NOT NULL DEFAULT 0,
  `image` varchar(255) DEFAULT NULL,
  `kind` varchar(32) NOT NULL,
  `title` varchar(32) NOT NULL,
  `description` varchar(32) DEFAULT NULL,
  `credits` int(11) NOT NULL DEFAULT 0,
  `mkdate` datetime NOT NULL DEFAULT current_timestamp(),
  `chdate` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `package_id` (`package_id`),
  CONSTRAINT `yuoshi_tasks_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `yuoshi_packages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `yuoshi_user_task_content_quest_solutions` (
  `id` varchar(32) NOT NULL,
  `content_solution_id` varchar(32) NOT NULL,
  `quest_id` varchar(32) NOT NULL,
  `answer_id` varchar(32) NOT NULL,
  `mkdate` datetime NOT NULL DEFAULT current_timestamp(),
  `chdate` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `quest_id` (`quest_id`),
  KEY `answer_id` (`answer_id`),
  CONSTRAINT `yuoshi_user_task_content_quest_solutions_ibfk_1` FOREIGN KEY (`quest_id`) REFERENCES `yuoshi_task_content_quests` (`id`),
  CONSTRAINT `yuoshi_user_task_content_quest_solutions_ibfk_2` FOREIGN KEY (`answer_id`) REFERENCES `yuoshi_task_content_quest_answers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `yuoshi_user_task_content_solutions` (
  `id` varchar(32) NOT NULL,
  `solution_id` varchar(32) NOT NULL,
  `content_id` varchar(32) NOT NULL,
  `value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`value`)),
  `mkdate` datetime NOT NULL DEFAULT current_timestamp(),
  `chdate` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `solution_id` (`solution_id`),
  KEY `content_id` (`content_id`),
  CONSTRAINT `yuoshi_user_task_content_solutions_ibfk_1` FOREIGN KEY (`solution_id`) REFERENCES `yuoshi_user_task_solutions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `yuoshi_user_task_content_solutions_ibfk_2` FOREIGN KEY (`content_id`) REFERENCES `yuoshi_task_contents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `yuoshi_user_task_solutions` (
  `id` varchar(32) NOT NULL,
  `task_id` varchar(32) NOT NULL,
  `user_id` varchar(32) NOT NULL,
  `mkdate` datetime NOT NULL DEFAULT current_timestamp(),
  `chdate` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;




/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
