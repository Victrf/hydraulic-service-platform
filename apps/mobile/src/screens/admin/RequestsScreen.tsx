import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  TextInput,
  RefreshControl,
  Image,
  ScrollView,
  ImageBackground,
  Dimensions,
} from "react-native";
import { useState, useCallback, useRef, useEffect } from "react";
import { api } from "../../api/client";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { socket } from "../../services/socket";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function RequestsScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  const navigation = useNavigation<any>();
  const flatListRef = useRef<FlatList>(null);

  const load = async () => {
    try {
      setLoading(true);
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

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  useEffect(() => {
    const refreshRequests = (data: any) => {
      console.log("🔥 request.updated received", data);
      load();
    };

    socket.on("request.created", refreshRequests);
    socket.on("request.updated", refreshRequests);
    socket.on("request.assigned", refreshRequests);
    socket.on("request.accepted", refreshRequests);
    socket.on("request.in-progress", refreshRequests);
    socket.on("request.completed", refreshRequests);

    return () => {
      socket.off("request.created", refreshRequests);
      socket.off("request.updated", refreshRequests);
      socket.off("request.assigned", refreshRequests);
      socket.off("request.accepted", refreshRequests);
      socket.off("request.in-progress", refreshRequests);
      socket.off("request.completed", refreshRequests);
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [filter]);

  const filteredByStatus =
    filter === "all"
      ? requests
      : requests.filter((r) => {
          switch (filter) {
            case "pending":
              return r.status === "pending" && !r.assignment;
            case "assigned":
              return r.status === "pending" && !!r.assignment;
            case "accepted":
              return r.status === "accepted";
            case "in-progress":
              return r.status === "in-progress";
            case "completed":
              return r.status === "completed";
            default:
              return true;
          }
        });

  const searchedRequests = filteredByStatus.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.description?.toLowerCase().includes(q) ||
      r.company?.name?.toLowerCase().includes(q) ||
      r.equipment?.name?.toLowerCase().includes(q)
    );
  });

  const filteredRequests = [...searchedRequests].sort((a, b) => {
    const aUnassigned = !a.assignment?.technician;
    const bUnassigned = !b.assignment?.technician;
    return aUnassigned === bUnassigned ? 0 : aUnassigned ? -1 : 1;
  });

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending" && !r.assignment)
      .length,
    assigned: requests.filter((r) => r.status === "pending" && r.assignment)
      .length,
    accepted: requests.filter((r) => r.status === "accepted").length,
    "in-progress": requests.filter((r) => r.status === "in-progress").length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

  const getDisplayStatus = (item: any) => {
    if (item.status === "pending" && !item.assignment) return "Pending";
    if (item.status === "pending" && item.assignment) return "Assigned";
    if (item.status === "accepted") return "Accepted";
    if (item.status === "in-progress") return "In Progress";
    if (item.status === "completed") return "Completed";
    return item.status;
  };

  const getStatusColor = (item: any) => {
    if (item.status === "pending" && !item.assignment) return "#f59e0b";
    if (item.status === "pending" && item.assignment) return "#eab308";
    if (item.status === "accepted") return "#7c3aed";
    if (item.status === "in-progress") return "#3b82f6";
    if (item.status === "completed") return "#22c55e";
    return "#64748b";
  };

  const getStatusIcon = (item: any) => {
    if (item.status === "pending" && !item.assignment) return "time-outline";
    if (item.status === "pending" && item.assignment) return "person-outline";
    if (item.status === "accepted") return "checkmark-circle-outline";
    if (item.status === "in-progress") return "hammer-outline";
    if (item.status === "completed") return "shield-checkmark-outline";
    return "help-circle-outline";
  };

  const getTechnicianMessage = (item: any) => {
    if (!item.assignment) return "Awaiting technician assignment";
    switch (item.status) {
      case "pending":
        return "Awaiting acceptance";
      case "accepted":
        return "Job accepted";
      case "in-progress":
        return "Working on request";
      case "completed":
        return "Work completed";
      default:
        return "";
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getAvatar = (technician: any) => {
    if (!technician?.profileImage) return null;
    return `${api.defaults.baseURL}/uploads/users/${technician.profileImage}`;
  };

  const getActionLabel = (item: any) => {
    if (item.status === "completed") return "View Report";
    if (!item.assignment) return "Assign";
    return "Reassign";
  };

  const handleAction = async (item: any) => {
    if (item.status === "completed") {
      const res = await api.get(`/reports/request/${item.id}`);
      navigation.navigate("ReportDetails", {
        reportId: res.data.id,
      });
      return;
    }
    navigation.navigate("AssignTechnician", {
      requestId: item.id,
    });
  };

  if (loading) {
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
        <FlatList
          ref={flatListRef}
          data={filteredRequests}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={{ paddingHorizontal: 16, paddingTop: 50 }}>
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
                    size={20}
                    color="#fff"
                  />
                </Pressable>
              </View>

              {/* SEARCH */}
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color="#94a3b8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search requests..."
                  placeholderTextColor="#64748b"
                  value={search}
                  onChangeText={setSearch}
                />
                {!!search && (
                  <Pressable onPress={() => setSearch("")}>
                    <Ionicons name="close-circle" size={18} color="#64748b" />
                  </Pressable>
                )}
              </View>

              {/* STATS */}
              <View style={styles.statsRow}>
                <StatCard value={counts.all} label="Total" color="#7c3aed" />
                <StatCard
                  value={counts.pending}
                  label="Pending"
                  color="#f59e0b"
                />
                <StatCard
                  value={counts.accepted}
                  label="Accepted"
                  color="#3b82f6"
                />
                <StatCard
                  value={counts.completed}
                  label="Done"
                  color="#22c55e"
                />
              </View>

              {/* FILTERS */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 18 }}
              >
                {[
                  "all",
                  "pending",
                  "assigned",
                  "accepted",
                  "in-progress",
                  "completed",
                ].map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => setFilter(item)}
                    style={[
                      styles.filterChip,
                      filter === item && styles.activeFilterChip,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        filter === item && styles.activeFilterText,
                      ]}
                    >
                      {item.charAt(0).toUpperCase() +
                        item.slice(1).replace("-", " ")}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={60} color="#475569" />
              <Text style={styles.emptyTitle}>No Requests Found</Text>
              <Text style={styles.emptyText}>
                There are currently no matching requests.
              </Text>
            </View>
          )}
          renderItem={({ item }) => {
            const technician = item.assignment?.technician;
            const avatar = getAvatar(technician);
            const statusColor = getStatusColor(item);

            return viewMode === "card" ? (
              <Pressable
                style={styles.requestCard}
                onPress={() =>
                  navigation.navigate("RequestDetail", { id: item.id })
                }
              >
                {/* Top accent line */}
                <View
                  style={[styles.cardAccent, { backgroundColor: statusColor }]}
                />

                <View style={styles.cardContent}>
                  {/* HEADER ROW */}
                  <View style={styles.cardTopRow}>
                    <View
                      style={[
                        styles.statusPill,
                        { backgroundColor: statusColor + "20" },
                      ]}
                    >
                      <Ionicons
                        name={getStatusIcon(item) as any}
                        size={12}
                        color={statusColor}
                      />
                      <Text
                        style={[styles.statusPillText, { color: statusColor }]}
                      >
                        {getDisplayStatus(item)}
                      </Text>
                    </View>
                    <Text style={styles.dateText}>
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </View>

                  {/* DESCRIPTION */}
                  <Text numberOfLines={2} style={styles.requestTitle}>
                    {item.description}
                  </Text>

                  {/* COMPANY & EQUIPMENT */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <View
                        style={[
                          styles.metaIconBox,
                          { backgroundColor: "rgba(124, 58, 237, 0.15)" },
                        ]}
                      >
                        <Ionicons
                          name="business-outline"
                          size={14}
                          color="#a78bfa"
                        />
                      </View>
                      <Text style={styles.metaText} numberOfLines={1}>
                        {item.company?.name}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <View
                        style={[
                          styles.metaIconBox,
                          { backgroundColor: "rgba(59, 130, 246, 0.15)" },
                        ]}
                      >
                        <Ionicons
                          name="construct-outline"
                          size={14}
                          color="#60a5fa"
                        />
                      </View>
                      <Text style={styles.metaText} numberOfLines={1}>
                        {item.equipment?.name}
                      </Text>
                    </View>
                  </View>

                  {/* DIVIDER */}
                  <View style={styles.cardDivider} />

                  {/* BOTTOM ROW: TECH + ACTION */}
                  <View style={styles.cardBottomRow}>
                    <View style={styles.techInfo}>
                      {avatar ? (
                        <Image
                          source={{ uri: avatar }}
                          style={styles.techAvatar}
                        />
                      ) : (
                        <View
                          style={[styles.techAvatar, styles.techAvatarFallback]}
                        >
                          <Text style={styles.techAvatarText}>
                            {getInitials(technician?.name)}
                          </Text>
                        </View>
                      )}
                      <View>
                        <Text style={styles.techName}>
                          {technician?.name ?? "Unassigned"}
                        </Text>
                        <Text style={styles.techStatus}>
                          {getTechnicianMessage(item)}
                        </Text>
                      </View>
                    </View>

                    <Pressable
                      style={[
                        styles.actionBtn,
                        { backgroundColor: statusColor },
                      ]}
                      onPress={() => handleAction(item)}
                    >
                      <Text style={styles.actionBtnText}>
                        {getActionLabel(item)}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ) : (
              <View style={styles.tableRow}>
                <Text style={styles.cell}>{item.description}</Text>
                <Text style={styles.cell}>{item.company?.name}</Text>
                <Text style={styles.cell}>{getDisplayStatus(item)}</Text>
                <Text style={styles.cell}>
                  {technician?.name ?? "Unassigned"}
                </Text>
              </View>
            );
          }}
        />
      </View>
    </ImageBackground>
  );
}

