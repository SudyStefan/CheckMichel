import { useEffect, useState } from "react";
import { Root } from "./components/Root";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Todo } from "./types/todo";
import { ActivityIndicator, View, Text, Platform } from "react-native";
import { todoService } from "./services/todoService";
import { OfflineStorage } from "./offline_storage/OfflineStorage";
import { offlineStorageDev } from "./offline_storage/offlineStorageDev";
import { offlineStorageLive } from "./offline_storage/offlineStorageLive";
import { styles } from "./styles/styles";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [onlineToggle, setOnlineToggle] = useState(false);
  const storage: OfflineStorage =
    Platform.OS === "web" ? offlineStorageDev : offlineStorageLive;

  useEffect(() => {
    todoService
      .fetchTodos()
      .then((fetchedTodos) => {
        setTodos(fetchedTodos);
        storage.upsertAllTodos(fetchedTodos);
        setOnlineToggle(true);
      })
      .catch(() => {
        console.warn("Failed to fetch on startup, swaping to offline mode.");
        return storage
          .fetchAllTodos()
          .then((readTodos) => setTodos(readTodos))
          .catch((err) => {
            console.error("Failed to get from local storage on startup.");
            throw err;
          });
      })
      .finally(() => setLoading(false));
  }, []);

  return loading ? (
    <View style={styles.loadingView}>
      <ActivityIndicator size={80} />
      <Text style={styles.itemText}>Loading...</Text>
    </View>
  ) : (
    <GestureHandlerRootView>
      <Root
        todos={todos}
        setTodos={setTodos}
        online={onlineToggle}
        offlineStorage={storage}
      />
    </GestureHandlerRootView>
  );
}
