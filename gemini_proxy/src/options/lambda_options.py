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


def options_handler(event, context):
    try:
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
                "Access-Control-Allow-Methods": "OPTIONS,POST",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps("Options called successfully!"),
        }
    except Exception as ex:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(ex)}),
        }
