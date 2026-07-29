import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { api } from "../../api/client";
import * as ImagePicker from "expo-image-picker";

export default function EditMaintenanceFindingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { findingId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [problem, setProblem] = useState("");
  const [cause, setCause] = useState("");
  const [condition, setCondition] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadFinding();
  }, []);

  async function loadFinding() {
    try {
      const res = await api.get(`/maintenance-findings/${findingId}`);

      setProblem(res.data.problem || "");
      setCause(res.data.cause || "");
      setCondition(res.data.condition || "");
      setRecommendation(res.data.recommendation || "");
      setNotes(res.data.notes || "");
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to load finding.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function pickImages() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (result.canceled) return;

    const formData = new FormData();

    result.assets.forEach((image: any) => {
      formData.append("photos", {
        uri: image.uri,
        name: image.fileName || "photo.jpg",
        type: image.mimeType || "image/jpeg",
      } as any);
    });

    await api.post(`/maintenance-findings/${findingId}/photos`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    loadFinding();
  }

  async function updateFinding() {
    if (!problem.trim()) {
      Alert.alert("Validation", "Problem is required.");
      return;
    }

    try {
      setSaving(true);

      await api.patch(`/maintenance-findings/${findingId}`, {
        problem,
        cause,
        condition,
        recommendation,
        notes,
      });

      navigation.goBack();
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to update finding.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Finding</Text>

      <Text style={styles.label}>Problem *</Text>
      <TextInput
        style={styles.input}
        value={problem}
        onChangeText={setProblem}
        placeholderTextColor="#64748b"
      />

      <Text style={styles.label}>Cause</Text>
      <TextInput
        style={styles.input}
        value={cause}
        onChangeText={setCause}
        placeholderTextColor="#64748b"
      />

      <Text style={styles.label}>Condition</Text>
      <TextInput
        style={styles.input}
        value={condition}
        onChangeText={setCondition}
        placeholderTextColor="#64748b"
      />

      <Text style={styles.label}>Recommendation</Text>
      <TextInput
        style={styles.input}
        value={recommendation}
        onChangeText={setRecommendation}
        placeholderTextColor="#64748b"
      />

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.notes]}
        multiline
        value={notes}
        onChangeText={setNotes}
        placeholderTextColor="#64748b"
      />

      <Pressable
        style={styles.button}
        onPress={() =>
          navigation.navigate("MaintenanceFindingPhotos", {
            findingId,
          })
        }
      >
        <Text style={styles.buttonText}>Manage Photos</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={updateFinding}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Update Finding</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 20,
    paddingTop: 60,
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 30,
  },

  label: {
    color: "#8b5cf6",
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 18,
  },

  input: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    color: "#fff",
    padding: 14,
  },

  notes: {
    height: 120,
    textAlignVertical: "top",
  },

  button: {
    marginTop: 40,
    backgroundColor: "#7c3aed",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 40,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
