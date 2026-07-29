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

export default function UserDetailsScreen() {
  const route = useRoute<any>();
  const { userId } = route.params;
  const navigation = useNavigation<any>();

  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadUser();
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

  const loadUser = async () => {
    try {
      const userRes = await api.get(`/users/${userId}`);
      setUser(userRes.data);

      if (userRes.data.role === "admin") {
        const companyRes = await api.get("/companies");
        setCompanies(companyRes.data || []);
      }

      const requestRes = await api.get(`/service-requests/user/${userId}`);
      setRequests(requestRes.data.requests || []);

      const historyRes = await api.get(`/users/${userId}/activity`);
      setHistory(historyRes.data || []);
    } catch (err) {
      console.log("USER DETAILS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <View style={styles.bgAccent} />
        <View style={styles.bgAccent2} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading user details...</Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.screen}>
        <View style={styles.bgAccent} />
        <View style={styles.center}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="person-outline" size={40} color="#64748b" />
          </View>
          <Text style={styles.emptyTitle}>User Not Found</Text>
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

  const isAdmin = user.role === "admin";
  const isCustomer = user.role === "customer";
  const isTechnician = user.role === "technician";
  const activeRequests = requests.filter((r) => r.status !== "completed");
  const completedRequests = requests.filter((r) => r.status === "completed");

  const loginLogs = history.filter((log) => log.action === "LOGIN");
  const logoutLogs = history.filter((log) => log.action === "LOGOUT");
  const lastLogin = loginLogs[0];
  const lastLogout = logoutLogs[0];

  let sessionDuration = "-";
  if (lastLogin && lastLogout) {
    const start = new Date(lastLogin.createdAt).getTime();
    const end = new Date(lastLogout.createdAt).getTime();
    const diffMs = Math.abs(end - start);
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    sessionDuration = `${hours}h ${minutes}m`;
  }

  const getRoleColor = (role: string) => {
    if (role === "admin") return "#6366f1";
    if (role === "technician") return "#f59e0b";
    return "#10b981";
  };

  const getRoleBgColor = (role: string) => {
    if (role === "admin") return "rgba(99, 102, 241, 0.15)";
    if (role === "technician") return "rgba(245, 158, 11, 0.15)";
    return "rgba(16, 185, 129, 0.15)";
  };

  const getRoleBorderColor = (role: string) => {
    if (role === "admin") return "rgba(99, 102, 241, 0.3)";
    if (role === "technician") return "rgba(245, 158, 11, 0.3)";
    return "rgba(16, 185, 129, 0.3)";
  };

  const getStatusColor = (status: string) => {
    if (status === "completed")
      return { bg: "rgba(34, 197, 94, 0.15)", text: "#4ade80", dot: "#22c55e" };
    if (status === "pending")
      return {
        bg: "rgba(245, 158, 11, 0.15)",
        text: "#fbbf24",
        dot: "#f59e0b",
      };
    return { bg: "rgba(99, 102, 241, 0.15)", text: "#818cf8", dot: "#6366f1" };
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "person-outline" },
    ...(isAdmin
      ? [
          {
            id: "company",
            label: "Companies",
            icon: "business-outline",
            count: companies.length,
          },
          {
            id: "requests",
            label: "Requests",
            icon: "time-outline",
            count: activeRequests.length,
          },
          {
            id: "completed",
            label: "Completed",
            icon: "checkmark-circle-outline",
            count: completedRequests.length,
          },
          {
            id: "history",
            label: "History",
            icon: "timer-outline",
            count: history.length,
          },
        ]
      : []),
    ...(isCustomer
      ? [
          {
            id: "company",
            label: "Company",
            icon: "business-outline",
            count: user.company ? 1 : 0,
          },
          {
            id: "equipment",
            label: "Equipment",
            icon: "hardware-chip-outline",
            count: user.availableEquipment?.length || 0,
          },
          {
            id: "requests",
            label: "Requests",
            icon: "time-outline",
            count: activeRequests.length,
          },
          {
            id: "completed",
            label: "Completed",
            icon: "checkmark-circle-outline",
            count: completedRequests.length,
          },
          {
            id: "history",
            label: "History",
            icon: "timer-outline",
            count: history.length,
          },
        ]
      : []),
    ...(isTechnician
      ? [
          {
            id: "assigned",
            label: "Assigned",
            icon: "clipboard-outline",
            count: activeRequests.length,
          },
          {
            id: "completed",
            label: "Completed",
            icon: "checkmark-circle-outline",
            count: completedRequests.length,
          },
          {
            id: "history",
            label: "History",
            icon: "timer-outline",
            count: history.length,
          },
        ]
      : []),
  ];

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
            onPress={() => navigation.navigate("EditUser", { user })}
          >
            <Ionicons name="create-outline" size={16} color="#fff" />
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        </Animated.View>

        {/* PROFILE HERO */}
        <Animated.View
          style={[
            styles.hero,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.heroGlow} />
          <View style={styles.avatarContainer}>
            {user.profileImage ? (
              <Image
                source={{
                  uri: `${api.defaults.baseURL}/uploads/users/${user.profileImage}`,
                }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>
                  {user.name?.charAt(0)?.toUpperCase()}
                </Text>
              </View>
            )}
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor: getRoleBgColor(user.role),
                  borderColor: getRoleBorderColor(user.role),
                },
              ]}
            >
              <View
                style={[
                  styles.roleDot,
                  { backgroundColor: getRoleColor(user.role) },
                ]}
              />
              <Text
                style={[styles.roleText, { color: getRoleColor(user.role) }]}
              >
                {user.role?.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>

          {user.phone && (
            <View style={styles.phoneRow}>
              <Ionicons name="call-outline" size={14} color="#64748b" />
              <Text style={styles.phone}>{user.phone}</Text>
            </View>
          )}
        </Animated.View>

        {/* TABS */}
        <Animated.View
          style={[
            styles.tabsContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tabs.map((tab) => (
              <Pressable
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={16}
                  color={activeTab === tab.id ? "#818cf8" : "#64748b"}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.id && styles.tabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
                {"count" in tab && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{tab.count}</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconBox}>
                  <Ionicons name="person-outline" size={18} color="#818cf8" />
                </View>
                <Text style={styles.cardTitle}>User Information</Text>
              </View>
              <View style={styles.divider} />
              <InfoRow
                icon="person-outline"
                label="Full Name"
                value={user.name}
              />
              <InfoRow
                icon="mail-outline"
                label="Email Address"
                value={user.email}
              />
              <InfoRow
                icon="call-outline"
                label="Phone Number"
                value={user.phone}
              />
              <InfoRow icon="shield-outline" label="Role" value={user.role} />
            </View>

            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.cardIconBox,
                    {
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      borderColor: "rgba(16, 185, 129, 0.2)",
                    },
                  ]}
                >
                  <Ionicons
                    name="stats-chart-outline"
                    size={18}
                    color="#34d399"
                  />
                </View>
                <Text style={styles.cardTitle}>Activity Stats</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Ionicons name="calendar-outline" size={20} color="#818cf8" />
                  <Text style={styles.statValue}>
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                  <Text style={styles.statLabel}>Joined</Text>
                </View>
                <View style={styles.statBox}>
                  <Ionicons name="log-in-outline" size={20} color="#34d399" />
                  <Text style={styles.statValue}>
                    {lastLogin
                      ? new Date(lastLogin.createdAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" },
                        )
                      : "-"}
                  </Text>
                  <Text style={styles.statLabel}>Last Login</Text>
                </View>
                <View style={styles.statBox}>
                  <Ionicons name="log-out-outline" size={20} color="#f87171" />
                  <Text style={styles.statValue}>
                    {lastLogout
                      ? new Date(lastLogout.createdAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" },
                        )
                      : "-"}
                  </Text>
                  <Text style={styles.statLabel}>Last Logout</Text>
                </View>
                <View style={styles.statBox}>
                  <Ionicons name="time-outline" size={20} color="#fbbf24" />
                  <Text style={styles.statValue}>{sessionDuration}</Text>
                  <Text style={styles.statLabel}>Session</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* COMPANY */}
        {activeTab === "company" && (
          <Animated.View style={{ opacity: fadeAnim }}>
            {isAdmin && (
              <>
                {companies.length > 0 ? (
                  companies.map((company) => (
                    <Pressable
                      key={company.id}
                      style={({ pressed }) => [
                        styles.glassCard,
                        styles.companyCard,
                        pressed && styles.cardPressed,
                      ]}
                      onPress={() =>
                        navigation.navigate("CompanyDetails", {
                          companyId: company.id,
                        })
                      }
                    >
                      <View style={styles.companyTop}>
                        <View style={styles.companyAvatar}>
                          <Text style={styles.companyAvatarText}>
                            {company.name
                              ?.split(" ")
                              .map((w: string) => w[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </Text>
                        </View>
                        <View style={styles.companyInfo}>
                          <Text style={styles.companyName} numberOfLines={1}>
                            {company.name}
                          </Text>
                          <Text style={styles.companyMeta} numberOfLines={1}>
                            {company.address || "No address"}
                          </Text>
                        </View>
                        <View style={styles.statusBadgeGreen}>
                          <View style={styles.statusDotGreen} />
                          <Text style={styles.statusTextGreen}>Active</Text>
                        </View>
                      </View>
                      <View style={styles.divider} />
                      <View style={styles.companyStats}>
                        <View style={styles.companyStat}>
                          <Ionicons
                            name="people-outline"
                            size={14}
                            color="#64748b"
                          />
                          <Text style={styles.companyStatValue}>
                            {company.users?.length || 0}
                          </Text>
                          <Text style={styles.companyStatLabel}>Users</Text>
                        </View>
                        <View style={styles.companyStat}>
                          <Ionicons
                            name="hardware-chip-outline"
                            size={14}
                            color="#64748b"
                          />
                          <Text style={styles.companyStatValue}>
                            {company.equipment?.length || 0}
                          </Text>
                          <Text style={styles.companyStatLabel}>Equipment</Text>
                        </View>
                      </View>
                      <View style={styles.cardActions}>
                        <Pressable
                          style={({ pressed }) => [
                            styles.actionBtn,
                            styles.viewBtn,
                            pressed && styles.actionBtnPressed,
                          ]}
                          onPress={() =>
                            navigation.navigate("CompanyDetails", {
                              companyId: company.id,
                            })
                          }
                        >
                          <Ionicons
                            name="eye-outline"
                            size={14}
                            color="#818cf8"
                          />
                          <Text
                            style={[styles.actionBtnText, { color: "#818cf8" }]}
                          >
                            View
                          </Text>
                        </Pressable>
                        <Pressable
                          style={({ pressed }) => [
                            styles.actionBtn,
                            styles.editActionBtn,
                            pressed && styles.actionBtnPressed,
                          ]}
                          onPress={() =>
                            navigation.navigate("EditCompany", { company })
                          }
                        >
                          <Ionicons
                            name="create-outline"
                            size={14}
                            color="#38bdf8"
                          />
                          <Text
                            style={[styles.actionBtnText, { color: "#38bdf8" }]}
                          >
                            Edit
                          </Text>
                        </Pressable>
                      </View>
                    </Pressable>
                  ))
                ) : (
                  <View style={styles.emptyCard}>
                    <View style={styles.emptyIconBox}>
                      <Ionicons
                        name="business-outline"
                        size={32}
                        color="#64748b"
                      />
                    </View>
                    <Text style={styles.emptyTitle}>No Companies</Text>
                    <Text style={styles.emptyMessage}>
                      No companies registered in the system.
                    </Text>
                  </View>
                )}
              </>
            )}

            {isCustomer && (
              <>
                {user.company ? (
                  <Pressable
                    style={({ pressed }) => [
                      styles.glassCard,
                      styles.companyDetailCard,
                      pressed && styles.cardPressed,
                    ]}
                    onPress={() =>
                      navigation.navigate("CompanyDetails", {
                        companyId: user.company.id,
                      })
                    }
                  >
                    <View style={styles.companyDetailHeader}>
                      {user.company.logoUrl ? (
                        <Image
                          source={{
                            uri: `${api.defaults.baseURL}/uploads/companies/${user.company.logoUrl}`,
                          }}
                          style={styles.companyLogo}
                        />
                      ) : (
                        <View style={styles.companyLogoPlaceholder}>
                          <Text style={styles.companyLogoText}>
                            {user.company.name
                              ?.split(" ")
                              .map((w: string) => w[0])
                              .join("")
                              .toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={styles.companyDetailInfo}>
                        <Text style={styles.companyDetailName}>
                          {user.company.name}
                        </Text>
                        <View style={styles.statusBadgeGreen}>
                          <View style={styles.statusDotGreen} />
                          <Text style={styles.statusTextGreen}>Active</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.divider} />
                    <InfoRow
                      icon="mail-outline"
                      label="Email"
                      value={user.company.email}
                    />
                    <InfoRow
                      icon="location-outline"
                      label="Address"
                      value={user.company.address}
                    />
                    <InfoRow
                      icon="call-outline"
                      label="Phone"
                      value={user.company.phone}
                    />
                    <InfoRow
                      icon="person-outline"
                      label="Contact"
                      value={user.company.contactName}
                    />
                    <InfoRow
                      icon="briefcase-outline"
                      label="Position"
                      value={user.company.contactPosition}
                    />
                    <View style={styles.cardActions}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.actionBtn,
                          styles.viewBtn,
                          pressed && styles.actionBtnPressed,
                        ]}
                        onPress={() =>
                          navigation.navigate("CompanyDetails", {
                            companyId: user.company.id,
                          })
                        }
                      >
                        <Ionicons
                          name="eye-outline"
                          size={14}
                          color="#818cf8"
                        />
                        <Text
                          style={[styles.actionBtnText, { color: "#818cf8" }]}
                        >
                          View
                        </Text>
                      </Pressable>
                      <Pressable
                        style={({ pressed }) => [
                          styles.actionBtn,
                          styles.editActionBtn,
                          pressed && styles.actionBtnPressed,
                        ]}
                        onPress={() =>
                          navigation.navigate("EditCompany", {
                            company: user.company,
                          })
                        }
                      >
                        <Ionicons
                          name="create-outline"
                          size={14}
                          color="#38bdf8"
                        />
                        <Text
                          style={[styles.actionBtnText, { color: "#38bdf8" }]}
                        >
                          Edit
                        </Text>
                      </Pressable>
                    </View>
                  </Pressable>
                ) : (
                  <View style={styles.emptyCard}>
                    <View style={styles.emptyIconBox}>
                      <Ionicons
                        name="business-outline"
                        size={32}
                        color="#64748b"
                      />
                    </View>
                    <Text style={styles.emptyTitle}>No Company</Text>
                    <Text style={styles.emptyMessage}>
                      This user is not assigned to any company.
                    </Text>
                  </View>
                )}
              </>
            )}
          </Animated.View>
        )}

        {/* EQUIPMENT */}
        {activeTab === "equipment" && isCustomer && (
          <Animated.View style={{ opacity: fadeAnim }}>
            {user.availableEquipment?.length > 0 ? (
              user.availableEquipment.map((equipment: any, index: number) => (
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
                      {equipment.name}
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
                  <View style={styles.statusBadgeBlue}>
                    <Text style={styles.statusTextBlue}>Assigned</Text>
                  </View>
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
                  No equipment assigned to this user.
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* REQUESTS */}
        {activeTab === "requests" && (
          <Animated.View style={{ opacity: fadeAnim }}>
            {activeRequests.length > 0 ? (
              activeRequests.map((request) => {
                const statusStyle = getStatusColor(request.status);
                return (
                  <Pressable
                    key={request.id}
                    style={({ pressed }) => [
                      styles.glassCard,
                      styles.requestCard,
                      pressed && styles.cardPressed,
                    ]}
                    onPress={() =>
                      navigation.navigate("ServiceRequestDetails", {
                        requestId: request.id,
                      })
                    }
                  >
                    <View style={styles.requestHeader}>
                      <Text style={styles.requestTitle} numberOfLines={2}>
                        {request.description}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: statusStyle.bg,
                            borderColor: statusStyle.dot + "40",
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.statusBadgeDot,
                            { backgroundColor: statusStyle.dot },
                          ]}
                        />
                        <Text
                          style={[
                            styles.statusBadgeText,
                            { color: statusStyle.text },
                          ]}
                        >
                          {request.status}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.requestMetaRow}>
                      <Ionicons
                        name="hardware-chip-outline"
                        size={14}
                        color="#64748b"
                      />
                      <Text style={styles.requestMeta}>
                        {request.equipment?.name || "-"}
                      </Text>
                    </View>
                    <View style={styles.requestMetaRow}>
                      <Ionicons
                        name="business-outline"
                        size={14}
                        color="#64748b"
                      />
                      <Text style={styles.requestMeta}>
                        {request.company?.name || "-"}
                      </Text>
                    </View>
                    <View style={styles.requestMetaRow}>
                      <Ionicons
                        name="person-outline"
                        size={14}
                        color="#64748b"
                      />
                      <Text style={styles.requestMeta}>
                        {request.assignment?.technician?.name || "Unassigned"}
                      </Text>
                    </View>
                    {isAdmin && (
                      <View style={styles.cardActions}>
                        <Pressable
                          style={({ pressed }) => [
                            styles.actionBtn,
                            styles.assignBtn,
                            pressed && styles.actionBtnPressed,
                          ]}
                          onPress={() =>
                            navigation.navigate("AssignTechnician", {
                              requestId: request.id,
                              reassign: !!request.assignment,
                            })
                          }
                        >
                          <Ionicons
                            name="person-add-outline"
                            size={14}
                            color="#818cf8"
                          />
                          <Text
                            style={[styles.actionBtnText, { color: "#818cf8" }]}
                          >
                            {request.assignment ? "Reassign" : "Assign"}
                          </Text>
                        </Pressable>
                        <Pressable
                          style={({ pressed }) => [
                            styles.actionBtn,
                            styles.viewBtn,
                            pressed && styles.actionBtnPressed,
                          ]}
                          onPress={() =>
                            navigation.navigate("ServiceRequestDetails", {
                              requestId: request.id,
                            })
                          }
                        >
                          <Ionicons
                            name="eye-outline"
                            size={14}
                            color="#38bdf8"
                          />
                          <Text
                            style={[styles.actionBtnText, { color: "#38bdf8" }]}
                          >
                            View
                          </Text>
                        </Pressable>
                      </View>
                    )}
                    <View style={styles.requestDate}>
                      <Ionicons
                        name="calendar-outline"
                        size={12}
                        color="#475569"
                      />
                      <Text style={styles.requestDateText}>
                        {new Date(request.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            ) : (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconBox}>
                  <Ionicons
                    name="document-text-outline"
                    size={32}
                    color="#64748b"
                  />
                </View>
                <Text style={styles.emptyTitle}>No Requests</Text>
                <Text style={styles.emptyMessage}>
                  No active service requests found.
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* ASSIGNED */}
        {activeTab === "assigned" && isTechnician && (
          <Animated.View style={{ opacity: fadeAnim }}>
            {activeRequests.length > 0 ? (
              activeRequests.map((request) => (
                <Pressable
                  key={request.id}
                  style={({ pressed }) => [
                    styles.glassCard,
                    styles.requestCard,
                    pressed && styles.cardPressed,
                  ]}
                  onPress={() =>
                    navigation.navigate("ServiceRequestDetails", {
                      requestId: request.id,
                    })
                  }
                >
                  <Text style={styles.requestTitle} numberOfLines={2}>
                    {request.description}
                  </Text>
                  <View style={styles.divider} />
                  <View style={styles.requestMetaRow}>
                    <Ionicons
                      name="hardware-chip-outline"
                      size={14}
                      color="#64748b"
                    />
                    <Text style={styles.requestMeta}>
                      {request.equipment?.name || "-"}
                    </Text>
                  </View>
                  <View style={styles.requestMetaRow}>
                    <Ionicons
                      name="business-outline"
                      size={14}
                      color="#64748b"
                    />
                    <Text style={styles.requestMeta}>
                      {request.company?.name || "-"}
                    </Text>
                  </View>
                  <View style={styles.requestDate}>
                    <Ionicons
                      name="calendar-outline"
                      size={12}
                      color="#475569"
                    />
                    <Text style={styles.requestDateText}>
                      {new Date(request.createdAt).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                </Pressable>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconBox}>
                  <Ionicons
                    name="clipboard-outline"
                    size={32}
                    color="#64748b"
                  />
                </View>
                <Text style={styles.emptyTitle}>No Assignments</Text>
                <Text style={styles.emptyMessage}>
                  No work assigned to this technician.
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* COMPLETED */}
        {activeTab === "completed" && (
          <Animated.View style={{ opacity: fadeAnim }}>
            {completedRequests.length > 0 ? (
              completedRequests.map((request) => (
                <Pressable
                  key={request.id}
                  style={({ pressed }) => [
                    styles.glassCard,
                    styles.requestCard,
                    pressed && styles.cardPressed,
                  ]}
                  onPress={() =>
                    navigation.navigate("ServiceRequestDetails", {
                      requestId: request.id,
                    })
                  }
                >
                  <View style={styles.requestHeader}>
                    <Text style={styles.requestTitle} numberOfLines={2}>
                      {request.description}
                    </Text>
                    <View style={styles.statusBadgeGreen}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#22c55e"
                      />
                      <Text style={styles.statusTextGreen}>Done</Text>
                    </View>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.requestMetaRow}>
                    <Ionicons
                      name="hardware-chip-outline"
                      size={14}
                      color="#64748b"
                    />
                    <Text style={styles.requestMeta}>
                      {request.equipment?.name || "-"}
                    </Text>
                  </View>
                  <View style={styles.requestMetaRow}>
                    <Ionicons
                      name="business-outline"
                      size={14}
                      color="#64748b"
                    />
                    <Text style={styles.requestMeta}>
                      {request.company?.name || "-"}
                    </Text>
                  </View>
                  <View style={styles.requestMetaRow}>
                    <Ionicons name="person-outline" size={14} color="#64748b" />
                    <Text style={styles.requestMeta}>
                      {request.assignment?.technician?.name || "Unassigned"}
                    </Text>
                  </View>
                </Pressable>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconBox}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={32}
                    color="#64748b"
                  />
                </View>
                <Text style={styles.emptyTitle}>No Completed</Text>
                <Text style={styles.emptyMessage}>
                  No completed requests yet.
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* HISTORY */}
        {activeTab === "history" && (
          <Animated.View style={{ opacity: fadeAnim }}>
            {history.length > 0 ? (
              history.map((log, index) => (
                <View key={log.id || index} style={styles.glassCard}>
                  <View style={styles.historyHeader}>
                    <View
                      style={[
                        styles.historyIconBox,
                        {
                          backgroundColor:
                            log.action === "LOGIN"
                              ? "rgba(34, 197, 94, 0.1)"
                              : "rgba(248, 113, 113, 0.1)",
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          log.action === "LOGIN"
                            ? "log-in-outline"
                            : "log-out-outline"
                        }
                        size={16}
                        color={log.action === "LOGIN" ? "#22c55e" : "#f87171"}
                      />
                    </View>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyAction}>{log.action}</Text>
                      <Text style={styles.historyMessage} numberOfLines={1}>
                        {log.message}
                      </Text>
                    </View>
                    <Text style={styles.historyDate}>
                      {new Date(log.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconBox}>
                  <Ionicons name="timer-outline" size={32} color="#64748b" />
                </View>
                <Text style={styles.emptyTitle}>No History</Text>
                <Text style={styles.emptyMessage}>
                  No activity history found for this user.
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

  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },

  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },

  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: "rgba(79, 70, 229, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },

  avatarText: {
    color: "#818cf8",
    fontSize: 40,
    fontWeight: "800",
  },

  roleBadge: {
    position: "absolute",
    bottom: -6,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },

  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  roleText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  name: {
    color: "#f8fafc",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 4,
  },

  email: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
  },

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },

  phone: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "500",
  },

  /* TABS */
  tabsContainer: {
    marginBottom: 20,
  },

  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  tabActive: {
    backgroundColor: "rgba(79, 70, 229, 0.15)",
    borderColor: "rgba(99, 102, 241, 0.3)",
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
    marginVertical: 14,
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

  /* STATS GRID */
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  statBox: {
    width: "47%",
    backgroundColor: "rgba(2, 6, 23, 0.5)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  statValue: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 2,
  },

  statLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  /* COMPANY CARDS */
  companyCard: {
    padding: 16,
  },

  companyTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  companyAvatar: {
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

  companyAvatarText: {
    color: "#818cf8",
    fontSize: 16,
    fontWeight: "700",
  },

  companyInfo: {
    flex: 1,
  },

  companyName: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },

  companyMeta: {
    color: "#64748b",
    fontSize: 13,
  },

  companyStats: {
    flexDirection: "row",
    gap: 10,
  },

  companyStat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(2, 6, 23, 0.5)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  companyStatValue: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "800",
  },

  companyStatLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
  },

  companyDetailCard: {
    padding: 16,
  },

  companyDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  companyLogo: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },

  companyLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "rgba(79, 70, 229, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },

  companyLogoText: {
    color: "#818cf8",
    fontSize: 20,
    fontWeight: "700",
  },

  companyDetailInfo: {
    flex: 1,
  },

  companyDetailName: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },

  /* EQUIPMENT CARDS */
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

  /* REQUEST CARDS */
  requestCard: {
    padding: 16,
  },

  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  requestTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
    lineHeight: 22,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },

  statusBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  requestMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },

  requestMeta: {
    color: "#94a3b8",
    fontSize: 13,
    flex: 1,
  },

  requestDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },

  requestDateText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "500",
  },

  /* HISTORY */
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  historyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  historyInfo: {
    flex: 1,
  },

  historyAction: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },

  historyMessage: {
    color: "#64748b",
    fontSize: 13,
  },

  historyDate: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "500",
  },

  /* ACTIONS */
  cardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },

  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
  },

  actionBtnPressed: {
    transform: [{ scale: 0.95 }],
  },

  viewBtn: {
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    borderColor: "rgba(56, 189, 248, 0.2)",
  },

  editActionBtn: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderColor: "rgba(99, 102, 241, 0.2)",
  },

  assignBtn: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "rgba(16, 185, 129, 0.2)",
  },

  actionBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },

  /* STATUS BADGES */
  statusBadgeGreen: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },

  statusDotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22c55e",
  },

  statusTextGreen: {
    color: "#4ade80",
    fontSize: 11,
    fontWeight: "700",
  },

  statusBadgeBlue: {
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },

  statusTextBlue: {
    color: "#60a5fa",
    fontSize: 11,
    fontWeight: "700",
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
