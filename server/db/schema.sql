CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
    id      SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name    VARCHAR(100) NOT NULL,
    UNIQUE (user_id, name)
);

CREATE TABLE transactions(
    id               SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id      INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    type             VARCHAR(7) NOT NULL CHECK(type IN( 'income', 'expense')),
    amount           NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    description      VARCHAR(255),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_date
    ON transactions (user_id, transaction_date)