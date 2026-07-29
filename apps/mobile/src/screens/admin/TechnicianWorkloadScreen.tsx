import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  Pressable,
  Image,
  Animated,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { api } from "../../api/client";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function TechnicianWorkloadScreen() {
  const [workload, setWorkload] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const requestId = route.params?.requestId;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadWorkload();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
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

              navigation.navigate({
                name: "Admin",
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

  const getLoadBgColor = (jobs: number) => {
    if (jobs === 0) return "rgba(16, 185, 129, 0.15)";
    if (jobs <= 2) return "rgba(245, 158, 11, 0.15)";
    return "rgba(239, 68, 68, 0.15)";
  };

  const getLoadBorderColor = (jobs: number) => {
    if (jobs === 0) return "rgba(16, 185, 129, 0.3)";
    if (jobs <= 2) return "rgba(245, 158, 11, 0.3)";
    return "rgba(239, 68, 68, 0.3)";
  };

  const getLoadLabel = (jobs: number) => {
    if (jobs === 0) return "Available";
    if (jobs <= 2) return "Moderate Load";
    return "Busy";
  };

  const getLoadIcon = (jobs: number) => {
    if (jobs === 0) return "checkmark-circle-outline";
    if (jobs <= 2) return "time-outline";
    return "alert-circle-outline";
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <View style={styles.bgAccent} />
        <View style={styles.bgAccent2} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading workload data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Background Accents */}
      <View style={styles.bgAccent} />
      <View style={styles.bgAccent2} />

      <FlatList
        style={styles.scroll}
        contentContainerStyle={styles.container}
        data={workload}
        keyExtractor={(item: any) => item.technicianId}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <Animated.View
            style={[
              styles.header,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.headerTag}>WORKLOAD</Text>
            <Text style={styles.title}>Technician Workload</Text>
            <Text style={styles.subtitle}>
              Tap a technician to assign this job
            </Text>

            {/* Stats Summary */}
            <View style={styles.statsBar}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{workload.length}</Text>
                <Text style={styles.statLabel}>Technicians</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {workload.filter((w) => w.activeJobs === 0).length}
                </Text>
                <Text style={styles.statLabel}>Available</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {workload.reduce((sum, w) => sum + w.activeJobs, 0)}
                </Text>
                <Text style={styles.statLabel}>Total Jobs</Text>
              </View>
            </View>
          </Animated.View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="analytics-outline" size={40} color="#64748b" />
            </View>
            <Text style={styles.emptyTitle}>No Workload Data</Text>
            <Text style={styles.emptySubtitle}>
              Assignments will appear here once technicians are assigned
            </Text>
          </View>
        )}
        renderItem={({ item, index }: any) => {
          const color = getLoadColor(item.activeJobs);
          const bgColor = getLoadBgColor(item.activeJobs);
          const borderColor = getLoadBorderColor(item.activeJobs);
          const label = getLoadLabel(item.activeJobs);
          const loadIcon = getLoadIcon(item.activeJobs);
          const avatarUrl = item.profileImage
            ? `${api.defaults.baseURL}/uploads/users/${item.profileImage}`
            : null;

          return (
            <Animated.View
              style={[
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => assignTechnician(item.technicianId)}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardLeft}>
                    {avatarUrl ? (
                      <Image
                        source={{ uri: avatarUrl }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarInitial}>
                          {item.technicianName?.charAt(0)?.toUpperCase() || "?"}
                        </Text>
                      </View>
                    )}

                    <View style={styles.userInfo}>
                      <Text style={styles.name} numberOfLines={1}>
                        {item.technicianName}
                      </Text>
                      <View style={styles.metaRow}>
                        <Ionicons
                          name={loadIcon as any}
                          size={12}
                          color={color}
                        />
                        <Text style={[styles.meta, { color }]}>{label}</Text>
                      </View>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: bgColor, borderColor },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color }]}>
                      {item.activeJobs}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressSection}>
                  <View style={styles.progressLabels}>
                    <Text style={styles.progressLabel}>Workload</Text>
                    <Text style={[styles.progressValue, { color }]}>
                      {Math.min(item.activeJobs * 30, 100)}%
                    </Text>
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
                </View>

                {/* Equipment Tags if any */}
                {item.equipment && item.equipment.length > 0 && (
                  <View style={styles.equipmentSection}>
                    <Text style={styles.equipmentLabel}>
                      Assigned Equipment
                    </Text>
                    <View style={styles.equipmentTags}>
                      {item.equipment
                        .slice(0, 3)
                        .map((eq: any, idx: number) => (
                          <View key={idx} style={styles.equipmentTag}>
                            <Text style={styles.equipmentTagText}>
                              {eq.name}
                            </Text>
                          </View>
                        ))}
                      {item.equipment.length > 3 && (
                        <View style={styles.equipmentTagMore}>
                          <Text style={styles.equipmentTagMoreText}>
                            +{item.equipment.length - 3}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <Text style={styles.assignText}>Tap to Assign</Text>
                  <Ionicons name="arrow-forward" size={16} color="#6366f1" />
                </View>
              </Pressable>
            </Animated.View>
          );
        }}
      />
    </View>
  );
}

