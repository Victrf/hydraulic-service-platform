import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
  RefreshControl,
  Image,
  Animated,
  StatusBar,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { api } from "../../api/client";

export default function MaintenanceVisitDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { visitId } = route.params;

  const [visit, setVisit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pressedButton, setPressedButton] = useState<string | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadVisit();
  }, []);

  useEffect(() => {
    if (!loading && visit) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, visit]);

  async function loadVisit() {
    try {
      const res = await api.get(`/maintenance-visits/${visitId}`);
      setVisit(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to load visit.");
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadVisit();
    setRefreshing(false);
  }

  async function acceptVisit() {
    try {
      await api.patch(`/maintenance-visits/${visitId}/accept`);
      await loadVisit();
    } catch (err: any) {
      alert(err.response?.data?.message);
    }
  }

  async function startVisit() {
    try {
      await api.patch(`/maintenance-visits/${visitId}/start`);
      await loadVisit();
    } catch (err: any) {
      alert(err.response?.data?.message);
    }
  }

  async function completeVisit() {
    try {
      console.log("Completing maintenance...");

      const res = await api.patch(`/maintenance-visits/${visitId}/complete`);

      console.log("Success:", res.data);

      await loadVisit();
    } catch (err: any) {
      console.log("ERROR:");
      console.log(err);
      console.log(err.response);
      console.log(err.response?.data);

      alert(JSON.stringify(err.response?.data ?? err.message));
    }
  }
  function getStatusConfig(status: string) {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return {
          color: "#8b5cf6",
          bg: "rgba(139, 92, 246, 0.15)",
          icon: "time-outline",
        };
      case "assigned":
        return {
          color: "#3b82f6",
          bg: "rgba(59, 130, 246, 0.15)",
          icon: "person-outline",
        };
      case "accepted":
        return {
          color: "#10b981",
          bg: "rgba(16, 185, 129, 0.15)",
          icon: "checkmark-circle-outline",
        };
      case "in_progress":
      case "in progress":
        return {
          color: "#f59e0b",
          bg: "rgba(245, 158, 11, 0.15)",
          icon: "play-circle-outline",
        };
      case "completed":
        return {
          color: "#22c55e",
          bg: "rgba(34, 197, 94, 0.15)",
          icon: "shield-checkmark-outline",
        };
      case "missed":
        return {
          color: "#ef4444",
          bg: "rgba(239, 68, 68, 0.15)",
          icon: "alert-circle-outline",
        };
      case "cancelled":
        return {
          color: "#64748b",
          bg: "rgba(100, 116, 139, 0.15)",
          icon: "close-circle-outline",
        };
      default:
        return {
          color: "#8b5cf6",
          bg: "rgba(139, 92, 246, 0.15)",
          icon: "help-circle-outline",
        };
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading visit details...</Text>
      </View>
    );
  }

  const statusConfig = getStatusConfig(visit.status);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Background Gradient */}
      <LinearGradient
        colors={["#0f172a", "#1e1b4b", "#0f172a"]}
        style={styles.backgroundGradient}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8b5cf6"
            progressBackgroundColor="#1e293b"
          />
        }
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {/* Hero Header */}
          <View style={styles.heroSection}>
            <View style={styles.heroTopRow}>
              <View style={styles.visitIdContainer}>
                <Text style={styles.visitIdLabel}>Visit ID</Text>
                <Text style={styles.visitIdValue}>#{visit.visitNumber}</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusConfig.bg },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: statusConfig.color },
                  ]}
                />
                <Ionicons
                  name={statusConfig.icon as any}
                  size={14}
                  color={statusConfig.color}
                />
                <Text
                  style={[styles.statusText, { color: statusConfig.color }]}
                >
                  {visit.status.replace("_", " ")}
                </Text>
              </View>
            </View>

            {/* Company Hero Card */}
            <View style={styles.companyHero}>
              <LinearGradient
                colors={["rgba(139, 92, 246, 0.2)", "rgba(59, 130, 246, 0.1)"]}
                style={styles.companyHeroGradient}
              >
                <View style={styles.companyHeroContent}>
                  {visit.company?.logoUrl ? (
                    <Image
                      source={{
                        uri: `${api.defaults.baseURL}/uploads/companies/${visit.company.logoUrl}`,
                      }}
                      style={styles.companyLogo}
                    />
                  ) : (
                    <View style={styles.logoPlaceholder}>
                      <LinearGradient
                        colors={["#7c3aed", "#4f46e5"]}
                        style={styles.logoGradient}
                      >
                        <Text style={styles.logoLetter}>
                          {(visit.company?.name || "?").charAt(0).toUpperCase()}
                        </Text>
                      </LinearGradient>
                    </View>
                  )}

                  <View style={styles.companyInfo}>
                    <Text style={styles.companyName} numberOfLines={1}>
                      {visit.company?.name}
                    </Text>
                    <View style={styles.planChip}>
                      <MaterialCommunityIcons
                        name="calendar-check"
                        size={12}
                        color="#a78bfa"
                      />
                      <Text style={styles.planName}>
                        {visit.subscription?.plan?.name}
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Visit Information Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: "rgba(139, 92, 246, 0.15)" },
                ]}
              >
                <Ionicons name="calendar-outline" size={18} color="#a78bfa" />
              </View>
              <Text style={styles.cardTitle}>Visit Information</Text>
            </View>

            <View style={styles.infoGrid}>
              <InfoItem
                icon="briefcase-outline"
                label="Maintenance Plan"
                value={visit.subscription?.plan?.name}
              />
              <InfoItem
                icon="time-outline"
                label="Scheduled Date"
                value={new Date(visit.scheduledDate).toLocaleString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
              <InfoItem
                icon="hash-outline"
                label="Visit Number"
                value={`#${visit.visitNumber}`}
              />
              <InfoItem
                icon="flag-outline"
                label="Current Status"
                value={visit.status.replace("_", " ")}
                valueColor={statusConfig.color}
              />
            </View>
          </View>

          {/* Equipment Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: "rgba(59, 130, 246, 0.15)" },
                ]}
              >
                <Ionicons
                  name="hardware-chip-outline"
                  size={18}
                  color="#60a5fa"
                />
              </View>
              <Text style={styles.cardTitle}>Equipment Details</Text>
            </View>

            <View style={styles.infoGrid}>
              <InfoItem
                icon="cube-outline"
                label="Equipment"
                value={visit.equipment?.name}
              />
              {visit.equipment?.serialNumber && (
                <InfoItem
                  icon="barcode-outline"
                  label="Serial Number"
                  value={visit.equipment.serialNumber}
                />
              )}
              {visit.equipment?.model && (
                <InfoItem
                  icon="layers-outline"
                  label="Model"
                  value={visit.equipment.model}
                />
              )}
              {visit.equipment?.location && (
                <InfoItem
                  icon="location-outline"
                  label="Location"
                  value={visit.equipment.location}
                />
              )}
            </View>
          </View>

          {/* Company Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: "rgba(16, 185, 129, 0.15)" },
                ]}
              >
                <Ionicons name="business-outline" size={18} color="#34d399" />
              </View>
              <Text style={styles.cardTitle}>Company Info</Text>
            </View>

            <View style={styles.infoGrid}>
              <InfoItem
                icon="home-outline"
                label="Company"
                value={visit.company?.name}
              />
              {visit.company?.address && (
                <InfoItem
                  icon="map-outline"
                  label="Address"
                  value={visit.company.address}
                />
              )}
              {visit.company?.phone && (
                <InfoItem
                  icon="call-outline"
                  label="Phone"
                  value={visit.company.phone}
                />
              )}
            </View>
          </View>

          {/* Completed Maintenance Report */}
          {visit.status === "completed" && (
            <>
              {/* Inspection Findings */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: "rgba(124, 58, 237, 0.15)" },
                    ]}
                  >
                    <Ionicons
                      name="clipboard-outline"
                      size={18}
                      color="#a78bfa"
                    />
                  </View>
                  <Text style={styles.cardTitle}>Inspection Findings</Text>
                </View>

                {visit.findings?.length ? (
                  visit.findings.map((finding: any, index: number) => (
                    <View
                      key={finding.id}
                      style={{
                        paddingVertical: 12,
                        borderBottomWidth:
                          index === visit.findings.length - 1 ? 0 : 1,
                        borderBottomColor: "rgba(148,163,184,0.08)",
                      }}
                    >
                      <Text
                        style={{
                          color: "#f8fafc",
                          fontWeight: "700",
                          marginBottom: 6,
                        }}
                      >
                        {finding.problem}
                      </Text>

                      {finding.condition ? (
                        <Text style={{ color: "#94a3b8", marginBottom: 4 }}>
                          Condition: {finding.condition}
                        </Text>
                      ) : null}

                      {finding.cause ? (
                        <Text style={{ color: "#94a3b8", marginBottom: 4 }}>
                          Cause: {finding.cause}
                        </Text>
                      ) : null}

                      {finding.recommendation ? (
                        <Text style={{ color: "#94a3b8", marginBottom: 4 }}>
                          Recommendation: {finding.recommendation}
                        </Text>
                      ) : null}

                      {finding.notes ? (
                        <Text style={{ color: "#94a3b8" }}>
                          Notes: {finding.notes}
                        </Text>
                      ) : null}
                    </View>
                  ))
                ) : (
                  <Text style={{ color: "#94a3b8" }}>
                    No inspection findings were recorded.
                  </Text>
                )}
              </View>

              {/* Service Request */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: "rgba(37,99,235,0.15)" },
                    ]}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={18}
                      color="#60a5fa"
                    />
                  </View>

                  <Text style={styles.cardTitle}>Service Request</Text>
                </View>

                {visit.serviceRequest ? (
                  <View style={styles.infoGrid}>
                    <InfoItem
                      icon="document-text-outline"
                      label="Request Number"
                      value={visit.serviceRequest.requestNumber}
                    />

                    <InfoItem
                      icon="flag-outline"
                      label="Status"
                      value={visit.serviceRequest.status}
                    />

                    <InfoItem
                      icon="chatbox-outline"
                      label="Description"
                      value={visit.serviceRequest.description}
                    />
                  </View>
                ) : (
                  <Text style={{ color: "#94a3b8" }}>
                    No service request was created for this maintenance visit.
                  </Text>
                )}
              </View>
            </>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            <Text style={styles.actionsTitle}>Actions</Text>

            {visit.status === "assigned" && (
              <ActionButton
                icon="checkmark-circle"
                label="Accept Maintenance"
                gradient={["#7c3aed", "#6d28d9"]}
                onPress={acceptVisit}
                pressed={pressedButton === "accept"}
                onPressIn={() => setPressedButton("accept")}
                onPressOut={() => setPressedButton(null)}
              />
            )}

            {visit.status === "accepted" && (
              <ActionButton
                icon="play"
                label="Start Maintenance"
                gradient={["#059669", "#047857"]}
                onPress={startVisit}
                pressed={pressedButton === "start"}
                onPressIn={() => setPressedButton("start")}
                onPressOut={() => setPressedButton(null)}
              />
            )}

            {visit.status === "in_progress" && (
              <>
                <ActionButton
                  icon="clipboard-list"
                  label="Inspection Findings"
                  gradient={["#7c3aed", "#6d28d9"]}
                  onPress={() =>
                    navigation.navigate("MaintenanceFindings", { visitId })
                  }
                  pressed={pressedButton === "findings"}
                  onPressIn={() => setPressedButton("findings")}
                  onPressOut={() => setPressedButton(null)}
                />

                <ActionButton
                  icon="document-text"
                  label="Create Service Request"
                  gradient={["#2563eb", "#1d4ed8"]}
                  onPress={() =>
                    navigation.navigate("CreateMaintenanceFinding", { visitId })
                  }
                  pressed={pressedButton === "service"}
                  onPressIn={() => setPressedButton("service")}
                  onPressOut={() => setPressedButton(null)}
                />

                <ActionButton
                  icon="checkmark-done"
                  label="Complete Maintenance"
                  gradient={["#16a34a", "#15803d"]}
                  onPress={completeVisit}
                  pressed={pressedButton === "complete"}
                  onPressIn={() => setPressedButton("complete")}
                  onPressOut={() => setPressedButton(null)}
                />
              </>
            )}
          </View>

          <View style={styles.bottomSpacer} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// Sub-components
