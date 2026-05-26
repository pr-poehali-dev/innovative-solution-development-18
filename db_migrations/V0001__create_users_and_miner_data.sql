CREATE TABLE IF NOT EXISTS t_p27446408_innovative_solution_.users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p27446408_innovative_solution_.miner_data (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES t_p27446408_innovative_solution_.users(id),
  clicks BIGINT DEFAULT 0,
  boost_level INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);