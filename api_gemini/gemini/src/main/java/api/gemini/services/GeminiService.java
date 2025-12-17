package api.gemini.services;


import java.util.HashMap;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import com.google.genai.types.Schema;
import com.google.genai.types.Type;

public class GeminiService {
  public static String promptForTodo(String text) {
    Client client = Client.builder().apiKey(System.getenv("GEMINI_API_KEY")).build();

    Schema summarySchema = Schema.builder()
      .type(Type.Known.STRING)
      .title("summary")
      .description("A concise summary of the input, four words or less, that can be put into a checklist/todo list.")
      .build();

    Schema descriptionSchema = Schema.builder()
      .type(Type.Known.STRING)
      .title("description")
      .description("A more detailed description of the todo item.")
      .build();

    Schema typeSchema = Schema.builder()
      .type(Type.Known.BOOLEAN)
      .title("type")
      .description("Todo items can be either a basic checklist event (false) or a calendar event (true).")
      .build();

    Schema eventDate = Schema.builder()
      .type(Type.Known.NUMBER)
      .title("eventDate")
      .description("If you determined the item to be a calendar event, extract the event date as a unix timestamp. Otherwise, return 0.")
      .build();

    HashMap<String, Schema> properties = new HashMap<>();
    properties.put("summary", summarySchema);
    properties.put("description", descriptionSchema);
    properties.put("type", typeSchema);
    properties.put("date", eventDate);

    Schema responseSchema = Schema.builder()
      .type(Type.Known.OBJECT)
      .title("GeminiTodo")
      .properties(properties)
      .build();
          
    GenerateContentConfig config = GenerateContentConfig.builder()
      .responseMimeType("application/json")
      .responseSchema(responseSchema)
      .systemInstruction(Content.fromParts(Part.fromText("""
        You are an assistant that helps users create todo list items based on their input.
        You will receive a transcript from the user, and you need to extract the most important information
        and format it in JSON format according to the provided schema. You need to determine if the todo item is a basic todo or a calendar event.
        """)))
      .build();

    GenerateContentResponse response = client.models.generateContent("gemini-2.5-flash", text, config);
    return response.text();
  }

  // public static GeminiResponse speechToText(byte[] audioBytes) {
  //   String prompt = """
  //       Process the audio file and try to extract the requested field from it.

  //       Requirements:
  //       1. Be accurate.
  //       2. It might be in English, German and potentially German with an Austrian dialect.
  //       """;

  //   Client client = Client.builder().apiKey(System.getenv("GEMINI_API_KEY")).build();

  //   ArrayList<Part> parts = new ArrayList<>();
  //   parts.add(Part.fromBytes(audioBytes, "audio/m4a"));
  //   parts.add(Part.fromText(prompt));

  //   Content content = Content.builder().parts(parts).build();

  //   Schema schema = Schema.builder()
  //     .type(Type.Known.STRING)
  //     .title("text")
  //     .description("A concise summary of the audio, four words or less, that can be put into a checklist/todo list.")
  //     .build();
          
  //   GenerateContentConfig config = GenerateContentConfig.builder()
  //     .responseMimeType("application/json")
  //     .responseSchema(schema)
  //     .build();

  //   GenerateContentResponse response = client.models.generateContent("gemini-2.5-flash", content, config);
  //   return new GeminiResponse(response.text(), "");
  // }
}
