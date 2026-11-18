# FitQuest 2.0 — Python architecture

Browser UI (HTML/CSS/JavaScript) communicates over same-origin HTTP with the Flask API (`server.py`). Flask uses PostgreSQL through psycopg 3. Passwords are hashed with bcrypt. Server-side filesystem sessions are managed by Flask-Session. Core account, profile, shop, workout, program, GPS and leaderboard routes are provided.

The PostgreSQL schema remains in `db/schema.sql`. For production, use HTTPS, a strong random `SESSION_SECRET`, managed PostgreSQL backups, logging and a security review. GPS from a browser is not cryptographic proof of location.
