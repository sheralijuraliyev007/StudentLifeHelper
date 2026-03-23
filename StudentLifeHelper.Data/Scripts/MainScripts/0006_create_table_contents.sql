create table contents(
	id					bigserial not null primary key,
	name				varchar(200) not null,
	file_name			uuid not null unique,
	folder				varchar(200) not null,
	content_type_id		integer not null references info.info_content_type(id),
	state_id			integer not null references info.info_state(id),

	-- static columns
	created_user_id   uuid not null,
	created_date_time TIMESTAMPTZ not null default now(), 
	modified_user_id   uuid null,
	modified_date_time TIMESTAMPTZ  null
);

create index ix_contents_state_id
on contents(state_id);

create index ix_contents_content_type_id
on contents(content_type_id);

create index ix_contents_state_content_type
on contents(state_id,content_type_id);

