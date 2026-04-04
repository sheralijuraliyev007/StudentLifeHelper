create table info.info_translation(
                                   id				bigserial not null primary key,
                                   table_code		integer not null references  info.info_table(code),
                                   language_code	integer not null references  info.info_language(code),
                                   column_name		varchar(100) not null,
                                   state_id		integer not null references info.info_state(id),
                                   translated_text	text not null,


                                   created_user_id   uuid not null,
                                   created_date_time TIMESTAMPTZ not null default now(),
                                   modified_user_id   uuid null,
                                   modified_date_time TIMESTAMPTZ  null
);
