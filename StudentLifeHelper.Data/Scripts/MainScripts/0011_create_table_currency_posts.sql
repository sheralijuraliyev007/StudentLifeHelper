create table currency_posts(
	id			bigserial not null primary key,
	title				varchar(200) not null,
	description			varchar(4000) not null,
	user_id				uuid not null references users(id),
	from_currency_id	integer not null references info.info_currency_type(id),
	to_currency_id		integer not null references info.info_currency_type(id),
	amount				numeric(18,2) not null,
	rate				numeric(18,6)	not null,
	status_id			integer not null references info.info_status(id),


	created_user_id   uuid not null,
	created_date_time TIMESTAMPTZ not null default now(), 
	modified_user_id   uuid null,
	modified_date_time TIMESTAMPTZ  null,



	check (from_currency_id <> to_currency_id),
	check (amount >0),
	check(rate >0)
);


create index ix_currency_posts_user_id
on currency_posts(user_id);

create index ix_currency_posts_status_id
on currency_posts(status_id);

create index ix_currency_posts_to_currency_id
on currency_posts(to_currency_id);

create index ix_currency_posts_from_currency_id
on currency_posts(from_currency_id);


create index ix_currency_posts_from_to_currency_id
on currency_posts(from_currency_id, to_currency_id);

create index ix_currency_posts_created_date_time
on currency_posts(created_date_time desc);