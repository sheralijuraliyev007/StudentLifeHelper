create table messages(
	id						bigserial not null primary key,
	chat_id					uuid not null references chats(id),
	from_user_id			uuid not null references users(id),
	status_id				integer not null references info.info_status(id),
	text					varchar(4000) not null,
	reply_to_message_id		bigint null references messages(id),

	created_user_id   uuid not null,
	created_date_time TIMESTAMPTZ not null default now(), 
	modified_user_id   uuid null,
	modified_date_time TIMESTAMPTZ  null

);

create index ix_messages_status_id
on messages(status_id);

create index ix_messages_chat_id
on messages(chat_id);

create index ix_messages_from_user_id
on messages(from_user_id);

create index ix_messages_reply_to_message_id
on messages(reply_to_message_id);


create index ix_messages_chat_id_created_date_time
on messages(chat_id, created_date_time desc);