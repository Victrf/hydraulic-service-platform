import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppModal from "./AppModal";

interface Option {
  id: string;
  name: string;
}

interface AppMultiSelectProps {
  label: string;
  placeholder?: string;
  values: string[];
  options: Option[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
}

export default function AppMultiSelect({
  label,
  placeholder = "Select...",
  values,
  options,
  onChange,
  disabled = false,
}: AppMultiSelectProps) {
  const [visible, setVisible] = useState(false);

  const selectedText = useMemo(() => {
    if (values.length === 0) return placeholder;

    const names = options
      .filter((o) => values.includes(o.id))
      .map((o) => o.name);

    if (names.length <= 2) {
      return names.join(", ");
    }

    return `${names.length} equipment selected`;
  }, [values, options, placeholder]);

  const toggle = (id: string) => {
    if (values.includes(id)) {
      onChange(values.filter((v) => v !== id));
    } else {
      onChange([...values, id]);
    }
  };

  return (
    <>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        disabled={disabled}
        style={[styles.select, disabled && styles.disabled]}
        onPress={() => setVisible(true)}
      >
        <Text
          numberOfLines={1}
          style={[styles.value, values.length === 0 && styles.placeholder]}
        >
          {disabled ? "Select Company First" : selectedText}
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

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {options.length === 0 ? (
            <Text style={styles.empty}>No equipment available</Text>
          ) : (
            options.map((item) => {
              const active = values.includes(item.id);

              return (
                <Pressable
                  key={item.id}
                  onPress={() => toggle(item.id)}
                  style={[styles.option, active && styles.optionActive]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      active && styles.optionTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>

                  <Ionicons
                    name={active ? "checkbox" : "square-outline"}
                    size={24}
                    color={active ? "#8b5cf6" : "#6b7280"}
                  />
                </Pressable>
              );
            })
          )}
        </ScrollView>

        <Pressable style={styles.doneButton} onPress={() => setVisible(false)}>
          <Text style={styles.doneText}>Done</Text>
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
  },

  disabled: {
    opacity: 0.55,
  },

  value: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
    marginRight: 12,
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

  list: {
    maxHeight: 350,
  },

  option: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  optionActive: {
    backgroundColor: "rgba(139,92,246,0.12)",
    borderColor: "#8b5cf6",
  },

  optionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },

  optionTextActive: {
    color: "#a78bfa",
  },

  empty: {
    color: "#6b7280",
    textAlign: "center",
    marginVertical: 20,
  },

  doneButton: {
    marginTop: 18,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#7c3aed",
    justifyContent: "center",
    alignItems: "center",
  },

  doneText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
