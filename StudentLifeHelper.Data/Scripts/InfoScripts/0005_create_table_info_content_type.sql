create table info.info_content_type(
	id				serial not null primary key,
	code integer not null unique CHECK (code > 0),
	short_name		varchar(15) not null unique,
	full_name		varchar(200) not null,
	info_table_id	integer not null references info.info_table(id),
	state_id		integer not null references info.info_state(id),


	created_user_id   uuid not null,
	created_date_time TIMESTAMPTZ not null default now(), 
	modified_user_id   uuid null,
	modified_date_time TIMESTAMPTZ  null

);



create index ix_info_content_type_state_id
on info.info_content_type(state_id);

create index ix_info_content_type_table_id
on info.info_content_type(info_table_id);


CREATE UNIQUE INDEX ui_info_content_type_full_name
ON info.info_content_type(full_name);

ALTER TABLE info.info_content_type
ADD COLUMN type_name VARCHAR(100) NOT NULL UNIQUE;

INSERT INTO info.info_content_type (code,short_name, full_name, info_table_id, state_id,created_user_id, type_name)
VALUES
    ( 1, 'TXT', 'Text File', 3, 1,'00000000-0000-0000-0000-000000000001','text/plain'),
    ( 2, 'CSV', 'Comma-Separated Values', 3, 1,'00000000-0000-0000-0000-000000000001','text/csv'),
    ( 3, 'DOC', 'Microsoft Word Document', 3, 1,'00000000-0000-0000-0000-000000000001','application/msword'),
    ( 4, 'DOCX', 'Microsoft Word Open XML Document', 3, 1,'00000000-0000-0000-0000-000000000001','application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
    ( 5, 'XLS', 'Microsoft Excel Spreadsheet', 3, 1,'00000000-0000-0000-0000-000000000001','application/vnd.ms-excel'),
    ( 6, 'JPEG', 'JPEG Image', 3, 1,'00000000-0000-0000-0000-000000000001','image/jpeg'),
    ( 7, 'PNG', 'Portable Network Graphics', 3, 1,'00000000-0000-0000-0000-000000000001','image/png'),
    ( 8, 'GIF', 'Graphics Interchange Format', 3, 1,'00000000-0000-0000-0000-000000000001','image/gif'),
    ( 9, 'BMP', 'Bitmap Image', 3, 1,'00000000-0000-0000-0000-000000000001','image/bmp')