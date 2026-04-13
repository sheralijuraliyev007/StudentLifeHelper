create table user_chats(
	id			bigserial not null primary key,
	user_id		uuid not null references users(id),
	chat_id		uuid not null references chats(id),
	status_code	integer not null references info.info_status(code),

	created_user_id   uuid not null,
	created_date_time TIMESTAMPTZ not null default now(), 
	modified_user_id   uuid null,
	modified_date_time TIMESTAMPTZ  null
);

create index ix_user_chats_status_id
on user_chats(status_code);


create index ix_user_chats_user_id
on user_chats(user_id);

create index ix_user_chats_chat_id
on user_chats(chat_id);

CREATE UNIQUE INDEX ux_user_chats_user_chat_active
ON user_chats(user_id, chat_id)
WHERE status_code = 1;

create index ix_user_chats_user_status
on user_chats(user_id, status_code);

