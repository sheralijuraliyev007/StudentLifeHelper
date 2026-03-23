create table room_posts(
	id						bigserial not null primary key,
	room_post_type_id		integer not null references info.info_room_post_type(id),
	room_type_id			integer not null references	info.info_room_type(id),
	user_id					uuid not null references users(id),
	title					varchar(200) not null,
	description				varchar(4000) not null,
	for_gender_id			integer not null references info.info_gender(id),
	motnthly_rent_fee		numeric(18,2) not null,
	currency_id				integer not null references info.info_currency_type(id),
	deposit_amount			numeric(18,2) not null,
	deposit_exists			boolean not null,
	room_capacity_count		integer not null,
	status_id				integer not null references info.info_status(id),
	region_id				integer not null references info.info_region(id),
	address_link			text not null,


	created_user_id   uuid not null,
	created_date_time TIMESTAMPTZ not null default now(), 
	modified_user_id   uuid null,
	modified_date_time TIMESTAMPTZ  null

);

create index ix_room_posts_status_id
on room_posts(status_id);

create index ix_room_posts_room_type_id
on room_posts(room_type_id);

create index ix_room_posts_user_id
on room_posts(user_id);

create index ix_room_posts_for_gender_id
on room_posts(for_gender_id);


create index ix_room_posts_room_post_type_id
on room_posts(room_post_type_id);

create index ix_room_posts_currency_id
on room_posts(currency_id);

create index ix_room_posts_type_gender
on room_posts(room_type_id, for_gender_id);

create index ix_room_posts_status_type
on room_posts(status_id, room_type_id);

create index ix_room_posts_created_date_time
on room_posts(created_date_time desc);
