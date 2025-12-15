import React from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { styles, colors } from "../styles/styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Todo, TodoStatus } from "../types/todo";

export type TodoItemProp = {
  item: Todo;
  onPress: (id: string) => void;
  onSwipe: (id: string) => void;
  swipeLeft?: boolean;
  swipeRight?: boolean;
};

export const TodoListItem = ({
  item,
  onPress,
  onSwipe,
  swipeLeft = false,
  swipeRight = false
}: TodoItemProp) => {
  const renderActions = (text: string) => (
    <View style={styles.swipeContainer}>
      <Text style={styles.swipeText}>{text}</Text>
    </View>
  );

  return (
    <Swipeable
      renderLeftActions={swipeLeft ? () => renderActions("CHECK") : undefined}
      dragOffsetFromLeftEdge={swipeLeft ? undefined : Number.MAX_VALUE}
      renderRightActions={
        swipeRight ? () => renderActions("DELETE") : undefined
      }
      dragOffsetFromRightEdge={swipeRight ? undefined : Number.MAX_VALUE}
      onSwipeableOpen={() => onSwipe(item.id)}
      childrenContainerStyle={styles.item}
      testID="TodoItem"
    >
      <Text style={styles.itemText} numberOfLines={1}>
        {item.summary}
      </Text>
      <Pressable onPress={() => onPress(item.id)}>
        <Ionicons
          name={
            item.status === TodoStatus.DONE
              ? "checkmark-circle"
              : "ellipse-outline"
          }
          size={Dimensions.get("window").height * 0.06}
          color={
            item.status === TodoStatus.DONE
              ? colors.seattlegreen
              : colors.soxred
          }
        />
      </Pressable>
    </Swipeable>
  );
};
