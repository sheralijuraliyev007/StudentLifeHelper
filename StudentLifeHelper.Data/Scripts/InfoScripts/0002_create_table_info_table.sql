CREATE TABLE info.info_table(
                                id                  SERIAL NOT NULL PRIMARY KEY,
                                code                INTEGER NOT NULL UNIQUE CHECK (code > 0),
                                short_name          VARCHAR(15) NOT NULL UNIQUE,
                                full_name           VARCHAR(200) NOT NULL,
                                state_code           INTEGER NOT NULL REFERENCES info.info_state(code),

                                created_user_id     UUID NOT NULL,
                                created_date_time   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                modified_user_id    UUID NULL,
                                modified_date_time  TIMESTAMPTZ NULL
);

CREATE INDEX ix_info_table_state_code
    ON info.info_table(state_code);


INSERT INTO info.info_table (
    code,
    short_name,
    full_name,
    state_code,
    created_user_id
)

    (1, 'STATUS', 'Status', 1, '00000000-0000-0000-0000-000000000001'),
    (2, 'COUNTRY', 'Country', 1, '00000000-0000-0000-0000-000000000001'),
    (3, 'CONTENT_TYPE', 'Content Type', 1, '00000000-0000-0000-0000-000000000001'),
    (4, 'GENDER', 'Gender', 1, '00000000-0000-0000-0000-000000000001'),
    (5, 'ROLE', 'Role', 1, '00000000-0000-0000-0000-000000000001'),
    (6, 'CURRENCY_TYPE', 'Currency Type', 1, '00000000-0000-0000-0000-000000000001'),
    (7, 'ROOM_POST_TYPE', 'Room Post Type', 1, '00000000-0000-0000-0000-000000000001'),
    (8, 'ROOM_TYPE', 'Room Type', 1, '00000000-0000-0000-0000-000000000001'),
    (9, 'REGION', 'Region', 1, '00000000-0000-0000-0000-000000000001'); 