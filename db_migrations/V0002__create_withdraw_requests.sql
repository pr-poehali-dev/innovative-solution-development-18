CREATE TABLE IF NOT EXISTS t_p27446408_innovative_solution_.withdraw_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES t_p27446408_innovative_solution_.users(id),
  ptc_amount DOUBLE PRECISION NOT NULL,
  rub_amount DOUBLE PRECISION NOT NULL,
  card_number VARCHAR(20) NOT NULL,
  card_holder VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);