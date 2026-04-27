CREATE TABLE `signup_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`event` enum('enter','leave','complete') NOT NULL,
	`step` enum('step1','step2','step3','step4','step5','complete') NOT NULL,
	`emailMasked` varchar(320),
	`country` varchar(8),
	`device` enum('mobile','tablet','desktop') DEFAULT 'desktop',
	`lang` varchar(16),
	`durationSec` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `signup_events_id` PRIMARY KEY(`id`)
);
