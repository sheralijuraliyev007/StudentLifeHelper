create table info.info_country(
	id				serial not null primary key,
	code 			integer not null unique CHECK (code > 0),
	short_name		varchar(15) not null unique,
	full_name		varchar(200) not null,
	state_code		integer not null references info.info_state(code),


	created_user_id   uuid not null,
	created_date_time TIMESTAMPTZ not null default now(), 
	modified_user_id   uuid null,
	modified_date_time TIMESTAMPTZ  null
);


create index ix_info_country_state_code
on info.info_country(state_code);

CREATE UNIQUE INDEX ui_info_country_full_name
ON info.info_country(full_name);

INSERT INTO info.info_country
(code, short_name, full_name, state_code, created_user_id)
VALUES
    (1,'UZ','Uzbekistan',1,'00000000-0000-0000-0000-000000000001');