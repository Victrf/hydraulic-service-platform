import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Animated,
  Easing,
} from "react-native";
import { useState, useCallback, useEffect } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { useNotificationStore } from "../../store/notificationStore";
import { socket } from "../../services/socket";
import { api } from "../../api/client";
import { Ionicons } from "@expo/vector-icons";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MyRequests"
>;

export default function MyRequestsScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState<"active" | "completed" | "history">(
    "active",
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ✅ NEW: animation
  const pulse = useState(new Animated.Value(1))[0];

  const navigation = useNavigation<NavigationProp>();
  const addUpdate = useNotificationStore((state) => state.addUpdate);
  const clearTab = useNotificationStore((state) => state.clearTab);

  const activeCount = useNotificationStore((state) => state.activeCount());
  const completedCount = useNotificationStore((state) =>
    state.completedCount(),
  );
  const historyCount = useNotificationStore((state) => state.historyCount());

  const loadRequests = async (selectedView = view) => {
    try {
      setLoading(true);
      const res = await api.get(`/service-requests/my?view=${selectedView}`);
      setRequests(res?.data?.data || []);
    } catch (e: any) {
      console.log("REQUEST LOAD ERROR:", e?.response?.data || e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleRequestUpdated = (request: any) => {
      loadRequests(view);

      if (request.status === "completed") {
        addUpdate(request.id, "completed");
      } else {
        addUpdate(request.id, "active");
      }
    };

    socket.on("request.updated", handleRequestUpdated);

    return () => {
      socket.off("request.updated", handleRequestUpdated);
    };
  }, [view]);

  useFocusEffect(
    useCallback(() => {
      loadRequests(view);

      // ✅ START PULSE LOOP
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.05,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }, [view]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests(view);
    setRefreshing(false);
  };

  const handleChangeView = (newView: typeof view) => {
    setView(newView);

    clearTab(newView);
  };

  const openDeleteModal = (id: string) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setSelectedId(null);
    setShowDeleteModal(false);
  };

  const confirmDelete = async () => {
    if (!selectedId) return;

    try {
      await api.patch(`/service-requests/${selectedId}/hide`);
      closeDeleteModal();
      loadRequests(view);
    } catch (e: any) {
      console.log("HIDE ERROR:", e?.response?.data || e);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await api.patch(`/service-requests/${id}/restore`);
      loadRequests(view);
    } catch (e: any) {
      console.log("RESTORE ERROR:", e?.response?.data || e);
    }
  };

  const getStatusStyle = (status: string) => {
    if (status === "pending") return styles.statusPending;
    if (status === "in-progress") return styles.statusProgress;
    if (status === "completed") return styles.statusCompleted;
    if (status === "accepted") return styles.statusAccepted;
    return styles.statusDefault;
  };

  const getStatusLabel = (status: string) => {
    if (status === "pending") return "Pending";
    if (status === "in-progress") return "In Progress";
    if (status === "completed") return "Completed";
    if (status === "accepted") return "Accepted";
    return status;
  };

  const handleNavigate = (item: any) => {
    if (view === "active") {
      navigation.navigate("CustomerRequestDetails", {
        requestId: item.id,
      });
      return;
    }

    navigation.navigate("Report", {
      requestId: item.id,
    });
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => handleNavigate(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.statusDot, getStatusStyle(item.status)]} />
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.description || "No description"}
          </Text>
        </View>

        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>

      <Text style={styles.metaText}>
        Request ID: {item?.id?.slice(0, 8)}...
      </Text>

      <Text style={styles.statusMessage}>
        {item.status === "pending" && "Waiting for technician assignment"}
        {item.status === "in-progress" && "Work is currently in progress"}
        {item.status === "completed" && "This request has been completed"}
        {item.status === "accepted" &&
          "Your technician has accepted this request and will begin work soon."}
      </Text>

      {view === "active" && (
        <View style={styles.actionRow}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color="#9ca3af"
          />
          <Text style={styles.actionText}>View Details</Text>
        </View>
      )}

      {(view === "completed" || view === "history") && (
        <Animated.View
          style={[styles.reportCTA, { transform: [{ scale: pulse }] }]}
        >
          <Ionicons name="document-text" size={16} color="#fff" />
          <Text style={styles.reportText}>View Report</Text>
          <Ionicons name="arrow-forward" size={14} color="#c4b5fd" />
        </Animated.View>
      )}

      {view === "completed" && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => openDeleteModal(item.id)}
        >
          <Ionicons name="trash-outline" size={14} color="#ef4444" />
          <Text style={styles.deleteText}>Remove</Text>
        </TouchableOpacity>
      )}

      {view === "history" && (
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={() => handleRestore(item.id)}
        >
          <Ionicons name="refresh-outline" size={14} color="#22c55e" />
          <Text style={styles.restoreText}>Restore</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Requests</Text>
      <Text style={styles.subtitle}>
        Track your service requests and progress
      </Text>

      <View style={styles.tabsContainer}>
        {["active", "completed", "history"].map((tab) => {
          const isActive = view === tab;

          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => handleChangeView(tab as any)}
            >
              <View style={styles.tabContent}>
                <Text
                  style={[styles.tabText, isActive && styles.activeTabText]}
                >
                  {tab === "active"
                    ? "Active"
                    : tab === "completed"
                      ? "Completed"
                      : "History"}
                </Text>

                {tab === "active" && activeCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{activeCount}</Text>
                  </View>
                )}

                {tab === "completed" && completedCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{completedCount}</Text>
                  </View>
                )}

                {tab === "history" && historyCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{historyCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item: any) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name={
                view === "active"
                  ? "construct-outline"
                  : view === "completed"
                    ? "checkmark-circle-outline"
                    : "time-outline"
              }
              size={48}
              color="#475569"
            />
            <Text style={styles.emptyTitle}>
              {view === "active"
                ? "No Active Requests"
                : view === "completed"
                  ? "No Completed Requests"
                  : "No History"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {view === "active"
                ? "You don't have any active service requests right now."
                : view === "completed"
                  ? "Completed requests will appear here."
                  : "Removed requests will appear here."}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
      />

      <Modal transparent visible={showDeleteModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Remove Request</Text>
            <Text style={styles.modalText}>
              This will remove the request from your main list.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeDeleteModal}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmDelete}
              >
                <Text style={styles.confirmText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 16,
    paddingTop: 40,
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  subtitle: {
    color: "#9ca3af",
    marginTop: 4,
    marginBottom: 16,
  },

  // ✅ TABS
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#020617",
    borderRadius: 12,
    marginBottom: 16,
  },

  tab: {
    flex: 1,
    height: 48,

    justifyContent: "center",
    alignItems: "center",

    borderRadius: 24,

    borderWidth: 1.5,
    borderColor: "rgba(124,58,237,0.45)",

    backgroundColor: "rgba(124,58,237,0.06)",

    marginHorizontal: 4,

    overflow: "hidden",
  },

  activeTab: {
    backgroundColor: "#7c3aed",
  },

  tabText: {
    color: "#6b7280",
    fontSize: 13,
    fontWeight: "600",
  },

  activeTabText: {
    color: "#fff",
  },

  card: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  metaText: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 6,
  },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  deleteText: {
    color: "#ef4444",
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "600",
  },

  restoreButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  restoreText: {
    color: "#22c55e",
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "85%",
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 20,
  },

  modalTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  modalText: {
    color: "#9ca3af",
    marginTop: 8,
    fontSize: 13,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },

  cancelButton: {
    marginRight: 12,
  },

  cancelText: {
    color: "#9ca3af",
  },

  confirmButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  confirmText: {
    color: "#fff",
    fontWeight: "600",
  },

  statusMessage: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 6,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  actionText: {
    color: "#9ca3af",
    marginLeft: 6,
    fontSize: 13,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  statusPending: {
    backgroundColor: "#f59e0b",
  },

  statusProgress: {
    backgroundColor: "#3b82f6",
  },

  statusCompleted: {
    backgroundColor: "#22c55e",
  },

  statusDefault: {
    backgroundColor: "#6b7280",
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    marginTop: 60,
  },

  emptyTitle: {
    color: "#fff",
    marginTop: 12,
    fontSize: 18,
    fontWeight: "600",
  },

  emptySubtitle: {
    color: "#9ca3af",
    marginTop: 6,
    textAlign: "center",
  },

  emptyHint: {
    color: "#6b7280",
    marginTop: 10,
    textAlign: "center",
  },

  reportCTA: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(124,58,237,0.15)",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.4)",

    // glow
    shadowColor: "#7c3aed",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },

  reportText: {
    color: "#c4b5fd",
    marginLeft: 6,
    marginRight: 6,
    fontSize: 13,
    fontWeight: "600",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },
  statusAccepted: {
    backgroundColor: "#7c3aed",
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
    paddingHorizontal: 5,
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});
