import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Image,
  Animated,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useEffect, useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../api/client";

export default function CompanyDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { companyId } = route.params;

  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "equipment"
  >("overview");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadCompany();
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
  }, []);

  const loadCompany = async () => {
    try {
      const res = await api.get(`/companies/${companyId}`);
      setCompany(res.data);
    } catch (err) {
      console.log("COMPANY DETAILS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) =>
    name
      ?.split(" ")
      ?.map((w) => w[0])
      ?.join("")
      ?.toUpperCase()
      ?.slice(0, 2) || "?";

  if (loading) {
    return (
      <View style={styles.screen}>
        <View style={styles.bgAccent} />
        <View style={styles.bgAccent2} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading company details...</Text>
        </View>
      </View>
    );
  }

  if (!company) {
    return (
      <View style={styles.screen}>
        <View style={styles.bgAccent} />
        <View style={styles.bgAccent2} />
        <View style={styles.center}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="business-outline" size={40} color="#64748b" />
          </View>
          <Text style={styles.emptyTitle}>Company Not Found</Text>
          <Pressable
            style={styles.emptyButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.emptyButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Background Accents */}
      <View style={styles.bgAccent} />
      <View style={styles.bgAccent2} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.backBtn,
              pressed && styles.backBtnPressed,
            ]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#f8fafc" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.editBtn,
              pressed && styles.editBtnPressed,
            ]}
            onPress={() => navigation.navigate("EditCompany", { company })}
          >
            <Ionicons name="create-outline" size={16} color="#fff" />
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        </Animated.View>

        {/* COMPANY HERO */}
        <Animated.View
          style={[
            styles.hero,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.heroGlow} />
          <View style={styles.logoContainer}>
            {company.logoUrl ? (
              <Image
                source={{
                  uri: `${api.defaults.baseURL}/uploads/companies/${company.logoUrl}`,
                }}
                style={styles.logo}
              />
            ) : (
              <View style={styles.logoFallback}>
                <Text style={styles.logoText}>{getInitials(company.name)}</Text>
              </View>
            )}
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>

          <Text style={styles.companyName}>{company.name}</Text>
          <Text style={styles.companyEmail}>
            {company.email || "No email on file"}
          </Text>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Ionicons name="people-outline" size={18} color="#818cf8" />
              <Text style={styles.quickStatValue}>
                {company.users?.length || 0}
              </Text>
              <Text style={styles.quickStatLabel}>Users</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStat}>
              <Ionicons
                name="hardware-chip-outline"
                size={18}
                color="#818cf8"
              />
              <Text style={styles.quickStatValue}>
                {company.equipment?.length || 0}
              </Text>
              <Text style={styles.quickStatLabel}>Equipment</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStat}>
              <Ionicons name="call-outline" size={18} color="#818cf8" />
              <Text style={styles.quickStatValue}>
                {company.phone ? "Yes" : "No"}
              </Text>
              <Text style={styles.quickStatLabel}>Phone</Text>
            </View>
          </View>
        </Animated.View>

        {/* TABS */}
        <Animated.View
          style={[
            styles.tabsContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Pressable
            style={[styles.tab, activeTab === "overview" && styles.tabActive]}
            onPress={() => setActiveTab("overview")}
          >
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={activeTab === "overview" ? "#818cf8" : "#64748b"}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "overview" && styles.tabTextActive,
              ]}
            >
              Overview
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tab, activeTab === "users" && styles.tabActive]}
            onPress={() => setActiveTab("users")}
          >
            <Ionicons
              name="people-outline"
              size={16}
              color={activeTab === "users" ? "#818cf8" : "#64748b"}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "users" && styles.tabTextActive,
              ]}
            >
              Users
            </Text>
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {company.users?.length || 0}
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={[styles.tab, activeTab === "equipment" && styles.tabActive]}
            onPress={() => setActiveTab("equipment")}
          >
            <Ionicons
              name="hardware-chip-outline"
              size={16}
              color={activeTab === "equipment" ? "#818cf8" : "#64748b"}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "equipment" && styles.tabTextActive,
              ]}
            >
              Equipment
            </Text>
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {company.equipment?.length || 0}
              </Text>
            </View>
          </Pressable>
        </Animated.View>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Company Info */}
            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconBox}>
                  <Ionicons name="business-outline" size={18} color="#818cf8" />
                </View>
                <Text style={styles.cardTitle}>Company Information</Text>
              </View>
              <View style={styles.divider} />
              <InfoRow
                icon="mail-outline"
                label="Email"
                value={company.email}
              />
              <InfoRow
                icon="call-outline"
                label="Phone"
                value={company.phone}
              />
              <InfoRow
                icon="location-outline"
                label="Address"
                value={company.address}
              />
            </View>

            {/* Contact Person */}
            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconBox}>
                  <Ionicons name="person-outline" size={18} color="#34d399" />
                </View>
                <Text style={styles.cardTitle}>Contact Person</Text>
              </View>
              <View style={styles.divider} />
              <InfoRow
                icon="person-outline"
                label="Name"
                value={company.contactName}
              />
              <InfoRow
                icon="mail-outline"
                label="Email"
                value={company.contactEmail}
              />
              <InfoRow
                icon="call-outline"
                label="Phone"
                value={company.contactPhone}
              />
              <InfoRow
                icon="briefcase-outline"
                label="Position"
                value={company.contactPosition}
              />
            </View>

            {/* Escalating Person */}
            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.cardIconBox,
                    {
                      backgroundColor: "rgba(248, 113, 113, 0.1)",
                      borderColor: "rgba(248, 113, 113, 0.2)",
                    },
                  ]}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={18}
                    color="#f87171"
                  />
                </View>
                <Text style={styles.cardTitle}>Escalation Contact</Text>
              </View>
              <View style={styles.divider} />
              <InfoRow
                icon="person-outline"
                label="Name"
                value={company.escalatingName}
              />
              <InfoRow
                icon="mail-outline"
                label="Email"
                value={company.escalatingEmail}
              />
              <InfoRow
                icon="call-outline"
                label="Phone"
                value={company.escalatingPhone}
              />
              <InfoRow
                icon="briefcase-outline"
                label="Position"
                value={company.escalatingPosition}
              />
            </View>
          </Animated.View>
        )}

        {/* USERS */}
        {activeTab === "users" && (
          <Animated.View style={{ opacity: fadeAnim }}>
            {company.users?.length > 0 ? (
              company.users.map((user: any, index: number) => (
                <Pressable
                  key={user.id || index}
                  style={({ pressed }) => [
                    styles.glassCard,
                    styles.userCard,
                    pressed && styles.cardPressed,
                  ]}
                >
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {getInitials(user.name)}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {user.name || "Unnamed User"}
                    </Text>
                    <Text style={styles.userMeta} numberOfLines={1}>
                      {user.email || "No email"}
                    </Text>
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleText}>
                        {user.role || "No role"}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#64748b" />
                </Pressable>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconBox}>
                  <Ionicons name="people-outline" size={32} color="#64748b" />
                </View>
                <Text style={styles.emptyTitle}>No Users</Text>
                <Text style={styles.emptyMessage}>
                  No users assigned to this company yet.
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* EQUIPMENT */}
        {activeTab === "equipment" && (
          <Animated.View style={{ opacity: fadeAnim }}>
            {company.equipment?.length > 0 ? (
              company.equipment.map((equipment: any, index: number) => (
                <Pressable
                  key={equipment.id || index}
                  style={({ pressed }) => [
                    styles.glassCard,
                    styles.equipmentCard,
                    pressed && styles.cardPressed,
                  ]}
                >
                  <View style={styles.equipmentIconBox}>
                    <Ionicons
                      name="construct-outline"
                      size={22}
                      color="#818cf8"
                    />
                  </View>
                  <View style={styles.equipmentInfo}>
                    <Text style={styles.equipmentName} numberOfLines={1}>
                      {equipment.name || equipment.title || "Equipment"}
                    </Text>
                    <View style={styles.equipmentMetaRow}>
                      <Text style={styles.equipmentMeta}>
                        <Text style={styles.equipmentMetaLabel}>SN: </Text>
                        {equipment.serialNumber || "-"}
                      </Text>
                    </View>
                    <View style={styles.equipmentTags}>
                      {equipment.brand && (
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>{equipment.brand}</Text>
                        </View>
                      )}
                      {equipment.model && (
                        <View style={[styles.tag, styles.tagModel]}>
                          <Text style={[styles.tagText, styles.tagTextModel]}>
                            {equipment.model}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#64748b" />
                </Pressable>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconBox}>
                  <Ionicons
                    name="hardware-chip-outline"
                    size={32}
                    color="#64748b"
                  />
                </View>
                <Text style={styles.emptyTitle}>No Equipment</Text>
                <Text style={styles.emptyMessage}>
                  No equipment assigned to this company yet.
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconBox}>
        <Ionicons name={icon} size={14} color="#64748b" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={1}>
          {value || "-"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#030712",
  },

  bgAccent: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#4f46e5",
    opacity: 0.12,
  },

  bgAccent2: {
    position: "absolute",
    bottom: -60,
    left: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#7c3aed",
    opacity: 0.1,
  },

  scroll: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#64748b",
    marginTop: 16,
    fontSize: 14,
    fontWeight: "500",
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    justifyContent: "center",
    alignItems: "center",
  },

  backBtnPressed: {
    transform: [{ scale: 0.95 }],
    backgroundColor: "rgba(15, 23, 42, 1)",
  },

  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#4f46e5",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  editBtnPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },

  editText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  /* HERO */
  hero: {
    alignItems: "center",
    marginBottom: 28,
    position: "relative",
  },

  heroGlow: {
    position: "absolute",
    top: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#4f46e5",
    opacity: 0.15,
  },

  logoContainer: {
    position: "relative",
    marginBottom: 16,
  },

  logo: {
    width: 100,
    height: 100,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },

  logoFallback: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: "rgba(79, 70, 229, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },

  logoText: {
    color: "#818cf8",
    fontSize: 32,
    fontWeight: "800",
  },

  statusBadge: {
    position: "absolute",
    bottom: -6,
    right: -6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22c55e",
    marginRight: 6,
  },

  statusText: {
    color: "#4ade80",
    fontSize: 11,
    fontWeight: "700",
  },

  companyName: {
    color: "#f8fafc",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 4,
  },

  companyEmail: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
  },

  quickStats: {
    flexDirection: "row",
    marginTop: 20,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    width: "100%",
  },

  quickStat: {
    flex: 1,
    alignItems: "center",
  },

  quickStatValue: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 6,
    marginBottom: 2,
  },

  quickStatLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  quickStatDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },

  /* TABS */
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
  },

  tabActive: {
    backgroundColor: "rgba(79, 70, 229, 0.15)",
  },

  tabText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "600",
  },

  tabTextActive: {
    color: "#e2e8f0",
    fontWeight: "700",
  },

  tabBadge: {
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },

  tabBadgeText: {
    color: "#818cf8",
    fontSize: 11,
    fontWeight: "700",
  },

  /* CARDS */
  glassCard: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 6,
  },

  cardPressed: {
    transform: [{ scale: 0.98 }],
    borderColor: "rgba(99, 102, 241, 0.2)",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
  },

  cardTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginBottom: 14,
  },

  /* INFO ROW */
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(2, 6, 23, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  infoValue: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "600",
  },

  /* USER CARD */
  userCard: {
    flexDirection: "row",
    alignItems: "center",
  },

  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(79, 70, 229, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },

  userAvatarText: {
    color: "#818cf8",
    fontSize: 16,
    fontWeight: "700",
  },

  userInfo: {
    flex: 1,
  },

  userName: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },

  userMeta: {
    color: "#64748b",
    fontSize: 13,
    marginBottom: 6,
  },

  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
  },

  roleText: {
    color: "#818cf8",
    fontSize: 11,
    fontWeight: "700",
  },

  /* EQUIPMENT CARD */
  equipmentCard: {
    flexDirection: "row",
    alignItems: "center",
  },

  equipmentIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
  },

  equipmentInfo: {
    flex: 1,
  },

  equipmentName: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },

  equipmentMetaRow: {
    marginBottom: 6,
  },

  equipmentMeta: {
    color: "#94a3b8",
    fontSize: 13,
  },

  equipmentMetaLabel: {
    color: "#64748b",
    fontWeight: "600",
  },

  equipmentTags: {
    flexDirection: "row",
    gap: 6,
  },

  tag: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },

  tagModel: {
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    borderColor: "rgba(56, 189, 248, 0.2)",
  },

  tagText: {
    color: "#4ade80",
    fontSize: 11,
    fontWeight: "700",
  },

  tagTextModel: {
    color: "#38bdf8",
  },

  /* EMPTY STATES */
  emptyCard: {
    alignItems: "center",
    paddingVertical: 48,
  },

  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  emptyTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },

  emptyMessage: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
    maxWidth: "80%",
  },

  emptyButton: {
    marginTop: 20,
    backgroundColor: "#4f46e5",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  emptyButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
