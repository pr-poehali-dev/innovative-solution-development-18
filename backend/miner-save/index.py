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
    """Сохранение кликов и уровня буста пользователя в БД"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, "body": ""}

    auth = event.get("headers", {}).get("X-Authorization") or event.get("headers", {}).get("authorization") or ""
    token = auth.replace("Bearer ", "").strip()
    user_id = get_user_id(token)

    if not user_id:
        return {"statusCode": 401, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"error": "Не авторизован"})}

    body = json.loads(event.get("body") or "{}")
    clicks = int(body.get("clicks") or 0)
    boost_level = int(body.get("boost_level") or 0)

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(
        f"UPDATE {SCHEMA}.miner_data SET clicks = {clicks}, boost_level = {boost_level}, updated_at = NOW() WHERE user_id = {user_id}"
    )
    conn.commit()
    cur.close(); conn.close()

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"ok": True})
    }
