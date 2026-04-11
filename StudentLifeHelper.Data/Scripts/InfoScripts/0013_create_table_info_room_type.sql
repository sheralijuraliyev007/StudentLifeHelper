create table info.info_room_type(
	id				serial not null primary key,
	code			integer not null unique CHECK (code > 0),
	short_name		varchar(15) not null unique ,
	full_name		varchar(200) not null,
	state_code		integer not null references info.info_state(code),


	created_user_id   uuid not null,
	created_date_time TIMESTAMPTZ not null default now(), 
	modified_user_id   uuid null,
	modified_date_time TIMESTAMPTZ  null
);

create index ix_info_room_type_state_code
on info.info_room_type(state_code);



