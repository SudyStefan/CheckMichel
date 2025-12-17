import { FlatList } from "react-native";
import { Todo, TodoStatus, TodoType } from "../types/todo";
import { styles } from "../styles/styles";
import { TodoListItem } from "./TodoListItem";

export type SinglePageProp = {
  data: Todo[];
  onCheck: (id: string) => void;
};

export const SinglePage = ({ data, onCheck }: SinglePageProp) => {
  return (
    <FlatList
      testID="SinglePage"
      data={data.filter(
        (data) =>
          data.type === TodoType.CHECK && data.status === TodoStatus.OPEN
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.singleList}
      renderItem={({ item }) => (
        <TodoListItem
          item={item}
          onSwipe={onCheck}
          onPress={onCheck}
          swipeLeft={true}
        />
      )}
    />
  );
};
