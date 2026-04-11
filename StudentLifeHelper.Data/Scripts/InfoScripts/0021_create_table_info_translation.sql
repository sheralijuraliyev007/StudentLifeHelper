create table info.info_translation(
                                   id				bigserial not null primary key,
                                   table_code		integer not null references  info.info_table(code),
                                   language_code	integer not null references  info.info_language(code),
                                    record_code     integer not null,
                                   column_name		varchar(100) not null,
                                   state_code		integer not null references info.info_state(code),
                                   translated_text	text not null,


                                   created_user_id   uuid not null,
                                   created_date_time TIMESTAMPTZ not null default now(),
                                   modified_user_id   uuid null,
                                   modified_date_time TIMESTAMPTZ  null
);

create  unique index ui_info_translation_unique on  info.info_translation(
                                    table_code , record_code, column_name,  language_code
    );


create  index ix_info_translation_language_code on 
info.info_translation(language_code)

create index ix_info_translation_language_code
on info.info_translation(table_code)

create index ix_info_translation_state_code
    on info.info_translation(state_code);