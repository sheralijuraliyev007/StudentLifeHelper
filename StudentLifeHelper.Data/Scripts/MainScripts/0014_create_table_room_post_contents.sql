create table room_post_contents(
	id				bigserial not null primary key,
	room_post_id	bigint not null references room_posts(id),
	content_id		bigint not null references contents(id),
	is_cover		boolean not null,

	created_user_id   uuid not null,
	created_date_time TIMESTAMPTZ not null default now(), 
	modified_user_id   uuid null,
	modified_date_time TIMESTAMPTZ  null,

	CHECK (is_cover IN (true, false))
);


create index ix_room_post_contents_content_id
on room_post_contents(content_id);

create index ix_room_post_contents_room_post_id
on room_post_contents(room_post_id);


-- optional constraint

