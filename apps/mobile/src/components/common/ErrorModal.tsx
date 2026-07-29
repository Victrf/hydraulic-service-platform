import React, { useEffect, useRef } from "react";
import { Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AppModal from "./AppModal";

interface ErrorModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
}

export default function ErrorModal({
  visible,
  title,
  message,
  buttonText = "OK",
  onClose,
}: ErrorModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.6);

      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, scaleAnim]);

  return (
    <AppModal visible={visible}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Ionicons name="close-circle" size={74} color="#ef4444" />
      </Animated.View>

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.message}>{message}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={onClose}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },

  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },

  message: {
    color: "#94a3b8",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
    marginTop: 14,
    marginBottom: 30,
  },

  button: {
    backgroundColor: "#ef4444",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
