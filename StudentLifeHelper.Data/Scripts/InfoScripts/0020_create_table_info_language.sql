create table info.info_language(
	id				serial not null primary key,
	code			integer not null unique CHECK (code > 0),
	short_name		varchar(15) not null,
	full_name		varchar(200) not null,
	state_id		integer not null references info.info_state(id),
	info_table_id	integer not null references info.info_table(id),


	created_user_id   uuid not null,
	created_date_time TIMESTAMPTZ not null default now(), 
	modified_user_id   uuid null,
	modified_date_time TIMESTAMPTZ  null
);


create index ix_info_language_state_id
    on info.info_language(state_id);

create index ix_info_language_info_table_id
    on info.info_language(info_table_id);

CREATE UNIQUE INDEX ui_info_language_code
    ON info.info_language(info_table_id, code);

CREATE UNIQUE INDEX ui_info_language_short_name
    ON info.info_language(info_table_id, short_name);

CREATE UNIQUE INDEX ui_info_language_full_name
    ON info.info_language(info_table_id, full_name);