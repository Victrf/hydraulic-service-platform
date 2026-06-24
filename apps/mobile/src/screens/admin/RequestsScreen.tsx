import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  TextInput,
  RefreshControl,
} from "react-native";
import { useState, useCallback } from "react";
import { api } from "../../api/client";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

export default function RequestsScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  const navigation = useNavigation<any>();

  // ✅ LOAD DATA
  const load = async () => {
    try {
      const res = await api.get("/service-requests");

      const result = res.data;
      const list = Array.isArray(result) ? result : result.data;

      setRequests(list || []);
    } catch (err: any) {
      console.log("ADMIN REQUEST ERROR:", err?.response?.data || err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ AUTO REFRESH ON SCREEN FOCUS
  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  // ✅ PULL TO REFRESH
  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  // ✅ FILTER
  const base =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

  // ✅ SEARCH
  const searched = base.filter((r) => {
    const q = search.toLowerCase();

    return (
      r.description?.toLowerCase().includes(q) ||
      r.company?.name?.toLowerCase().includes(q) ||
      r.equipment?.name?.toLowerCase().includes(q)
    );
  });

  // ✅ SAFE SORT (no mutation)
  const filteredRequests = [...searched].sort((a, b) => {
    const aUnassigned = !a.assignment?.technician;
    const bUnassigned = !b.assignment?.technician;
    return aUnassigned === bUnassigned ? 0 : aUnassigned ? -1 : 1;
  });

  // ✅ STATS
  const counts: any = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    "in-progress": requests.filter((r) => r.status === "in-progress").length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

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
          <Text style={styles.title}>Service Requests</Text>
          <Text style={styles.subtitle}>
            Monitor and manage maintenance requests
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
          placeholder="Search requests..."
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
          <Text style={styles.statValue}>{counts.all}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{counts.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{counts.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* FILTER */}
      <View style={styles.tabs}>
        {["all", "pending", "in-progress", "completed"].map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setFilter(tab)}
            style={[styles.tab, filter === tab && styles.activeTab]}
          >
            <Text
              style={[styles.tabText, filter === tab && styles.activeTabText]}
            >
              {tab} ({counts[tab]})
            </Text>
          </Pressable>
        ))}
      </View>

      {/* TABLE HEADER */}
      {viewMode === "table" && (
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>Request</Text>
          <Text style={styles.headerCell}>Company</Text>
          <Text style={styles.headerCell}>Status</Text>
          <Text style={styles.headerCell}>Tech</Text>
        </View>
      )}

      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.center}>
            <Text style={{ color: "#6b7280" }}>No requests found</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const technician = item.assignment?.technician;
          const isUnassigned = !technician;

          return viewMode === "card" ? (
            <Pressable
              onPress={() =>
                navigation.navigate("RequestDetail", { id: item.id })
              }
              style={[styles.card, isUnassigned && styles.unassignedCard]}
            >
              <View style={styles.topGlow} />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.titleText}>
                    {item.description || "No description"}
                  </Text>
                  <Text style={styles.meta}>
                    {item.company?.name} • {item.equipment?.name}
                  </Text>
                </View>

                <View
                  style={[
                    styles.badge,
                    item.status === "completed"
                      ? styles.completed
                      : item.status === "in-progress"
                        ? styles.progress
                        : styles.pending,
                  ]}
                >
                  <Text style={styles.badgeText}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons
                  name={
                    isUnassigned ? "alert-circle-outline" : "person-outline"
                  }
                  size={14}
                  color={isUnassigned ? "#ef4444" : "#6b7280"}
                />
                <Text
                  style={[
                    styles.infoText,
                    isUnassigned && { color: "#ef4444" },
                  ]}
                >
                  {isUnassigned
                    ? "Unassigned (needs action)"
                    : technician?.name}
                </Text>
              </View>

              <Text style={styles.date}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.tableRow}>
              <Text style={styles.cell}>{item.description}</Text>
              <Text style={styles.cell}>{item.company?.name}</Text>
              <Text style={styles.cell}>{item.status}</Text>
              <Text style={styles.cell}>
                {technician?.name || "Unassigned"}
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
    marginBottom: 20,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#0b1220",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2d37fd",
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

  tabs: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },

  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#0b1220",
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  activeTab: {
    backgroundColor: "#7c3aed",
    borderColor: "#7c3aed",
  },

  tabText: {
    color: "#6b7280",
    fontSize: 12,
    textTransform: "capitalize",
  },

  activeTabText: {
    color: "#fff",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#0b1220",
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    overflow: "hidden",
  },

  topGlow: {
    position: "absolute",
    height: 3,
    width: "100%",
    backgroundColor: "#7c3aed",
    top: 0,
    left: 0,
    opacity: 0.6,
  },

  unassignedCard: {
    borderColor: "#ef4444",
    backgroundColor: "#1a0f0f",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  titleText: {
    color: "#fff",
    fontWeight: "600",
  },

  meta: {
    color: "#6b7280",
    fontSize: 12,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  pending: {
    backgroundColor: "#3f1d1d",
    borderWidth: 1,
    borderColor: "#ef4444",
  },

  progress: {
    backgroundColor: "#1e3a8a",
    borderWidth: 1,
    borderColor: "#3b82f6",
  },

  completed: {
    backgroundColor: "#14532d",
    borderWidth: 1,
    borderColor: "#22c55e",
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    textTransform: "capitalize",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  infoText: {
    color: "#9ca3af",
    marginLeft: 6,
    fontSize: 12,
  },

  date: {
    marginTop: 8,
    color: "#6b7280",
    fontSize: 11,
  },

  divider: {
    height: 1,
    backgroundColor: "#1e293b",
    marginTop: 12,
    opacity: 0.4,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyCard: {
    width: "100%",
    backgroundColor: "#0b1220",
    padding: 28,
    borderRadius: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e293b",
    overflow: "hidden",
  },

  glow: {
    position: "absolute",
    width: 220,
    height: 220,
    backgroundColor: "#7c3aed",
    opacity: 0.12,
    borderRadius: 120,
    top: -80,
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
  },

  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
    fontSize: 13,
  },

  flowBox: {
    marginTop: 14,
    backgroundColor: "#020617",
    padding: 10,
    borderRadius: 12,
  },

  flowText: {
    color: "#7c3aed",
    fontSize: 12,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  toggleBtn: {
    backgroundColor: "#334155",
    padding: 10,
    borderRadius: 12,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0b1220",
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
    paddingBottom: 6,
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

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
