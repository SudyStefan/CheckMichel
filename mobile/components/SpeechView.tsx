import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import { colors, styles } from "../styles/styles";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent
} from "expo-speech-recognition";
import {
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
  useCallback
} from "react";

export type SpeechViewProps = {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  onStopRecognizing: (transcripedText: string) => void;
};

export const SpeechView = ({
  isVisible,
  setIsVisible,
  onStopRecognizing
}: SpeechViewProps) => {
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useSpeechRecognitionEvent("start", () => setIsVisible(true));
  useSpeechRecognitionEvent("end", () => onStopRecognizing(transcript));
  useSpeechRecognitionEvent("result", (event) => {
    setTranscript(event.results[0].transcript);
  });
  useSpeechRecognitionEvent("error", (event) => {
    console.error("error code:", event.error, "error msg:", event.message);
  });
  useSpeechRecognitionEvent("nomatch", (event) => {
    console.warn("No match:", event);
  });

  const handleStart = useCallback(() => {
    setIsProcessing(false);
    ExpoSpeechRecognitionModule.requestPermissionsAsync().then((result) => {
      if (!result.granted) {
        console.warn("Permission not granted", result);
        return;
      }
      console.log("Starting speech recognition...");
      ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: true,
        continuous: true
      });
    });
  }, []);

  const handleStop = useCallback(() => {
    setIsProcessing(true);
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const handleTranscriptReset = useCallback(() => {
    setTranscript("");
  }, []);

  useEffect(() => {
    isVisible && handleStart();
  }, [isVisible]);

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      style={styles.fullScreenView}
    >
      <View style={styles.addView}>
        <Text
          style={{ ...styles.addText, textAlign: "center", marginBottom: 20 }}
        >
          {transcript ? transcript : "Listening..."}
        </Text>
        {isProcessing ? (
          <ActivityIndicator size={100} style={{ marginTop: 100 }} />
        ) : (
          <View style={{ flexDirection: "row", marginLeft: 10 }}>
            <Pressable onPress={handleStop} style={styles.pressableButton}>
              <Text style={styles.addText}>PROCESS</Text>
            </Pressable>
            <Pressable
              onPress={handleTranscriptReset}
              style={{
                ...styles.pressableButton,
                backgroundColor: colors.soxred
              }}
            >
              <Text style={styles.addText}>RESET</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
};
