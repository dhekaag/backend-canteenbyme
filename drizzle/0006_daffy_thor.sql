ALTER TABLE "canteens" ADD COLUMN "status" text DEFAULT 'open' NOT NULL;--> statement-breakpoint
ALTER TABLE "canteens" DROP COLUMN IF EXISTS "open";