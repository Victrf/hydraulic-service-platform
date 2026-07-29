import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  TextInput,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { useEffect, useState, useRef, useCallback } from "react";
import { api } from "../../api/client";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function SubscriptionsScreen() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation<any>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

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

  const load = async () => {
    try {
      setRefreshing(true);
      const res = await api.get("/subscriptions");
      const data = res.data || [];

      const sorted = data.sort((a: any, b: any) => {
        const today = new Date();
        const aDays = Math.ceil(
          (new Date(a.currentPeriodEnd).getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        const bDays = Math.ceil(
          (new Date(b.currentPeriodEnd).getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        return aDays - bDays;
      });

      setSubs(sorted);
      animateIn();
    } catch (err) {
      console.log(err);
      setSubs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredSubs = subs.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.company?.name?.toLowerCase().includes(q) ||
      s.plan?.name?.toLowerCase().includes(q)
    );
  });

  const active = subs.filter((s) => s.status === "active").length;
  const expired = subs.filter((s) => s.status === "expired").length;
  const cancelled = subs.filter((s) => s.status === "cancelled").length;

  const atRiskCount = subs.filter((s) => {
    if (s.status === "cancelled") return false;
    const expiry = new Date(s.currentPeriodEnd);
    const today = new Date();
    const daysRemaining = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysRemaining > 0 && daysRemaining <= 30;
  }).length;

  const overdueCount = subs.filter((s) => {
    if (s.status === "cancelled") return false;
    return new Date(s.currentPeriodEnd) < new Date();
  }).length;

  const getStatusConfig = (item: any) => {
    const today = new Date();
    const expiry = new Date(item.currentPeriodEnd);
    const daysRemaining = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    const isCancelled = item.status === "cancelled";
    const isExpired = item.status === "expired" || daysRemaining <= 0;
    const isAtRisk = !isCancelled && !isExpired && daysRemaining <= 30;
    const isActive = !isCancelled && !isExpired && !isAtRisk;

    return { isCancelled, isExpired, isAtRisk, isActive, daysRemaining };
  };

  const getStatusColor = (
    isCancelled: boolean,
    isExpired: boolean,
    isAtRisk: boolean,
  ) => {
    if (isCancelled)
      return {
        bg: "rgba(55, 65, 81, 0.8)",
        border: "#4b5563",
        text: "#9ca3af",
        icon: "close-circle",
      };
    if (isExpired)
      return {
        bg: "rgba(127, 29, 29, 0.6)",
        border: "#991b1b",
        text: "#fca5a5",
        icon: "alert-circle",
      };
    if (isAtRisk)
      return {
        bg: "rgba(146, 64, 14, 0.6)",
        border: "#b45309",
        text: "#fcd34d",
        icon: "warning",
      };
    return {
      bg: "rgba(30, 27, 75, 0.8)",
      border: "#4338ca",
      text: "#a78bfa",
      icon: "checkmark-circle",
    };
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#8b5cf6" size="large" />
        <Text style={styles.loadingText}>Loading subscriptions...</Text>
      </View>
    );
  }

  const renderCard = ({ item, index }: { item: any; index: number }) => {
    const { isCancelled, isExpired, isAtRisk, isActive, daysRemaining } =
      getStatusConfig(item);
    const status = getStatusColor(isCancelled, isExpired, isAtRisk);
    const statusLabel = isCancelled
      ? "Cancelled"
      : isExpired
        ? "Expired"
        : isAtRisk
          ? "At Risk"
          : "Active";

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        }}
      >
        <Pressable
          onPress={() =>
            navigation.navigate("SubscriptionDetail", { subscription: item })
          }
          style={({ pressed }) => [
            styles.card,
            {
              borderColor: status.border,
              backgroundColor: "rgba(15, 23, 42, 0.9)",
            },
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
          ]}
        >
          {/* Top accent bar */}
          <View
            style={[styles.accentBar, { backgroundColor: status.border }]}
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
                <View style={styles.logoPlaceholder}>
                  <Ionicons name="business-outline" size={20} color="#8b5cf6" />
                </View>
              )}
              <View style={styles.companyInfo}>
                <Text style={styles.company}>{item.company?.name}</Text>
                <Text style={styles.plan}>{item.equipment?.name}</Text>
                <Text style={styles.meta}>{item.plan?.name}</Text>
              </View>
            </View>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: status.bg, borderColor: status.border },
              ]}
            >
              <Ionicons
                name={status.icon as any}
                size={12}
                color={status.text}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.badgeText, { color: status.text }]}>
                {statusLabel}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Info grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={14} color="#6b7280" />
              <Text style={styles.infoLabel}>Next Visit</Text>
              <Text style={styles.infoValue}>
                {new Date(item.nextVisitDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={14} color="#6b7280" />
              <Text style={styles.infoLabel}>Expiry</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: isExpired ? "#fca5a5" : "#e5e7eb" },
                ]}
              >
                {new Date(item.currentPeriodEnd).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="hourglass-outline" size={14} color="#6b7280" />
              <Text style={styles.infoLabel}>Days Left</Text>
              <Text
                style={[
                  styles.infoValue,
                  {
                    color: isAtRisk
                      ? "#fcd34d"
                      : isExpired
                        ? "#fca5a5"
                        : "#a78bfa",
                  },
                ]}
              >
                {daysRemaining > 0 ? `${daysRemaining}d` : "Overdue"}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.max(0, Math.min(100, (daysRemaining / 365) * 100))}%`,
                    backgroundColor: isExpired
                      ? "#ef4444"
                      : isAtRisk
                        ? "#f59e0b"
                        : "#8b5cf6",
                  },
                ]}
              />
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Animated Background */}
      <View style={styles.bgGradient}>
        <View style={[styles.bgOrb, styles.bgOrb1]} />
        <View style={[styles.bgOrb, styles.bgOrb2]} />
      </View>

      {/* HEADER */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Subscriptions</Text>
          <Text style={styles.subtitle}>Manage company maintenance plans</Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            style={styles.createBtn}
            onPress={() => navigation.navigate("CreateSubscription")}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.createBtnText}>Create</Text>
          </Pressable>

          <Pressable
            style={styles.toggleBtn}
            onPress={() =>
              setViewMode((prev) => (prev === "card" ? "table" : "card"))
            }
          >
            <Ionicons
              name={viewMode === "card" ? "grid-outline" : "list-outline"}
              size={18}
              color="#c4b5fd"
            />
          </Pressable>
        </View>
      </View>

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color="#6b7280" />
        <TextInput
          placeholder="Search company or plan..."
          placeholderTextColor="#4b5563"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <Pressable onPress={() => setSearch("")} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color="#6b7280" />
          </Pressable>
        ) : null}
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderColor: "#312e81" }]}>
          <View style={styles.statIconWrap}>
            <Ionicons name="layers-outline" size={18} color="#818cf8" />
          </View>
          <Text style={styles.statValue}>{subs.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={[styles.statCard, { borderColor: "#1e3a5f" }]}>
          <View
            style={[
              styles.statIconWrap,
              { backgroundColor: "rgba(30, 58, 95, 0.5)" },
            ]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color="#34d399"
            />
          </View>
          <Text style={[styles.statValue, { color: "#34d399" }]}>{active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>

        <View style={[styles.statCard, { borderColor: "#4a1d1d" }]}>
          <View
            style={[
              styles.statIconWrap,
              { backgroundColor: "rgba(74, 29, 29, 0.5)" },
            ]}
          >
            <Ionicons name="alert-circle-outline" size={18} color="#f87171" />
          </View>
          <Text style={[styles.statValue, { color: "#f87171" }]}>
            {expired}
          </Text>
          <Text style={styles.statLabel}>Expired</Text>
        </View>
      </View>

      {/* HEALTH */}
      <View style={styles.healthRow}>
        <View style={[styles.healthCard, { borderColor: "#78350f" }]}>
          <View style={styles.healthHeader}>
            <Ionicons name="warning-outline" size={16} color="#fbbf24" />
            <Text style={styles.healthLabel}>At Risk</Text>
          </View>
          <Text style={[styles.healthValue, { color: "#fbbf24" }]}>
            {atRiskCount}
          </Text>
        </View>

        <View style={[styles.healthCard, { borderColor: "#7f1d1d" }]}>
          <View style={styles.healthHeader}>
            <Ionicons name="close-circle-outline" size={16} color="#f87171" />
            <Text style={styles.healthLabel}>Overdue</Text>
          </View>
          <Text style={[styles.healthValue, { color: "#f87171" }]}>
            {overdueCount}
          </Text>
        </View>
      </View>

      {/* TABLE HEADER */}
      {viewMode === "table" && (
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 2 }]}>Company</Text>
          <Text style={styles.headerCell}>Plan</Text>
          <Text style={styles.headerCell}>Status</Text>
          <Text style={styles.headerCell}>Expiry</Text>
        </View>
      )}

      <FlatList
        data={filteredSubs}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={
          viewMode === "card"
            ? renderCard
            : ({ item }) => {
                const { isCancelled, isExpired, isAtRisk } =
                  getStatusConfig(item);
                const status = getStatusColor(isCancelled, isExpired, isAtRisk);
                const statusLabel = isCancelled
                  ? "Cancelled"
                  : isExpired
                    ? "Expired"
                    : isAtRisk
                      ? "At Risk"
                      : "Active";

                return (
                  <Pressable
                    onPress={() =>
                      navigation.navigate("SubscriptionDetail", {
                        subscription: item,
                      })
                    }
                    style={({ pressed }) => [
                      styles.tableRow,
                      pressed && {
                        backgroundColor: "rgba(139, 92, 246, 0.08)",
                      },
                    ]}
                  >
                    <View
                      style={{
                        flex: 2,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      {item.company?.logoUrl ? (
                        <Image
                          source={{
                            uri: `${api.defaults.baseURL}/uploads/companies/${item.company.logoUrl}`,
                          }}
                          style={styles.tableLogo}
                        />
                      ) : (
                        <View style={styles.tableLogoPlaceholder}>
                          <Ionicons
                            name="business-outline"
                            size={12}
                            color="#8b5cf6"
                          />
                        </View>
                      )}
                      <Text
                        style={[styles.cell, { flex: 1, marginLeft: 8 }]}
                        numberOfLines={1}
                      >
                        {item.company?.name}
                      </Text>
                    </View>
                    <Text style={styles.cell} numberOfLines={1}>
                      {item.plan?.name}
                    </Text>
                    <View
                      style={[
                        styles.tableBadge,
                        {
                          backgroundColor: status.bg,
                          borderColor: status.border,
                        },
                      ]}
                    >
                      <Text style={[styles.badgeText, { color: status.text }]}>
                        {statusLabel}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.cell,
                        { color: isExpired ? "#fca5a5" : "#e5e7eb" },
                      ]}
                    >
                      {new Date(item.currentPeriodEnd).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" },
                      )}
                    </Text>
                  </Pressable>
                );
              }
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyCard}>
              <View style={styles.glow} />
              <View style={styles.iconWrap}>
                <Ionicons name="receipt-outline" size={32} color="#8b5cf6" />
              </View>
              <Text style={styles.emptyTitle}>No subscriptions found</Text>
              <Text style={styles.emptyText}>
                {search
                  ? "Try adjusting your search terms"
                  : "Get started by creating your first subscription"}
              </Text>
              {!search && (
                <Pressable
                  style={styles.emptyActionBtn}
                  onPress={() => navigation.navigate("CreateSubscription")}
                >
                  <Ionicons name="add" size={16} color="#fff" />
                  <Text style={styles.emptyActionText}>
                    Create Subscription
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 16,
    paddingTop: 50,
  },

  bgGradient: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },

  bgOrb: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.12,
  },

  bgOrb1: {
    width: 300,
    height: 300,
    backgroundColor: "#7c3aed",
    top: -80,
    right: -60,
    filter: "blur(80px)",
  },

  bgOrb2: {
    width: 250,
    height: 250,
    backgroundColor: "#2563eb",
    bottom: 100,
    left: -80,
    filter: "blur(60px)",
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  subtitle: {
    color: "#6b7280",
    marginBottom: 16,
    fontSize: 13,
    letterSpacing: 0.2,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },

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
    backgroundColor: "rgba(49, 46, 129, 0.5)",
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

  healthRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },

  healthCard: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backdropFilter: "blur(10px)",
  },

  healthHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  healthValue: {
    fontWeight: "800",
    fontSize: 22,
  },

  healthLabel: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "600",
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

  accentBar: {
    height: 3,
    width: "100%",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingBottom: 12,
  },

  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  companyInfo: {
    marginLeft: 12,
    flex: 1,
  },

  company: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: -0.2,
  },

  plan: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },

  meta: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 2,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
    letterSpacing: 0.3,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    marginHorizontal: 16,
  },

  infoGrid: {
    flexDirection: "row",
    padding: 16,
    paddingTop: 12,
    gap: 16,
  },

  infoItem: {
    flex: 1,
    alignItems: "flex-start",
  },

  infoLabel: {
    color: "#6b7280",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 4,
    marginBottom: 2,
    fontWeight: "600",
  },

  infoValue: {
    color: "#e5e7eb",
    fontSize: 13,
    fontWeight: "600",
  },

  progressContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  progressBarBg: {
    height: 4,
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    borderRadius: 2,
    overflow: "hidden",
  },

  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  toggleBtn: {
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
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

  clearBtn: {
    padding: 2,
  },

  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 6,
    paddingBottom: 8,
  },

  headerCell: {
    flex: 1,
    color: "#6b7280",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.5)",
  },

  tableLogo: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },

  tableLogoPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },

  tableBadge: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
  },

  cell: {
    flex: 1,
    color: "#e5e7eb",
    fontSize: 12,
    fontWeight: "500",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
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

  glow: {
    position: "absolute",
    width: 200,
    height: 200,
    backgroundColor: "#7c3aed",
    opacity: 0.12,
    borderRadius: 100,
    top: -60,
    filter: "blur(40px)",
  },

  iconWrap: {
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

  emptyActionBtn: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7c3aed",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },

  emptyActionText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },

  loadingText: {
    color: "#6b7280",
    marginTop: 12,
    fontSize: 13,
    fontWeight: "500",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7c3aed",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  createBtnText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 6,
    fontSize: 13,
  },

  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },

  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
});
