import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  Animated,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../api/client";

export default function ScheduledMaintenanceScreen() {
  const navigation = useNavigation<any>();
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      loadVisits();
    }, []),
  );

  async function loadVisits() {
    try {
      setLoading(true);
      const res = await api.get("/maintenance-visits/my");
      setVisits(res.data);
      animateIn();
    } catch (err: any) {
      console.log(err.response?.data || err.message);
      alert("Failed to load maintenance visits.");
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadVisits();
    setRefreshing(false);
  }

  function getStatusConfig(status: string) {
    const s = status?.toLowerCase();
    switch (s) {
      case "scheduled":
        return {
          color: "#a78bfa",
          bg: "rgba(124, 58, 237, 0.2)",
          border: "#7c3aed",
          icon: "calendar-outline",
        };
      case "assigned":
        return {
          color: "#60a5fa",
          bg: "rgba(59, 130, 246, 0.2)",
          border: "#3b82f6",
          icon: "person-add-outline",
        };
      case "in_progress":
      case "in progress":
        return {
          color: "#fbbf24",
          bg: "rgba(146, 64, 14, 0.3)",
          border: "#b45309",
          icon: "construct-outline",
        };
      case "completed":
        return {
          color: "#34d399",
          bg: "rgba(16, 185, 129, 0.2)",
          border: "#10b981",
          icon: "checkmark-circle-outline",
        };
      case "missed":
        return {
          color: "#f87171",
          bg: "rgba(127, 29, 29, 0.3)",
          border: "#ef4444",
          icon: "alert-circle-outline",
        };
      case "cancelled":
        return {
          color: "#9ca3af",
          bg: "rgba(55, 65, 81, 0.3)",
          border: "#4b5563",
          icon: "close-circle-outline",
        };
      default:
        return {
          color: "#a78bfa",
          bg: "rgba(124, 58, 237, 0.2)",
          border: "#7c3aed",
          icon: "calendar-outline",
        };
    }
  }

  function getRelativeTime(dateString: string): {
    text: string;
    isUrgent: boolean;
    isPast: boolean;
  } {
    const now = new Date();
    const target = new Date(dateString);

    // Reset time to midnight for accurate day comparison
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(
      target.getFullYear(),
      target.getMonth(),
      target.getDate(),
    );

    const diffMs = targetDate.getTime() - nowDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    // Same day
    if (diffDays === 0) return { text: "Today", isUrgent: true, isPast: false };

    // Tomorrow
    if (diffDays === 1)
      return { text: "Tomorrow", isUrgent: true, isPast: false };

    // Yesterday
    if (diffDays === -1)
      return { text: "Yesterday", isUrgent: false, isPast: true };

    // This week (2-6 days from now)
    if (diffDays >= 2 && diffDays <= 6)
      return {
        text: `In ${diffDays} days`,
        isUrgent: diffDays <= 3,
        isPast: false,
      };

    // Last week (2-6 days ago)
    if (diffDays >= -6 && diffDays <= -2)
      return {
        text: `${Math.abs(diffDays)} days ago`,
        isUrgent: false,
        isPast: true,
      };

    // Next week (7-13 days from now)
    if (diffDays >= 7 && diffDays <= 13)
      return { text: "Next week", isUrgent: false, isPast: false };

    // Last week exactly (7 days ago)
    if (diffDays === -7)
      return { text: "Last week", isUrgent: false, isPast: true };

    // 1-3 weeks ago
    if (diffDays >= -20 && diffDays <= -8) {
      const weeks = Math.round(Math.abs(diffDays) / 7);
      return {
        text: `${weeks} week${weeks > 1 ? "s" : ""} ago`,
        isUrgent: false,
        isPast: true,
      };
    }

    // 2-3 weeks from now
    if (diffDays >= 14 && diffDays <= 20) {
      const weeks = Math.round(diffDays / 7);
      return { text: `In ${weeks} weeks`, isUrgent: false, isPast: false };
    }

    // This month (same month, different weeks)
    if (
      targetDate.getMonth() === nowDate.getMonth() &&
      targetDate.getFullYear() === nowDate.getFullYear()
    ) {
      if (diffDays > 0)
        return { text: `In ${diffDays} days`, isUrgent: false, isPast: false };
      return {
        text: `${Math.abs(diffDays)} days ago`,
        isUrgent: false,
        isPast: true,
      };
    }

    // Last month
    const lastMonth = new Date(
      nowDate.getFullYear(),
      nowDate.getMonth() - 1,
      1,
    );
    if (
      targetDate.getMonth() === lastMonth.getMonth() &&
      targetDate.getFullYear() === lastMonth.getFullYear()
    ) {
      return { text: "Last month", isUrgent: false, isPast: true };
    }

    // Next month
    const nextMonth = new Date(
      nowDate.getFullYear(),
      nowDate.getMonth() + 1,
      1,
    );
    if (
      targetDate.getMonth() === nextMonth.getMonth() &&
      targetDate.getFullYear() === nextMonth.getFullYear()
    ) {
      return { text: "Next month", isUrgent: false, isPast: false };
    }

    // Months ago
    const monthDiff =
      (nowDate.getFullYear() - targetDate.getFullYear()) * 12 +
      (nowDate.getMonth() - targetDate.getMonth());
    if (monthDiff > 0 && monthDiff < 12) {
      return {
        text: `${monthDiff} month${monthDiff > 1 ? "s" : ""} ago`,
        isUrgent: false,
        isPast: true,
      };
    }

    // Months from now
    if (monthDiff < 0 && monthDiff > -12) {
      return {
        text: `In ${Math.abs(monthDiff)} month${Math.abs(monthDiff) > 1 ? "s" : ""}`,
        isUrgent: false,
        isPast: false,
      };
    }

    // Years
    const yearDiff = nowDate.getFullYear() - targetDate.getFullYear();
    if (yearDiff > 0)
      return {
        text: `${yearDiff} year${yearDiff > 1 ? "s" : ""} ago`,
        isUrgent: false,
        isPast: true,
      };
    if (yearDiff < 0)
      return {
        text: `In ${Math.abs(yearDiff)} year${Math.abs(yearDiff) > 1 ? "s" : ""}`,
        isUrgent: false,
        isPast: false,
      };

    return {
      text: targetDate.toLocaleDateString(),
      isUrgent: false,
      isPast: false,
    };
  }

  function getTimeBadgeStyle(relative: { isUrgent: boolean; isPast: boolean }) {
    if (relative.isPast)
      return {
        bg: "rgba(239, 68, 68, 0.15)",
        border: "rgba(239, 68, 68, 0.3)",
        text: "#f87171",
      };
    if (relative.isUrgent)
      return {
        bg: "rgba(245, 158, 11, 0.15)",
        border: "rgba(245, 158, 11, 0.3)",
        text: "#fbbf24",
      };
    return {
      bg: "rgba(16, 185, 129, 0.15)",
      border: "rgba(16, 185, 129, 0.3)",
      text: "#34d399",
    };
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.bgGradient}>
          <View style={[styles.bgOrb, styles.bgOrb1]} />
          <View style={[styles.bgOrb, styles.bgOrb2]} />
        </View>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading visits...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.bgGradient}>
        <View style={[styles.bgOrb, styles.bgOrb1]} />
        <View style={[styles.bgOrb, styles.bgOrb2]} />
        <View style={[styles.bgOrb, styles.bgOrb3]} />
      </View>

      <Animated.View
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.headerLeft}>
          <View style={styles.headerIconWrap}>
            <Ionicons name="calendar-outline" size={20} color="#a78bfa" />
          </View>
          <View>
            <Text style={styles.title}>Scheduled Maintenance</Text>
            <Text style={styles.subtitle}>
              {visits.length === 0
                ? "No visits assigned"
                : `${visits.length} visit${visits.length > 1 ? "s" : ""} assigned`}
            </Text>
          </View>
        </View>
      </Animated.View>

      <FlatList
        data={visits}
        keyExtractor={(item: any) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8b5cf6"
          />
        }
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
                <Ionicons name="construct-outline" size={40} color="#8b5cf6" />
              </View>
              <Text style={styles.emptyTitle}>No Scheduled Maintenance</Text>
              <Text style={styles.emptyText}>
                You don't have any scheduled maintenance visits assigned yet.
                Pull down to refresh.
              </Text>
              <Pressable style={styles.refreshButton} onPress={loadVisits}>
                <Ionicons name="refresh" color="#fff" size={16} />
                <Text style={styles.refreshText}>Refresh</Text>
              </Pressable>
            </View>
          </Animated.View>
        }
        renderItem={({ item, index }: any) => {
          const status = getStatusConfig(item.status);
          const isLast = index === visits.length - 1;
          const relative = getRelativeTime(item.scheduledDate);
          const timeStyle = getTimeBadgeStyle(relative);

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
                  navigation.navigate("MaintenanceVisitDetails", {
                    visitId: item.id,
                  })
                }
              >
                <View
                  style={[styles.accentBar, { backgroundColor: status.border }]}
                />

                <View style={styles.cardHeader}>
                  <View style={styles.visitLeft}>
                    <Text style={styles.visit}>Visit #{item.visitNumber}</Text>
                    <Text style={styles.plan}>
                      {item.subscription?.plan?.name || "No Maintenance Plan"}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: status.bg,
                        borderColor: status.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={status.icon as any}
                      size={12}
                      color={status.color}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.statusText, { color: status.color }]}>
                      {item.status?.replace("_", " ")}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.companyRow}>
                  {item.company?.logoUrl ? (
                    <Image
                      source={{
                        uri: `${api.defaults.baseURL}/uploads/companies/${item.company.logoUrl}`,
                      }}
                      style={styles.companyLogo}
                    />
                  ) : (
                    <View style={styles.logoPlaceholder}>
                      <Text style={styles.logoLetter}>
                        {(item.company?.name || "?").charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.companyInfo}>
                    <Text style={styles.company} numberOfLines={1}>
                      {item.company?.name || "Unknown Company"}
                    </Text>
                    <Text style={styles.equipment}>
                      {item.equipment?.name || "Unknown Equipment"}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.cardFooter}>
                  <View style={styles.dateRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color="#6b7280"
                    />
                    <Text style={styles.date}>
                      {new Date(item.scheduledDate).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.timeBadge,
                      {
                        backgroundColor: timeStyle.bg,
                        borderColor: timeStyle.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        relative.isPast
                          ? "time-outline"
                          : relative.isUrgent
                            ? "alert-circle-outline"
                            : "checkmark-circle-outline"
                      }
                      size={12}
                      color={timeStyle.text}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.timeText, { color: timeStyle.text }]}>
                      {relative.text}
                    </Text>
                  </View>
                </View>

                <View style={styles.openRow}>
                  <Text style={styles.openText}>View Details</Text>
                  <Ionicons name="chevron-forward" size={18} color="#a78bfa" />
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
  screen: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
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
    backgroundColor: "#ec4899",
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

  header: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
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
    alignItems: "flex-start",
    padding: 16,
    paddingBottom: 12,
  },
  visitLeft: { flex: 1, marginRight: 12 },
  visit: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  plan: { color: "#a78bfa", marginTop: 4, fontWeight: "600", fontSize: 13 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontWeight: "700",
    fontSize: 11,
    textTransform: "capitalize",
    letterSpacing: 0.3,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    marginHorizontal: 16,
  },

  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 12,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(124, 58, 237, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  logoLetter: { color: "#fff", fontWeight: "800", fontSize: 20 },
  companyInfo: { flex: 1, marginLeft: 12 },
  company: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  equipment: { color: "#6b7280", marginTop: 2, fontSize: 12 },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  date: { color: "#9ca3af", fontSize: 13, fontWeight: "500" },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  timeText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.2 },

  openRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(30, 41, 59, 0.4)",
  },
  openText: {
    color: "#a78bfa",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: -0.2,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
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
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    maxWidth: "85%",
    marginBottom: 20,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7c3aed",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  refreshText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
