create table contents(
	id					bigserial not null primary key,
	name				varchar(200) not null,
	file_id			uuid not null unique,
	folder				varchar(200) not null,
	content_type_code		integer not null references info.info_content_type(code),
	state_code			integer not null references info.info_state(code),

	-- static columns
	created_user_id   uuid not null,
	created_date_time TIMESTAMPTZ not null default now(), 
	modified_user_id   uuid null,
	modified_date_time TIMESTAMPTZ  null
);

create index ix_contents_state_code
on contents(state_code);

create index ix_contents_content_type_code
on contents(content_type_code);

create index ix_contents_state_content_type
on contents(state_code,content_type_code);


CREATE UNIQUE INDEX ui_contents_folder_name_active_ci
ON contents(folder, lower(contents(name)))
WHERE state_code = 1;