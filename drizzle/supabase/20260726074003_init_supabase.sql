CREATE TABLE "aiConversations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "aiConversations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"purpose" varchar DEFAULT 'free_chat' NOT NULL,
	"title" varchar(200),
	"messages" text NOT NULL,
	"extractedMemoryIds" text,
	"isActive" smallint DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "aiConversations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "aiMemories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "aiMemories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"category" varchar NOT NULL,
	"content" text NOT NULL,
	"importance" integer DEFAULT 3 NOT NULL,
	"source" varchar DEFAULT 'manual' NOT NULL,
	"lastUsedAt" timestamp,
	"usageCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "aiMemories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "aiPrompts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "aiPrompts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"mode" varchar NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" varchar(300),
	"systemPrompt" text NOT NULL,
	"aiModel" varchar(100) DEFAULT 'default' NOT NULL,
	"aiProvider" varchar(50) DEFAULT 'manus' NOT NULL,
	"isActive" smallint DEFAULT 1 NOT NULL,
	"updatedBy" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "aiPrompts_mode_unique" UNIQUE("mode")
);
--> statement-breakpoint
ALTER TABLE "aiPrompts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "assetDocuments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "assetDocuments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"verificationId" integer NOT NULL,
	"type" varchar NOT NULL,
	"label" varchar(256),
	"fileKey" varchar(512) NOT NULL,
	"fileUrl" text NOT NULL,
	"fileName" varchar(256),
	"mimeType" varchar(128),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assetDocuments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "assetVerifications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "assetVerifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"idPhotoKey" varchar(512),
	"idPhotoUrl" text,
	"selfieKey" varchar(512),
	"selfieUrl" text,
	"consentAt" timestamp,
	"signatureKey" varchar(512),
	"signatureUrl" text,
	"reviewedAt" timestamp,
	"reviewNote" text,
	"reviewedBy" integer,
	"submittedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "assetVerifications_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
