import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ImageBackground,
  Dimensions,
} from "react-native";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Ionicons } from "@expo/vector-icons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function RequestDetailScreen({ route, navigation }: any) {
  const { id } = route.params;

  const [request, setRequest] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    loadRequest();
    loadEvents();
  }, []);

  const loadRequest = async () => {
    try {
      const res = await api.get(`/service-requests/${id}`);
      setRequest(res.data);
    } catch (err) {
      console.log("LOAD REQUEST ERROR:", err);
    }
  };

  const loadEvents = async () => {
    try {
      const res = await api.get(`/service-requests/${id}/events`);
      setEvents(res.data || []);
    } catch (err) {
      console.log("EVENT ERROR:", err);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      await api.patch(`/service-requests/${id}/status`, { status });
      await loadRequest();
      await loadEvents();
    } catch (err) {
      console.log("STATUS ERROR:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return request?.assignment ? "#eab308" : "#f59e0b";
      case "accepted":
        return "#7c3aed";
      case "in-progress":
        return "#3b82f6";
      case "completed":
        return "#22c55e";
      default:
        return "#64748b";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "time-outline";
      case "accepted":
        return "checkmark-circle-outline";
      case "in-progress":
        return "hammer-outline";
      case "completed":
        return "shield-checkmark-outline";
      default:
        return "help-circle-outline";
    }
  };

  if (!request) {
    return (
      <View style={styles.loading}>
        <Ionicons name="refresh-outline" size={32} color="#7c3aed" />
        <Text style={styles.loadingText}>Loading request...</Text>
      </View>
    );
  }

  const isCompleted = request.status === "completed";

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80",
      }}
      style={styles.bgImage}
      resizeMode="cover"
    >
      {/* Dark overlay for readability */}
      <View style={styles.overlay} />

      <View style={styles.screen}>
        {/* HEADER BAR */}
        <View style={styles.headerBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Request Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* STATUS HERO */}
          <View style={styles.heroSection}>
            <View
              style={[
                styles.statusRing,
                { borderColor: getStatusColor(request.status) },
              ]}
            >
              <Ionicons
                name={getStatusIcon(request.status)}
                size={32}
                color={getStatusColor(request.status)}
              />
            </View>

            <View style={styles.heroContent}>
              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: getStatusColor(request.status) + "25" },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(request.status) },
                  ]}
                />
                <Text
                  style={[
                    styles.statusPillText,
                    { color: getStatusColor(request.status) },
                  ]}
                >
                  {request.status.replace("-", " ").toUpperCase()}
                </Text>
              </View>

              <Text style={styles.heroTitle}>
                {request.equipment?.name || "Service Request"}
              </Text>

              <View style={styles.heroMeta}>
                <Ionicons name="business-outline" size={14} color="#94a3b8" />
                <Text style={styles.heroMetaText}>
                  {request.company?.name || "Unknown Company"}
                </Text>
              </View>

              <View style={styles.heroMeta}>
                <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                <Text style={styles.heroMetaText}>
                  {new Date(request.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* ACTION BAR */}
          <View style={styles.actionBar}>
            {isCompleted ? (
              <Pressable
                style={[styles.actionBtn, styles.actionBtnPrimary]}
                onPress={async () => {
                  const res = await api.get(`/reports/request/${request.id}`);
                  navigation.navigate("ReportDetails", {
                    reportId: res.data.id,
                  });
                }}
              >
                <Ionicons name="document-text" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>View Report</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.actionBtn, styles.actionBtnPrimary]}
                onPress={() =>
                  navigation.navigate("TechnicianWorkload", {
                    requestId: request.id,
                  })
                }
              >
                <Ionicons
                  name={request.assignment ? "swap-horizontal" : "person-add"}
                  size={18}
                  color="#fff"
                />
                <Text style={styles.actionBtnText}>
                  {request.assignment ? "Reassign" : "Assign Technician"}
                </Text>
              </Pressable>
            )}

            {!request.assignment && !isCompleted && (
              <Pressable
                style={[styles.actionBtn, styles.actionBtnGhost]}
                onPress={() =>
                  navigation.navigate("TechnicianWorkload", {
                    requestId: request.id,
                  })
                }
              >
                <Ionicons name="flash-outline" size={18} color="#22c55e" />
                <Text style={[styles.actionBtnText, { color: "#22c55e" }]}>
                  Auto Assign
                </Text>
              </Pressable>
            )}
          </View>

          {/* DESCRIPTION */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: "rgba(124, 58, 237, 0.2)" },
                ]}
              >
                <Ionicons name="chatbubble-outline" size={16} color="#a78bfa" />
              </View>
              <Text style={styles.sectionTitle}>Customer Issue</Text>
            </View>

            <View style={styles.glassCard}>
              <Text style={styles.description}>{request.description}</Text>
            </View>
          </View>

          {/* INFO GRID */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: "rgba(59, 130, 246, 0.2)" },
                ]}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color="#60a5fa"
                />
              </View>
              <Text style={styles.sectionTitle}>Request Info</Text>
            </View>

            <View style={styles.infoGrid}>
              <InfoTile
                icon="business-outline"
                label="Company"
                value={request.company?.name}
                color="#3b82f6"
              />
              <InfoTile
                icon="construct-outline"
                label="Equipment"
                value={request.equipment?.name}
                color="#7c3aed"
              />
              <InfoTile
                icon="location-outline"
                label="Location"
                value={request.location}
                color="#ef4444"
              />
              <InfoTile
                icon="calendar-outline"
                label="Submitted"
                value={new Date(request.createdAt).toLocaleDateString()}
                color="#10b981"
              />
            </View>
          </View>

          {/* PHOTOS */}
          {request.images?.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View
                  style={[
                    styles.sectionIcon,
                    { backgroundColor: "rgba(245, 158, 11, 0.2)" },
                  ]}
                >
                  <Ionicons name="images-outline" size={16} color="#fbbf24" />
                </View>
                <Text style={styles.sectionTitle}>Photos</Text>
                <Text style={styles.photoCount}>
                  {request.images.length} photo
                  {request.images.length > 1 ? "s" : ""}
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 16 }}
              >
                {request.images.map((img: any, index: number) => (
                  <View key={img.id} style={styles.photoWrapper}>
                    <Image
                      source={{
                        uri: `${api.defaults.baseURL}/uploads/service-requests/${img.url}`,
                      }}
                      style={styles.photo}
                    />
                    <View style={styles.photoOverlay}>
                      <Text style={styles.photoIndex}>{index + 1}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* COMPANY CARD */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: "rgba(16, 185, 129, 0.2)" },
                ]}
              >
                <Ionicons name="briefcase-outline" size={16} color="#34d399" />
              </View>
              <Text style={styles.sectionTitle}>Company</Text>
            </View>

            <View style={styles.glassCard}>
              <View style={styles.profileRow}>
                {request.company?.logoUrl ? (
                  <Image
                    source={{
                      uri: `${api.defaults.baseURL}/uploads/companies/${request.company.logoUrl}`,
                    }}
                    style={styles.companyLogo}
                  />
                ) : (
                  <View style={[styles.companyLogo, styles.logoFallback]}>
                    <Text style={styles.logoInitial}>
                      {(request.company?.name || "C").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}

                <View style={{ flex: 1 }}>
                  <Text style={styles.profileName}>
                    {request.company?.name || "-"}
                  </Text>
                  <View style={styles.profileMeta}>
                    <Ionicons name="call-outline" size={12} color="#94a3b8" />
                    <Text style={styles.profileMetaText}>
                      {request.company?.phone || "No phone"}
                    </Text>
                  </View>
                  <View style={styles.profileMeta}>
                    <Ionicons
                      name="location-outline"
                      size={12}
                      color="#94a3b8"
                    />
                    <Text style={styles.profileMetaText}>
                      {request.company?.address || "No address"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* EQUIPMENT CARD */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: "rgba(239, 68, 68, 0.2)" },
                ]}
              >
                <Ionicons
                  name="hardware-chip-outline"
                  size={16}
                  color="#f87171"
                />
              </View>
              <Text style={styles.sectionTitle}>Equipment</Text>
            </View>

            <View style={styles.glassCard}>
              <View style={styles.equipmentRow}>
                <EquipmentField
                  label="Brand"
                  value={request.equipment?.brand}
                />
                <EquipmentField
                  label="Model"
                  value={request.equipment?.model}
                />
              </View>
              <View style={styles.equipmentDivider} />
              <EquipmentField
                label="Serial Number"
                value={request.equipment?.serialNumber}
                fullWidth
              />
            </View>
          </View>

          {/* TECHNICIAN CARD */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: "rgba(124, 58, 237, 0.2)" },
                ]}
              >
                <Ionicons name="person-outline" size={16} color="#a78bfa" />
              </View>
              <Text style={styles.sectionTitle}>Technician</Text>
            </View>

            {request.assignment?.technician ? (
              <View style={styles.glassCard}>
                <View style={styles.profileRow}>
                  {request.assignment.technician.profileImage ? (
                    <Image
                      source={{
                        uri: `${api.defaults.baseURL}/uploads/users/${request.assignment.technician.profileImage}`,
                      }}
                      style={styles.techAvatar}
                    />
                  ) : (
                    <View style={[styles.techAvatar, styles.avatarFallback]}>
                      <Text style={styles.avatarInitial}>
                        {request.assignment.technician.name
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </Text>
                    </View>
                  )}

                  <View style={{ flex: 1 }}>
                    <Text style={styles.profileName}>
                      {request.assignment.technician.name}
                    </Text>
                    <View style={styles.profileMeta}>
                      <Ionicons name="mail-outline" size={12} color="#94a3b8" />
                      <Text style={styles.profileMetaText}>
                        {request.assignment.technician.email}
                      </Text>
                    </View>
                    <View style={styles.profileMeta}>
                      <Ionicons name="call-outline" size={12} color="#94a3b8" />
                      <Text style={styles.profileMetaText}>
                        {request.assignment.technician.phone || "No phone"}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.assignmentBadge,
                      {
                        backgroundColor: getStatusColor(request.status) + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.assignmentBadgeText,
                        { color: getStatusColor(request.status) },
                      ]}
                    >
                      Active
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={[styles.glassCard, styles.unassignedCard]}>
                <View style={styles.unassignedRow}>
                  <View style={styles.unassignedIcon}>
                    <Ionicons
                      name="person-add-outline"
                      size={24}
                      color="#f59e0b"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.unassignedTitle}>
                      No Technician Assigned
                    </Text>
                    <Text style={styles.unassignedDesc}>
                      Assign someone to begin work on this request.
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={styles.assignBtn}
                  onPress={() =>
                    navigation.navigate("TechnicianWorkload", {
                      requestId: request.id,
                    })
                  }
                >
                  <Ionicons name="add-circle" size={18} color="#fff" />
                  <Text style={styles.assignBtnText}>Assign Now</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* TIMELINE */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: "rgba(59, 130, 246, 0.2)" },
                ]}
              >
                <Ionicons name="time-outline" size={16} color="#60a5fa" />
              </View>
              <Text style={styles.sectionTitle}>Activity</Text>
            </View>

            {events.length > 0 ? (
              <View style={styles.glassCard}>
                {events.map((event, index) => (
                  <View
                    key={event.id}
                    style={[
                      styles.timelineItem,
                      index === events.length - 1 && { marginBottom: 0 },
                    ]}
                  >
                    <View style={styles.timelineLeft}>
                      <View
                        style={[
                          styles.timelineDot,
                          index === 0 && styles.timelineDotActive,
                        ]}
                      />
                      {index !== events.length - 1 && (
                        <View style={styles.timelineLine} />
                      )}
                    </View>

                    <View style={styles.timelineBody}>
                      <Text style={styles.timelineTitle}>{event.message}</Text>
                      <Text style={styles.timelineTime}>
                        {new Date(event.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={[styles.glassCard, styles.emptyState]}>
                <Ionicons name="time-outline" size={32} color="#64748b" />
                <Text style={styles.emptyStateText}>No activity yet</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

/* SUB-COMPONENTS */

const InfoTile = ({ icon, label, value, color }: any) => (
  <View style={styles.infoTile}>
    <View style={[styles.infoTileIcon, { backgroundColor: color + "20" }]}>
      <Ionicons name={icon} size={16} color={color} />
    </View>
    <Text style={styles.infoTileLabel}>{label}</Text>
    <Text style={styles.infoTileValue} numberOfLines={1}>
      {value || "-"}
    </Text>
  </View>
);

const EquipmentField = ({ label, value, fullWidth }: any) => (
  <View style={[styles.equipmentField, fullWidth && { width: "100%" }]}>
    <Text style={styles.equipmentLabel}>{label}</Text>
    <Text style={styles.equipmentValue}>{value || "-"}</Text>
  </View>
);

const styles = StyleSheet.create({
  /* BACKGROUND */

  bgImage: {
    flex: 1,
    width: "100%",
    height: SCREEN_HEIGHT,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 6, 23, 0.88)",
  },

  /* SCREEN CONTAINER */

  screen: {
    flex: 1,
  },

  /* LOADING */

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
    gap: 12,
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 15,
  },

  /* HEADER BAR */

  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    backdropFilter: "blur(10px)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.5)",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  /* HERO */

  heroSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 16,
  },
  statusRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
  },
  heroContent: {
    flex: 1,
    gap: 6,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroMetaText: {
    color: "#94a3b8",
    fontSize: 13,
  },

  /* ACTION BAR */

  actionBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  actionBtnPrimary: {
    backgroundColor: "#7c3aed",
  },
  actionBtnGhost: {
    backgroundColor: "rgba(17, 24, 39, 0.5)",
    borderWidth: 1.5,
    borderColor: "#22c55e",
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  /* SECTIONS */

  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  photoCount: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "500",
  },

  /* GLASS CARDS — semi-transparent for bg visibility */

  glassCard: {
    backgroundColor: "rgba(17, 24, 39, 0.55)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.4)",
    backdropFilter: "blur(12px)",
  },

  /* DESCRIPTION */

  description: {
    color: "#e2e8f0",
    fontSize: 15,
    lineHeight: 24,
  },

  /* INFO GRID */

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  infoTile: {
    width: "47.5%",
    backgroundColor: "rgba(17, 24, 39, 0.55)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.4)",
  },
  infoTileIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  infoTileLabel: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 4,
  },
  infoTileValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  /* PHOTOS */

  photoWrapper: {
    marginRight: 12,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  photo: {
    width: 140,
    height: 140,
    borderRadius: 16,
    backgroundColor: "#1e293b",
  },
  photoOverlay: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  photoIndex: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  /* PROFILES */

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  companyLogo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#1e293b",
  },
  logoFallback: {
    backgroundColor: "#7c3aed",
    justifyContent: "center",
    alignItems: "center",
  },
  logoInitial: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  techAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1e293b",
    borderWidth: 2,
    borderColor: "#334155",
  },
  avatarFallback: {
    backgroundColor: "#7c3aed",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  profileName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  profileMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  profileMetaText: {
    color: "#94a3b8",
    fontSize: 13,
  },
  assignmentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  assignmentBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  /* EQUIPMENT */

  equipmentRow: {
    flexDirection: "row",
    gap: 16,
  },
  equipmentField: {
    flex: 1,
  },
  equipmentDivider: {
    height: 1,
    backgroundColor: "rgba(30, 41, 59, 0.4)",
    marginVertical: 12,
  },
  equipmentLabel: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 4,
  },
  equipmentValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  /* UNASSIGNED */

  unassignedCard: {
    gap: 16,
  },
  unassignedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  unassignedIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  unassignedTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  unassignedDesc: {
    color: "#94a3b8",
    marginTop: 3,
    fontSize: 13,
  },
  assignBtn: {
    backgroundColor: "#f59e0b",
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  assignBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  /* TIMELINE */

  timelineItem: {
    flexDirection: "row",
    marginBottom: 20,
  },
  timelineLeft: {
    width: 28,
    alignItems: "center",
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#475569",
    borderWidth: 2,
    borderColor: "#1e293b",
  },
  timelineDotActive: {
    backgroundColor: "#7c3aed",
    borderColor: "#7c3aed",
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: "rgba(30, 41, 59, 0.4)",
    marginTop: 4,
  },
  timelineBody: {
    flex: 1,
    paddingLeft: 12,
    paddingTop: 2,
  },
  timelineTitle: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  timelineTime: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 4,
  },

  /* EMPTY STATE */

  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 10,
  },
  emptyStateText: {
    color: "#94a3b8",
    fontSize: 14,
  },
});
