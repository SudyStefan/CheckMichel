import { Todo, TodoStatus, TodoType } from "../types/todo";
import { Platform, useWindowDimensions, View } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import React, { useCallback, useState } from "react";
import { SinglePage } from "./SinglePage";
import { styles, colors } from "../styles/styles";
import { FloatingPressable } from "./FloatingPressable";
import { AddView } from "./AddView";
import { DonePage } from "./DonePage";
import { InfoPopup, PopupItem } from "./InfoPopup";
import { todoService } from "../services/todoService";
import { SafeAreaView } from "react-native-safe-area-context";
import { geminiService } from "../services/geminiService";
import { OfflineStorage } from "../offline_storage/OfflineStorage";
import { SpeechView } from "./SpeechView";

const routes = [
  { key: "single", title: "SINGLE" },
  { key: "done", title: "DONE" }
];

export type RootProp = {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  online: boolean;
  offlineStorage: OfflineStorage;
};

export const Root = ({ todos, setTodos, online, offlineStorage }: RootProp) => {
  const [addViewVisible, setAddViewVisible] = useState(false);
  const [popupItems, setPopupItems] = useState<PopupItem[]>([]);
  const [navIndex, setNavIndex] = useState(0);
  const [speechViewVisibility, setSpeechViewVisibility] = useState(false);

  const layout = useWindowDimensions();

  const changeTodo = useCallback((id: string, newStatus: TodoStatus) => {
    setTodos((currentTodos) => {
      const todo = currentTodos.find((item) => item.id === id)!;
      setPopupItems((currentPopups) => [
        ...currentPopups,
        {
          id: todo.id,
          text: todo.summary,
          prevStatus: todo.status,
          currentStatus: newStatus
        }
      ]);

      return currentTodos.map((todo) =>
        todo.id === id ? { ...todo, status: newStatus } : todo
      );
    });
  }, []);

  const undoChange = useCallback((id: string) => {
    setTodos((currentTodos) => {
      let revertedStatus = TodoStatus.OPEN;
      setPopupItems((currentPopups) => {
        revertedStatus = currentPopups.find(
          (popup) => popup.id === id
        )!.prevStatus!;
        return currentPopups.filter((popup) => popup.id !== id);
      });
      return currentTodos.map((todo) =>
        todo.id === id ? { ...todo, status: revertedStatus } : todo
      );
    });
  }, []);

  // NEEDS REWORK (BUGGY!)
  const syncOnTimeout = useCallback(
    (id: string) => {
      if (online) {
        todoService
          .putTodo(todos.find((item) => item.id === id)!)
          .then(() =>
            setPopupItems((prev) => prev.filter((item) => item.id !== id))
          )
          .catch((err) => console.error(`Failed to sync: ${err}`));
      } else {
        offlineStorage.upsertTodo(todos.find((todo) => todo.id === id)!);
        setPopupItems((prev) => prev.filter((item) => item.id !== id));
      }
    },
    [todos, popupItems]
  );

  const toggleAddViewVisibility = useCallback(() => {
    setAddViewVisible((prevVisibility) => !prevVisibility);
  }, []);

  const addTodo = useCallback(
    (todo: Todo) => {
      if (online) {
        todoService
          .postTodo(todo)
          .then((newTodo) => {
            setTodos((prev) => [...prev, newTodo]);
            offlineStorage.upsertTodo(newTodo);
          })
          .catch((err) => {
            console.error("Failed to add todo:", err);
            //Implement adding error to popup
          });
      } else {
        console.log(`Created Todo: ${todo}`);
        offlineStorage.upsertTodo(todo);
        setTodos([...todos, todo]);
      }
      toggleAddViewVisibility();
    },
    [online]
  );

  const toggleSpeechViewVisibility = useCallback(() => {
    setSpeechViewVisibility((prevVisibility) => !prevVisibility);
  }, []);

  const handleTranscribedSpeech = useCallback((transcript: string) => {
    if (transcript.length > 0) {
      console.log("Received transcript:", transcript);
      geminiService
        .fetchFromTranscript(transcript)
        .then((response) => {
          console.log("Gemini response:", response.summary);
          addTodo(response);
        })
        .catch((err) => {
          console.error("Error fetching from Gemini:", err);
        })
        .finally(toggleSpeechViewVisibility);
    } else {
      console.log("No transcript received.");
      toggleSpeechViewVisibility();
    }
  }, []);

  const SingleRoute = useCallback(
    () => (
      <SinglePage
        data={todos.filter(
          (item) =>
            item.type === TodoType.CHECK && item.status === TodoStatus.OPEN
        )}
        onCheck={(id: string) => changeTodo(id, TodoStatus.DONE)}
      />
    ),
    [todos]
  );

  const DoneRoute = useCallback(
    () => (
      <DonePage
        data={todos.filter(
          (item) =>
            item.type === TodoType.CHECK && item.status === TodoStatus.DONE
        )}
        onUncheck={(id: string) => changeTodo(id, TodoStatus.OPEN)}
        onDelete={(id: string) => changeTodo(id, TodoStatus.DELETED)}
      />
    ),
    [todos]
  );

  const SafeView = Platform.OS === "web" ? View : SafeAreaView;
  return (
    <SafeView style={styles.root} testID="Root">
      <AddView
        isVisible={addViewVisible}
        onAdd={addTodo}
        onClose={toggleAddViewVisibility}
      />
      <SpeechView
        isVisible={speechViewVisibility}
        setIsVisible={setSpeechViewVisibility}
        onStopRecognizing={handleTranscribedSpeech}
      />
      <TabView
        testID="TabView"
        navigationState={{ index: navIndex, routes }}
        renderScene={SceneMap({
          single: SingleRoute,
          done: DoneRoute
        })}
        onIndexChange={setNavIndex}
        initialLayout={{ width: layout.width }}
        tabBarPosition="bottom"
        commonOptions={{ labelStyle: { fontSize: 20 } }} //??? https://stackoverflow.com/a/79518059
        renderTabBar={(props) => (
          <TabBar
            {...props}
            style={styles.tabBar}
            indicatorStyle={{
              top: 0,
              height: "100%",
              backgroundColor: colors.primaryDark
            }}
            activeColor={colors.secondaryLight}
          />
        )}
      />
      <View style={styles.floatingPressableView}>
        <FloatingPressable
          onPress={toggleAddViewVisibility}
          style={styles.roundPressableButton}
          iconName={"add"}
        />
        <FloatingPressable
          onPress={toggleSpeechViewVisibility}
          style={styles.roundPressableButton}
          iconName={"mic"}
        />
      </View>
      <InfoPopup
        data={popupItems}
        onUndo={undoChange}
        onTimeout={syncOnTimeout}
      />
    </SafeView>
  );
};
