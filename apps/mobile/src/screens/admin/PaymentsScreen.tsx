import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Ionicons } from "@expo/vector-icons";

export default function PaymentsScreen() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);

      const res = await api.get("/payments/admin");

      // ✅ safe handling
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setPayments(data);

    } catch (err: any) {
      console.log("PAYMENTS ERROR:", err?.response?.data || err.message);
      Alert.alert("Error", "Failed to load payments");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const success = payments.filter((p) => p.status === "success").length;
  const failed = payments.filter((p) => p.status === "failed").length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Payments</Text>
      <Text style={styles.subtitle}>Subscription payment activity</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{payments.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{success}</Text>
          <Text style={styles.statLabel}>Success</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{failed}</Text>
          <Text style={styles.statLabel}>Failed</Text>
        </View>
      </View>

      {payments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="card-outline" size={48} color="#374151" />
          <Text style={styles.emptyTitle}>No Payments Yet</Text>
          <Text style={styles.emptyText}>
            Payments will appear when subscriptions are billed.
          </Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const company = item.company;
            const plan = item.subscription?.plan;

            return (
              <View style={styles.card}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.company}>
                      {company?.name || "Company"}
                    </Text>

                    <Text style={styles.plan}>
                      {plan?.name || "Plan"}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.badge,
                      item.status === "success"
                        ? styles.success
                        : styles.failed,
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.amount}>₹{item.amount}</Text>

                <Text style={styles.meta}>
                  Method: {item.method || "manual"}
                </Text>

                <Text style={styles.meta}>
                  Date:{" "}
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : "N/A"}
                </Text>
              </View>
            );
          }}
        />
      )}
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

  company: {
    color: "#fff",
    fontWeight: "600",
  },

  plan: {
    color: "#6b7280",
    fontSize: 12,
  },

  amount: {
    color: "#a78bfa",
    fontWeight: "700",
    marginBottom: 6,
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

  success: {
    backgroundColor: "#1e1b4b",
  },

  failed: {
    backgroundColor: "#3f1d1d",
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    textTransform: "capitalize",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
  },

  emptyText: {
    color: "#6b7280",
    marginTop: 6,
    fontSize: 13,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
