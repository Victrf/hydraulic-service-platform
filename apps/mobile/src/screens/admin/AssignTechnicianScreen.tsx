import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  Image,
  ImageBackground,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function AssignTechnicianScreen({ route }: any) {
  const { requestId } = route.params;
  const navigation = useNavigation<any>();

  const [techs, setTechs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    loadTechs();
  }, []);

  const loadTechs = async () => {
    try {
      const res = await api.get("/users");
      const users = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const technicians = users.filter((u: any) => u.role === "technician");
      setTechs(technicians);
    } catch (err: any) {
      console.log("LOAD TECH ERROR:", err?.response?.data || err.message);
      Alert.alert("Error", "Failed to load technicians");
      setTechs([]);
    } finally {
      setPageLoading(false);
    }
  };

  const assign = async (techId: string) => {
    try {
      setLoading(true);
      await api.post("/assignments", {
        serviceRequestId: requestId,
        technicianId: techId,
      });
      Alert.alert("Success", "Technician assigned");
      navigation.goBack();
    } catch (err: any) {
      console.log("ASSIGN ERROR:", err?.response?.data || err.message);
      Alert.alert(
        "Assignment failed",
        err?.response?.data?.message ||
          "You must be admin or assignment already exists",
      );
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80",
      }}
      style={styles.bgImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <View style={styles.screen}>
        {/* HEADER BAR */}
        <View style={styles.headerBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Assign Technician</Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          data={techs}
          keyExtractor={(item: any) => item.id}
          ListHeaderComponent={() => (
            <View style={styles.heroSection}>
              <View style={styles.heroIcon}>
                <Ionicons name="people" size={28} color="#a78bfa" />
              </View>
              <Text style={styles.heroTitle}>Select Technician</Text>
              <Text style={styles.heroSubtitle}>
                Choose a qualified technician to handle this service request
              </Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="people-outline" size={40} color="#64748b" />
              </View>
              <Text style={styles.emptyTitle}>No Technicians Available</Text>
              <Text style={styles.emptySubtitle}>
                Add technicians to your team to assign them to service requests
              </Text>
            </View>
          )}
          renderItem={({ item }: any) => {
            const avatarUrl = item.profileImage
              ? `${api.defaults.baseURL}/uploads/users/${item.profileImage}`
              : null;

            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarFallback]}>
                      <Text style={styles.avatarInitial}>
                        {item.name?.charAt(0)?.toUpperCase() || "?"}
                      </Text>
                    </View>
                  )}

                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <View style={styles.metaRow}>
                      <Ionicons name="mail-outline" size={12} color="#94a3b8" />
                      <Text style={styles.meta}>
                        {item.email || "No email"}
                      </Text>
                    </View>
                    {item.phone && (
                      <View style={styles.metaRow}>
                        <Ionicons
                          name="call-outline"
                          size={12}
                          color="#94a3b8"
                        />
                        <Text style={styles.meta}>{item.phone}</Text>
                      </View>
                    )}
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      item.isAvailable !== false && styles.statusBadgeActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        item.isAvailable !== false && {
                          backgroundColor: "#22c55e",
                        },
                      ]}
                    />
                    <Text style={styles.statusText}>
                      {item.isAvailable !== false ? "Available" : "Busy"}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.cardBottom}>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {item.completedJobs || 0}
                      </Text>
                      <Text style={styles.statLabel}>Completed</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {item.activeJobs || 0}
                      </Text>
                      <Text style={styles.statLabel}>Active</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {item.rating ? item.rating.toFixed(1) : "-"}
                      </Text>
                      <Text style={styles.statLabel}>Rating</Text>
                    </View>
                  </View>

                  <Pressable
                    style={[styles.assignBtn, loading && { opacity: 0.6 }]}
                    onPress={() => assign(item.id)}
                    disabled={loading}
                  >
                    <Ionicons name="person-add" size={18} color="#fff" />
                    <Text style={styles.assignText}>
                      {loading ? "Assigning..." : "Assign to Request"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  /* BACKGROUND */
  bgImage: {
    flex: 1,
    width: "100%",
    height: SCREEN_HEIGHT,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 6, 23, 0.9)",
  },

  /* SCREEN */
  screen: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },

  /* HEADER BAR */
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.5)",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  /* HERO */
  heroSection: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(124, 58, 237, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  heroSubtitle: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },

  /* CARDS */
  card: {
    backgroundColor: "rgba(17, 24, 39, 0.55)",
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.4)",
    overflow: "hidden",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#1e293b",
    borderWidth: 2,
    borderColor: "rgba(51, 65, 85, 0.5)",
  },
  avatarFallback: {
    backgroundColor: "#7c3aed",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  name: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  meta: {
    color: "#94a3b8",
    fontSize: 13,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },
  statusBadgeActive: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ef4444",
  },
  statusText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
  },

  /* CARD DIVIDER */
  cardDivider: {
    height: 1,
    backgroundColor: "rgba(30, 41, 59, 0.4)",
  },

  /* CARD BOTTOM */
  cardBottom: {
    padding: 18,
    gap: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  statLabel: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(30, 41, 59, 0.4)",
  },

  /* ASSIGN BUTTON */
  assignBtn: {
    backgroundColor: "#7c3aed",
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  assignText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  /* EMPTY STATE */
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "rgba(17, 24, 39, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
});
