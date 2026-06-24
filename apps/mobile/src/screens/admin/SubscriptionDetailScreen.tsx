import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../api/client";
import { useNavigation } from "@react-navigation/native";

export default function SubscriptionDetailScreen({ route }: any) {
  const { subscription } = route.params;
  const navigation = useNavigation<any>();

  const payments = subscription.payments || [];
  const lastPayment = payments.length > 0 ? payments[0] : null;

  const isAtRisk =
    !lastPayment || new Date(subscription.currentPeriodEnd) < new Date();

  const handleCancel = async () => {
    try {
      await api.patch("/subscriptions/cancel");

      Alert.alert("Subscription cancelled");
      navigation.goBack();
    } catch (err) {
      console.log(err);
      Alert.alert("Cancel failed");
    }
  };

  return (
    <ScrollView style={styles.screen}>
      {/* HEADER */}
      <Text style={styles.title}>Subscription</Text>
      <Text style={styles.subtitle}>Detailed overview</Text>

      {/* STATUS */}
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconBox}>
            <Ionicons name="layers-outline" size={18} color="#7c3aed" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.company}>
              {subscription.company?.name}
            </Text>
            <Text style={styles.plan}>{subscription.plan?.name}</Text>
          </View>

          <View
            style={[
              styles.badge,
              isAtRisk
                ? styles.riskBadge
                : subscription.status === "active"
                ? styles.safeBadge
                : styles.cancelledBadge,
            ]}
          >
            <Text style={styles.badgeText}>
              {isAtRisk ? "at risk" : subscription.status}
            </Text>
          </View>
        </View>
      </View>

      {/* LIFECYCLE */}
      <View style={styles.card}>
        <Text style={styles.section}>Lifecycle</Text>

        <Text style={styles.meta}>
          Next Visit:{" "}
          {new Date(subscription.nextVisitDate).toLocaleDateString()}
        </Text>

        <Text style={styles.meta}>
          Expiry:{" "}
          {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
        </Text>
      </View>

      {/* PAYMENT HISTORY */}
      <View style={styles.card}>
        <Text style={styles.section}>Payments</Text>

        {payments.length === 0 ? (
          <Text style={styles.failedText}>No payments recorded</Text>
        ) : (
          payments.map((p: any) => (
            <View key={p.id} style={styles.paymentRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.meta}>₹{p.amount}</Text>
                <Text style={styles.small}>
                  {new Date(p.createdAt).toLocaleDateString()}
                </Text>
              </View>

              <Text
                style={[
                  styles.small,
                  p.status === "success"
                    ? styles.successText
                    : styles.failedText,
                ]}
              >
                {p.status}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* ACTION */}
      {subscription.status === "active" && (
        <View style={styles.card}>
          <Pressable style={styles.cancelBtn} onPress={handleCancel}>
            <Ionicons name="close-circle-outline" size={16} color="#fff" />
            <Text style={styles.cancelText}>Cancel Subscription</Text>
          </Pressable>
        </View>
      )}

      {/* SYSTEM INFO */}
      <View style={styles.card}>
        <Text style={styles.section}>System Behavior</Text>

        <Text style={styles.meta}>
          • Generates maintenance requests automatically
        </Text>

        <Text style={styles.meta}>
          • Triggers based on plan interval
        </Text>

        <Text style={styles.meta}>
          • Expires if payment period ends
        </Text>
      </View>
    </ScrollView>
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
    color: "#6b7280",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#1e1b4b",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  company: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  plan: {
    color: "#9ca3af",
    fontSize: 12,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  safeBadge: {
    backgroundColor: "#1e1b4b",
  },

  riskBadge: {
    backgroundColor: "#3f1d1d",
  },

  cancelledBadge: {
    backgroundColor: "#374151",
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    textTransform: "capitalize",
  },

  section: {
    color: "#7c3aed",
    fontSize: 12,
    marginBottom: 8,
  },

  meta: {
    color: "#9ca3af",
    fontSize: 13,
    marginBottom: 4,
  },

  small: {
    color: "#6b7280",
    fontSize: 11,
  },

  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  successText: {
    color: "#22c55e",
  },

  failedText: {
    color: "#ef4444",
  },

  cancelBtn: {
    backgroundColor: "#ef4444",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },

  cancelText: {
    color: "#fff",
    fontWeight: "600",
  },
});