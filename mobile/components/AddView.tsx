import React, { useEffect } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { styles, colors } from "../styles/styles";
import { TextInput } from "react-native-gesture-handler";
import { Todo, TodoStatus, TodoType } from "../types/todo";
import { v4 as uuid } from "uuid";
import Ionicons from "@expo/vector-icons/Ionicons";

export type AddViewProps = {
  isVisible: boolean;
  onAdd: (todo: Todo) => void;
  onClose: () => void;
};

export const AddView = ({ isVisible, onAdd, onClose }: AddViewProps) => {
  const [summary, setSummary] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [type, setType] = React.useState<TodoType>(TodoType.CHECK);

  const summaryRef = React.useRef<TextInput>(null);
  const descriptionRef = React.useRef<TextInput>(null);

  useEffect(() => {
    if (!isVisible) {
      setSummary("");
      setDescription("");
      setType(TodoType.CHECK);
    }
  }, [isVisible]);

  const initClose = () => {
    onAdd({
      id: uuid(),
      summary: summary,
      description: description,
      status: TodoStatus.OPEN,
      creationDate: new Date(),
      type: type
    });
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      style={styles.fullScreenView}
      onShow={() => summaryRef.current?.focus()}
    >
      <View style={styles.addView}>
        <TextInput
          ref={summaryRef}
          style={{ ...styles.addText, minWidth: 400 }}
          placeholder="todo name..."
          value={summary}
          onChangeText={(text) => setSummary(text)}
        />
        <TextInput
          ref={descriptionRef}
          style={{ ...styles.addText, minWidth: 400 }}
          placeholder="description (optional)..."
          value={description}
          onChangeText={(text) => setDescription(text)}
        />
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <Pressable
            onPress={() => setType(TodoType.CHECK)}
            style={
              type === TodoType.CHECK
                ? styles.pressableRadioSelected
                : styles.pressableRadio
            }
          >
            <Ionicons
              name={"checkmark-circle"}
              size={60}
              color={colors.primaryLight}
            />
          </Pressable>
          <Pressable
            onPress={() => setType(TodoType.CALENDAR)}
            style={
              type === TodoType.CALENDAR
                ? styles.pressableRadioSelected
                : styles.pressableRadio
            }
          >
            <Ionicons name={"calendar"} size={60} color={colors.primaryLight} />
          </Pressable>
        </View>
        {type === TodoType.CALENDAR && (
          <Text style={styles.addText}>**Datepicker here**</Text>
        )}
        <View style={{ flexDirection: "row", marginLeft: 10, marginTop: 50 }}>
          <Pressable onPress={initClose} style={styles.pressableButton}>
            <Text style={styles.addText}>ADD</Text>
          </Pressable>
          <Pressable
            onPress={onClose}
            style={{
              ...styles.pressableButton,
              backgroundColor: colors.soxred
            }}
          >
            <Text style={styles.addText}>CANCEL</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};
