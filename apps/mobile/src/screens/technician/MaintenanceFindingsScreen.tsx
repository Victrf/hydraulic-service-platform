import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { api } from "../../api/client";

export default function MaintenanceFindingsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { visitId, status } = route.params;

  const readOnly = status === "completed";

  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadFindings();
    }, []),
  );

  async function loadFindings() {
    try {
      setLoading(true);

      const res = await api.get(`/maintenance-findings/visit/${visitId}`);

      setFindings(res.data);
    } catch (err: any) {
      console.log(err.response?.data || err.message);
      Alert.alert("Error", "Failed to load findings.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteFinding(id: string) {
    Alert.alert(
      "Delete Finding",
      "Are you sure you want to delete this finding?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/maintenance-findings/${id}`);
              loadFindings();
            } catch (err: any) {
              Alert.alert(
                "Error",
                err.response?.data?.message || "Failed to delete finding.",
              );
            }
          },
        },
      ],
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inspection Findings</Text>

        {!readOnly && (
          <Pressable
            onPress={() =>
              navigation.navigate("CreateMaintenanceFinding", {
                visitId,
              })
            }
          >
            <Ionicons name="add-circle" size={34} color="#8b5cf6" />
          </Pressable>
        )}
      </View>

      <FlatList
        data={findings}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="clipboard-outline" size={70} color="#475569" />

            <Text style={styles.emptyTitle}>No Findings Yet</Text>

            <Text style={styles.emptyText}>
              Tap the + button to create your first inspection finding.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.label}>Problem</Text>
            <Text style={styles.value}>{item.problem}</Text>

            {!!item.cause && (
              <>
                <Text style={styles.label}>Cause</Text>
                <Text style={styles.value}>{item.cause}</Text>
              </>
            )}

            {!!item.condition && (
              <>
                <Text style={styles.label}>Condition</Text>
                <Text style={styles.value}>{item.condition}</Text>
              </>
            )}

            {!!item.recommendation && (
              <>
                <Text style={styles.label}>Recommendation</Text>
                <Text style={styles.value}>{item.recommendation}</Text>
              </>
            )}

            {!!item.notes && (
              <>
                <Text style={styles.label}>Notes</Text>
                <Text style={styles.value}>{item.notes}</Text>
              </>
            )}

            <Text style={styles.label}>Photos</Text>

            <Text style={styles.value}>
              {item.photos?.length || 0} Photo(s)
            </Text>
            {!readOnly && (
              <View style={styles.actions}>
                <Pressable
                  style={styles.editButton}
                  onPress={() =>
                    navigation.navigate("EditMaintenanceFinding", {
                      findingId: item.id,
                    })
                  }
                >
                  <Ionicons name="create-outline" size={18} color="#fff" />

                  <Text style={styles.buttonText}>Edit</Text>
                </Pressable>

                <Pressable
                  style={styles.deleteButton}
                  onPress={() => deleteFinding(item.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#fff" />

                  <Text style={styles.buttonText}>Delete</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 20,
    paddingTop: 60,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },

  empty: {
    alignItems: "center",
    marginTop: 100,
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
  },

  emptyText: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 30,
  },

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  label: {
    color: "#8b5cf6",
    fontWeight: "700",
    marginTop: 12,
  },

  value: {
    color: "#fff",
    marginTop: 4,
    lineHeight: 22,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc2626",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  buttonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
  },
});
