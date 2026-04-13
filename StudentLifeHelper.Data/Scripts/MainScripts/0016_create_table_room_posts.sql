create table room_posts(
	id						bigserial not null primary key,
	room_post_type_code		integer not null references info.info_room_post_type(code),
	room_type_code			integer not null references	info.info_room_type(code),
	user_id					uuid not null references users(id),
	title					varchar(200) not null,
	description				varchar(4000) not null,
	for_gender_code			integer not null references info.info_gender(code),
	monthly_rent_fee		numeric(18,2) not null,
	currency_code			integer not null references info.info_currency_type(code),
	deposit_amount			numeric(18,2) not null,
	deposit_exists			boolean not null,
	room_capacity_count		integer not null,
	status_code				integer not null references info.info_status(code),
	region_code				integer not null references info.info_region(code),
	address_link			text not null,


	created_user_id   uuid not null,
	created_date_time TIMESTAMPTZ not null default now(), 
	modified_user_id   uuid null,
	modified_date_time TIMESTAMPTZ  null,

	CHECK (monthly_rent_fee > 0),
CHECK (deposit_amount >= 0),
CHECK (room_capacity_count > 0),

CHECK (
    (deposit_exists = true AND deposit_amount > 0)
    OR
    (deposit_exists = false AND deposit_amount = 0)
)
);


CREATE INDEX ix_room_posts_active_feed
ON room_posts(created_date_time DESC)
WHERE status_code = 1;

CREATE INDEX ix_room_posts_search
ON room_posts(status_code, region_code, room_type_code);
create index ix_room_posts_status_code
on room_posts(status_code);

create index ix_room_posts_room_type_code
on room_posts(room_type_code);

create index ix_room_posts_user_id
on room_posts(user_id);

create index ix_room_posts_for_gender_code
on room_posts(for_gender_code);


CREATE INDEX ix_room_posts_region_code
ON room_posts(region_code);

create index ix_room_posts_room_post_type_code
on room_posts(room_post_type_code);

create index ix_room_posts_currency_code
on room_posts(currency_code);

create index ix_room_posts_type_gender
on room_posts(room_type_code, for_gender_code);

create index ix_room_posts_status_type
on room_posts(status_code, room_type_code);

create index ix_room_posts_created_date_time
on room_posts(created_date_time desc);
