import json
import os
import hashlib
import secrets
import psycopg2

SCHEMA = "t_p27446408_innovative_solution_"

def handler(event: dict, context) -> dict:
    """Регистрация нового пользователя по email и паролю"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, "body": ""}

    body = json.loads(event.get("body") or "{}")
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    if not email or not password:
        return {"statusCode": 400, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"error": "Email и пароль обязательны"})}

    if len(password) < 6:
        return {"statusCode": 400, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"error": "Пароль должен быть не менее 6 символов"})}

    password_hash = hashlib.sha256(password.encode()).hexdigest()
    token = secrets.token_hex(32)

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()

    cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email = '{email}'")
    if cur.fetchone():
        cur.close(); conn.close()
        return {"statusCode": 409, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"error": "Пользователь с таким email уже существует"})}

    cur.execute(f"INSERT INTO {SCHEMA}.users (email, password_hash) VALUES ('{email}', '{password_hash}') RETURNING id")
    user_id = cur.fetchone()[0]
    cur.execute(f"INSERT INTO {SCHEMA}.miner_data (user_id, clicks, boost_level) VALUES ({user_id}, 0, 0)")
    conn.commit()
    cur.close(); conn.close()

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"token": f"{user_id}:{token}", "user_id": user_id})
    }
