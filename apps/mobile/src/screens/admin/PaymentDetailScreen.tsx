import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { api } from "../../api/client";

const { width } = Dimensions.get("window");

export default function PaymentDetailScreen({ route }: any) {
  const navigation = useNavigation<any>();
  const { payment } = route.params;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
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
  }, []);

  const statusConfig =
    payment.status === "success"
      ? {
          bg: "rgba(16, 185, 129, 0.15)",
          border: "rgba(16, 185, 129, 0.3)",
          text: "#34d399",
          icon: "checkmark-circle",
          bar: "#10b981",
        }
      : {
          bg: "rgba(239, 68, 68, 0.15)",
          border: "rgba(239, 68, 68, 0.3)",
          text: "#f87171",
          icon: "alert-circle",
          bar: "#ef4444",
        };

  const infoItems = [
    {
      icon: "receipt-outline",
      label: "Receipt Number",
      value: payment.receiptNumber || "-",
      color: "#a78bfa",
    },
    {
      icon: "card-outline",
      label: "Payment Method",
      value: payment.method || "-",
      color: "#60a5fa",
    },
    {
      icon: "document-text-outline",
      label: "Transaction Reference",
      value: payment.transactionReference || "-",
      color: "#fbbf24",
    },
    {
      icon: "calendar-outline",
      label: "Payment Date",
      value: new Date(
        payment.paymentDate || payment.createdAt,
      ).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      color: "#34d399",
    },
    {
      icon: "time-outline",
      label: "Time",
      value: new Date(
        payment.paymentDate || payment.createdAt,
      ).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      color: "#818cf8",
    },
    {
      icon: "person-outline",
      label: "Recorded By",
      value: payment.recordedBy?.name || "-",
      color: "#f472b6",
    },
  ];

  return (
    <View style={styles.screen}>
      {/* Background Orbs */}
      <View style={styles.bgGradient}>
        <View style={[styles.bgOrb, styles.bgOrb1]} />
        <View style={[styles.bgOrb, styles.bgOrb2]} />
        <View style={[styles.bgOrb, styles.bgOrb3]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Payment Details</Text>
            <Text style={styles.subtitle}>Transaction overview</Text>
          </View>
          <View style={{ width: 44 }} />
        </Animated.View>

        {/* Hero Card */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
        >
          <View style={[styles.heroCard, { borderColor: statusConfig.border }]}>
            <View
              style={[styles.accentBar, { backgroundColor: statusConfig.bar }]}
            />

            <View style={styles.heroHeader}>
              <View style={styles.heroLeft}>
                {payment.company?.logoUrl ? (
                  <Image
                    source={{
                      uri: `${api.defaults.baseURL}/uploads/companies/${payment.company.logoUrl}`,
                    }}
                    style={styles.companyLogo}
                  />
                ) : (
                  <View style={styles.logoPlaceholder}>
                    <Ionicons
                      name="business-outline"
                      size={24}
                      color="#8b5cf6"
                    />
                  </View>
                )}
                <View style={styles.heroInfo}>
                  <Text style={styles.companyName}>
                    {payment.company?.name || "-"}
                  </Text>
                  <Text style={styles.equipment}>
                    {payment.equipment?.name || "-"}
                  </Text>
                  <Text style={styles.plan}>
                    {payment.subscription?.plan?.name ||
                      payment.plan?.name ||
                      "-"}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: statusConfig.bg,
                    borderColor: statusConfig.border,
                  },
                ]}
              >
                <Ionicons
                  name={statusConfig.icon as any}
                  size={14}
                  color={statusConfig.text}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.statusText, { color: statusConfig.text }]}>
                  {payment.status}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>Amount Paid</Text>
              <Text style={styles.amount}>
                ₹{Number(payment.amount).toLocaleString()}
              </Text>
              <Text style={styles.amountSub}>
                {payment.status === "success"
                  ? "Payment completed successfully"
                  : "Payment failed or pending"}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Info Grid */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <View style={styles.infoGrid}>
            {infoItems.map((item, index) => (
              <View key={index} style={styles.infoCard}>
                <View
                  style={[
                    styles.infoIconWrap,
                    { backgroundColor: `${item.color}18` },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={18}
                    color={item.color}
                  />
                </View>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text
                  style={[styles.infoValue, { color: item.color }]}
                  numberOfLines={2}
                >
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Notes Card */}
        {payment.notes && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View style={styles.notesCard}>
              <View style={styles.notesHeader}>
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color="#a78bfa"
                />
                <Text style={styles.notesTitle}>Notes</Text>
              </View>
              <Text style={styles.notesText}>{payment.notes}</Text>
            </View>
          </Animated.View>
        )}

        {/* Receipt Button */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <Pressable
            style={({ pressed }) => [
              styles.receiptButton,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
            onPress={() =>
              navigation.navigate("Receipt", { paymentId: payment.id })
            }
          >
            <View style={styles.receiptIconWrap}>
              <Ionicons name="receipt-outline" size={20} color="#7c3aed" />
            </View>
            <View style={styles.receiptTextWrap}>
              <Text style={styles.receiptButtonText}>View Receipt</Text>
              <Text style={styles.receiptButtonSub}>Download or share PDF</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a78bfa" />
          </Pressable>
        </Animated.View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  scroll: { flex: 1 },
  bgGradient: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
  bgOrb: { position: "absolute", borderRadius: 999, opacity: 0.1 },
  bgOrb1: {
    width: 350,
    height: 350,
    backgroundColor: "#7c3aed",
    top: -120,
    right: -80,
  },
  bgOrb2: {
    width: 280,
    height: 280,
    backgroundColor: "#2563eb",
    top: 250,
    left: -100,
  },
  bgOrb3: {
    width: 200,
    height: 200,
    backgroundColor: "#ec4899",
    bottom: 150,
    right: -40,
    opacity: 0.08,
  },

  content: { padding: 20, paddingTop: 50, paddingBottom: 20 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.5)",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 4,
    letterSpacing: 0.2,
  },

  // Hero Card
  heroCard: {
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  accentBar: { height: 3, width: "100%" },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    paddingBottom: 14,
  },
  heroLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  heroInfo: { marginLeft: 14, flex: 1 },
  companyName: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 17,
    letterSpacing: -0.3,
  },
  equipment: { color: "#9ca3af", fontSize: 13, marginTop: 2 },
  plan: { color: "#6b7280", fontSize: 12, marginTop: 2 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    marginHorizontal: 18,
  },

  amountSection: { alignItems: "center", padding: 20 },
  amountLabel: {
    color: "#6b7280",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "700",
    marginBottom: 8,
  },
  amount: { color: "#fff", fontSize: 40, fontWeight: "800", letterSpacing: -1 },
  amountSub: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 8,
    fontWeight: "500",
  },

  // Info Grid
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  infoCard: {
    width: (width - 50) / 2,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.6)",
    alignItems: "flex-start",
  },
  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  infoLabel: {
    color: "#6b7280",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoValue: { fontSize: 13, fontWeight: "700", lineHeight: 18 },

  // Notes
  notesCard: {
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.6)",
    marginBottom: 20,
  },
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  notesTitle: {
    color: "#a78bfa",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  notesText: {
    color: "#e5e7eb",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
  },

  // Receipt Button
  receiptButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(124, 58, 237, 0.1)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
  receiptIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(124, 58, 237, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  receiptTextWrap: { flex: 1 },
  receiptButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  receiptButtonSub: { color: "#6b7280", fontSize: 12, marginTop: 2 },

  // Images
  companyLogo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  logoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
});
