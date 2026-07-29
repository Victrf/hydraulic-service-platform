import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState, useRef } from "react";
import { api } from "../../api/client";

export default function MySubscriptionScreen({ navigation }: any) {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    loadSubscriptions();
    animateEntrance();
  }, []);

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadSubscriptions = async () => {
    try {
      const res = await api.get("/subscriptions/me");
      setSubscriptions(res.data);
    } catch (err) {
      console.log("SUBSCRIPTION ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "#5a9e7a";
      case "expired":
        return "#c07070";
      case "pending":
        return "#d4a843";
      default:
        return "#7a8fa8";
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <LinearGradient
          colors={["#0a0e1a", "#121828"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.spinner} />
        <Text style={styles.loadingText}>Loading subscriptions...</Text>
      </View>
    );
  }

  if (!subscriptions.length) {
    return (
      <View style={styles.center}>
        <LinearGradient
          colors={["#0a0e1a", "#121828", "#1a1f35"]}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          style={[
            styles.emptyContent,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.emptyIconGlow}>
            <MaterialCommunityIcons
              name="clipboard-remove-outline"
              size={60}
              color="#5a6a7e"
            />
          </View>
          <Text style={styles.emptyTitle}>No Active Subscription</Text>
          <Text style={styles.emptySubtitle}>
            You don't currently have an active maintenance subscription.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.planButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate("Plans")}
          >
            <LinearGradient
              colors={["#3d4f6f", "#4a5f7f"]}
              style={styles.planButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.planButtonText}>View Plans</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#0a0e1a", "#121828", "#1a1f35"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerIcon}>
              <Ionicons name="card-outline" size={22} color="#8a9bb8" />
            </View>
            <View style={styles.headerBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.headerBadgeText}>
                {subscriptions.length} Active
              </Text>
            </View>
          </View>
          <Text style={styles.heading}>My Subscriptions</Text>
          <Text style={styles.subheading}>Manage your maintenance plans</Text>
        </Animated.View>

        {/* Subscription Cards */}
        {subscriptions.map((item, index) => (
          <Animated.View
            key={item.id}
            style={[
              styles.cardWrapper,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={["rgba(25, 35, 50, 0.8)", "rgba(15, 20, 30, 0.95)"]}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Plan Header */}
              <View style={styles.planHeader}>
                <View style={styles.planHeaderLeft}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: getStatusColor(item.status),
                        shadowColor: getStatusColor(item.status),
                      },
                    ]}
                  />
                  <View>
                    <Text style={styles.planName}>{item.plan.displayName}</Text>
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(item.status) },
                      ]}
                    >
                      {item.status.charAt(0).toUpperCase() +
                        item.status.slice(1)}
                    </Text>
                  </View>
                </View>
                <View style={styles.priceTag}>
                  <Text style={styles.priceCurrency}>₹</Text>
                  <Text style={styles.priceValue}>{item.plan.price}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Info Grid */}
              <View style={styles.infoGrid}>
                <InfoItem
                  icon="calendar-outline"
                  label="Started"
                  value={formatDate(item.startDate)}
                />
                <InfoItem
                  icon="hourglass-outline"
                  label="Expires"
                  value={formatDate(item.currentPeriodEnd)}
                />
                <InfoItem
                  icon="time-outline"
                  label="Next Visit"
                  value={formatDate(item.nextVisitDate)}
                />
              </View>

              <View style={styles.divider} />

              {/* Equipment Section */}
              <View style={styles.equipmentSection}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionIcon}>
                    <Ionicons
                      name="hardware-chip-outline"
                      size={16}
                      color="#7a8fa8"
                    />
                  </View>
                  <Text style={styles.sectionTitle}>Covered Equipment</Text>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.equipmentCard,
                    pressed && styles.cardPressed,
                  ]}
                  onPress={() =>
                    navigation.navigate("MaintenanceHistory", {
                      equipmentId: item.equipment.id,
                    })
                  }
                >
                  <View style={styles.equipmentIcon}>
                    <MaterialCommunityIcons
                      name="hammer-wrench"
                      size={28}
                      color="#7a8fa8"
                    />
                  </View>

                  <View style={styles.equipmentInfo}>
                    <Text style={styles.machineName}>
                      {item.equipment.name}
                    </Text>
                    <Text style={styles.serial}>
                      {item.equipment.serialNumber}
                    </Text>

                    <View
                      style={[
                        styles.historyBadge,
                        item.totalVisitsCompleted > 0
                          ? styles.historyBadgeSuccess
                          : styles.historyBadgePending,
                      ]}
                    >
                      <Ionicons
                        name={
                          item.totalVisitsCompleted > 0
                            ? "checkmark-circle"
                            : "time"
                        }
                        size={12}
                        color={
                          item.totalVisitsCompleted > 0 ? "#5a9e7a" : "#d4a843"
                        }
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.historyBadgeText}>
                        {item.totalVisitsCompleted > 0
                          ? `${item.totalVisitsCompleted} Visit${
                              item.totalVisitsCompleted > 1 ? "s" : ""
                            }`
                          : "No History Yet"}
                      </Text>
                    </View>

                    <View style={styles.viewHistoryRow}>
                      <Text style={styles.viewHistory}>
                        View Maintenance History
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={14}
                        color="#5a6f8f"
                      />
                    </View>
                  </View>
                </Pressable>
              </View>
            </LinearGradient>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

