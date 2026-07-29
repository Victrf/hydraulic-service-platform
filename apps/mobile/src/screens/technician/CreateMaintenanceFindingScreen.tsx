import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../api/client";

export default function CreateMaintenanceFindingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { visitId } = route.params;

  const [problem, setProblem] = useState("");
  const [cause, setCause] = useState("");
  const [condition, setCondition] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [attemptedSave, setAttemptedSave] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (problem || cause || condition || recommendation || notes) {
      setHasChanges(true);
    }
  }, [problem, cause, condition, recommendation, notes]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      if (!hasChanges || saving) {
        return;
      }

      e.preventDefault();

      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to leave?",
        [
          {
            text: "Continue Editing",
            style: "cancel",
          },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ],
      );
    });

    return unsubscribe;
  }, [navigation, hasChanges, saving]);

  async function saveFinding() {
    setAttemptedSave(true);

    if (!problem.trim()) {
      Alert.alert("Validation", "Problem is required.");
      return;
    }

    try {
      setSaving(true);

      await api.post(`/maintenance-findings/visit/${visitId}`, {
        problem,
        cause,
        condition,
        recommendation,
        notes,
      });

      setHasChanges(false);

      Alert.alert("Success", "Finding saved successfully.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to create finding.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>New Inspection Finding</Text>

        <Text style={styles.subtitle}>
          Record any issues identified during this maintenance visit.
        </Text>

        {/* Issue Details */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="warning-outline" size={22} color="#7c3aed" />

            <Text style={styles.cardTitle}>Issue Details</Text>
          </View>

          <Text style={styles.label}>Problem *</Text>

          <TextInput
            style={[
              styles.input,
              attemptedSave && !problem.trim() && styles.inputError,
            ]}
            editable={!saving}
            value={problem}
            onChangeText={setProblem}
            placeholder="Describe the issue found..."
            placeholderTextColor="#64748b"
            multiline
          />

          <Text style={styles.label}>Possible Cause</Text>

          <TextInput
            style={styles.input}
            editable={!saving}
            value={cause}
            onChangeText={setCause}
            placeholder="Possible root cause..."
            placeholderTextColor="#64748b"
            multiline
          />
        </View>

        {/* Equipment Condition */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="construct-outline" size={22} color="#7c3aed" />

            <Text style={styles.cardTitle}>Equipment Condition</Text>
          </View>

          <Text style={styles.label}>Condition</Text>

          <TextInput
            style={styles.input}
            editable={!saving}
            value={condition}
            onChangeText={setCondition}
            placeholder="Current condition of the equipment..."
            placeholderTextColor="#64748b"
            multiline
          />
        </View>

        {/* Recommendation */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="clipboard-outline" size={22} color="#7c3aed" />

            <Text style={styles.cardTitle}>Recommendation</Text>
          </View>

          <Text style={styles.label}>Recommended Action</Text>

          <TextInput
            style={styles.input}
            editable={!saving}
            value={recommendation}
            onChangeText={setRecommendation}
            placeholder="Recommended repair or maintenance..."
            placeholderTextColor="#64748b"
            multiline
          />
        </View>

        {/* Notes */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={22} color="#7c3aed" />

            <Text style={styles.cardTitle}>Additional Notes</Text>
          </View>

          <TextInput
            style={[styles.input, styles.notes]}
            editable={!saving}
            multiline
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional observations, measurements or comments..."
            placeholderTextColor="#64748b"
            textAlignVertical="top"
          />
        </View>

        {/* Buttons */}

        <Pressable
          style={styles.saveButton}
          disabled={saving}
          onPress={saveFinding}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#fff" />

              <Text style={styles.buttonText}>Save Finding</Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={styles.cancelButton}
          disabled={saving}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "700",
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 28,
  },

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },

  label: {
    color: "#8b5cf6",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    backgroundColor: "#020617",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: 15,
    color: "#fff",
    fontSize: 15,
    minHeight: 54,
  },

  inputError: {
    borderColor: "#ef4444",
  },

  notes: {
    minHeight: 140,
    textAlignVertical: "top",
  },

  saveButton: {
    backgroundColor: "#7c3aed",
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 10,
  },

  cancelButton: {
    marginTop: 14,
    marginBottom: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  cancelText: {
    color: "#cbd5e1",
    fontSize: 16,
    fontWeight: "700",
  },
});
