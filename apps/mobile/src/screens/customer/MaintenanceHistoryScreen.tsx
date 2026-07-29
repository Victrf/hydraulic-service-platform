import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { api } from "../../api/client";

export default function MaintenanceHistoryScreen({ navigation, route }: any) {
  const { equipmentId } = route.params;

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get(`/maintenance-visits/equipment/${equipmentId}`);

      console.log("HISTORY:", res.data);

      setHistory(res.data);
    } catch (err) {
      console.log("HISTORY ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={{ color: "#fff" }}>Loading...</Text>
      </View>
    );
  }

  if (!history.length) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="history" size={70} color="#64748b" />

        <Text style={styles.emptyTitle}>No Maintenance History</Text>

        <Text style={styles.emptySubtitle}>
          There are no maintenance visits recorded for this equipment yet.
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={["#020617", "#111827", "#020617"]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.heading}>Maintenance History</Text>

        <Text style={styles.subHeading}>
          {history.length} {history.length === 1 ? "visit" : "visits"} recorded
        </Text>
        {/* History cards will go here */}
        {history.map((visit) => (
          <Pressable
            key={visit.id}
            style={styles.card}
            onPress={() =>
              navigation.navigate("MaintenanceVisitDetails", {
                visitId: visit.id,
              })
            }
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.visitTitle}>
                  {visit.subscription.plan.displayName}
                </Text>

                <Text style={styles.visitDate}>
                  {new Date(visit.scheduledDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  visit.status === "completed"
                    ? styles.completedBadge
                    : styles.pendingBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    visit.status === "completed"
                      ? styles.completedText
                      : styles.pendingText,
                  ]}
                >
                  {visit.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="account-hard-hat"
                size={18}
                color="#8b5cf6"
              />

              <Text style={styles.infoText}>
                Technician: {visit.technician?.name || "-"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="clipboard-check-outline"
                size={18}
                color="#8b5cf6"
              />

              <Text style={styles.infoText}>
                Findings: {visit.findings.length}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="calendar-check"
                size={18}
                color="#8b5cf6"
              />

              <Text style={styles.infoText}>
                Completed:{" "}
                {visit.completedAt
                  ? new Date(visit.completedAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "-"}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.footer}>
              <Text style={styles.viewReport}>View Maintenance Report</Text>

              <Ionicons name="chevron-forward" size={20} color="#8b5cf6" />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },

  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  heading: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 25,
  },

  emptyContainer: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 20,
  },

  emptySubtitle: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  visitTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  visitDate: {
    color: "#94a3b8",
    marginTop: 8,
  },

  visitStatus: {
    color: "#22c55e",
    marginTop: 12,
    fontWeight: "700",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusBadge: {
    backgroundColor: "#14532d",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusBadgeText: {
    color: "#bbf7d0",
    fontSize: 11,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#1f2937",
    marginVertical: 18,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  infoText: {
    color: "#cbd5e1",
    marginLeft: 10,
    fontSize: 14,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },

  viewReport: {
    color: "#8b5cf6",
    fontWeight: "700",
    fontSize: 14,
  },
  subHeading: {
    color: "#94a3b8",
    fontSize: 15,
    marginBottom: 24,
  },
  completedBadge: {
    backgroundColor: "#14532d",
  },

  pendingBadge: {
    backgroundColor: "#78350f",
  },

  completedText: {
    color: "#bbf7d0",
  },

  pendingText: {
    color: "#fde68a",
  },
});
