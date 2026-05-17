CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(30) NOT NULL,
    username VARCHAR(30) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES  users(id) ON DELETE CASCADE ,
    bio TEXT,
    avatar_url TEXT,
    birth DATE,
)