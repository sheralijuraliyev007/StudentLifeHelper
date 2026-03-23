create table info.info_currency_type(
	id				serial not null primary key,
	code integer not null unique CHECK (code > 0),
	symbol			varchar(10) null,
	short_name		varchar(15) not null,
	full_name		varchar(200) not null,
	state_id		integer not null references info.info_state(id),
	info_table_id	integer not null references info.info_table(id),


	created_user_id   uuid not null,
	created_date_time TIMESTAMPTZ not null default now(), 
	modified_user_id   uuid null,
	modified_date_time TIMESTAMPTZ  null
);

create index ix_info_currency_type_state_id
on info.info_currency_type(state_id);

create index ix_info_currency_type_info_table_id
on info.info_currency_type(info_table_id);

CREATE UNIQUE INDEX ui_info_currency_type_short_name
ON info.info_currency_type(short_name);


