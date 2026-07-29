import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TextInput,
  Pressable,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { useMemo, useState, useCallback, useRef } from "react";
import EmptyState from "../../components/common/EmptyState";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../api/client";

const { width } = Dimensions.get("window");

export default function CompletedJobsScreen() {
  const navigation = useNavigation<any>();
  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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
      loadCompletedJobs();
    }, []),
  );

  const loadCompletedJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/technicians/completed-summary");
      setJobs(res.data || []);
      animateIn();
    } catch (err: any) {
      console.log("COMPLETED JOBS ERROR:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return jobs;
    return jobs.filter(
      (job) =>
        job.company?.name?.toLowerCase().includes(term) ||
        job.equipment?.name?.toLowerCase().includes(term),
    );
  }, [jobs, search]);

  const totalJobs = jobs.length;
  const thisMonth = jobs.filter((j) => {
    const date = new Date(j.report?.createdAt || j.createdAt);
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;

  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.bgGradient}>
          <View style={[styles.bgOrb, styles.bgOrb1]} />
          <View style={[styles.bgOrb, styles.bgOrb2]} />
        </View>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Background Orbs */}
      <View style={styles.bgGradient}>
        <View style={[styles.bgOrb, styles.bgOrb1]} />
        <View style={[styles.bgOrb, styles.bgOrb2]} />
        <View style={[styles.bgOrb, styles.bgOrb3]} />
      </View>

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.headerLeft}>
          <View style={styles.headerIconWrap}>
            <Ionicons
              name="checkmark-done-circle-outline"
              size={22}
              color="#34d399"
            />
          </View>
          <View>
            <Text style={styles.title}>Completed Jobs</Text>
            <Text style={styles.subtitle}>Browse your service history</Text>
          </View>
        </View>
      </Animated.View>

      {/* Stats */}
      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderColor: "#312e81" }]}>
            <View
              style={[
                styles.statIconWrap,
                { backgroundColor: "rgba(99, 102, 241, 0.15)" },
              ]}
            >
              <Ionicons name="layers-outline" size={18} color="#818cf8" />
            </View>
            <Text style={styles.statValue}>{totalJobs}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, { borderColor: "#064e3b" }]}>
            <View
              style={[
                styles.statIconWrap,
                { backgroundColor: "rgba(16, 185, 129, 0.15)" },
              ]}
            >
              <Ionicons name="calendar-outline" size={18} color="#34d399" />
            </View>
            <Text style={[styles.statValue, { color: "#34d399" }]}>
              {thisMonth}
            </Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
        </View>
      </Animated.View>

      {/* Search */}
      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color="#6b7280" />
          <TextInput
            placeholder="Search company or equipment..."
            placeholderTextColor="#4b5563"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          {search ? (
            <Pressable onPress={() => setSearch("")} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color="#6b7280" />
            </Pressable>
          ) : null}
        </View>
      </Animated.View>

      {/* List */}
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
          flexGrow: filteredJobs.length === 0 ? 1 : 0,
        }}
        ListEmptyComponent={
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
                  name="checkmark-circle-outline"
                  size={36}
                  color="#8b5cf6"
                />
              </View>
              <Text style={styles.emptyTitle}>No Completed Jobs</Text>
              <Text style={styles.emptyText}>
                Completed service reports will appear here once you finish a
                job.
              </Text>
            </View>
          </Animated.View>
        }
        renderItem={({ item, index }) => {
          const isLast = index === filteredJobs.length - 1;
          const completedDate = new Date(
            item.report?.createdAt || item.createdAt,
          );
          const daysAgo = Math.floor(
            (new Date().getTime() - completedDate.getTime()) /
              (1000 * 60 * 60 * 24),
          );

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
                  navigation.navigate("TechnicianReport", {
                    requestId: item.id,
                  })
                }
              >
                <View
                  style={[styles.accentBar, { backgroundColor: "#10b981" }]}
                />

                <View style={styles.cardHeader}>
                  <View style={styles.cardLeft}>
                    {item.company?.logoUrl ? (
                      <Image
                        source={{
                          uri: `${api.defaults.baseURL}/uploads/companies/${item.company.logoUrl}`,
                        }}
                        style={styles.companyLogo}
                      />
                    ) : (
                      <View
                        style={[
                          styles.completionBadge,
                          {
                            backgroundColor: "rgba(16, 185, 129, 0.15)",
                            borderColor: "rgba(16, 185, 129, 0.3)",
                          },
                        ]}
                      >
                        <Ionicons
                          name="business-outline"
                          size={16}
                          color="#34d399"
                        />
                      </View>
                    )}
                    <View style={styles.cardInfo}>
                      <Text style={styles.company} numberOfLines={1}>
                        {item.company?.name}
                      </Text>
                      <Text style={styles.equipment}>
                        {item.equipment?.name}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.daysBadge}>
                    <Text style={styles.daysText}>
                      {daysAgo === 0
                        ? "Today"
                        : daysAgo === 1
                          ? "Yesterday"
                          : `${daysAgo}d ago`}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.cardFooter}>
                  <View style={styles.dateRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={13}
                      color="#6b7280"
                    />
                    <Text style={styles.dateText}>
                      {completedDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  <View style={styles.viewReport}>
                    <Text style={styles.viewReportText}>View Report</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#7c3aed"
                    />
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617", padding: 20, paddingTop: 50 },
  bgGradient: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
  bgOrb: { position: "absolute", borderRadius: 999, opacity: 0.1 },
  bgOrb1: {
    width: 350,
    height: 350,
    backgroundColor: "#7c3aed",
    top: -100,
    right: -80,
  },
  bgOrb2: {
    width: 280,
    height: 280,
    backgroundColor: "#2563eb",
    top: 200,
    left: -100,
  },
  bgOrb3: {
    width: 200,
    height: 200,
    backgroundColor: "#10b981",
    bottom: 100,
    right: -50,
    opacity: 0.08,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },
  loadingText: {
    color: "#6b7280",
    marginTop: 14,
    fontSize: 14,
    fontWeight: "500",
  },

  // Header
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 4,
    letterSpacing: 0.2,
  },

  // Stats
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 20,
    marginBottom: 2,
  },
  statLabel: {
    color: "#6b7280",
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Search
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "500",
  },
  clearBtn: { padding: 2 },

  // Card
  card: {
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
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
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  completionBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    marginRight: 12,
  },
  cardInfo: { flex: 1 },
  company: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: -0.2,
  },
  equipment: { color: "#9ca3af", fontSize: 12, marginTop: 2 },
  daysBadge: {
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#334155",
  },
  daysText: { color: "#9ca3af", fontSize: 11, fontWeight: "600" },

  divider: {
    height: 1,
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    marginHorizontal: 16,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    paddingHorizontal: 16,
  },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dateText: { color: "#6b7280", fontSize: 12, fontWeight: "500" },
  viewReport: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewReportText: { color: "#a78bfa", fontSize: 13, fontWeight: "700" },

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
  companyLogo: {
    width: 32,
    height: 32,
    borderRadius: 10,
    marginRight: 12,
  },
});