/* SUB-COMPONENTS */

const StatCard = ({ value, label, color }: any) => (
  <View style={[styles.statCard, { borderColor: color + "30" }]}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

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

  /* LOADING / EMPTY */
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },

  /* HEADER */
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 4,
    color: "#94a3b8",
    fontSize: 13,
  },
  toggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.5)",
  },

  /* SEARCH */
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.5)",
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: "#fff",
    fontSize: 15,
  },

  /* STATS */
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.5)",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
  },
  statLabel: {
    marginTop: 4,
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "500",
  },

  /* FILTERS */
  filterChip: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(17, 24, 39, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.4)",
    marginRight: 10,
  },
  activeFilterChip: {
    backgroundColor: "#7c3aed",
    borderColor: "#7c3aed",
  },
  filterText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
  },
  activeFilterText: {
    color: "#fff",
  },

  /* TABLE VIEW */
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(30, 41, 59, 0.3)",
  },
  cell: {
    flex: 1,
    color: "#fff",
    fontSize: 12,
  },

  /* REQUEST CARDS */
  requestCard: {
    backgroundColor: "rgba(17, 24, 39, 0.55)",
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.4)",
    overflow: "hidden",
  },
  cardAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  cardContent: {
    padding: 18,
    paddingLeft: 23,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  dateText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "500",
  },
  requestTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 24,
    marginBottom: 14,
  },

  /* META ROW */
  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  metaIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  metaText: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },

  /* CARD DIVIDER */
  cardDivider: {
    height: 1,
    backgroundColor: "rgba(30, 41, 59, 0.4)",
    marginVertical: 14,
  },

  /* BOTTOM ROW */
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  techInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  techAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(51, 65, 85, 0.5)",
  },
  techAvatarFallback: {
    backgroundColor: "#7c3aed",
    justifyContent: "center",
    alignItems: "center",
  },
  techAvatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  techName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  techStatus: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },

  /* ACTION BUTTON */
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
