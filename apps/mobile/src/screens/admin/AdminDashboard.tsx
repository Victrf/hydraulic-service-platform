import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { api } from "../../api/client";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { socket } from "../../services/socket";

export default function AdminDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [requestStats, setRequestStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    unassigned: 0,
  });

  const [systemStats, setSystemStats] = useState({
    totalSubs: 0,
    activeSubs: 0,
    expiredSubs: 0,
    totalPayments: 0,
  });

  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  useEffect(() => {
    loadSystemStats();
    loadRequestStats();
  }, []);

  useEffect(() => {
    const refresh = () => {
      console.log("🔥 Dashboard refreshed");
      refreshDashboard();
    };

    socket.on("request.created", refresh);
    socket.on("request.updated", refresh);
    socket.on("request.assigned", refresh);
    socket.on("request.accepted", refresh);
    socket.on("request.in-progress", refresh);
    socket.on("request.completed", refresh);

    return () => {
      socket.off("request.created", refresh);
      socket.off("request.updated", refresh);
      socket.off("request.assigned", refresh);
      socket.off("request.accepted", refresh);
      socket.off("request.in-progress", refresh);
      socket.off("request.completed", refresh);
    };
  }, []);

  useEffect(() => {
    setPage(1);
    setRequests([]);
    setHasMore(true);
    loadRequests(true);
  }, [statusFilter]);

  useEffect(() => {
    if (route.params?.refresh) {
      setPage(1);
      setRequests([]);
      setHasMore(true);
      loadRequests(true);
      loadRequestStats();
      navigation.setParams({ refresh: undefined });
    }
  }, [route.params?.refresh]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/service-requests/${id}/status`, { status });
      setPage(1);
      setRequests([]);
      loadRequests(true);
      loadRequestStats();
    } catch (err) {
      console.log(err);
    }
  };

  const autoAssign = async (id: string) => {
    try {
      await api.post("/assignments/auto-assign", {
        serviceRequestId: id,
      });
      setPage(1);
      setRequests([]);
      loadRequests(true);
      loadRequestStats();
    } catch (err: any) {
      let message = err?.response?.data?.message || "Auto assign failed";
      if (Array.isArray(message)) message = message[0];
      console.log("AUTO ASSIGN ERROR:", message);
      Alert.alert("Error", message);
    }
  };

  const loadRequests = async (reset = false) => {
    try {
      const currentPage = reset ? 1 : page;
      const url = statusFilter
        ? `/service-requests?status=${statusFilter}&page=${currentPage}&limit=10`
        : `/service-requests?page=${currentPage}&limit=10`;

      const res = await api.get(url);
      const newData = res.data?.data || [];
      const meta = res.data?.meta;

      setRequests((prev) => {
        const combined = reset ? newData : [...prev, ...newData];
        const unique = Array.from(
          new Map(combined.map((item) => [item.id, item])).values(),
        );
        return unique;
      });

      setHasMore(currentPage < meta.lastPage);
      setPage(currentPage + 1);
    } catch (err) {
      console.log(err);
    }
  };

  const loadRequestStats = async () => {
    try {
      const res = await api.get("/service-requests/admin-stats");
      setRequestStats(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadSystemStats = async () => {
    try {
      const [subsRes, paymentsRes] = await Promise.all([
        api.get("/subscriptions"),
        api.get("/payments"),
      ]);

      const subs = subsRes.data || [];
      const payments = paymentsRes.data || [];

      setSystemStats({
        totalSubs: subs.length,
        activeSubs: subs.filter((s: any) => s.status === "active").length,
        expiredSubs: subs.filter((s: any) => s.status === "expired").length,
        totalPayments: payments.length,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const refreshDashboard = async () => {
    setPage(1);
    setRequests([]);
    setHasMore(true);
    await Promise.all([
      loadRequests(true),
      loadRequestStats(),
      loadSystemStats(),
    ]);
  };

  return (
    <View style={styles.screen}>
      <FlatList
        data={requests}
        keyExtractor={(item, index) => item.id + "-" + index}
        onEndReached={() => {
          if (hasMore) loadRequests();
        }}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <>
            <View style={{ padding: 16, paddingTop: 40 }}>
              <Text style={styles.title}>Admin Dashboard</Text>
              <Text style={styles.subtitle}>
                System overview and service operations
              </Text>

              <Text style={styles.sectionTitle}>Quick Access</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.quickNavScroll}>
                  <NavBtn label="Users" icon="people-outline" screen="Users" />
                  <NavBtn
                    label="Companies"
                    icon="business-outline"
                    screen="Companies"
                  />
                  <NavBtn
                    label="Equipment"
                    icon="construct-outline"
                    screen="Equipment"
                  />
                  <NavBtn
                    label="Reports"
                    icon="bar-chart-outline"
                    screen="Reports"
                  />
                </View>
              </ScrollView>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.quickNavScroll}>
                  <NavBtn
                    label="Subscriptions"
                    icon="layers-outline"
                    screen="Subscriptions"
                  />
                  <NavBtn
                    label="Payments"
                    icon="card-outline"
                    screen="Payments"
                  />
                  <NavBtn
                    label="Products"
                    icon="cube-outline"
                    screen="Products"
                  />
                  <NavBtn
                    label="Announcements"
                    icon="megaphone-outline"
                    screen="Announcements"
                  />
                  <NavBtn
                    label="Requests"
                    icon="clipboard-outline"
                    screen="Requests"
                  />
                </View>
              </ScrollView>

              <View style={styles.kpiRow}>
                <KPI label="Subscriptions" value={systemStats.totalSubs} />
                <KPI label="Active Subs" value={systemStats.activeSubs} />
                <KPI label="Expired" value={systemStats.expiredSubs} />
                <KPI label="Payments" value={systemStats.totalPayments} />
              </View>

              <View style={styles.kpiRow}>
                <KPI label="Total Jobs" value={requestStats.total} />
                <KPI label="Pending" value={requestStats.pending} />
                <KPI label="In Progress" value={requestStats.inProgress} />
                <KPI label="Needs Assignment" value={requestStats.unassigned} />
              </View>

              <View style={styles.filters}>
                {["All", "pending", "in-progress", "completed"].map((f) => {
                  const active =
                    (f === "All" && !statusFilter) || statusFilter === f;

                  return (
                    <Pressable
                      key={f}
                      onPress={() => setStatusFilter(f === "All" ? null : f)}
                      style={[styles.filterBtn, active && styles.activeFilter]}
                    >
                      <Text style={{ color: active ? "#fff" : "#9ca3af" }}>
                        {f}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("RequestDetail", {
                id: item.id,
              })
            }
            style={[
              styles.card,
              !item.assignment && styles.unassignedCard,
              { marginHorizontal: 16 },
            ]}
          >
            {/* HEADER */}
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) + "22" },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {item.status.toUpperCase()}
                </Text>
              </View>

              <Text style={styles.dateText}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>

            {/* COMPANY */}
            <View style={styles.companySection}>
              <Image
                source={{
                  uri: item.company?.logoUrl
                    ? `${api.defaults.baseURL}/uploads/companies/${item.company.logoUrl}`
                    : "https://placehold.co/60x60",
                }}
                style={styles.companyLogo}
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.companyName}>{item.company?.name}</Text>

                <Text style={styles.companyMeta}>{item.equipment?.name}</Text>

                {!!item.location && (
                  <Text style={styles.companyLocation}>{item.location}</Text>
                )}
              </View>
            </View>

            {/* CUSTOMER ISSUE */}
            <View style={styles.issueCard}>
              <Text style={styles.sectionLabel}>Customer Issue</Text>

              <Text style={styles.issueText} numberOfLines={3}>
                {item.description}
              </Text>
            </View>

            {/* TECHNICIAN - NOW ON THE RIGHT */}
            <View style={styles.techSection}>
              <View style={styles.techRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionLabel}>Technician</Text>
                  {item.assignment ? (
                    <>
                      <Text style={styles.techName}>
                        {item.assignment.technician?.name}
                      </Text>
                      <Text style={styles.techRole}>
                        {item.assignment.technician?.role || "Technician"}
                      </Text>
                    </>
                  ) : (
                    <View style={styles.unassignedBox}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={18}
                        color="#f59e0b"
                      />
                      <Text style={styles.unassignedText}>Not assigned</Text>
                    </View>
                  )}
                </View>

                {item.assignment ? (
                  <Image
                    source={{
                      uri: item.assignment?.technician?.profileImage
                        ? `${api.defaults.baseURL}/uploads/users/${item.assignment.technician.profileImage}`
                        : "https://placehold.co/80x80",
                    }}
                    style={styles.techAvatar}
                  />
                ) : (
                  <View style={styles.techAvatarFallback}>
                    <Ionicons name="person-outline" size={24} color="#64748b" />
                  </View>
                )}
              </View>
            </View>

            {/* ACTIONS - STACKED IN ONE COLUMN */}
            {/* ACTIONS - HORIZONTAL ROW */}
            <View style={styles.footer}>
              <Pressable
                style={styles.viewBtn}
                onPress={() =>
                  navigation.navigate("RequestDetail", {
                    id: item.id,
                  })
                }
              >
                <Ionicons name="eye-outline" size={18} color="#fff" />
                <Text style={styles.viewBtnText}>View</Text>
              </Pressable>

              {!item.assignment ? (
                <>
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() =>
                      navigation.navigate("TechnicianWorkload", {
                        requestId: item.id,
                      })
                    }
                  >
                    <Ionicons
                      name="person-add-outline"
                      size={18}
                      color="#fff"
                    />
                    <Text style={styles.actionBtnText}>Assign</Text>
                  </Pressable>

                  <Pressable
                    style={styles.autoBtn}
                    onPress={() =>
                      Alert.alert(
                        "Auto Assign",
                        "Assign to the least busy technician?",
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Confirm",
                            onPress: () => autoAssign(item.id),
                          },
                        ],
                      )
                    }
                  >
                    <Ionicons name="flash-outline" size={18} color="#22c55e" />
                    <Text style={styles.autoBtnText}>Auto</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable
                  style={styles.actionBtn}
                  onPress={() =>
                    navigation.navigate("TechnicianWorkload", {
                      requestId: item.id,
                    })
                  }
                >
                  <Ionicons
                    name="swap-horizontal-outline"
                    size={18}
                    color="#fff"
                  />
                  <Text style={styles.actionBtnText}>Reassign</Text>
                </Pressable>
              )}
            </View>
          </Pressable>
        )}
        ListFooterComponent={
          requests.length === 0 ? (
            <View style={styles.noDataCard}>
              <Ionicons name="alert-circle-outline" size={26} color="#7c3aed" />
              <Text style={styles.noDataTitle}>No Requests Yet</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

/* COMPONENTS */

const KPI = ({ label, value }: any) => {
  const getColor = () => {
    if (label.includes("Active")) return "#10b981";
    if (label.includes("Expired")) return "#ef4444";
    if (label.includes("Payments")) return "#38bdf8";
    if (label.includes("Pending")) return "#f59e0b";
    if (label.includes("Progress")) return "#60a5fa";
    return "#7c3aed";
  };

  return (
    <View style={[styles.kpiCard, { borderColor: getColor() }]}>
      <Text style={[styles.kpiValue, { color: getColor() }]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
};

const NavBtn = ({ label, icon, screen }: any) => {
  const navigation = useNavigation<any>();

  return (
    <Pressable
      style={styles.navBtn}
      onPress={() => navigation.navigate(screen)}
    >
      <Ionicons name={icon} size={16} color="#fff" />
      <Text style={styles.navText}>{label}</Text>
    </Pressable>
  );
};

const getStatusColor = (status: string) => {
  if (status === "pending") return "#facc15";
  if (status === "in-progress") return "#60a5fa";
  if (status === "completed") return "#10b981";
  return "#9ca3af";
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },

  title: { color: "#fff", fontSize: 24, fontWeight: "700" },
  subtitle: { color: "#9ca3af", marginBottom: 12 },

  sectionTitle: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 16,
    marginBottom: 8,
  },

  noDataCard: {
    marginTop: 20,
    backgroundColor: "#0f172a",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    alignItems: "center",
  },

  noDataTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    marginTop: 8,
  },

  noDataText: {
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 6,
    fontSize: 12,
  },

  noDataHint: {
    color: "#6b7280",
    marginTop: 8,
    fontSize: 11,
  },

  quickNavScroll: {
    flexDirection: "row",
    marginBottom: 10,
  },

  navBtn: {
    backgroundColor: "#0f172a",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginRight: 10,
  },

  navText: { color: "#fff", fontSize: 13 },

  kpiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  kpiCard: {
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 14,
    width: "23%",
    alignItems: "center",
    borderWidth: 1,
  },

  kpiValue: { fontSize: 18, fontWeight: "700" },
  kpiLabel: { color: "#9ca3af", fontSize: 11, textAlign: "center" },

  filters: { flexDirection: "row", marginBottom: 16 },

  filterBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#111827",
    marginRight: 8,
  },

  activeFilter: { backgroundColor: "#7c3aed" },

  /* ============================================
     ENHANCED CARD STYLES
  ============================================ */

  card: {
    backgroundColor: "#111827",
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
    overflow: "hidden",
    // Subtle shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  unassignedCard: {
    borderColor: "#ef4444",
    shadowColor: "#ef4444",
    shadowOpacity: 0.15,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },

  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  dateText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "500",
  },

  /* COMPANY */

  companySection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 18,
  },

  companyLogo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#1e293b",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },

  companyName: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  companyMeta: {
    color: "#94a3b8",
    marginTop: 3,
    fontSize: 13,
  },

  companyLocation: {
    color: "#64748b",
    marginTop: 3,
    fontSize: 12,
  },

  /* ISSUE */

  issueCard: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  issueText: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 22,
  },

  /* TECHNICIAN - RIGHT ALIGNED */

  techSection: {
    paddingHorizontal: 20,
    paddingBottom: 18,
  },

  techRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  techAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1e293b",
    borderWidth: 2,
    borderColor: "#334155",
  },

  techAvatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1e293b",
    borderWidth: 2,
    borderColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
  },

  techName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  techRole: {
    color: "#94a3b8",
    marginTop: 2,
    fontSize: 12,
  },

  unassignedBox: {
    flexDirection: "row",
    alignItems: "center",
  },

  unassignedText: {
    color: "#f59e0b",
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 13,
  },

  /* ACTIONS - STACKED COLUMN */

  footer: {
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    padding: 20,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  viewBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    flex: 1,
  },

  viewBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  actionBtn: {
    backgroundColor: "#7c3aed",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    flex: 1,
  },

  actionBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  autoBtn: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#22c55e",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    flex: 1,
  },

  autoBtnText: {
    color: "#22c55e",
    fontWeight: "700",
    fontSize: 13,
  },
  sectionLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  desc: { color: "#fff", fontWeight: "600" },
  meta: { color: "#9ca3af", marginTop: 4 },

  actions: { flexDirection: "row", marginTop: 12, gap: 8 },

  primaryBtn: {
    backgroundColor: "#7c3aed",
    padding: 10,
    borderRadius: 10,
  },

  secondaryBtn: {
    backgroundColor: "#1f2937",
    padding: 10,
    borderRadius: 10,
  },

  workloadBtn: {
    marginTop: 20,
    backgroundColor: "#7c3aed",
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
});
