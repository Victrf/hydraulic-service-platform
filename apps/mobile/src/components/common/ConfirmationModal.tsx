import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppModal from "./AppModal";

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmationModal({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "#7c3aed",
  icon = "help-circle",
  onCancel,
  onConfirm,
}: ConfirmationModalProps) {
  return (
    <AppModal visible={visible}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={70} color={confirmColor} />
      </View>

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.message}>{message}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>{cancelText}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: confirmColor }]}
          onPress={onConfirm}
        >
          <Text style={styles.confirmText}>{confirmText}</Text>
        </TouchableOpacity>
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "700",
    textAlign: "center",
  },

  message: {
    color: "#94a3b8",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
    marginTop: 14,
    marginBottom: 28,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cancelButton: {
    flex: 1,
    backgroundColor: "#1f2937",
    paddingVertical: 15,
    borderRadius: 14,
    marginRight: 10,
    alignItems: "center",
  },

  confirmButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    marginLeft: 10,
    alignItems: "center",
  },

  cancelText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  confirmText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