// Sub-components
function InfoItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon as any} size={14} color="#5a6f8f" />
      </View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e1a",
  },

  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // Loading State
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  spinner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: "#3d4f6f",
    borderTopColor: "transparent",
    marginBottom: 16,
  },
  loadingText: {
    color: "#6b7a94",
    fontSize: 16,
    fontWeight: "500",
  },

  // Header
  header: {
    marginBottom: 28,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(90, 110, 140, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(90, 158, 122, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(90, 158, 122, 0.25)",
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#5a9e7a",
  },
  headerBadgeText: {
    color: "#5a9e7a",
    fontSize: 12,
    fontWeight: "700",
  },
  heading: {
    color: "#e8ecf2",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subheading: {
    color: "#5a6a7e",
    fontSize: 14,
    marginTop: 4,
    fontWeight: "500",
  },

  // Card
  cardWrapper: {
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGradient: {
    padding: 22,
  },

  // Plan Header
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  planHeaderLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  planName: {
    color: "#e8ecf2",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  statusText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  priceTag: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(90, 110, 140, 0.12)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  priceCurrency: {
    color: "#7a8fa8",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  priceValue: {
    color: "#e8ecf2",
    fontSize: 22,
    fontWeight: "800",
    marginLeft: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    marginVertical: 18,
  },

  // Info Grid
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(20, 28, 42, 0.5)",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
  },
  infoIcon: {
    marginBottom: 8,
  },
  infoLabel: {
    color: "#5a6a7e",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    color: "#e8ecf2",
    fontSize: 13,
    fontWeight: "700",
  },

  // Equipment Section
  equipmentSection: {
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(90, 110, 140, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#8a9bb8",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  equipmentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(20, 28, 42, 0.5)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  equipmentIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(90, 110, 140, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  equipmentInfo: {
    flex: 1,
  },
  machineName: {
    color: "#e8ecf2",
    fontSize: 16,
    fontWeight: "700",
  },
  serial: {
    color: "#5a6a7e",
    marginTop: 4,
    fontSize: 12,
    fontWeight: "500",
  },
  historyBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
  historyBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  historyBadgePending: {
    backgroundColor: "rgba(212, 168, 67, 0.12)",
  },
  historyBadgeSuccess: {
    backgroundColor: "rgba(90, 158, 122, 0.12)",
  },
  viewHistoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 4,
  },
  viewHistory: {
    color: "#5a6f8f",
    fontSize: 12,
    fontWeight: "700",
  },

  // Empty State
  emptyContent: {
    alignItems: "center",
    padding: 30,
  },
  emptyIconGlow: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(90, 110, 140, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(90, 110, 140, 0.15)",
  },
  emptyTitle: {
    color: "#e8ecf2",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    color: "#5a6a7e",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 32,
    lineHeight: 22,
    fontSize: 14,
    maxWidth: 280,
  },
  planButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#3d4f6f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  planButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 8,
  },
  planButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.3,
  },
});
