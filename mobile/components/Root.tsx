import { Todo, TodoStatus, TodoType } from "../types/todo";
import { Platform, useWindowDimensions, View } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import React, { useState } from "react";
import { SinglePage } from "./SinglePage";
import { styles, colors } from "../styles/styles";
import { FloatingPressable } from "./FloatingPressable";
import { AddView } from "./AddView";
import { DonePage } from "./DonePage";
import { InfoPopup, PopupItem } from "./InfoPopup";
import { todoService } from "../services/todoService";
import { SafeAreaView } from "react-native-safe-area-context";
import { geminiService } from "../services/geminiService";
import { v4 as uuid } from "uuid";
import { OfflineStorage } from "../offline_storage/OfflineStorage";
import { VoiceView } from "./VoiceView";

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
  const [isRecognizingSpeech, setIsRecognizingSpeech] = useState(false);

  const layout = useWindowDimensions();

  const handleTranscribedSpeech = (transcript: string) => {
    if (transcript.length > 0) {
      console.log("received transcript:", transcript);
      geminiService
        .fetchFromTranscript(transcript)
        .then((responseText) => {
          console.log("gemini response:", responseText);
          addTodo(responseText, TodoType.SINGLE);
        })
        .catch((err) => {
          console.error("Error fetching from Gemini:", err);
        });
    } else {
      console.log("No transcript received.");
    }
  };

  const changeTodo = (id: string, newStatus: TodoStatus) => {
    const todo = todos.find((item) => item.id === id)!;
    setPopupItems([
      ...popupItems,
      {
        id: todo.id,
        text: todo.summary,
        prevStatus: todo.status,
        currentStatus: newStatus
      }
    ]);
    setTodos(
      todos.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
    offlineStorage.upsertTodo({
      ...todo,
      status: newStatus
    });
  };

  const undoChange = (id: string) => {
    const revertedTodo: Todo = {
      ...todos.find((item) => item.id === id)!,
      status: popupItems.find((item) => item.id === id)!.prevStatus!
    };
    setTodos((items) =>
      items.map((todo) => (todo.id === id ? revertedTodo : todo))
    );
    setPopupItems((changed) => changed.filter((todo) => todo.id !== id));
    offlineStorage.upsertTodo(revertedTodo);
  };

  // NEEDS REWORK (BUGGY!)
  const syncOnTimeout = (id: string) => {
    online &&
      todoService
        .putTodo(todos.find((item) => item.id === id)!)
        .then(() =>
          setPopupItems((prev) => prev.filter((item) => item.id !== id))
        )
        .catch((err) => console.error(`Failed to sync: ${err}`));
  };

  const addTodo = (text: string, type: TodoType) => {
    const todo: Todo = {
      id: uuid(),
      summary: text,
      status: TodoStatus.OPEN,
      creationDate: new Date(),
      type: type
    };

    if (online) {
      todoService
        .postTodo(todo)
        .then((newTodo) => {
          setTodos([...todos, newTodo]);
          offlineStorage.upsertTodo(newTodo);
        })
        .catch((err) => {
          console.error("Failed to add todo:", err);
          //Implement adding error to popup
        });
    } else {
      console.log(todo);
      offlineStorage.upsertTodo(todo);
      setTodos([...todos, todo]);
    }
    setAddViewVisible(false);
  };

  const SingleRoute = () => (
    <SinglePage
      data={todos.filter(
        (item) =>
          item.type === TodoType.SINGLE && item.status === TodoStatus.OPEN
      )}
      onCheck={(id: string) => changeTodo(id, TodoStatus.DONE)}
    />
  );

  const DoneRoute = () => (
    <DonePage
      data={todos.filter(
        (item) =>
          item.type === TodoType.SINGLE && item.status === TodoStatus.DONE
      )}
      onUncheck={(id: string) => changeTodo(id, TodoStatus.OPEN)}
      onDelete={(id: string) => changeTodo(id, TodoStatus.DELETED)}
    />
  );

  const SafeView = Platform.OS === "web" ? View : SafeAreaView;
  return (
    <SafeView style={styles.root} testID="Root">
      <AddView
        isVisible={addViewVisible}
        onAdd={(text: string, type: TodoType) => addTodo(text, type)}
        onClose={() => setAddViewVisible(false)}
      />
      <VoiceView
        isRecognizing={isRecognizingSpeech}
        setIsRecognizing={setIsRecognizingSpeech}
        onClose={handleTranscribedSpeech}
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
          onPress={() => setAddViewVisible(true)}
          style={styles.roundPressableButton}
          iconName={"add"}
        />
        <FloatingPressable
          onPress={() => setIsRecognizingSpeech(true)}
          style={styles.roundPressableButton}
          iconName={"mic"}
        />
      </View>
      <InfoPopup
        data={popupItems}
        onUndo={(id: string) => undoChange(id)}
        onTimeout={(id: string) => syncOnTimeout(id)}
      />
    </SafeView>
  );
};
