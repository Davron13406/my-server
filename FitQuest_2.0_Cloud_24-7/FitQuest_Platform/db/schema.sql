CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  nick VARCHAR(32) NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_uq ON users (LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS users_nick_lower_uq ON users (LOWER(nick));

CREATE TABLE IF NOT EXISTS player_state (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  coins INTEGER NOT NULL DEFAULT 0 CHECK (coins >= 0),
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  streak INTEGER NOT NULL DEFAULT 0 CHECK (streak >= 0),
  total_tasks INTEGER NOT NULL DEFAULT 0 CHECK (total_tasks >= 0),
  week_xp INTEGER NOT NULL DEFAULT 0 CHECK (week_xp >= 0),
  history JSONB NOT NULL DEFAULT '{}'::jsonb,
  settings JSONB NOT NULL DEFAULT '{"height":"","weight":"","activity":"moderate","profileBio":"","profileGoal":"general","reminderTime":"19:00","dailyReminder":true,"missedReminder":true,"timezone":"Asia/Tashkent"}'::jsonb,
  inventory TEXT[] NOT NULL DEFAULT ARRAY['theme-lime','avatar-rocket']::TEXT[],
  equipped_theme TEXT NOT NULL DEFAULT 'theme-lime',
  equipped_avatar TEXT NOT NULL DEFAULT 'avatar-rocket',
  equipped_voice TEXT NOT NULL DEFAULT '',
  streak_freezes INTEGER NOT NULL DEFAULT 0 CHECK (streak_freezes >= 0),
  last_active_date TEXT NOT NULL DEFAULT '',
  geo_date TEXT NOT NULL DEFAULT '',
  geo_meters DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (geo_meters >= 0),
  geo_farthest_meters DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (geo_farthest_meters >= 0),
  geo_start_lat DOUBLE PRECISION,
  geo_start_lon DOUBLE PRECISION,
  geo_last_lat DOUBLE PRECISION,
  geo_last_lon DOUBLE PRECISION,
  geo_last_timestamp BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS completed_tasks (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  day_key TEXT NOT NULL,
  coins_awarded INTEGER NOT NULL,
  xp_awarded INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, task_id, day_key)
);
CREATE INDEX IF NOT EXISTS completed_tasks_user_day_idx ON completed_tasks(user_id, day_key);

CREATE TABLE IF NOT EXISTS shop_purchases (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS shop_purchases_user_idx ON shop_purchases(user_id, purchased_at DESC);

CREATE TABLE IF NOT EXISTS workout_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes BETWEEN 1 AND 180),
  note VARCHAR(300) NOT NULL DEFAULT '',
  local_day TEXT NOT NULL,
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  coins_awarded INTEGER NOT NULL DEFAULT 0,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  client_request_id UUID
);
ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS client_request_id UUID;
CREATE UNIQUE INDEX IF NOT EXISTS workout_logs_user_request_uq ON workout_logs(user_id, client_request_id) WHERE client_request_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS workout_logs_user_day_idx ON workout_logs(user_id, local_day);
CREATE INDEX IF NOT EXISTS workout_logs_user_date_idx ON workout_logs(user_id, logged_at DESC);

CREATE TABLE IF NOT EXISTS program_progress (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program_id TEXT NOT NULL,
  completed_days INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_completed_on TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(user_id, program_id)
);
