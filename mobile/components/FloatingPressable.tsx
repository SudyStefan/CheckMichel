import React from "react";
import { Dimensions, Pressable, StyleProp, ViewStyle } from "react-native";
import { colors } from "../styles/styles";
import Ionicons from "@expo/vector-icons/Ionicons";

export type FloatingPressableProp = {
  onPress: () => void;
  style: StyleProp<ViewStyle>;
  iconName: keyof typeof Ionicons.glyphMap;
};

export const FloatingPressable = ({
  onPress,
  style,
  iconName
}: FloatingPressableProp) => {
  return (
    <Pressable onPress={() => onPress()} style={style}>
      <Ionicons
        name={iconName}
        size={Dimensions.get("window").height * 0.05}
        color={colors.primaryLight}
      />
    </Pressable>
  );
};
