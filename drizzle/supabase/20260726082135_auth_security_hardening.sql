CREATE TABLE "authSessions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"revokedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "authSessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "emailOtps" ALTER COLUMN "code" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "emailOtps" ADD COLUMN "purpose" varchar(32) DEFAULT 'signup' NOT NULL;