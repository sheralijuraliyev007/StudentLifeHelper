create table users(
                      id                              uuid not null primary key,
                      first_name                      varchar(50) not null,
                      last_name                       varchar(50) not null,
                      middle_name                     varchar(50) null,
                      birth_country_code              integer not null references info.info_country(code),
                      residence_country_code          integer not null references info.info_country(code),
                    language_code                      integer not null  references  info.info_language(code),

                      birth_date                      date null,
                      password_hash                   varchar(255) not null,
                      username                        varchar(50) not null,
                      state_code                      integer not null references info.info_state(code),
                      role_code                       integer not null references info.info_role(code),
                      refresh_token                   text null,
                      refresh_token_expiry_time       timestamptz,
                      img_id                          bigint null references contents(id),
                      gender_code                     integer not null references info.info_gender(code),
                      region_code                     integer not null references info.info_region(code),

                      created_user_id                 uuid not null,
                      created_date_time               timestamptz not null default now(),
                      modified_user_id                uuid null,
                      modified_date_time              timestamptz null
);

create index ix_users_birth_country_code
    on users(birth_country_code);

create index ix_users_residence_country_code
    on users(residence_country_code);

create index ix_users_birth_residence_country_code
    on users(birth_country_code, residence_country_code);

create index ix_users_state_code
    on users(state_code);

create index ix_users_role_code
    on users(role_code);

create index ix_users_img_id
    on users(img_id);

create index ix_users_gender_code
    on users(gender_code);

create index ix_users_region_code
    on users(region_code);

create unique index ui_users_username_active_ci
    on users(lower(username))
    where state_code = 1;

create unique index ui_users_username_passive_ci
    on users(lower(username))
    where state_code = 2;

create unique index ui_users_refresh_token
    on users(refresh_token)
    where refresh_token is not null;