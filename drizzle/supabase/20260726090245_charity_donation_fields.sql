ALTER TABLE "charityDonations" ADD COLUMN "donationType" varchar DEFAULT 'posthumous' NOT NULL;--> statement-breakpoint
ALTER TABLE "charityDonations" ADD COLUMN "paymentStatus" varchar DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "charityDonations" ADD COLUMN "stripeSessionId" varchar(128);--> statement-breakpoint
ALTER TABLE "charityDonations" ADD COLUMN "paidAt" timestamp;--> statement-breakpoint
ALTER TABLE "charityDonations" ADD COLUMN "publicMessage" text;--> statement-breakpoint
ALTER TABLE "charityDonations" ADD COLUMN "messagePublic" smallint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "charityDonations" ADD COLUMN "displayName" varchar(64);--> statement-breakpoint
ALTER TABLE "charityDonations" ADD COLUMN "country" varchar(8) DEFAULT 'KR';