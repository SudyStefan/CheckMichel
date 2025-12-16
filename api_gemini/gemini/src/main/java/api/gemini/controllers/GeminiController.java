package api.gemini.controllers;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import api.gemini.models.GeminiResponse;
import api.gemini.services.GeminiService;


@RestController
@CrossOrigin(origins = "http://localhost:8081")
public class GeminiController {
  @PostMapping("/todo")
  public String createGeminiTodo(@RequestBody String requestText) {
    final String response = GeminiService.promptForTodo(requestText);
    System.out.print(response);
    return response;
  }
  
  // @GetMapping("/todo")
  // public GeminiResponse testGemini() {
  //   return GeminiService.promptForTodo("I'm out of toilet paper");
  // }

  // @PostMapping("/todoAudio")
  // public GeminiResponse transcribeAudio(@RequestPart("audiofile") MultipartFile audioFile) {
  //   try {
  //       String fileName = audioFile.getOriginalFilename();
  //       String contentType = audioFile.getContentType();
  //       long fileSize = audioFile.getSize();
  //       byte[] fileBytes = audioFile.getBytes();

  //       System.out.println("Processing file: " + fileName + 
  //                              ", Type: " + contentType + 
  //                              ", Size: " + fileSize);
  //       GeminiResponse result = GeminiService.speechToText(fileBytes);
  //       System.out.println("Response: " + result.getResponseText());
  //       return result;
  //   } catch (Exception e) {
  //     return null;
  //   }
  // }
}