// Add missing import
const ActivityIndicator = ({ size, color }: { size?: any; color?: string }) => (
  <Ionicons
    name="reload"
    size={28}
    color={color || "#6366f1"}
    style={{ transform: [{ rotate: "0deg" }] }}
  />
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#030712",
  },

  bgAccent: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#4f46e5",
    opacity: 0.12,
  },

  bgAccent2: {
    position: "absolute",
    bottom: -60,
    left: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#7c3aed",
    opacity: 0.1,
  },

  scroll: {
    flex: 1,
  },

  container: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#64748b",
    marginTop: 16,
    fontSize: 14,
    fontWeight: "500",
  },

  /* HEADER */
  header: {
    marginBottom: 24,
  },

  headerTag: {
    color: "#6366f1",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  title: {
    color: "#f8fafc",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 6,
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 20,
    maxWidth: "80%",
  },

  /* STATS BAR */
  statsBar: {
    flexDirection: "row",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statValue: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 2,
  },

  statLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  statDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },

  /* CARDS */
  card: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 6,
  },

  cardPressed: {
    transform: [{ scale: 0.98 }],
    borderColor: "rgba(99, 102, 241, 0.2)",
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    marginRight: 14,
    borderWidth: 2,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },

  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(79, 70, 229, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 2,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },

  avatarInitial: {
    color: "#818cf8",
    fontSize: 20,
    fontWeight: "700",
  },

  userInfo: {
    flex: 1,
  },

  name: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  meta: {
    fontSize: 12,
    fontWeight: "600",
  },

  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 44,
    alignItems: "center",
  },

  badgeText: {
    fontSize: 16,
    fontWeight: "800",
  },

  /* PROGRESS */
  progressSection: {
    marginTop: 16,
  },

  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  progressLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  progressValue: {
    fontSize: 13,
    fontWeight: "700",
  },

  progressBar: {
    height: 6,
    backgroundColor: "rgba(2, 6, 23, 0.5)",
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.04)",
  },

  progressFill: {
    height: "100%",
    borderRadius: 6,
  },

  /* EQUIPMENT TAGS */
  equipmentSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },

  equipmentLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  equipmentTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  equipmentTag: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
  },

  equipmentTagText: {
    color: "#818cf8",
    fontSize: 12,
    fontWeight: "600",
  },

  equipmentTagMore: {
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
  },

  equipmentTagMoreText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
  },

  /* CARD FOOTER */
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
    gap: 6,
  },

  assignText: {
    color: "#818cf8",
    fontSize: 14,
    fontWeight: "700",
  },

  /* EMPTY STATE */
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 24,
  },

  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  emptyTitle: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },

  emptySubtitle: {
    color: "#64748b",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: "80%",
  },
});
