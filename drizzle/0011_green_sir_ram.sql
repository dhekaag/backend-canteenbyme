CREATE TABLE IF NOT EXISTS "transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"user_name" text NOT NULL,
	"total_price" integer NOT NULL,
	"image_url" text,
	"description" text,
	"update_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
