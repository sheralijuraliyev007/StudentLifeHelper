create table info.info_region(
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

create index ix_info_region_state_id
on info.info_region(state_id);

create index ix_info_region_info_table_id
on info.info_region(info_table_id);