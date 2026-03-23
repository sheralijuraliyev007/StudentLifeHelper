create table info.info_country(
	id				serial not null primary key,
	code 			integer not null unique CHECK (code > 0),
	short_name		varchar(15) not null unique,
	full_name		varchar(200) not null,
	info_table_id	integer not null references info.info_table(id),
	state_id		integer not null references info.info_state(id),


	created_user_id   uuid not null,
	created_date_time TIMESTAMPTZ not null default now(), 
	modified_user_id   uuid null,
	modified_date_time TIMESTAMPTZ  null
);


create index ix_info_country_state_id
on info.info_country(state_id);

create index ix_info_country_info_table_id
on info.info_country(info_table_id);

CREATE UNIQUE INDEX ui_info_country_full_name
ON info.info_country(full_name);