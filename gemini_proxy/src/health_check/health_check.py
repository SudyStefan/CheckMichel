import json


def health_check(event, context):
    try:
        client_ip = (
            event.get("requestContext", {}).get("http", {}).get("sourceIp", "unknown")
        )
        if client_ip == "unknown":
            client_ip = event.get("headers", {}).get("X-Forwarded-For", "unknown")

        print(f"Received healthcheck from: {client_ip}")
        response_body = {"status": "healthy", "client_ip": client_ip}

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(response_body),
        }
    except Exception as ex:
        print(f"Error during healthcheck: {ex}")
        error_body = {"error": str(ex)}
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(error_body),
        }
