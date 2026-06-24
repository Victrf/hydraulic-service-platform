import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { api } from "../../api/client";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native"; // ✅ added useRoute
import { Ionicons } from "@expo/vector-icons";

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
  const route = useRoute<any>(); // ✅ added

  useEffect(() => {
    loadSystemStats();
    loadRequestStats();
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

      navigation.setParams({ refresh: undefined }); // ✅ fix
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

      if (Array.isArray(message)) message = message[0]; // ✅ safe fix

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
          <View
            style={[
              styles.card,
              !item.assignment && styles.unassignedCard,
              { marginHorizontal: 16 },
            ]}
          >
            <Text style={styles.desc}>{item.description}</Text>

            <Text style={styles.meta}>
              {item.company?.name} • {item.equipment?.name}
            </Text>

            <Text
              style={[styles.status, { color: getStatusColor(item.status) }]}
            >
              Status: {item.status}
            </Text>

            <Text style={styles.meta}>
              {item.assignment
                ? `Assigned to ${item.assignment.technician?.name}`
                : "⚠ Unassigned"}
            </Text>

            <View style={styles.actions}>
              {!item.assignment ? (
                <>
                  <Pressable
                    style={styles.primaryBtn}
                    onPress={() =>
                      navigation.navigate("TechnicianWorkload", {
                        requestId: item.id,
                      })
                    }
                  >
                    <Text style={{ color: "#fff" }}>Assign</Text>
                  </Pressable>

                  <Pressable
                    style={styles.secondaryBtn}
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
                    <Text style={{ color: "#22c55e" }}>Auto</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable
                  style={styles.primaryBtn}
                  onPress={() =>
                    Alert.alert(
                      "Reassign Technician",
                      "Change the assigned technician?",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Continue",
                          onPress: () =>
                            navigation.navigate("TechnicianWorkload", {
                              requestId: item.id,
                            }),
                        },
                      ],
                    )
                  }
                >
                  <Text style={{ color: "#fff" }}>Reassign</Text>
                </Pressable>
              )}

              {item.status === "pending" && (
                <Pressable
                  style={styles.secondaryBtn}
                  onPress={() => updateStatus(item.id, "in-progress")}
                >
                  <Text style={{ color: "#60a5fa" }}>Start</Text>
                </Pressable>
              )}

              {item.status === "in-progress" && (
                <Pressable
                  style={styles.secondaryBtn}
                  onPress={() => updateStatus(item.id, "completed")}
                >
                  <Text style={{ color: "#10b981" }}>Complete</Text>
                </Pressable>
              )}
            </View>
          </View>
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

  card: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  unassignedCard: {
    borderColor: "#ef4444",
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
