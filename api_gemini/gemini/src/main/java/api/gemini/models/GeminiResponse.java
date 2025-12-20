package api.gemini.models;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;


@Getter
@Setter
@ToString
public class GeminiResponse {
  private String summary;
  private String description;
  private Boolean type;
  private Number date;
}
