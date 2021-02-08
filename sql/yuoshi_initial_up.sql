CREATE TABLE IF NOT EXISTS `yuoshi_packages` (
  `id` varchar(32) NOT NULL,
  `course_id` varchar(32) NOT NULL,
  `slug` varchar(64) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `mkdate` datetime NOT NULL DEFAULT current_timestamp(),
  `chdate` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `yuoshi_stations` (
  `id` varchar(32) NOT NULL,
  `package_id` varchar(32) NOT NULL,
  `slug` varchar(64) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `mkdate` datetime NOT NULL DEFAULT current_timestamp(),
  `chdate` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `yuoshi_tasks` (
  `id` varchar(32) NOT NULL,
  `station_id` varchar(32) NOT NULL,
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
  KEY `station_id` (`station_id`),
  CONSTRAINT `yuoshi_tasks_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `yuoshi_stations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `yuoshi_task_contents` (
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

CREATE TABLE IF NOT EXISTS `yuoshi_task_content_quests` (
  `id` varchar(32) NOT NULL,
  `content_id` varchar(32) NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `prePhrase` text DEFAULT NULL,
  `question` text NOT NULL,
  `multiple` tinyint(1) NOT NULL DEFAULT 0,
  `mkdate` datetime NOT NULL DEFAULT current_timestamp(),
  `chdate` datetime NOT NULL DEFAULT current_timestamp(),
  `sort` int(11) unsigned DEFAULT NULL,
  `require_order` tinyint(1) NOT NULL,
  `custom_answer` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `content_id` (`content_id`),
  CONSTRAINT `yuoshi_task_content_quests_ibfk_1` FOREIGN KEY (`content_id`) REFERENCES `yuoshi_task_contents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `yuoshi_task_content_quest_answers` (
  `id` varchar(32) NOT NULL,
  `quest_id` varchar(32) NOT NULL,
  `content` text NOT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT 0,
  `sort` int(11) DEFAULT NULL,
  `mkdate` datetime NOT NULL DEFAULT current_timestamp(),
  `chdate` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `quest_id` (`quest_id`),
  CONSTRAINT `yuoshi_task_content_quest_answers_ibfk_1` FOREIGN KEY (`quest_id`) REFERENCES `yuoshi_task_content_quests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `yuoshi_user_task_solutions` (
  `id` varchar(32) NOT NULL,
  `task_id` varchar(32) NOT NULL,
  `user_id` varchar(32) NOT NULL,
  `points` int(11) unsigned DEFAULT NULL,
  `finished` datetime DEFAULT NULL,
  `mkdate` datetime NOT NULL DEFAULT current_timestamp(),
  `chdate` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `task_id` (`task_id`),
  CONSTRAINT `yuoshi_user_task_solutions_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `yuoshi_tasks` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `yuoshi_user_task_content_solutions` (
  `id` varchar(32) NOT NULL,
  `solution_id` varchar(32) NOT NULL,
  `content_id` varchar(32) NOT NULL,
  `value` longtext DEFAULT NULL,
  `mkdate` datetime NOT NULL DEFAULT current_timestamp(),
  `chdate` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `solution_id` (`solution_id`),
  KEY `content_id` (`content_id`),
  CONSTRAINT `yuoshi_user_task_content_solutions_ibfk_1` FOREIGN KEY (`solution_id`) REFERENCES `yuoshi_user_task_solutions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `yuoshi_user_task_content_solutions_ibfk_2` FOREIGN KEY (`content_id`) REFERENCES `yuoshi_task_contents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `yuoshi_user_task_content_quest_solutions` (
  `id` varchar(32) NOT NULL,
  `content_solution_id` varchar(32) NOT NULL,
  `quest_id` varchar(32) NOT NULL,
  `is_correct` tinyint(1) NOT NULL,
  `score` int(11) unsigned NOT NULL,
  `sent_solution` tinyint(1) NOT NULL,
  `mkdate` datetime NOT NULL DEFAULT current_timestamp(),
  `chdate` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `quest_id` (`quest_id`),
  KEY `content_solution_id` (`content_solution_id`),
  CONSTRAINT `yuoshi_user_task_content_quest_solutions_ibfk_1` FOREIGN KEY (`quest_id`) REFERENCES `yuoshi_task_content_quests` (`id`),
  CONSTRAINT `yuoshi_user_task_content_quest_solutions_ibfk_3` FOREIGN KEY (`content_solution_id`) REFERENCES `yuoshi_user_task_content_solutions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `yuoshi_user_task_content_quest_solution_answers` (
  `id` varchar(32) NOT NULL,
  `quest_solution_id` varchar(32) NOT NULL,
  `answer_id` varchar(32) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `custom` text DEFAULT NULL,
  `mkdate` datetime NOT NULL DEFAULT current_timestamp(),
  `chdate` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `answer_id` (`answer_id`),
  KEY `quest_solution_id` (`quest_solution_id`),
  CONSTRAINT `yuoshi_user_task_content_quest_solution_answers_ibfk_1` FOREIGN KEY (`answer_id`) REFERENCES `yuoshi_task_content_quest_answers` (`id`),
  CONSTRAINT `yuoshi_user_task_content_quest_solution_answers_ibfk_2` FOREIGN KEY (`quest_solution_id`) REFERENCES `yuoshi_user_task_content_quest_solutions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
