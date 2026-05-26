import json
import os
import psycopg2

SCHEMA = "t_p27446408_innovative_solution_"

def get_user_id(token: str) -> int | None:
    parts = token.split(":")
    if len(parts) < 2:
        return None
    try:
        return int(parts[0])
    except ValueError:
        return None

def handler(event: dict, context) -> dict:
    """Получение данных майнера пользователя (клики и уровень буста)"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, "body": ""}

    auth = event.get("headers", {}).get("X-Authorization") or event.get("headers", {}).get("authorization") or ""
    token = auth.replace("Bearer ", "").strip()
    user_id = get_user_id(token)

    if not user_id:
        return {"statusCode": 401, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"error": "Не авторизован"})}

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(f"SELECT clicks, boost_level FROM {SCHEMA}.miner_data WHERE user_id = {user_id}")
    row = cur.fetchone()
    cur.close(); conn.close()

    if not row:
        return {"statusCode": 200, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"clicks": 0, "boost_level": 0})}

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"clicks": row[0], "boost_level": row[1]})
    }
