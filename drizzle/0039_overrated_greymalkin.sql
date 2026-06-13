CREATE TABLE `expertConsultations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`expertId` int NOT NULL,
	`applicantName` varchar(100) NOT NULL,
	`applicantEmail` varchar(320),
	`applicantPhone` varchar(50),
	`applicantCountry` varchar(8) DEFAULT 'KR',
	`consultType` enum('inheritance','will','tax','dispute','other') NOT NULL DEFAULT 'inheritance',
	`selfIntro` text NOT NULL,
	`assetScale` enum('under_100m','100m_500m','500m_1b','over_1b','unknown') DEFAULT 'unknown',
	`urgency` enum('normal','urgent') DEFAULT 'normal',
	`status` enum('pending','read','replied','closed') NOT NULL DEFAULT 'pending',
	`expertNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expertConsultations_id` PRIMARY KEY(`id`)
);
