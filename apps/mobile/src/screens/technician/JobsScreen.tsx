import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  Animated,
  Image,
} from "react-native";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback, useRef } from "react";
import EmptyState from "../../components/common/EmptyState";
import { api } from "../../api/client";

export default function JobsScreen() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const status = route.params?.status;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useFocusEffect(
    useCallback(() => {
      loadJobs();
    }, [status]),
  );

  const loadJobs = async () => {
    try {
      setLoading(true);
      const url = status
        ? `/technicians/my-jobs?status=${status}`
        : `/technicians/my-jobs`;
      const res = await api.get(url);
      setJobs(Array.isArray(res.data) ? res.data : res.data?.data || []);
      animateIn();
    } catch (err: any) {
      console.log("JOB LOAD ERROR:", err?.response?.data || err.message);
      alert(err?.response?.data?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (jobStatus: string) => {
    switch (jobStatus) {
      case "pending":
        return {
          color: "#fbbf24",
          bg: "rgba(146, 64, 14, 0.4)",
          border: "#b45309",
          icon: "time-outline",
        };
      case "accepted":
        return {
          color: "#a78bfa",
          bg: "rgba(76, 29, 149, 0.4)",
          border: "#7c3aed",
          icon: "checkmark-circle-outline",
        };
      case "in-progress":
        return {
          color: "#60a5fa",
          bg: "rgba(30, 58, 95, 0.4)",
          border: "#3b82f6",
          icon: "construct-outline",
        };
      case "completed":
        return {
          color: "#34d399",
          bg: "rgba(6, 78, 59, 0.4)",
          border: "#10b981",
          icon: "checkmark-done-outline",
        };
      default:
        return {
          color: "#9ca3af",
          bg: "rgba(55, 65, 81, 0.4)",
          border: "#4b5563",
          icon: "help-circle-outline",
        };
    }
  };

  const getEmptyState = () => {
    switch (status) {
      case "pending":
        return {
          icon: "time-outline",
          title: "No Pending Jobs",
          message: "New jobs waiting for your acceptance will appear here.",
        };
      case "accepted":
        return {
          icon: "checkmark-done-outline",
          title: "No Accepted Jobs",
          message: "Accepted jobs that are ready to begin will appear here.",
        };
      case "in-progress":
        return {
          icon: "construct-outline",
          title: "Nothing In Progress",
          message: "Start an accepted job to begin working.",
        };
      case "completed":
        return {
          icon: "checkmark-circle-outline",
          title: "No Completed Jobs",
          message: "Completed jobs will appear here.",
        };
      default:
        return {
          icon: "briefcase-outline",
          title: "No Jobs Assigned",
          message: "Assigned jobs will appear here when available.",
        };
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ImageBackground
          source={require("../../assets/images/jobscreen.png")}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
        >
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(2,6,23,0.85)" },
            ]}
          />
        </ImageBackground>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading jobs...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../assets/images/jobscreen.png")}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
      >
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(2,6,23,0.78)" },
          ]}
        />
      </ImageBackground>

      {/* Gradient Orbs Overlay */}
      <View style={styles.bgGradient}>
        <View style={[styles.bgOrb, styles.bgOrb1]} />
        <View style={[styles.bgOrb, styles.bgOrb2]} />
      </View>

      <View style={styles.screen}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.headerLeft}>
            <View style={styles.headerIconWrap}>
              <Ionicons name="briefcase-outline" size={20} color="#a78bfa" />
            </View>
            <View>
              <Text style={styles.title}>
                {status
                  ? `${status.charAt(0).toUpperCase() + status.slice(1)} Jobs`
                  : "All Jobs"}
              </Text>
              <Text style={styles.subtitle}>
                {jobs.length} {jobs.length === 1 ? "job" : "jobs"} found
              </Text>
            </View>
          </View>
          <Pressable style={styles.refreshBtn} onPress={loadJobs}>
            <Ionicons name="refresh-outline" size={18} color="#a78bfa" />
          </Pressable>
        </Animated.View>

        <FlatList
          data={jobs}
          keyExtractor={(item: any) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 40,
            flexGrow: jobs.length === 0 ? 1 : 0,
          }}
          ListEmptyComponent={() => {
            const empty = getEmptyState();
            return (
              <Animated.View
                style={[
                  styles.emptyContainer,
                  { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
                ]}
              >
                <View style={styles.emptyCard}>
                  <View style={styles.emptyGlow} />
                  <View style={styles.emptyIconWrap}>
                    <Ionicons
                      name={empty.icon as any}
                      size={36}
                      color="#8b5cf6"
                    />
                  </View>
                  <Text style={styles.emptyTitle}>{empty.title}</Text>
                  <Text style={styles.emptyText}>{empty.message}</Text>
                </View>
              </Animated.View>
            );
          }}
          renderItem={({ item, index }: any) => {
            const s = getStatusConfig(item.status);
            const isLast = index === jobs.length - 1;

            return (
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                }}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.card,
                    pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                    isLast && { marginBottom: 0 },
                  ]}
                  onPress={() =>
                    navigation.navigate("JobDetails", { requestId: item.id })
                  }
                >
                  <View
                    style={[styles.accentBar, { backgroundColor: s.border }]}
                  />

                  <View style={styles.cardHeader}>
                    <Text style={styles.desc} numberOfLines={2}>
                      {item.description}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: s.bg, borderColor: s.border },
                      ]}
                    >
                      <Ionicons
                        name={s.icon as any}
                        size={12}
                        color={s.color}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.statusText, { color: s.color }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                      <View style={styles.companyRow}>
                        {item.company?.logoUrl ? (
                          <Image
                            source={{
                              uri: `${api.defaults.baseURL}/uploads/companies/${item.company.logoUrl}`,
                            }}
                            style={styles.companyLogo}
                          />
                        ) : (
                          <View style={styles.companyPlaceholder}>
                            <Ionicons
                              name="business-outline"
                              size={16}
                              color="#7c3aed"
                            />
                          </View>
                        )}

                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={styles.infoLabel}>Company</Text>

                          <Text style={styles.infoValue} numberOfLines={1}>
                            {item.company?.name || "No company"}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons
                        name="hardware-chip-outline"
                        size={14}
                        color="#6b7280"
                      />
                      <Text style={styles.infoLabel}>Equipment</Text>
                      <Text style={styles.infoValue} numberOfLines={1}>
                        {item.equipment?.name || "No equipment"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.footerText}>View Job Details</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#7c3aed"
                    />
                  </View>
                </Pressable>
              </Animated.View>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: {
    color: "#6b7280",
    marginTop: 14,
    fontSize: 14,
    fontWeight: "500",
  },

  bgGradient: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    pointerEvents: "none",
  },
  bgOrb: { position: "absolute", borderRadius: 999, opacity: 0.08 },
  bgOrb1: {
    width: 400,
    height: 400,
    backgroundColor: "#7c3aed",
    top: -150,
    right: -100,
  },
  bgOrb2: {
    width: 300,
    height: 300,
    backgroundColor: "#2563eb",
    bottom: 100,
    left: -100,
  },

  screen: {
    flex: 1,
    backgroundColor: "transparent",
    padding: 20,
    paddingTop: 60,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(124, 58, 237, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  refreshBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.5)",
  },

  // Card
  card: {
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.6)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  accentBar: { height: 3, width: "100%" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    paddingBottom: 12,
  },
  desc: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
    letterSpacing: 0.3,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    marginHorizontal: 16,
  },

  infoGrid: { flexDirection: "row", padding: 16, gap: 16 },
  infoItem: { flex: 1 },
  infoLabel: {
    color: "#6b7280",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 2,
  },
  infoValue: { color: "#e5e7eb", fontSize: 13, fontWeight: "600" },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(30, 41, 59, 0.4)",
  },
  footerText: {
    color: "#a78bfa",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: -0.2,
  },

  // Empty State
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyCard: {
    width: "100%",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e293b",
    overflow: "hidden",
    position: "relative",
  },
  emptyGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    backgroundColor: "#7c3aed",
    opacity: 0.12,
    borderRadius: 100,
    top: -60,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "rgba(124, 58, 237, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.3)",
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    maxWidth: "80%",
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  companyLogo: {
    width: 42,
    height: 42,
    borderRadius: 10,
  },

  companyPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
  },
});
