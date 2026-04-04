create table info.info_region(
	id				serial not null primary key,
	code			integer not null CHECK (code > 0),
	short_name		varchar(15) not null,
	full_name		varchar(200) not null,
	state_id		integer not null references info.info_state(id),
	info_table_id	integer not null references info.info_table(id),


	created_user_id   uuid not null,
	created_date_time TIMESTAMPTZ not null default now(), 
	modified_user_id   uuid null,
	modified_date_time TIMESTAMPTZ  null
);

create index ix_info_region_state_id
on info.info_region(state_id);

create index ix_info_region_info_table_id
on info.info_region(info_table_id);

CREATE UNIQUE INDEX ui_info_region_code
ON info.info_region(info_table_id, code);

CREATE UNIQUE INDEX ui_info_region_short_name
ON info.info_region(info_table_id, short_name);

CREATE UNIQUE INDEX ui_info_region_full_name
ON info.info_region(info_table_id, full_name);

INSERT INTO info.info_region
(code, short_name, full_name, state_id, info_table_id, created_user_id)
VALUES
    (1, 'SEO', 'Seoul', 1, 1, '00000000-0000-0000-0000-000000000001');Q