ALTER TABLE "assetVerifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "assets" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "assets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"type" varchar NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"estimatedValue" bigint,
	"currency" varchar(8) DEFAULT 'KRW',
	"country" varchar(8) DEFAULT 'KR',
	"details" text,
	"sortOrder" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "autobiographies" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "autobiographies_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"title" varchar(256) DEFAULT '나의 자서전',
	"status" varchar DEFAULT 'draft' NOT NULL,
	"completedChapters" integer DEFAULT 0 NOT NULL,
	"pdfKey" varchar(512),
	"pdfUrl" text,
	"shareToken" varchar(64),
	"isShared" smallint DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "autobiographies_shareToken_unique" UNIQUE("shareToken")
);
--> statement-breakpoint
ALTER TABLE "autobiographies" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "autobiographyChapters" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "autobiographyChapters_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"autobiographyId" integer NOT NULL,
	"chapterNumber" integer NOT NULL,
	"chapterTitle" varchar(128),
	"conversationJson" text,
	"generatedText" text,
	"photoKeys" text,
	"artworkUrls" text,
	"isCompleted" smallint DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "autobiographyChapters" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "charityDonations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "charityDonations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"category" varchar NOT NULL,
	"hasSpecificOrg" smallint DEFAULT 0,
	"customOrgName" varchar(128),
	"orgAddress" varchar(256),
	"orgPhone" varchar(64),
	"amount" bigint DEFAULT 0 NOT NULL,
	"memo" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "charityDonations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "chatMessages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "chatMessages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"sessionId" integer NOT NULL,
	"userId" integer NOT NULL,
	"role" varchar NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chatMessages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "chatSessions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "chatSessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer,
	"sessionKey" varchar(64) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chatSessions_sessionKey_unique" UNIQUE("sessionKey")
);
--> statement-breakpoint
ALTER TABLE "chatSessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "countryPricing" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "countryPricing_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"countryCode" varchar(8) NOT NULL,
	"currency" varchar(8) DEFAULT 'USD' NOT NULL,
	"currencySymbol" varchar(8) DEFAULT '$' NOT NULL,
	"certificationPrice" integer DEFAULT 39 NOT NULL,
	"recertificationPrice" integer DEFAULT 15 NOT NULL,
	"videoWillPrice" integer DEFAULT 29 NOT NULL,
	"handwrittenScanPrice" integer DEFAULT 19 NOT NULL,
	"membershipPrice" integer DEFAULT 29 NOT NULL,
	"goldPrice" integer DEFAULT 0 NOT NULL,
	"platinumPrice" integer DEFAULT 0 NOT NULL,
	"vipPrice" integer DEFAULT 0 NOT NULL,
	"badgeEssentialPrice" integer DEFAULT 49 NOT NULL,
	"badgeWearablePrice" integer DEFAULT 79 NOT NULL,
	"badgeNecklacePrice" integer DEFAULT 99 NOT NULL,
	"badgePremiumPrice" integer DEFAULT 299 NOT NULL,
	"note" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "countryPricing_countryCode_unique" UNIQUE("countryCode")
);
--> statement-breakpoint
ALTER TABLE "countryPricing" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "emailOtps" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "emailOtps_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" varchar(320) NOT NULL,
	"code" varchar(8) NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"used" integer DEFAULT 0 NOT NULL,
	"failCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "emailOtps" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "expertConsultations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "expertConsultations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"expertId" integer NOT NULL,
	"applicantName" varchar(100) NOT NULL,
	"applicantEmail" varchar(320),
	"applicantPhone" varchar(50),
	"applicantCountry" varchar(8) DEFAULT 'KR',
	"consultType" varchar DEFAULT 'inheritance' NOT NULL,
	"selfIntro" text NOT NULL,
	"assetScale" varchar DEFAULT 'unknown',
	"urgency" varchar DEFAULT 'normal',
	"status" varchar DEFAULT 'pending' NOT NULL,
	"expertNote" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expertConsultations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "expertPartners" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "expertPartners_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"nameEn" varchar(100),
	"specialty" varchar DEFAULT 'lawyer' NOT NULL,
	"subSpecialty" varchar(200),
	"country" varchar(8) DEFAULT 'KR' NOT NULL,
	"city" varchar(100),
	"firmName" varchar(200),
	"bio" text,
	"bioEn" text,
	"yearsOfExperience" integer DEFAULT 0,
	"languages" varchar(200),
	"email" varchar(320),
	"phone" varchar(50),
	"website" varchar(500),
	"photoUrl" varchar(1000),
	"licenseNumber" varchar(100),
	"status" varchar DEFAULT 'pending' NOT NULL,
	"annualFeePaid" integer DEFAULT 0 NOT NULL,
	"annualFeeExpiresAt" timestamp,
	"userId" integer,
	"isSample" integer DEFAULT 0 NOT NULL,
	"ratingAvg" integer DEFAULT 0,
	"reviewCount" integer DEFAULT 0,
	"consultCount" integer DEFAULT 0,
	"adminNote" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expertPartners" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "family_members" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "family_members_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"nameKo" varchar(64) NOT NULL,
	"relationship" varchar(32) NOT NULL,
	"birthDate" varchar(32),
	"idFront" varchar(6),
	"address" text,
	"source" varchar DEFAULT 'manual' NOT NULL,
	"sourceFileKey" text,
	"rawData" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "family_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "farewellAttachments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "farewellAttachments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"letterId" integer NOT NULL,
	"userId" integer NOT NULL,
	"originalName" varchar(256) NOT NULL,
	"fileKey" varchar(512) NOT NULL,
	"fileUrl" text NOT NULL,
	"mimeType" varchar(128),
	"fileSize" bigint,
	"fileType" varchar DEFAULT 'other' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "farewellAttachments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "farewellLetters" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "farewellLetters_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"title" varchar(256),
	"step1Content" text,
	"step2Content" text,
	"step3Content" text,
	"step4Content" text,
	"step5Content" text,
	"recipientMode" varchar DEFAULT 'all' NOT NULL,
	"status" varchar DEFAULT 'draft' NOT NULL,
	"isPaid" smallint DEFAULT 0 NOT NULL,
	"editCount" integer DEFAULT 0 NOT NULL,
	"isLocked" smallint DEFAULT 0 NOT NULL,
	"stripeSessionId" varchar(128),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "farewellLetters" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "farewellRecipients" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "farewellRecipients_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"letterId" integer NOT NULL,
	"name" varchar(64) NOT NULL,
	"relationship" varchar(32),
	"phone" varchar(32),
	"email" varchar(320),
	"address" text,
	"viewPaid" smallint DEFAULT 0 NOT NULL,
	"viewStripeSessionId" varchar(128),
	"mailPaid" smallint DEFAULT 0 NOT NULL,
	"mailStripeSessionId" varchar(128),
	"viewedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "farewellRecipients" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "heirInvitations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "heirInvitations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"willId" integer NOT NULL,
	"heirId" integer NOT NULL,
	"userId" integer NOT NULL,
	"token" varchar(128) NOT NULL,
	"emailSent" integer DEFAULT 0 NOT NULL,
	"smsSent" integer DEFAULT 0 NOT NULL,
	"accepted" integer DEFAULT 0 NOT NULL,
	"acceptedAt" timestamp,
	"registered" integer DEFAULT 0 NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"isActive" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "heirInvitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "heirInvitations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "heirs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "heirs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"nameKo" varchar(64) NOT NULL,
	"nameEn" varchar(64),
	"relationship" varchar NOT NULL,
	"birthDate" varchar(16),
	"phone" varchar(32),
	"email" varchar(320),
	"country" varchar(8) DEFAULT 'KR',
	"address" text,
	"priority" integer DEFAULT 1 NOT NULL,
	"shareType" varchar DEFAULT 'percent',
	"sharePercent" integer DEFAULT 0,
	"shareAmount" bigint DEFAULT 0,
	"smsConsent" integer DEFAULT 0,
	"smsSent" integer DEFAULT 0,
	"isExecutor" integer DEFAULT 0 NOT NULL,
	"accessLevel" varchar DEFAULT 'own_only' NOT NULL,
	"heirPaid" integer DEFAULT 0 NOT NULL,
	"heirFee" integer DEFAULT 0 NOT NULL,
	"kakaoId" varchar(128),
	"lineId" varchar(128),
	"whatsappId" varchar(64),
	"wechatId" varchar(128),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "heirs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "inquiries_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer,
	"name" varchar(100) NOT NULL,
	"email" varchar(320) NOT NULL,
	"category" varchar DEFAULT 'general' NOT NULL,
	"subject" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"reply" text,
	"repliedAt" timestamp,
	"repliedBy" integer,
	"satisfaction" integer,
	"satisfactionToken" varchar(64),
	"satisfactionAt" timestamp,
	"isFeatured" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inquiries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "legacyLetters" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "legacyLetters_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"recipientName" varchar(64) NOT NULL,
	"recipientRelationship" varchar(32),
	"recipientEmail" varchar(320),
	"recipientPhone" varchar(32),
	"title" varchar(256),
	"content" text,
	"releaseCondition" varchar DEFAULT 'after_death' NOT NULL,
	"releaseDate" timestamp,
	"releaseEventDesc" varchar(256),
	"status" varchar DEFAULT 'draft' NOT NULL,
	"releasedAt" timestamp,
	"viewedAt" timestamp,
	"attachmentKey" varchar(512),
	"attachmentUrl" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "legacyLetters" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lifeJournals" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "lifeJournals_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"journalDate" varchar(16) NOT NULL,
	"conversationJson" text,
	"diaryText" text,
	"imageKey" varchar(512),
	"imageUrl" text,
	"imageStyle" varchar(32) DEFAULT 'watercolor',
	"emotionTags" varchar(256),
	"isShared" smallint DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lifeJournals" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "medicalDirectives" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "medicalDirectives_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"type" varchar NOT NULL,
	"selections" text NOT NULL,
	"savedAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "medicalDirectives" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "newsPosts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "newsPosts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"url" varchar(2048) NOT NULL,
	"outlet" varchar(128) NOT NULL,
	"country" varchar(64) NOT NULL,
	"flag" varchar(8) NOT NULL,
	"summary" text,
	"tag" varchar(64),
	"isActive" smallint DEFAULT 1 NOT NULL,
	"createdBy" integer,
	"publishedAt" varchar(32),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "newsPosts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notarizationDocs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notarizationDocs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"docId" varchar(100) NOT NULL,
	"docName" varchar(200) NOT NULL,
	"fileKey" text NOT NULL,
	"fileUrl" text NOT NULL,
	"fileName" varchar(500) NOT NULL,
	"fileSize" integer DEFAULT 0 NOT NULL,
	"analysisResult" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notarizationDocs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "payments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"stripeSessionId" varchar(128),
	"stripePaymentIntentId" varchar(128),
	"tossOrderId" varchar(128),
	"tossPaymentKey" varchar(200),
	"paymentMethod" varchar(50),
	"paymentType" varchar(50),
	"status" varchar DEFAULT 'pending' NOT NULL,
	"amountTotal" bigint,
	"currency" varchar(8) DEFAULT 'krw',
	"items" text,
	"customerEmail" varchar(320),
	"country" varchar(8) DEFAULT 'KR',
	"paidAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_stripeSessionId_unique" UNIQUE("stripeSessionId"),
	CONSTRAINT "payments_tossOrderId_unique" UNIQUE("tossOrderId")
);
--> statement-breakpoint
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "personProfiles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "personProfiles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"name" varchar(64) NOT NULL,
	"relationship" varchar(32) DEFAULT 'self' NOT NULL,
	"photoKey" varchar(512),
	"photoUrl" text,
	"facePrompt" text,
	"isActive" smallint DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "personProfiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "pointHistory" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pointHistory_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"type" varchar NOT NULL,
	"amount" integer NOT NULL,
	"balanceAfter" integer NOT NULL,
	"description" varchar(256),
	"relatedUserId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pointHistory" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "signup_events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "signup_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"sessionId" varchar(64) NOT NULL,
	"event" varchar NOT NULL,
	"step" varchar NOT NULL,
	"emailMasked" varchar(320),
	"country" varchar(8),
	"device" varchar DEFAULT 'desktop',
	"lang" varchar(16),
	"durationSec" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "signup_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "siteSettings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "siteSettings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"settingKey" varchar(100) NOT NULL,
	"settingValue" text,
	"description" varchar(255),
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "siteSettings_settingKey_unique" UNIQUE("settingKey")
);
--> statement-breakpoint
ALTER TABLE "siteSettings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "siteStats" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "siteStats_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"key" varchar(64) NOT NULL,
	"value" bigint DEFAULT 0 NOT NULL,
	"label" varchar(128),
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "siteStats_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "siteStats" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" varchar DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	"stripeCustomerId" varchar(64),
	"phone" varchar(20),
	"birthDate" varchar(16),
	"country" varchar(8) DEFAULT 'KR',
	"profileCompleted" integer DEFAULT 0,
	"referralCode" varchar(16),
	"referredBy" varchar(16),
	"pointBalance" integer DEFAULT 0 NOT NULL,
	"address" text,
	"zipCode" varchar(16),
	"stateProvince" varchar(64),
	"nationality" varchar(8),
	"furigana" varchar(128),
	"religion" varchar(32),
	"agreeTerms" integer DEFAULT 0,
	"agreePrivacy" integer DEFAULT 0,
	"agreeMarketing" integer DEFAULT 0,
	"agreeGdpr" integer DEFAULT 0,
	"occupation" varchar(64),
	"assetScale" varchar(16),
	"qrCode" varchar(64),
	"qrPublic" integer DEFAULT 1,
	"passwordHash" varchar(256),
	"memberGrade" varchar DEFAULT 'general' NOT NULL,
	"gradeUpdatedAt" timestamp,
	"profilePhotoKey" varchar(512),
	"faceVerified" integer DEFAULT 0,
	"idImageKey" varchar(512),
	"selfieImageKey" varchar(512),
	"faceVerifiedAt" timestamp,
	"faceVerifyResult" text,
	"residentNumberEnc" varchar(512),
	"residentNumberMasked" varchar(32),
	"foreignerNumberEnc" varchar(512),
	"passportNumberEnc" varchar(512),
	"passportExpiry" varchar(16),
	"addressDetail" text,
	"city" varchar(64),
	"kycStatus" varchar DEFAULT 'none',
	"kycVerifiedAt" timestamp,
	"kycProvider" varchar(32),
	"kycReferenceId" varchar(128),
	"kycExpiresAt" timestamp,
	"identityVerified" integer DEFAULT 0,
	"signatureVerified" integer DEFAULT 0,
	"signatureVerifiedAt" timestamp,
	"signatureProvider" varchar(32),
	"signatureDocId" varchar(256),
	"voiceVerified" integer DEFAULT 0,
	"voiceVerifiedAt" timestamp,
	"voiceFileKey" varchar(512),
	"blockchainHash" varchar(256),
	"blockchainTxId" varchar(256),
	"blockchainAt" timestamp,
	"timestampToken" text,
	"timestampIssuedAt" timestamp,
	"adminNote" text,
	"suspended" integer DEFAULT 0,
	"suspendReason" text,
	"suspendedAt" timestamp,
	"assetLocked" integer DEFAULT 0 NOT NULL,
	"assetLockedAt" timestamp,
	"nameKo" varchar(64),
	"nameEn" varchar(64),
	CONSTRAINT "users_openId_unique" UNIQUE("openId"),
	CONSTRAINT "users_referralCode_unique" UNIQUE("referralCode"),
	CONSTRAINT "users_qrCode_unique" UNIQUE("qrCode")
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "videoWills" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "videoWills_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"fileKey" varchar(500) NOT NULL,
	"fileUrl" varchar(1000) NOT NULL,
	"mimeType" varchar(50) DEFAULT 'video/webm' NOT NULL,
	"videoType" varchar DEFAULT 'legal' NOT NULL,
	"blockchainHash" varchar(100) NOT NULL,
	"recipient" varchar(200),
	"deliveryDate" varchar(20),
	"memo" text,
	"status" varchar DEFAULT 'active' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "videoWills" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "willAssetScans" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "willAssetScans_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"docType" varchar DEFAULT 'other' NOT NULL,
	"docTypeLabel" varchar(64),
	"issuer" varchar(128),
	"ownerName" varchar(64),
	"assetName" varchar(256),
	"assetCode" varchar(128),
	"amount" varchar(64),
	"unit" varchar(32),
	"referenceDate" varchar(32),
	"location" text,
	"area" varchar(64),
	"beneficiary" varchar(128),
	"additionalInfo" text,
	"confidence" varchar(16) DEFAULT 'medium',
	"imageKey" varchar(512),
	"imageUrl" varchar(1024),
	"userMemo" text,
	"estimatedValue" bigint,
	"status" varchar DEFAULT 'pending',
	"sortOrder" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "willAssetScans" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "will_attachments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "will_attachments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"willId" integer,
	"fileKey" varchar(500) NOT NULL,
	"fileUrl" varchar(1000) NOT NULL,
	"fileName" varchar(255) NOT NULL,
	"fileType" varchar(100) NOT NULL,
	"fileSize" integer NOT NULL,
	"category" varchar(50) DEFAULT 'other' NOT NULL,
	"description" varchar(500),
	"verified" integer DEFAULT 0,
	"verifiedAt" timestamp,
	"createdAt" bigint NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "will_attachments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "willCertificates" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "willCertificates_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"willId" integer NOT NULL,
	"certDate" varchar(20) NOT NULL,
	"purpose" varchar(200) NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"issueNumber" varchar(50),
	"paymentId" varchar(100),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"processedAt" timestamp,
	"fileKey" varchar(500),
	"fileUrl" varchar(1000),
	"printedAt" timestamp,
	"printCount" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "willCertificates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "willRevisionPayments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "willRevisionPayments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"willId" integer NOT NULL,
	"userId" integer NOT NULL,
	"stripeSessionId" varchar(128),
	"amount" integer DEFAULT 5000 NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "willRevisionPayments_stripeSessionId_unique" UNIQUE("stripeSessionId")
);
--> statement-breakpoint
ALTER TABLE "willRevisionPayments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "wills" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "wills_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"title" varchar(256),
	"data" text,
	"mode" varchar DEFAULT 'ai',
	"status" varchar DEFAULT 'draft' NOT NULL,
	"isCertified" integer DEFAULT 0,
	"certifiedAt" timestamp,
	"storageExpiresAt" timestamp,
	"paymentId" integer,
	"scannedWillKey" varchar(512),
	"scannedWillUrl" varchar(1024),
	"pdfKey" varchar(512),
	"pdfUrl" varchar(1024),
	"blockchainHash" varchar(128),
	"certNumber" varchar(32),
	"freeRevisionCount" integer DEFAULT 10 NOT NULL,
	"usedFreeRevisions" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wills_certNumber_unique" UNIQUE("certNumber")
);
--> statement-breakpoint
ALTER TABLE "wills" ENABLE ROW LEVEL SECURITY;