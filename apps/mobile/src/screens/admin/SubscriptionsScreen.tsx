import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  TextInput,
} from "react-native";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function SubscriptionsScreen() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  const navigation = useNavigation<any>();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await api.get("/subscriptions");
      const data = res.data || [];

      // 🔥 SORT (worst first)
      const sorted = data.sort((a: any, b: any) => {
        const aRisk =
          !a.payments?.length ||
          new Date(a.currentPeriodEnd) < new Date() ||
          new Date(a.nextVisitDate) < new Date();

        const bRisk =
          !b.payments?.length ||
          new Date(b.currentPeriodEnd) < new Date() ||
          new Date(b.nextVisitDate) < new Date();

        return aRisk === bRisk ? 0 : aRisk ? -1 : 1;
      });

      setSubs(sorted);
    } catch (err) {
      console.log(err);
      setSubs([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 SEARCH
  const filteredSubs = subs.filter((s) => {
    const q = search.toLowerCase();

    return (
      s.company?.name?.toLowerCase().includes(q) ||
      s.plan?.name?.toLowerCase().includes(q)
    );
  });

  const active = subs.filter((s) => s.status === "active").length;
  const expired = subs.filter((s) => s.status === "expired").length;

  const atRiskCount = subs.filter((s) => {
    return (
      !s.payments?.length ||
      new Date(s.currentPeriodEnd) < new Date() ||
      new Date(s.nextVisitDate) < new Date()
    );
  }).length;

  const overdueCount = subs.filter(
    (s) => new Date(s.nextVisitDate) < new Date(),
  ).length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Subscriptions</Text>
          <Text style={styles.subtitle}>
            Manage company maintenance plans
          </Text>
        </View>

        <Pressable
          style={styles.toggleBtn}
          onPress={() =>
            setViewMode((prev) => (prev === "card" ? "table" : "card"))
          }
        >
          <Ionicons
            name={viewMode === "card" ? "grid-outline" : "list-outline"}
            size={18}
            color="#fff"
          />
        </Pressable>
      </View>

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color="#9ca3af" />

        <TextInput
          placeholder="Search company or plan..."
          placeholderTextColor="#6b7280"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />

        {search ? (
          <Pressable onPress={() => setSearch("")}>
            <Ionicons name="close" size={16} color="#9ca3af" />
          </Pressable>
        ) : null}
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{subs.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{expired}</Text>
          <Text style={styles.statLabel}>Expired</Text>
        </View>
      </View>

      {/* HEALTH */}
      <View style={styles.healthRow}>
        <View style={styles.healthCard}>
          <Text style={styles.healthValue}>{atRiskCount}</Text>
          <Text style={styles.healthLabel}>At Risk</Text>
        </View>

        <View style={styles.healthCard}>
          <Text style={styles.healthValue}>{overdueCount}</Text>
          <Text style={styles.healthLabel}>Overdue</Text>
        </View>
      </View>

      {/* TABLE HEADER */}
      {viewMode === "table" && (
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>Company</Text>
          <Text style={styles.headerCell}>Plan</Text>
          <Text style={styles.headerCell}>Status</Text>
          <Text style={styles.headerCell}>Expiry</Text>
        </View>
      )}

      <FlatList
        data={filteredSubs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const payments = item.payments || [];
          const lastPayment = payments.length > 0 ? payments[0] : null;

          const isPaymentRisk =
            !lastPayment || new Date(item.currentPeriodEnd) < new Date();

          const isVisitOverdue = new Date(item.nextVisitDate) < new Date();

          const isAtRisk = isPaymentRisk || isVisitOverdue;

          return viewMode === "card" ? (
            <Pressable
              onPress={() =>
                navigation.navigate("SubscriptionDetail", {
                  subscription: item,
                })
              }
              style={({ pressed }) => [
                styles.card,
                pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
              ]}
            >
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.company}>{item.company?.name}</Text>
                  <Text style={styles.plan}>{item.plan?.name}</Text>
                </View>

                <View style={styles.statusWrap}>
                  {isAtRisk && (
                    <Ionicons
                      name={
                        isVisitOverdue
                          ? "time-outline"
                          : "warning-outline"
                      }
                      size={16}
                      color="#ef4444"
                      style={{ marginRight: 6 }}
                    />
                  )}

                  <View
                    style={[
                      styles.badge,
                      isAtRisk
                        ? styles.risk
                        : item.status === "active"
                        ? styles.active
                        : item.status === "expired"
                        ? styles.expired
                        : styles.cancelled,
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {isAtRisk
                        ? isVisitOverdue
                          ? "overdue"
                          : "at risk"
                        : item.status}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.meta}>
                Next Visit:{" "}
                {new Date(item.nextVisitDate).toLocaleDateString()}
              </Text>

              <Text style={styles.meta}>
                Expiry:{" "}
                {new Date(item.currentPeriodEnd).toLocaleDateString()}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.tableRow}>
              <Text style={styles.cell}>{item.company?.name}</Text>
              <Text style={styles.cell}>{item.plan?.name}</Text>
              <Text style={styles.cell}>{item.status}</Text>
              <Text style={styles.cell}>
                {new Date(item.currentPeriodEnd).toLocaleDateString()}
              </Text>
            </View>
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
    padding: 16,
    paddingTop: 50,
  },

  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },

  subtitle: {
    color: "#9ca3af",
    marginBottom: 16,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  statValue: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },

  statLabel: {
    color: "#6b7280",
    fontSize: 11,
  },

  healthRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },

  healthCard: {
    flex: 1,
    backgroundColor: "#1e1b4b",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#312e81",
  },

  healthValue: {
    color: "#fff",
    fontWeight: "700",
  },

  healthLabel: {
    color: "#a78bfa",
    fontSize: 11,
  },

  card: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  statusWrap: {
    flexDirection: "row",
    alignItems: "center",
  },

  company: {
    color: "#fff",
    fontWeight: "600",
  },

  plan: {
    color: "#6b7280",
    fontSize: 12,
  },

  meta: {
    color: "#9ca3af",
    fontSize: 12,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  active: {
    backgroundColor: "#1e1b4b",
  },

  expired: {
    backgroundColor: "#3f1d1d",
  },

  cancelled: {
    backgroundColor: "#374151",
  },

  risk: {
    backgroundColor: "#3f1d1d",
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    textTransform: "capitalize",
  },

  headerRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

toggleBtn: {
  backgroundColor: "#334155",
  padding: 10,
  borderRadius: 12,
},

searchBox: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#0f172a",
  borderRadius: 12,
  paddingHorizontal: 10,
  paddingVertical: 8,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: "#1e293b",
},

searchInput: {
  flex: 1,
  marginLeft: 8,
  color: "#fff",
},

tableHeader: {
  flexDirection: "row",
  borderBottomWidth: 1,
  borderColor: "#1e293b",
  marginBottom: 6,
},

headerCell: {
  flex: 1,
  color: "#6b7280",
  fontSize: 12,
},

tableRow: {
  flexDirection: "row",
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderColor: "#1e293b",
},

cell: {
  flex: 1,
  color: "#fff",
  fontSize: 12,
},

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyCard: {
    width: "100%",
    backgroundColor: "#0f172a",
    borderRadius: 22,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e293b",
    overflow: "hidden",
  },

  glow: {
    position: "absolute",
    width: 200,
    height: 200,
    backgroundColor: "#7c3aed",
    opacity: 0.15,
    borderRadius: 100,
    top: -60,
  },

  iconWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#1e1b4b",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
  },

  flowBox: {
    marginTop: 16,
    backgroundColor: "#020617",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  flowText: {
    color: "#7c3aed",
    fontSize: 12,
    fontWeight: "500",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
