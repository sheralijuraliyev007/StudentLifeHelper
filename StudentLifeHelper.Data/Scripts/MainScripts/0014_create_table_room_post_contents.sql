create table room_post_contents(
	id				bigserial not null primary key,
	room_post_id	bigint not null references room_posts(id),
	content_id		bigint not null references contents(id),
	is_cover		boolean not null,
	status_id		integer not null references info.info_status(id),

	created_user_id   uuid not null,
	created_date_time TIMESTAMPTZ not null default now(), 
	modified_user_id   uuid null,
	modified_date_time TIMESTAMPTZ  null
);



create index ix_room_post_contents_status_id
on room_post_contents(status_id);

create index ix_room_post_contents_content_id
on room_post_contents(content_id);

create index ix_room_post_contents_room_post_id
on room_post_contents(room_post_id);

CREATE UNIQUE INDEX ux_room_post_contents_room_post_content_active
ON room_post_contents(room_post_id, content_id)
WHERE status_id = 1;

CREATE UNIQUE INDEX ux_room_post_contents_one_cover_per_post
ON room_post_contents(room_post_id)
WHERE is_cover = true AND status_id = 1;

-- optional constraint
CHECK (is_cover IN (true, false))