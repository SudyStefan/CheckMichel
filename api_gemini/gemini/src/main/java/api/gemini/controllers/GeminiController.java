package api.gemini.controllers;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import api.gemini.services.GeminiService;


@RestController
@CrossOrigin(origins = "http://localhost:8081")
public class GeminiController {
  @GetMapping("/alive")
  @CrossOrigin(origins = "http://localhost:8081")
  public ResponseEntity<String> testGemini() {
    return new ResponseEntity<>("We Alive", HttpStatus.OK);
  }

  @PostMapping("/todo")
  public ResponseEntity<String> createTodoFromTranscript(@RequestBody String requestText) {
    try {
    final String response = GeminiService.promptForTodo(requestText);
    System.out.print(response);
    return new ResponseEntity<>(response, HttpStatus.OK);
    } catch (Exception e) {
      return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  @PostMapping("/todoAudio")
  public ResponseEntity<String> createTodoFromAudio(@RequestPart("audiofile") MultipartFile audioFile) {
    try {
        String fileName = audioFile.getOriginalFilename();
        String contentType = audioFile.getContentType();
        long fileSize = audioFile.getSize();
        byte[] fileBytes = audioFile.getBytes();

        System.out.println("Processing file: " + fileName + 
                               ", Type: " + contentType + 
                               ", Size: " + fileSize);
        final String response = GeminiService.transcribeAudio(fileBytes);
        return new ResponseEntity<>(response, HttpStatus.OK);
    } catch (IOException e) {
      return new ResponseEntity<>("e.getMessage()", HttpStatus.INTERNAL_SERVER_ERROR);
    } catch (Exception e) {
      return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
