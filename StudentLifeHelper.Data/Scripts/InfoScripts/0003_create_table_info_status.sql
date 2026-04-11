create table info.info_status(
	id				serial not null primary key,
	code integer not null  CHECK (code > 0),
	short_name		varchar(15) not null,
	full_name		varchar(200) not null,
	info_table_code	integer not null references info.info_table(code),
	state_code		integer not null references info.info_state(code),


	created_user_id   uuid not null,
	created_date_time TIMESTAMPTZ not null default now(), 
	modified_user_id   uuid null,
	modified_date_time TIMESTAMPTZ  null
);


create index ix_info_status_state_code
on info.info_status(state_code);

create index ix_info_status_table_info_table_code
on info.info_status(info_table_code);


CREATE UNIQUE INDEX ui_info_status_table_code
ON info.info_status(info_table_code, code);

CREATE UNIQUE INDEX ui_info_status_table_short_name
ON info.info_status(info_table_code, short_name);