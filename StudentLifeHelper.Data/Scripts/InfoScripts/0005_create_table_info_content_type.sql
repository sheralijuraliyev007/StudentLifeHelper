create table info.info_content_type(
                                       id				serial not null primary key,
                                       code            integer not null unique CHECK (code > 0),
                                       short_name		varchar(15) not null unique,
                                       full_name		varchar(200) not null,
                                       type_name           varchar(100)   not null unique ,
                                       state_code		integer not null references info.info_state(code),


                                       created_user_id   uuid not null,
                                       created_date_time TIMESTAMPTZ not null default now(),
                                       modified_user_id   uuid null,
                                       modified_date_time TIMESTAMPTZ  null

);



create index ix_info_content_type_state_code
    on info.info_content_type(state_code);



CREATE UNIQUE INDEX ui_info_content_type_full_name
    ON info.info_content_type(full_name);


INSERT INTO info.info_content_type (code,short_name, full_name, type_name,state_code,created_user_id)
VALUES
    ( 1, 'TXT', 'Text File', 'text/plain',1,'00000000-0000-0000-0000-000000000001'),
    ( 2, 'CSV', 'Comma-Separated Values', 'text/csv',1,'00000000-0000-0000-0000-000000000001'),
    ( 3, 'DOC', 'Microsoft Word Document', 'application/msword',1,'00000000-0000-0000-0000-000000000001'),
    ( 4, 'DOCX', 'Microsoft Word Open XML Document',  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',1,'00000000-0000-0000-0000-000000000001'),
    ( 5, 'XLS', 'Microsoft Excel Spreadsheet',  'application/vnd.ms-excel',1,'00000000-0000-0000-0000-000000000001'),
    ( 6, 'JPEG', 'JPEG Image', 'image/jpeg',1,'00000000-0000-0000-0000-000000000001'),
    ( 7, 'PNG', 'Portable Network Graphics', 'image/png',1,'00000000-0000-0000-0000-000000000001'),
    ( 8, 'GIF', 'Graphics Interchange Format',  'image/gif',1,'00000000-0000-0000-0000-000000000001'),
    ( 9, 'BMP', 'Bitmap Image', 'image/bmp',1,'00000000-0000-0000-0000-000000000001')