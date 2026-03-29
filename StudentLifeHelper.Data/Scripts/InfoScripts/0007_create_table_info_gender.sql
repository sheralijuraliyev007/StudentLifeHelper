create table info.info_gender(
	id				serial not null primary key,
	code integer not null unique CHECK (code > 0),
	short_name		varchar(15) not null unique,
	full_name		varchar(200) not null,
	state_id		integer not null references info.info_state(id),
	info_table_id	integer not null references info.info_table(id),


	created_user_id   uuid not null,
	created_date_time TIMESTAMPTZ not null default now(), 
	modified_user_id   uuid null,
	modified_date_time TIMESTAMPTZ  null
);

create index ix_info_gender_state_id
on info.info_gender(state_id);

create index ix_info_gender_info_table_id
on info.info_gender(info_table_id);


CREATE UNIQUE INDEX ui_info_gender_full_name
ON info.info_gender(full_name);

INSERT INTO info.info_gender (
    code,
    short_name,
    full_name,
    info_table_id,
    state_id,
    created_user_id
)
VALUES
    (1, 'M', 'Male', 4, 1, '00000000-0000-0000-0000-000000000001'),
    (2, 'F', 'Female', 4, 1, '00000000-0000-0000-0000-000000000001');