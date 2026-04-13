CREATE SCHEMA info;

CREATE TABLE info.info_state(
                                id                  SERIAL NOT NULL PRIMARY KEY,
                                code                INTEGER NOT NULL UNIQUE CHECK (code > 0),
                                short_name          VARCHAR(15) NOT NULL,
                                full_name           VARCHAR(200) NOT NULL,

                                created_user_id     UUID NOT NULL,
                                created_date_time   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                modified_user_id    UUID NULL,
                                modified_date_time  TIMESTAMPTZ NULL
);

INSERT INTO info.info_state (
    code,
    short_name,
    full_name,
    created_user_id
)
VALUES
    (1, 'A', 'Active', '00000000-0000-0000-0000-000000000001'),
    (2, 'P', 'Passive', '00000000-0000-0000-0000-000000000001');