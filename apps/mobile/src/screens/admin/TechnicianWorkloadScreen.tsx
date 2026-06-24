import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  Pressable,
} from "react-native";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function TechnicianWorkloadScreen() {
  const [workload, setWorkload] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const requestId = route.params?.requestId;

  useEffect(() => {
    loadWorkload();
  }, []);

  const loadWorkload = async () => {
    try {
      setLoading(true);

      const res = await api.get("/assignments/workload");
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];

      setWorkload(data);
    } catch (err: any) {
      console.log("WORKLOAD ERROR:", err?.response?.data || err.message);
      Alert.alert("Error", "Failed to load workload data");
      setWorkload([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED: SUCCESS FEEDBACK FLOW
  const assignTechnician = async (technicianId: string) => {
    if (!requestId) {
      Alert.alert("Error", "No request selected");
      return;
    }

    Alert.alert(
      "Confirm Assignment",
      "Assign this technician to the request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await api.post("/assignments", {
                technicianId,
                serviceRequestId: requestId,
              });

              // ✅ PASS DATA BACK (no blind goBack)
              navigation.navigate({
                name: "Admin", // ⚠️ change if your route name differs
                params: {
                  refresh: true,
                  assignedRequestId: requestId,
                  assignedTechnicianId: technicianId,
                },
                merge: true,
              });

              Alert.alert("Success", "Technician assigned");
            } catch (err: any) {
              const errorData = err?.response?.data;

              let message = errorData?.message || "Assignment failed";
              if (Array.isArray(message)) message = message[0];

              const code = errorData?.code;

              console.log("ASSIGN ERROR:", code, message);

              if (code === "ALREADY_ASSIGNED") {
                Alert.alert(
                  "Already Assigned",
                  "This request already has a technician. Reassign instead?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Reassign",
                      onPress: async () => {
                        try {
                          await api.post("/assignments/reassign", {
                            technicianId,
                            serviceRequestId: requestId,
                          });

                          // ✅ SAME SUCCESS FLOW FOR REASSIGN
                          navigation.navigate({
                            name: "Admin",
                            params: {
                              refresh: true,
                              assignedRequestId: requestId,
                              assignedTechnicianId: technicianId,
                            },
                            merge: true,
                          });

                          Alert.alert("Success", "Reassigned successfully");
                        } catch (e: any) {
                          const reErr = e?.response?.data;

                          let msg = reErr?.message || "Reassignment failed";
                          if (Array.isArray(msg)) msg = msg[0];

                          console.log("REASSIGN ERROR:", reErr?.code, msg);

                          Alert.alert("Error", msg);
                        }
                      },
                    },
                  ],
                );
              } else {
                Alert.alert("Error", message);
              }
            }
          },
        },
      ],
    );
  };

  const getLoadColor = (jobs: number) => {
    if (jobs === 0) return "#10b981";
    if (jobs <= 2) return "#f59e0b";
    return "#ef4444";
  };

  const getLoadLabel = (jobs: number) => {
    if (jobs === 0) return "Available";
    if (jobs <= 2) return "Moderate Load";
    return "Busy";
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Ionicons name="analytics-outline" size={28} color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={{ padding: 16, paddingTop: 40 }}
        data={workload}
        keyExtractor={(item: any) => item.technicianId}
        ListHeaderComponent={() => (
          <>
            <Text style={styles.title}>Technician Workload</Text>
            <Text style={styles.subtitle}>
              Tap a technician to assign this job
            </Text>
          </>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="analytics-outline" size={50} color="#374151" />
            <Text style={styles.emptyTitle}>No Workload Data</Text>
            <Text style={styles.emptySubtitle}>
              Assignments will appear here once technicians are assigned
            </Text>
          </View>
        )}
        renderItem={({ item }: any) => {
          const color = getLoadColor(item.activeJobs);
          const label = getLoadLabel(item.activeJobs);

          return (
            <Pressable
              style={styles.card}
              onPress={() => assignTechnician(item.technicianId)}
            >
              <View style={styles.row}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={18} color="#fff" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.technicianName}</Text>
                  <Text style={styles.meta}>{label}</Text>
                </View>

                <View style={[styles.badge, { backgroundColor: color }]}>
                  <Text style={styles.badgeText}>{item.activeJobs}</Text>
                </View>
              </View>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(item.activeJobs * 30, 100)}%`,
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
            </Pressable>
          );
        }}
      />
    </View>
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
    marginTop: 4,
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#7c3aed",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  name: {
    color: "#fff",
    fontWeight: "600",
  },

  meta: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  badgeText: {
    color: "#fff",
    fontWeight: "600",
  },

  progressBar: {
    height: 6,
    backgroundColor: "#1f2937",
    borderRadius: 6,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
  },

  emptyState: {
    marginTop: 80,
    alignItems: "center",
  },

  emptyTitle: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
  },

  emptySubtitle: {
    color: "#9ca3af",
    marginTop: 4,
    textAlign: "center",
  },
});
