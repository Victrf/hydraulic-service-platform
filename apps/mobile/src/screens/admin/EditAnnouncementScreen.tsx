import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { api } from "../../api/client";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";

export default function EditAnnouncementScreen({ route }: any) {
  const { announcement } = route.params;
  const navigation = useNavigation<any>();

  const [title, setTitle] = useState(announcement.title || "");
  const [content, setContent] = useState(announcement.content || "");
  const [loading, setLoading] = useState(false);

  const [successVisible, setSuccessVisible] = useState(false);

  const [errorVisible, setErrorVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleUpdate = async () => {
    if (!title.trim() || !content.trim()) {
      setErrorTitle("Validation Error");
      setErrorMessage("Please complete all required fields.");
      setErrorVisible(true);
      return;
    }

    try {
      setLoading(true);

      await api.patch(`/announcements/${announcement.id}`, {
        title: title.trim(),
        content: content.trim(),
      });

      setSuccessVisible(true);
    } catch (err: any) {
      console.log("UPDATE ERROR:", err?.response?.data || err.message);

      setErrorTitle("Update Failed");

      setErrorMessage(
        err?.response?.data?.message ||
          "You must be an administrator to update announcements.",
      );

      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        padding: 16,
        paddingTop: 50,
        paddingBottom: 40,
      }}
    >
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="create-outline" size={32} color="#a78bfa" />
        </View>

        <Text style={styles.title}>Edit Announcement</Text>

        <Text style={styles.subtitle}>
          Update the announcement before publishing the latest information to
          your users.
        </Text>
      </View>

      <View style={styles.field}>
        <View style={styles.labelRow}>
          <Ionicons name="create-outline" size={18} color="#a78bfa" />

          <Text style={styles.label}>Announcement Title</Text>
        </View>

        <TextInput
          placeholder="Enter announcement title..."
          placeholderTextColor="#6b7280"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        <Text style={styles.counter}>{title.length}/100 characters</Text>
      </View>

      <View style={styles.field}>
        <View style={styles.labelRow}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={18}
            color="#a78bfa"
          />

          <Text style={styles.label}>Announcement Message</Text>
        </View>

        <TextInput
          placeholder="Write your announcement here..."
          placeholderTextColor="#6b7280"
          style={[styles.input, styles.messageInput]}
          multiline
          textAlignVertical="top"
          value={content}
          onChangeText={setContent}
          maxLength={500}
        />

        <Text style={styles.counter}>{content.length}/500 characters</Text>
      </View>

      <Pressable
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleUpdate}
        disabled={loading}
      >
        <View style={styles.buttonContent}>
          <Ionicons name="save-outline" size={18} color="#fff" />

          <Text style={styles.buttonText}>
            {loading ? "Updating..." : "Save Changes"}
          </Text>
        </View>
      </Pressable>

      <SuccessModal
        visible={successVisible}
        title="Announcement Updated"
        message="Your announcement has been updated successfully."
        buttonText="Continue"
        onContinue={() => {
          setSuccessVisible(false);
          navigation.goBack();
        }}
      />

      <ErrorModal
        visible={errorVisible}
        title={errorTitle}
        message={errorMessage}
        buttonText="OK"
        onClose={() => {
          setErrorVisible(false);
          setErrorTitle("");
          setErrorMessage("");
        }}
      />
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
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
    marginBottom: 28,
  },

  hero: {
    alignItems: "center",
    marginBottom: 28,
  },

  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#1e1b4b",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#312e81",
  },

  field: {
    marginBottom: 20,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  label: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },

  input: {
    backgroundColor: "#0f172a",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#1e293b",
    fontSize: 15,
  },

  messageInput: {
    height: 180,
  },

  counter: {
    color: "#64748b",
    fontSize: 12,
    textAlign: "right",
    marginTop: 6,
  },

  button: {
    backgroundColor: "#7c3aed",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
