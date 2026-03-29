create table info.info_role(
	id				serial not null primary key,
	code integer not null unique CHECK (code > 0),
	short_name		varchar(15) not null unique,
	full_name		varchar(200) not null,
	info_table_id	integer not null references info.info_table(id),
	state_id		integer not null references info.info_state(id),


	created_user_id   uuid not null,
	created_date_time TIMESTAMPTZ not null default now(), 
	modified_user_id   uuid null,
	modified_date_time TIMESTAMPTZ  null
);


create index ix_info_role_state_id
on info.info_role(state_id);

create index ix_info_role_info_table_id
on info.info_role(info_table_id);


CREATE UNIQUE INDEX ui_info_role_full_name
ON info.info_role(full_name);


INSERT INTO info.info_role (
    code,
    short_name,
    full_name,
    info_table_id,
    state_id,
    created_user_id
)
VALUES
    (1, 'A', 'Administrator', 5, 1, '00000000-0000-0000-0000-000000000001'),
    (2, 'U', 'User', 5, 1, '00000000-0000-0000-0000-000000000001');