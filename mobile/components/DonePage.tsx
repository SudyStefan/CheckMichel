import { FlatList } from "react-native";
import { Todo, TodoStatus, TodoType } from "../types/todo";
import { styles } from "../styles/styles";
import { TodoListItem } from "./TodoListItem";

export type DonePageProp = {
  data: Todo[];
  onUncheck: (id: string) => void;
  onDelete: (id: string) => void;
};

export const DonePage = ({ data, onUncheck, onDelete }: DonePageProp) => {
  return (
    <FlatList
      data={data.filter(
        (data) =>
          data.type === TodoType.CHECK && data.status === TodoStatus.DONE
      )}
      keyExtractor={(item) => item.id}
      style={{ flex: 1 }}
      contentContainerStyle={styles.singleList}
      renderItem={({ item }) => (
        <TodoListItem
          item={item}
          onSwipe={onDelete}
          onPress={onUncheck}
          swipeRight
        />
      )}
    />
  );
};
