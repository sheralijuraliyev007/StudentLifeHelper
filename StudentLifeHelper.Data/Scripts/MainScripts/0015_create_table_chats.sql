create table chats(
	id				uuid not null primary key,
	status_id		integer not null references info.info_status(id),


	created_user_id   uuid not null,
	created_date_time TIMESTAMPTZ not null default now(), 
	modified_user_id   uuid null,
	modified_date_time TIMESTAMPTZ  null
);


create index ix_chats_status_id
on chats(status_id);


