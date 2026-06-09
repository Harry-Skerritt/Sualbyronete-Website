/* WARNING: Script requires that SQLITE_DBCONFIG_DEFENSIVE be disabled */
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE `admin_users` (
	`id` text PRIMARY KEY DEFAULT (uuid4()) NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'editor' NOT NULL,
	`last_login` text,
	`is_active` integer DEFAULT true NOT NULL,
	`date_created` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO admin_users VALUES('8539debb-a9a3-41ef-aeaa-def578c31994','harry@harryskerritt.co.uk','Harry Skerritt','harry','5c352a5f128d6e53f8323d6643b9744a:89161eea3b947967879ba21f380886fa60936c1edef9bc304c2f648ed532d1b12e3aaefc742807cb0fc3b7f94ca48afe6ad6635958f4e75df27153faca0bd26f','admin','2026-06-09T09:49:38.223Z',1,'2026-06-05 12:55:21');
CREATE TABLE `adults` (
	`seq_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`breed` text NOT NULL,
	`gender` text NOT NULL,
	`id` text GENERATED ALWAYS AS (
            (CASE WHEN LOWER(breed) = 'yorkie' THEN 'YT' ELSE 'BT' END) ||
            PRINTF('%03d', seq_id) ||
            (CASE WHEN LOWER(gender) = 'female' THEN '-D' ELSE '-S' END)
        ) VIRTUAL NOT NULL,
	`name` text NOT NULL,
	`colour` text NOT NULL,
	`image` text DEFAULT 'default.png' NOT NULL,
	`dob` text NOT NULL,
	`regID` text DEFAULT '#0000' NOT NULL,
	`forSale` integer DEFAULT false NOT NULL,
	`bio` text DEFAULT 'No bio specified' NOT NULL,
	`puppies` text DEFAULT '[]' NOT NULL,
	`date_added` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO adults VALUES(1,'yorkie','male','Byron','steel-blue-tan','YT001-S.jpg','2026-06-03','5241635413',1,'This is Byron','[]','2026-06-05 13:32:51');
INSERT INTO adults VALUES(2,'yorkie','female','Lucy','black-tan','YT002-D.jpg','2025-10-06','64586345654',1,'This is Luna, a mother dog','[]','2026-06-05 13:33:06');
CREATE TABLE `puppies` (
	`seq_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`breed` text NOT NULL,
	`id` text GENERATED ALWAYS AS (
            CASE
              WHEN LOWER(breed) = 'yorkie' THEN 'YT' || PRINTF('%03d', seq_id)
              ELSE 'BT' || PRINTF('%03d', seq_id)
            END
        ) VIRTUAL NOT NULL,
	`name` text NOT NULL,
	`gender` text NOT NULL,
	`colour` text NOT NULL,
	`status` text NOT NULL,
	`image` text NOT NULL,
	`dob` text NOT NULL,
	`bio` text DEFAULT 'No bio specified.' NOT NULL,
	`show_in_carousel` integer DEFAULT false NOT NULL,
	`mother` text NOT NULL,
	`father` text NOT NULL,
	`availableFrom` text NOT NULL,
	`regID` text DEFAULT '#0000' NOT NULL,
	`date_added` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`mother`) REFERENCES `adults`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`father`) REFERENCES `adults`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO puppies VALUES(1,'yorkie','Sid','male','black-tan','available','YT001.webp','2026-06-03','No bio specified',1,'YT002-D','YT001-S','2026-06-03','#0000','2026-06-05 13:33:28');
INSERT INTO puppies VALUES(3,'yorkie','Alfie','male','steel-blue-tan','available','YT003.webp','2026-05-18','No bio specified',1,'YT002-D','YT001-S','2026-06-03','654498754','2026-06-05 14:50:10');
INSERT INTO puppies VALUES(4,'yorkie','James','male','black-tan','available','YT004.jpg','2025-12-05','James is a special boy',0,'YT002-D','YT001-S','2026-08-14','564654897654','2026-06-05 15:26:48');
INSERT INTO puppies VALUES(5,'yorkie','Miles','male','black-tan','reserved','YT005.jpg','2026-06-05','No bio specified',1,'YT002-D','YT001-S','2026-08-14','4658974659496','2026-06-05 15:29:31');
INSERT INTO puppies VALUES(7,'biewer','John','male','black-tan','reserved','BT007.webp','2026-04-13','This is John! He is part of a litter of 4 puppies.',0,'YT002-D','YT001-S','2026-08-14','85463284','2026-06-05 15:35:20');
INSERT INTO puppies VALUES(8,'biewer','Olivia','female','black','new','BT008.webp','2026-06-05','No bio specified',0,'YT002-D','YT001-S','2026-08-14','752431','2026-06-05 16:09:54');
INSERT INTO puppies VALUES(10,'yorkie','Bella','female','black-tan','available','YT010.jpg','2025-12-05','Bella is a special girl',0,'YT002-D','YT001-S','2026-08-14','94563138543','2026-06-08 16:48:03');
INSERT INTO puppies VALUES(12,'biewer','Milo','male','white-tan','reserved','BT012.jpg','2026-02-09','No bio specified',0,'YT002-D','YT001-S','2026-04-23','8965463846','2026-06-09 09:44:19');
COMMIT;
