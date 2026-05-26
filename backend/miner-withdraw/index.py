import json
import os
import psycopg2

SCHEMA = "t_p27446408_innovative_solution_"
MIN_WITHDRAW_RUB = 1000.0

def get_user_id(token: str) -> int | None:
    parts = token.split(":")
    if len(parts) < 2:
        return None
    try:
        return int(parts[0])
    except ValueError:
        return None

def handler(event: dict, context) -> dict:
    """Создание заявки на вывод PTC → рубли на банковскую карту"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization"}, "body": ""}

    auth = event.get("headers", {}).get("X-Authorization") or event.get("headers", {}).get("authorization") or ""
    token = auth.replace("Bearer ", "").strip()
    user_id = get_user_id(token)

    if not user_id:
        return {"statusCode": 401, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"error": "Не авторизован"})}

    body = json.loads(event.get("body") or "{}")
    ptc_amount = float(body.get("ptc_amount") or 0)
    rub_amount = float(body.get("rub_amount") or 0)
    card_number = str(body.get("card_number") or "").replace(" ", "")
    card_holder = str(body.get("card_holder") or "").strip().upper()

    if ptc_amount <= 0 or rub_amount <= 0:
        return {"statusCode": 400, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"error": "Укажите сумму для вывода"})}

    if rub_amount < MIN_WITHDRAW_RUB:
        return {"statusCode": 400, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"error": f"Минимальная сумма вывода {int(MIN_WITHDRAW_RUB)} ₽"})}

    if len(card_number) != 16 or not card_number.isdigit():
        return {"statusCode": 400, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"error": "Введите корректный номер карты (16 цифр)"})}

    if not card_holder or len(card_holder) < 3:
        return {"statusCode": 400, "headers": {"Access-Control-Allow-Origin": "*"}, "body": json.dumps({"error": "Укажите имя держателя карты"})}

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()

    cur.execute(
        f"INSERT INTO {SCHEMA}.withdraw_requests (user_id, ptc_amount, rub_amount, card_number, card_holder, status) "
        f"VALUES ({user_id}, {ptc_amount}, {rub_amount}, '{card_number}', '{card_holder}', 'pending') RETURNING id"
    )
    request_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({
            "ok": True,
            "request_id": request_id,
            "message": f"Заявка #{request_id} принята. Выплата {rub_amount:.2f} ₽ будет обработана в течение 24 часов."
        })
    }
