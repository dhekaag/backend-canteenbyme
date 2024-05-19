CREATE TABLE `canteens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `menus` (
	`id` text PRIMARY KEY DEFAULT 'e674da07-0677-4f92-b44e-3c6764821fa1' NOT NULL,
	`canteenId` integer,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`price` integer NOT NULL,
	`description` text NOT NULL,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`canteenId`) REFERENCES `canteens`(`id`) ON UPDATE no action ON DELETE no action
);
