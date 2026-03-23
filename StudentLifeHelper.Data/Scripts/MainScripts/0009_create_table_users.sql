create table users(
	id								uuid not null primary key,
	first_name						varchar(50) not null,
	last_name						varchar(50) not null,
	middle_name						varchar(50) null,
	country_id						integer not null references info.info_country(id),
	birth_date						date null,
	password_hash					varchar(255) not null,
	username						varchar(50) not null unique,
	state_id						integer not null references info.info_state(id),
	role_id							integer not null references info.info_role(id),
	refresh_token					text null,
	refresh_token_expire_time		TIMESTAMPZ,
	img_id							bigint null references contents(id),
	gender_id						integer not null references info.info_gender(id),
	region_id						integer not null references info.info_region(id),

	created_user_id   uuid not null,
	created_date_time TIMESTAMPTZ not null default now(), 
	modified_user_id   uuid null,
	modified_date_time TIMESTAMPTZ  null
);

create index ix_users_country_id
on users(country_id);

create index ix_users_state_id
on users(state_id);

create index ix_users_role_id
on users(role_id);

create index ix_users_img_id
on users(img_id);

create index ix_users_gender_id
on users(gender_id);

