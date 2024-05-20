CREATE TABLE IF NOT EXISTS "canteens" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "menus" (
	"id" text PRIMARY KEY NOT NULL,
	"canteen_id" text NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"price" integer NOT NULL,
	"image_url" text,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "menus" ADD CONSTRAINT "menus_canteen_id_canteens_id_fk" FOREIGN KEY ("canteen_id") REFERENCES "public"."canteens"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
