import json
import os
import hashlib
import secrets
import psycopg2

SCHEMA = "t_p27446408_innovative_solution_"

def handler(event: dict, context) -> dict:
    """Вход пользователя по email и паролю"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, "body": ""}

    body = json.loads(event.get("body") or "{}")
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    if not email or not password:
        return {"statusCode": 400, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"error": "Email и пароль обязательны"})}

    password_hash = hashlib.sha256(password.encode()).hexdigest()

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email = '{email}' AND password_hash = '{password_hash}'")
    row = cur.fetchone()
    cur.close(); conn.close()

    if not row:
        return {"statusCode": 401, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"error": "Неверный email или пароль"})}

    user_id = row[0]
    token = secrets.token_hex(32)

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"token": f"{user_id}:{token}", "user_id": user_id})
    }
