import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Image,
  StatusBar,
  Platform,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { api } from "../../api/client";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    loadProfile();
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
    ]).start();
  };

  const loadProfile = async () => {
    try {
      setRefreshing(true);
      const userRes = await api.get("/users/me");
      setUser(userRes.data);

      const [historyRes, requestRes] = await Promise.all([
        api.get(`/users/${userRes.data.id}/activity`),
        api.get(`/service-requests/user/${userRes.data.id}`),
      ]);

      setHistory(historyRes.data || []);
      setRequests(requestRes.data.requests || []);
    } catch (error) {
      console.log("PROFILE ERROR:", error);
    } finally {
      setRefreshing(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <LinearGradient
          colors={["#0a0e1a", "#121828"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContainer}>
          <View style={styles.spinner} />
          <Text style={styles.loading}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  const lastLogin = history.find((log) => log.action === "login");
  const lastLogout = history.find((log) => log.action === "logout");
  const activeRequests = requests.filter((r) => r.status !== "completed");

  let sessionDuration = "-";
  if (lastLogin && lastLogout) {
    const diff =
      new Date(lastLogout.createdAt).getTime() -
      new Date(lastLogin.createdAt).getTime();
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    sessionDuration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "in_progress":
        return "#3b82f6";
      case "completed":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?"
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <LinearGradient
        colors={["#0a0e1a", "#121828", "#1a1f35"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.screen}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* HERO */}
        <Animated.View
          style={[
            styles.hero,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={["#6366f1", "#8b5cf6", "#a78bfa"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarRing}
            >
              <View style={styles.avatar}>
                {user.profileImage ? (
                  <Image
                    source={{
                      uri: `${api.defaults.baseURL}/uploads/users/${user.profileImage}`,
                    }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {getInitials(user.name)}
                  </Text>
                )}
              </View>
            </LinearGradient>
            <View style={styles.onlineDot} />
          </View>

          <Text style={styles.name}>{user.name}</Text>

          <View style={styles.roleBadge}>
            <View style={styles.roleDot} />
            <Text style={styles.roleText}>{user.role}</Text>
          </View>

          <Text style={styles.email}>{user.email}</Text>

          {user.phone && (
            <View style={styles.phoneRow}>
              <Ionicons name="call-outline" size={12} color="#64748b" />
              <Text style={styles.phoneText}>{user.phone}</Text>
            </View>
          )}
        </Animated.View>

        {/* COMPACT KPI CARDS */}
        <Animated.View style={[styles.kpiRow, { opacity: fadeAnim }]}>
          <KpiCard
            icon="business-outline"
            value={user.company ? 1 : 0}
            label="Company"
            color="#6366f1"
          />
          <KpiCard
            icon="hardware-chip-outline"
            value={user.availableEquipment?.length || 0}
            label="Equipment"
            color="#8b5cf6"
          />
          <KpiCard
            icon="file-tray-full-outline"
            value={activeRequests.length}
            label="Active"
            color="#10b981"
          />
        </Animated.View>

        {/* QUICK ACTIONS */}
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Quick Actions</Text>
          </View>
          <View style={styles.actionsRow}>
            <ActionPill
              icon="construct-outline"
              label="New Request"
              color="#6366f1"
              onPress={() => navigation.navigate("CreateRequest")}
            />
            <ActionPill
              icon="document-text-outline"
              label="My Requests"
              sublabel={`${activeRequests.length} active`}
              color="#8b5cf6"
              onPress={() => navigation.navigate("MyRequests")}
            />
          </View>
        </Animated.View>

        {/* EQUIPMENT */}
        {user.availableEquipment?.length > 0 && (
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>My Equipment</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {user.availableEquipment.length}
                </Text>
              </View>
            </View>

            {user.availableEquipment.map((equipment: any, index: number) => (
              <Pressable
                key={equipment.id}
                style={({ pressed }) => [
                  styles.equipmentCard,
                  pressed && styles.cardPressed,
                ]}
                android_ripple={{ color: "rgba(255,255,255,0.03)" }}
              >
                <View style={styles.equipmentLeft}>
                  <View
                    style={[
                      styles.equipmentIcon,
                      { backgroundColor: "rgba(99,102,241,0.1)" },
                    ]}
                  >
                    <Ionicons name="cube-outline" size={18} color="#818cf8" />
                  </View>
                  <View style={styles.equipmentInfo}>
                    <Text style={styles.equipmentName}>{equipment.name}</Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.equipmentMeta}>
                        S/N: {equipment.serialNumber || "—"}
                      </Text>
                    </View>
                    {(equipment.brand || equipment.model) && (
                      <Text style={styles.equipmentMeta}>
                        {equipment.brand} {equipment.model}
                      </Text>
                    )}
                  </View>
                </View>

                <Pressable
                  style={styles.addBtn}
                  onPress={() =>
                    navigation.navigate("CreateEquipmentRequest", {
                      equipmentId: equipment.id,
                      equipmentName: equipment.name,
                      serialNumber: equipment.serialNumber,
                      brand: equipment.brand,
                      model: equipment.model,
                    })
                  }
                >
                  <Ionicons name="add" size={18} color="#fff" />
                </Pressable>
              </Pressable>
            ))}
          </Animated.View>
        )}

        {/* COMPANY */}
        {user.company && (
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Company</Text>
            </View>

            <View style={styles.companyCard}>
              <View style={styles.companyHeader}>
                <View
                  style={[
                    styles.companyIcon,
                    { backgroundColor: "rgba(59,130,246,0.1)" },
                  ]}
                >
                  <Ionicons name="business" size={20} color="#60a5fa" />
                </View>
                <View style={styles.companyInfo}>
                  <Text style={styles.companyName}>{user.company.name}</Text>
                  <View style={styles.statusRow}>
                    <View
                      style={[styles.statusDot, { backgroundColor: "#10b981" }]}
                    />
                    <Text style={[styles.statusText, { color: "#10b981" }]}>
                      Active
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.companyDetails}>
                <DetailRow
                  icon="location-outline"
                  text={user.company.address}
                  fallback="No address"
                />
                <DetailRow
                  icon="call-outline"
                  text={user.company.phone}
                  fallback="No phone"
                />
                {user.company.email && (
                  <DetailRow
                    icon="mail-outline"
                    text={user.company.email}
                    fallback=""
                  />
                )}
              </View>
            </View>
          </Animated.View>
        )}

        {/* ACTIVITY */}
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Activity</Text>
          </View>

          <View style={styles.activityCard}>
            <ActivityRow
              icon="log-in-outline"
              title="Last Login"
              value={
                lastLogin ? new Date(lastLogin.createdAt).toLocaleString() : "—"
              }
              color="#10b981"
            />
            <ActivityRow
              icon="log-out-outline"
              title="Last Logout"
              value={
                lastLogout
                  ? new Date(lastLogout.createdAt).toLocaleString()
                  : "—"
              }
              color="#ef4444"
            />
            <ActivityRow
              icon="time-outline"
              title="Session"
              value={sessionDuration}
              color="#f59e0b"
              isLast
            />
          </View>
        </Animated.View>

        {/* ACTIVE REQUESTS */}
        {activeRequests.length > 0 && (
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Active Requests</Text>
              <Pressable onPress={() => navigation.navigate("MyRequests")}>
                <Text style={styles.seeAll}>See All</Text>
              </Pressable>
            </View>

            {activeRequests.slice(0, 3).map((request: any) => (
              <View key={request.id} style={styles.requestRow}>
                <View
                  style={[
                    styles.statusLine,
                    { backgroundColor: getStatusColor(request.status) },
                  ]}
                />
                <View style={styles.requestInfo}>
                  <Text style={styles.requestTitle}>
                    {request.title || "Untitled"}
                  </Text>
                  <Text style={styles.requestDate}>
                    {request.createdAt
                      ? new Date(request.createdAt).toLocaleDateString()
                      : "—"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: `${getStatusColor(request.status)}15` },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      { color: getStatusColor(request.status) },
                    ]}
                  >
                    {request.status}
                  </Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

// ============ SUB-COMPONENTS ============

function KpiCard({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.kpiCard}>
      <View style={[styles.kpiIconBox, { backgroundColor: `${color}12` }]}>
        <Ionicons name={icon as any} size={16} color={color} />
      </View>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function ActionPill({ icon, label, sublabel, color, onPress }: any) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionPill,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
      android_ripple={{ color: "rgba(255,255,255,0.05)" }}
    >
      <View style={[styles.actionPillIcon, { backgroundColor: `${color}12` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.actionPillLabel}>{label}</Text>
        {sublabel && <Text style={styles.actionPillSub}>{sublabel}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={16} color="#475569" />
    </Pressable>
  );
}

function ActivityRow({ icon, title, value, color, isLast }: any) {
  return (
    <View style={[styles.activityRow, !isLast && styles.activityRowBorder]}>
      <View style={[styles.activityIcon, { backgroundColor: `${color}12` }]}>
        <Ionicons name={icon} size={14} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activityValue}>{value}</Text>
      </View>
    </View>
  );
}

function DetailRow({
  icon,
  text,
  fallback,
}: {
  icon: string;
  text?: string;
  fallback: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons
        name={icon as any}
        size={13}
        color="#475569"
        style={{ marginRight: 10 }}
      />
      <Text style={[styles.detailText, !text && styles.detailFallback]}>
        {text || fallback}
      </Text>
    </View>
  );
}

// ============ STYLES ============

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e1a",
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop:
      Platform.OS === "ios" ? 60 : (StatusBar.currentHeight || 40) + 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    alignItems: "center",
  },
  spinner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: "#334155",
    borderTopColor: "#6366f1",
    marginBottom: 14,
  },
  loading: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
  },

  // Hero
  hero: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 14,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 52,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarText: {
    color: "#e2e8f0",
    fontSize: 28,
    fontWeight: "800",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  onlineDot: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10b981",
    borderWidth: 2.5,
    borderColor: "#0a0e1a",
  },
  name: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  roleBadge: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(99,102,241,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.15)",
  },
  roleDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#818cf8",
    marginRight: 6,
  },
  roleText: {
    color: "#a5b4fc",
    fontWeight: "700",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  email: {
    color: "#64748b",
    marginTop: 8,
    fontSize: 13,
    fontWeight: "500",
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    gap: 5,
  },
  phoneText: {
    color: "#475569",
    fontSize: 12,
  },

  // Compact KPI Cards
  kpiRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: "rgba(30,41,59,0.5)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  kpiIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 2,
  },
  kpiLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    flex: 1,
  },
  countBadge: {
    backgroundColor: "rgba(99,102,241,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.2)",
  },
  countBadgeText: {
    color: "#a5b4fc",
    fontSize: 11,
    fontWeight: "700",
  },
  seeAll: {
    color: "#6366f1",
    fontSize: 12,
    fontWeight: "700",
  },

  // Quick Actions
  actionsRow: {
    gap: 10,
  },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30,41,59,0.5)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    gap: 12,
  },
  actionPillIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  actionPillLabel: {
    color: "#e2e8f0",
    fontWeight: "700",
    fontSize: 14,
  },
  actionPillSub: {
    color: "#475569",
    fontSize: 12,
    marginTop: 1,
  },

  // Equipment
  equipmentCard: {
    backgroundColor: "rgba(30,41,59,0.4)",
    padding: 14,
    borderRadius: 16,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  equipmentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  equipmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    color: "#f1f5f9",
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 3,
  },
  metaRow: {
    marginTop: 1,
  },
  equipmentMeta: {
    color: "#475569",
    fontSize: 12,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },

  // Company
  companyCard: {
    backgroundColor: "rgba(30,41,59,0.4)",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  companyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  companyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    color: "#f1f5f9",
    fontWeight: "800",
    fontSize: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 3,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    marginVertical: 14,
  },
  companyDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    color: "#64748b",
    fontSize: 13,
    flex: 1,
  },
  detailFallback: {
    color: "#334155",
    fontStyle: "italic",
  },

  // Activity
  activityCard: {
    backgroundColor: "rgba(30,41,59,0.4)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  activityRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.03)",
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  activityTitle: {
    color: "#e2e8f0",
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 2,
  },
  activityValue: {
    color: "#475569",
    fontSize: 12,
  },

  // Requests
  requestRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30,41,59,0.4)",
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  statusLine: {
    width: 3,
    height: 36,
    borderRadius: 2,
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestTitle: {
    color: "#e2e8f0",
    fontWeight: "600",
    fontSize: 13,
  },
  requestDate: {
    color: "#475569",
    fontSize: 11,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
