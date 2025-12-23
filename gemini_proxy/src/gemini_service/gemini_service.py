from google import genai
import os
import json

GEMINI_CLIENT = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

SYSTEM_INSTRUCTION = """
You are an assistant that helps users create todo list items based on their input.
You will receive a transcript from the user, and you need to extract the most important information
and format it in JSON format according to the provided schema. You need to determine if the todo item is a basic todo or a calendar event.
"""

TODO_SCHEMA = {
    "type": "OBJECT",
    "title": "GeminiTodo",
    "properties": {
        "summary": {
            "type": "STRING",
            "title": "summary",
            "description": "A concise summary of the input, four words or less, that can be put into a checklist/todo list.",
        },
        "description": {
            "type": "STRING",
            "title": "description",
            "description": "A more detailed description of the todo item.",
        },
        "type": {
            "type": "BOOLEAN",
            "title": "type",
            "description": "Todo items can be either a basic checklist event (false) or a calendar event (true).",
        },
        "date": {
            "type": "NUMBER",
            "title": "eventDate",
            "description": "If you determined the item to be a calendar event, extract the event date as a unix timestamp. Otherwise, return 0.",
        },
    },
}

GEMINI_CONFIG = {"responseMimeType": "application/json", "responseSchema": TODO_SCHEMA}


def gemini_transcript_handler(event, context):
    response_headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
        "Access-Control-Allow-Headers": "*",
    }
    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        return {
            "statusCode": 400,
            "headers": response_headers,
            "body": json.dumps({"error": "Invalid JSON in request body"}),
        }

    transcript = body.get("transcript")
    if not transcript:
        return {
            "statusCode": 400,
            "headers": response_headers,
            "body": json.dumps({"error": "No transcript provided in request body"}),
        }

    try:
        todo = prompt_for_todo(transcript)
        return {
            "statusCode": 200,
            "headers": response_headers,
            "body": json.dumps(todo),
        }

    except Exception as ex:
        print(f"Error creating transcript: {ex}")
        return {
            "statusCode": 500,
            "headers": response_headers,
            "body": json.dumps({"error": str(ex)}),
        }


def prompt_for_todo(transcript):
    try:
        response = GEMINI_CLIENT.models.generate_content(
            model="gemini-2.5-flash", contents=[transcript], config=GEMINI_CONFIG
        )
        return json.loads(response.text)
    except Exception as ex:
        print(f"Error during generation: {ex}")
        raise ValueError(f"failed to gen or parse: {str(ex)}")
