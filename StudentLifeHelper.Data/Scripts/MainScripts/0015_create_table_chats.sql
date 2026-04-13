create table chats(
	id				uuid not null primary key,
	status_code		integer not null references info.info_status(code),


	created_user_id   uuid not null,
	created_date_time TIMESTAMPTZ not null default now(), 
	modified_user_id   uuid null,
	modified_date_time TIMESTAMPTZ  null
);


create index ix_chats_status_code
on chats(status_code);


