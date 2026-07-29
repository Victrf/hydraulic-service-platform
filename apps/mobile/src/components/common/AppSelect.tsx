import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppModal from "./AppModal";

interface Option {
  id: string;
  name: string;
}

interface AppSelectProps {
  label: string;
  placeholder?: string;
  value: string;
  options: Option[];
  onSelect: (value: string) => void;
}

export default function AppSelect({
  label,
  placeholder = "Select...",
  value,
  options,
  onSelect,
}: AppSelectProps) {
  const [visible, setVisible] = useState(false);

  const selected = useMemo(
    () => options.find((o) => o.id === value),
    [options, value],
  );

  const handleSelect = (id: string) => {
    onSelect(id);
    setVisible(false);
  };

  return (
    <>
      <Text style={styles.label}>{label}</Text>

      <Pressable style={styles.select} onPress={() => setVisible(true)}>
        <Text style={[styles.value, !selected && styles.placeholder]}>
          {selected ? selected.name : placeholder}
        </Text>

        <Ionicons
          name={visible ? "chevron-up" : "chevron-down"}
          size={20}
          color="#9ca3af"
        />
      </Pressable>

      <AppModal
        visible={visible}
        onClose={() => setVisible(false)}
        closeOnBackdrop
        variant="bottom"
      >
        <Text style={styles.modalTitle}>{label}</Text>

        <ScrollView
          style={{
            maxHeight: 350,
          }}
          showsVerticalScrollIndicator={false}
        >
          {options.map((item) => {
            const active = item.id === value;

            return (
              <Pressable
                key={item.id}
                onPress={() => handleSelect(item.id)}
                style={[styles.option, active && styles.optionActive]}
              >
                <Text
                  style={[styles.optionText, active && styles.optionTextActive]}
                >
                  {item.name}
                </Text>

                {active && (
                  <Ionicons name="checkmark-circle" size={22} color="#8b5cf6" />
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable style={styles.cancel} onPress={() => setVisible(false)}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </AppModal>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    color: "#9ca3af",
    marginBottom: 8,
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
  },

  select: {
    height: 56,
    borderRadius: 14,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  value: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },

  placeholder: {
    color: "#6b7280",
  },

  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 18,
  },

  option: {
    height: 54,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  optionActive: {
    borderColor: "#8b5cf6",
    backgroundColor: "rgba(139,92,246,0.12)",
  },

  optionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },

  optionTextActive: {
    color: "#a78bfa",
  },

  cancel: {
    marginTop: 18,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1f2937",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
