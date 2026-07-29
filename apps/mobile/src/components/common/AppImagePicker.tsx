import React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

interface AppImagePickerProps {
  label?: string;
  image: string | null;
  onChange: (uri: string | null) => void;
  shape?: "circle" | "square";
}

export default function AppImagePicker({
  label = "Image",
  image,
  onChange,
  shape = "circle",
}: AppImagePickerProps) {
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
      aspect: shape === "circle" ? [1, 1] : undefined,
    });

    if (!result.canceled) {
      onChange(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Pressable onPress={pickImage} style={styles.center}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={[
              styles.image,
              shape === "circle" ? styles.circle : styles.square,
            ]}
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              shape === "circle" ? styles.circle : styles.square,
            ]}
          >
            <Ionicons name="camera" size={34} color="#94a3b8" />
          </View>
        )}

        <Text style={styles.uploadText}>
          {image ? "Change Photo" : "Upload Photo"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 22,
  },

  label: {
    color: "#9ca3af",
    marginBottom: 16,
    fontSize: 14,
    fontWeight: "600",
  },

  center: {
    alignItems: "center",
  },

  placeholder: {
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    borderWidth: 2,
    borderColor: "#7c3aed",
  },

  circle: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },

  square: {
    width: 120,
    height: 120,
    borderRadius: 18,
  },

  uploadText: {
    color: "#a78bfa",
    marginTop: 12,
    fontWeight: "600",
    fontSize: 15,
  },
});
