-- Create tables
CREATE TABLE IF NOT EXISTS public.users (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) not null,
    last_name VARCHAR(100) not null,
    password varchar(255) not null,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
