import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Pressable,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState, useRef } from "react";
import { api } from "../../api/client";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function PaymentsScreen() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

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

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payments/admin");
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setPayments(data);
      animateIn();
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
  const totalAmount = payments.reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0,
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.bgGradient}>
          <View style={[styles.bgOrb, styles.bgOrb1]} />
          <View style={[styles.bgOrb, styles.bgOrb2]} />
        </View>
        <ActivityIndicator color="#8b5cf6" size="large" />
        <Text style={styles.loadingText}>Loading payments...</Text>
      </View>
    );
  }

  const getStatusConfig = (status: string) => {
    if (status === "success")
      return {
        bg: "rgba(16, 185, 129, 0.15)",
        border: "rgba(16, 185, 129, 0.3)",
        text: "#34d399",
        icon: "checkmark-circle",
      };
    if (status === "failed")
      return {
        bg: "rgba(239, 68, 68, 0.15)",
        border: "rgba(239, 68, 68, 0.3)",
        text: "#f87171",
        icon: "alert-circle",
      };
    return {
      bg: "rgba(245, 158, 11, 0.15)",
      border: "rgba(245, 158, 11, 0.3)",
      text: "#fbbf24",
      icon: "time",
    };
  };

  return (
    <View style={styles.screen}>
      {/* Background Orbs */}
      <View style={styles.bgGradient}>
        <View style={[styles.bgOrb, styles.bgOrb1]} />
        <View style={[styles.bgOrb, styles.bgOrb2]} />
        <View style={[styles.bgOrb, styles.bgOrb3]} />
      </View>

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View>
          <Text style={styles.title}>Payments</Text>
          <Text style={styles.subtitle}>Subscription payment activity</Text>
        </View>
        <View style={styles.totalRevenue}>
          <Ionicons name="wallet-outline" size={16} color="#a78bfa" />
          <Text style={styles.totalRevenueText}>
            ₹{totalAmount.toLocaleString()}
          </Text>
        </View>
      </Animated.View>

      {/* Stats */}
      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderColor: "#312e81" }]}>
            <View
              style={[
                styles.statIconWrap,
                { backgroundColor: "rgba(99, 102, 241, 0.15)" },
              ]}
            >
              <Ionicons name="layers-outline" size={18} color="#818cf8" />
            </View>
            <Text style={styles.statValue}>{payments.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>

          <View style={[styles.statCard, { borderColor: "#064e3b" }]}>
            <View
              style={[
                styles.statIconWrap,
                { backgroundColor: "rgba(16, 185, 129, 0.15)" },
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#34d399"
              />
            </View>
            <Text style={[styles.statValue, { color: "#34d399" }]}>
              {success}
            </Text>
            <Text style={styles.statLabel}>Success</Text>
          </View>

          <View style={[styles.statCard, { borderColor: "#7f1d1d" }]}>
            <View
              style={[
                styles.statIconWrap,
                { backgroundColor: "rgba(239, 68, 68, 0.15)" },
              ]}
            >
              <Ionicons name="alert-circle-outline" size={18} color="#f87171" />
            </View>
            <Text style={[styles.statValue, { color: "#f87171" }]}>
              {failed}
            </Text>
            <Text style={styles.statLabel}>Failed</Text>
          </View>
        </View>
      </Animated.View>

      {/* List */}
      {payments.length === 0 ? (
        <Animated.View
          style={[
            styles.emptyContainer,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.emptyCard}>
            <View style={styles.emptyGlow} />
            <View style={styles.emptyIconWrap}>
              <Ionicons name="receipt-outline" size={36} color="#8b5cf6" />
            </View>
            <Text style={styles.emptyTitle}>No Payments Yet</Text>
            <Text style={styles.emptyText}>
              Payments will appear when subscriptions are billed.
            </Text>
          </View>
        </Animated.View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item, index }) => {
            const company = item.company;
            const plan = item.subscription?.plan;
            const status = getStatusConfig(item.status);
            const isLast = index === payments.length - 1;

            return (
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                }}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.card,
                    pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                    isLast && { marginBottom: 0 },
                  ]}
                  onPress={() =>
                    navigation.navigate("PaymentDetail", { payment: item })
                  }
                >
                  <View
                    style={[styles.accentBar, { backgroundColor: status.text }]}
                  />

                  <View style={styles.cardHeader}>
                    <View style={styles.cardLeft}>
                      {company?.logoUrl ? (
                        <Image
                          source={{
                            uri: `${api.defaults.baseURL}/uploads/companies/${company.logoUrl}`,
                          }}
                          style={styles.companyLogo}
                        />
                      ) : (
                        <View style={styles.logoPlaceholder}>
                          <Ionicons
                            name="business-outline"
                            size={20}
                            color="#8b5cf6"
                          />
                        </View>
                      )}
                      <View style={styles.companyInfo}>
                        <Text style={styles.company}>
                          {company?.name || "Company"}
                        </Text>
                        <Text style={styles.equipment}>
                          {item.equipment?.name || "Equipment"}
                        </Text>
                        <Text style={styles.plan}>{plan?.name || "Plan"}</Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: status.bg,
                          borderColor: status.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name={status.icon as any}
                        size={12}
                        color={status.text}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.statusText, { color: status.text }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.amountRow}>
                    <View style={styles.amountLeft}>
                      <Text style={styles.amountLabel}>Amount</Text>
                      <Text style={styles.amount}>
                        ₹{Number(item.amount).toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.amountRight}>
                      <Text style={styles.dateLabel}>Date</Text>
                      <Text style={styles.date}>
                        {new Date(
                          item.paymentDate || item.createdAt,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.metaGrid}>
                    <View style={styles.metaItem}>
                      <Ionicons name="card-outline" size={13} color="#6b7280" />
                      <Text style={styles.metaLabel}>Method</Text>
                      <Text style={styles.metaValue}>
                        {item.method || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons
                        name="document-text-outline"
                        size={13}
                        color="#6b7280"
                      />
                      <Text style={styles.metaLabel}>Reference</Text>
                      <Text style={styles.metaValue} numberOfLines={1}>
                        {item.transactionReference || "-"}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons
                        name="person-outline"
                        size={13}
                        color="#6b7280"
                      />
                      <Text style={styles.metaLabel}>Recorded By</Text>
                      <Text style={styles.metaValue}>
                        {item.recordedBy?.name || "-"}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617", padding: 16, paddingTop: 50 },
  bgGradient: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
  bgOrb: { position: "absolute", borderRadius: 999, opacity: 0.1 },
  bgOrb1: {
    width: 350,
    height: 350,
    backgroundColor: "#7c3aed",
    top: -100,
    right: -80,
  },
  bgOrb2: {
    width: 280,
    height: 280,
    backgroundColor: "#2563eb",
    top: 200,
    left: -100,
  },
  bgOrb3: {
    width: 200,
    height: 200,
    backgroundColor: "#ec4899",
    bottom: 100,
    right: -50,
    opacity: 0.08,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },
  loadingText: {
    color: "#6b7280",
    marginTop: 14,
    fontSize: 14,
    fontWeight: "500",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 4,
    letterSpacing: 0.2,
  },
  totalRevenue: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(124, 58, 237, 0.15)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
    gap: 6,
  },
  totalRevenueText: { color: "#a78bfa", fontSize: 14, fontWeight: "800" },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
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
  accentBar: { height: 3, width: "100%" },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingBottom: 12,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  companyInfo: { marginLeft: 12, flex: 1 },
  company: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: -0.2,
  },
  equipment: { color: "#9ca3af", fontSize: 12, marginTop: 2 },
  plan: { color: "#6b7280", fontSize: 11, marginTop: 2 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
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

  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    paddingBottom: 12,
  },
  amountLeft: { alignItems: "flex-start" },
  amountRight: { alignItems: "flex-end" },
  amountLabel: {
    color: "#6b7280",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
    marginBottom: 4,
  },
  amount: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  dateLabel: {
    color: "#6b7280",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
    marginBottom: 4,
  },
  date: { color: "#e5e7eb", fontSize: 13, fontWeight: "600" },

  metaGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  metaItem: { flex: 1, alignItems: "flex-start" },
  metaLabel: {
    color: "#6b7280",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 2,
  },
  metaValue: { color: "#e5e7eb", fontSize: 12, fontWeight: "600" },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  emptyGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    backgroundColor: "#7c3aed",
    opacity: 0.12,
    borderRadius: 100,
    top: -60,
  },
  emptyIconWrap: {
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
