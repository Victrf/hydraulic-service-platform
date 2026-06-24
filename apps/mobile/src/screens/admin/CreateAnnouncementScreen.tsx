import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { api } from "../../api/client";
import { useNavigation } from "@react-navigation/native";

export default function CreateAnnouncementScreen() {
  const navigation = useNavigation<any>();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Validation", "All fields are required");
      return;
    }

    try {
      setLoading(true);

      await api.post("/announcements", {
        title: title.trim(),
        content: content.trim(),
      });

      Alert.alert("Success", "Announcement created");

      // ✅ reset (prevents stale data if user comes back)
      setTitle("");
      setContent("");

      navigation.goBack();

    } catch (err: any) {
      console.log("CREATE ERROR:", err?.response?.data || err.message);

      Alert.alert(
        "Create failed",
        err?.response?.data?.message ||
          "You must be admin or token is invalid"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Create Announcement</Text>
      <Text style={styles.subtitle}>Send updates to all users</Text>

      <TextInput
        placeholder="Title"
        placeholderTextColor="#6b7280"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        placeholder="Content"
        placeholderTextColor="#6b7280"
        style={[styles.input, { height: 120 }]}
        multiline
        value={content}
        onChangeText={setContent}
      />

      <Pressable
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleCreate}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Creating..." : "Create Announcement"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  subtitle: {
    color: "#9ca3af",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  button: {
    backgroundColor: "#7c3aed",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
