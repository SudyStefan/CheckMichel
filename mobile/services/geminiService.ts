import axios from "axios";
import { Platform } from "react-native";
import { Todo, TodoStatus, TodoType } from "../types/todo";
import { v4 as uuid } from "uuid";

class GeminiService {
  public fetchFromTranscript = (text: string): Promise<Todo> => {
    return axios
      .post("http://localhost:8080/todo", text)
      .then((res) => {
        console.log(res.data);
        const todo: Todo = {
          id: uuid(),
          summary: res.data.summary,
          status: TodoStatus.OPEN,
          creationDate: new Date(),
          type: res.data.type ? TodoType.CALENDAR : TodoType.CHECK,
          description: res.data.description
        };

        return res.data.type === TodoType.CHECK
          ? todo
          : {
              ...todo,
              eventDate: new Date(res.data.date * 1000)
            };
      })
      .catch((err) => {
        console.error(`Error trying to prompt gemini:`, err);
        throw err;
      });
  };

  public fetchFromAudio = (audioUri: string): Promise<string> => {
    const formData = new FormData();

    if (Platform.OS === "web") {
      return fetch(audioUri).then((res) =>
        res
          .blob()
          .then((blob) => {
            formData.append("audiofile", blob);
            return axios
              .post("http://localhost:8080/todoAudio", formData)
              .then((res) => (res.data.responseText as string).replace('"', ""))
              .catch((err) => {
                throw err;
              });
          })
          .catch((err) => {
            throw err;
          })
      );
    } else {
      formData.append("audiofile", {
        uri: audioUri,
        type: "audio/m4a",
        name: audioUri.split("/").pop() || "recording.m4a"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      return axios
        .post("http://localhost:8080/todoAudio", formData)
        .then((res) => res.data.responseText)
        .catch((err) => {
          throw err;
        });
    }
  };
}

export const geminiService = new GeminiService();