function InfoItem({
  icon,
  label,
  value,
  valueColor = "#f8fafc",
}: {
  icon: string;
  label: string;
  value?: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoItemIcon}>
        <Ionicons name={icon as any} size={16} color="#64748b" />
      </View>
      <View style={styles.infoItemContent}>
        <Text style={styles.infoItemLabel}>{label}</Text>
        <Text
          style={[styles.infoItemValue, { color: valueColor }]}
          numberOfLines={1}
        >
          {value || "-"}
        </Text>
      </View>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  gradient,
  onPress,
  pressed,
  onPressIn,
  onPressOut,
}: any) {
  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={({ pressed: p }) => [
        styles.actionButton,
        p && styles.actionButtonPressed,
      ]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.actionButtonGradient}
      >
        <View style={styles.actionButtonInner}>
          <View style={styles.actionIconCircle}>
            <Ionicons name={icon} size={20} color="#fff" />
          </View>
          <Text style={styles.actionButtonText}>{label}</Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color="rgba(255,255,255,0.6)"
          />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020617",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },
  loadingText: {
    color: "#64748b",
    marginTop: 16,
    fontSize: 15,
    fontWeight: "500",
  },

  // Hero Section
  heroSection: {
    marginBottom: 24,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  visitIdContainer: {
    flex: 1,
  },
  visitIdLabel: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  visitIdValue: {
    color: "#f8fafc",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  // Company Hero
  companyHero: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
  companyHeroGradient: {
    padding: 20,
  },
  companyHeroContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  companyLogo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#1e293b",
    borderWidth: 2,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  logoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 20,
    overflow: "hidden",
  },
  logoGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  logoLetter: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
  },
  companyInfo: {
    flex: 1,
    marginLeft: 16,
  },
  companyName: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  planChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  planName: {
    color: "#a78bfa",
    fontSize: 13,
    fontWeight: "600",
  },

  // Cards
  card: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTitle: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "700",
  },

  // Info Grid
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoItemIcon: {
    width: 32,
    alignItems: "center",
    marginRight: 12,
  },
  infoItemContent: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.06)",
    paddingBottom: 12,
  },
  infoItemLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoItemValue: {
    fontSize: 15,
    fontWeight: "600",
  },

  // Actions
  actionsSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  actionsTitle: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
  },
  actionButton: {
    borderRadius: 18,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  actionButtonGradient: {
    padding: 4,
  },
  actionButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },

  bottomSpacer: {
    height: 40,
  },
});
