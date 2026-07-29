import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  Dimensions,
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../api/client";
import { useNavigation } from "@react-navigation/native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ReportDetailsScreen({ route }: any) {
  const { reportId } = route.params;
  const navigation = useNavigation<any>();

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const res = await api.get(`/reports/${reportId}`);
      console.log("REPORT DETAILS:", JSON.stringify(res.data, null, 2));
      setReport(res.data);
    } catch (err) {
      console.log("REPORT DETAILS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.center}>
        <Ionicons name="document-text-outline" size={80} color="#475569" />
        <Text style={styles.emptyTitle}>Report Not Found</Text>
        <Text style={styles.emptySubtitle}>
          This report could not be loaded.
        </Text>
      </View>
    );
  }

  const request = report.serviceRequest;
  const technician = request?.assignment?.technician;
  const company = request?.company;
  const equipment = request?.equipment;

  const checklistItems = [
    {
      label: "Equipment Tested",
      checked: report.equipmentTested,
      icon: "flask-outline",
    },
    {
      label: "Equipment Operational",
      checked: report.operational,
      icon: "checkmark-done-outline",
    },
    {
      label: "Customer Informed",
      checked: report.customerInformed,
      icon: "notifications-outline",
    },
    {
      label: "Work Area Cleaned",
      checked: report.areaCleaned,
      icon: "sparkles-outline",
    },
    {
      label: "Safety Checks Completed",
      checked: report.safetyChecks,
      icon: "shield-checkmark-outline",
    },
    {
      label: "Customer Accepted Service",
      checked: report.customerAccepted,
      icon: "thumbs-up-outline",
    },
  ];

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80",
      }}
      style={styles.bgImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <View style={styles.screen}>
        {/* HEADER BAR */}
        <View style={styles.headerBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Service Report</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* HERO */}
          <View style={styles.heroSection}>
            <View style={styles.completedRing}>
              <Ionicons name="shield-checkmark" size={32} color="#22c55e" />
            </View>

            <View style={styles.heroContent}>
              <View style={styles.completedPill}>
                <View style={styles.completedDot} />
                <Text style={styles.completedPillText}>COMPLETED</Text>
              </View>

              <Text style={styles.heroTitle}>
                {equipment?.name || "Service Report"}
              </Text>

              <View style={styles.heroMeta}>
                <Ionicons name="business-outline" size={14} color="#94a3b8" />
                <Text style={styles.heroMetaText}>
                  {company?.name || "Unknown Company"}
                </Text>
              </View>

              <View style={styles.heroMeta}>
                <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                <Text style={styles.heroMetaText}>
                  {report.createdAt
                    ? new Date(report.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "-"}
                </Text>
              </View>
            </View>
          </View>

          {/* TECHNICIAN */}
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

            <View style={styles.glassCard}>
              <View style={styles.profileRow}>
                {technician?.profileImage ? (
                  <Image
                    source={{
                      uri: `${api.defaults.baseURL}/uploads/users/${technician.profileImage}`,
                    }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={[styles.profileImage, styles.avatarFallback]}>
                    <Text style={styles.avatarInitial}>
                      {technician?.name?.charAt(0)?.toUpperCase() || "T"}
                    </Text>
                  </View>
                )}

                <View style={{ flex: 1 }}>
                  <Text style={styles.profileName}>
                    {technician?.name || "-"}
                  </Text>
                  <View style={styles.profileMeta}>
                    <Ionicons name="mail-outline" size={12} color="#94a3b8" />
                    <Text style={styles.profileMetaText}>
                      {technician?.email || "-"}
                    </Text>
                  </View>
                  <View style={styles.profileMeta}>
                    <Ionicons name="call-outline" size={12} color="#94a3b8" />
                    <Text style={styles.profileMetaText}>
                      {technician?.phone || "-"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* COMPANY */}
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
                {company?.logoUrl ? (
                  <Image
                    source={{
                      uri: `${api.defaults.baseURL}/uploads/companies/${company.logoUrl}`,
                    }}
                    style={styles.companyLogo}
                  />
                ) : (
                  <View style={[styles.companyLogo, styles.logoFallback]}>
                    <Text style={styles.logoInitial}>
                      {company?.name?.charAt(0)?.toUpperCase() || "C"}
                    </Text>
                  </View>
                )}

                <View style={{ flex: 1 }}>
                  <Text style={styles.profileName}>{company?.name || "-"}</Text>
                  <View style={styles.profileMeta}>
                    <Ionicons name="call-outline" size={12} color="#94a3b8" />
                    <Text style={styles.profileMetaText}>
                      {company?.phone || "No phone"}
                    </Text>
                  </View>
                  <View style={styles.profileMeta}>
                    <Ionicons
                      name="location-outline"
                      size={12}
                      color="#94a3b8"
                    />
                    <Text style={styles.profileMetaText}>
                      {company?.address || "No address"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* EQUIPMENT */}
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
                <InfoField label="Name" value={equipment?.name} />
                <InfoField label="Brand" value={equipment?.brand} />
              </View>
              <View style={styles.equipmentDivider} />
              <View style={styles.equipmentRow}>
                <InfoField label="Model" value={equipment?.model} />
                <InfoField label="Serial" value={equipment?.serialNumber} />
              </View>
            </View>
          </View>

          {/* ORIGINAL REQUEST */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: "rgba(245, 158, 11, 0.2)" },
                ]}
              >
                <Ionicons name="chatbubble-outline" size={16} color="#fbbf24" />
              </View>
              <Text style={styles.sectionTitle}>Original Request</Text>
            </View>

            <View style={styles.glassCard}>
              <Text style={styles.bodyText}>
                {request?.description || "No description provided."}
              </Text>

              <View style={styles.equipmentDivider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{request?.location || "-"}</Text>
              </View>
            </View>
          </View>

          {/* CUSTOMER PHOTOS */}
          {request?.images?.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View
                  style={[
                    styles.sectionIcon,
                    { backgroundColor: "rgba(59, 130, 246, 0.2)" },
                  ]}
                >
                  <Ionicons name="images-outline" size={16} color="#60a5fa" />
                </View>
                <Text style={styles.sectionTitle}>Request Photos</Text>
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
                {request.images.map((image: any, index: number) => (
                  <View key={index} style={styles.photoWrapper}>
                    <Image
                      source={{
                        uri: `${api.defaults.baseURL}/${image.imageUrl}`,
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

          {/* FINDINGS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: "rgba(124, 58, 237, 0.2)" },
                ]}
              >
                <Ionicons name="search-outline" size={16} color="#a78bfa" />
              </View>
              <Text style={styles.sectionTitle}>Inspection Findings</Text>
            </View>

            <View style={styles.glassCard}>
              <Text style={styles.bodyText}>
                {report.findings || "No findings recorded."}
              </Text>
            </View>
          </View>

          {/* ROOT CAUSE */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: "rgba(239, 68, 68, 0.2)" },
                ]}
              >
                <Ionicons name="bug-outline" size={16} color="#f87171" />
              </View>
              <Text style={styles.sectionTitle}>Root Cause</Text>
            </View>

            <View style={styles.glassCard}>
              <Text style={styles.bodyText}>
                {report.rootCause || "No root cause recorded."}
              </Text>
            </View>
          </View>

          {/* WORK PERFORMED */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: "rgba(16, 185, 129, 0.2)" },
                ]}
              >
                <Ionicons name="hammer-outline" size={16} color="#34d399" />
              </View>
              <Text style={styles.sectionTitle}>Work Performed</Text>
            </View>

            <View style={styles.glassCard}>
              <Text style={styles.bodyText}>
                {report.workPerformed || "No work performed recorded."}
              </Text>
            </View>
          </View>

          {/* RECOMMENDATIONS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: "rgba(59, 130, 246, 0.2)" },
                ]}
              >
                <Ionicons name="bulb-outline" size={16} color="#60a5fa" />
              </View>
              <Text style={styles.sectionTitle}>Recommendations</Text>
            </View>

            <View style={styles.glassCard}>
              <Text style={styles.bodyText}>
                {report.recommendations || "No recommendations provided."}
              </Text>
            </View>
          </View>

          {/* COMPLETION CHECKLIST */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: "rgba(245, 158, 11, 0.2)" },
                ]}
              >
                <Ionicons name="checkbox-outline" size={16} color="#fbbf24" />
              </View>
              <Text style={styles.sectionTitle}>Completion Checklist</Text>
            </View>

            <View style={styles.glassCard}>
              {checklistItems.map((item, index) => (
                <ChecklistItem
                  key={index}
                  label={item.label}
                  checked={item.checked}
                  icon={item.icon}
                  isLast={index === checklistItems.length - 1}
                />
              ))}
            </View>
          </View>

          {/* SERVICE TIMELINE */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: "rgba(124, 58, 237, 0.2)" },
                ]}
              >
                <Ionicons name="time-outline" size={16} color="#a78bfa" />
              </View>
              <Text style={styles.sectionTitle}>Service Timeline</Text>
            </View>

            {request?.events?.length ? (
              <View style={styles.glassCard}>
                {request.events.map((event: any, index: number) => (
                  <View
                    key={event.id}
                    style={[
                      styles.timelineItem,
                      index === request.events.length - 1 && {
                        marginBottom: 0,
                      },
                    ]}
                  >
                    <View style={styles.timelineLeft}>
                      <View
                        style={[
                          styles.timelineDot,
                          index === 0 && styles.timelineDotActive,
                        ]}
                      />
                      {index !== request.events.length - 1 && (
                        <View style={styles.timelineLine} />
                      )}
                    </View>

                    <View style={styles.timelineBody}>
                      <Text style={styles.timelineTitle}>
                        {formatEvent(event.type)}
                      </Text>
                      <Text style={styles.timelineTime}>
                        {new Date(event.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                      {event.description ? (
                        <Text style={styles.timelineDescription}>
                          {event.description}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={[styles.glassCard, styles.emptyState]}>
                <Ionicons name="time-outline" size={32} color="#64748b" />
                <Text style={styles.emptyStateText}>No timeline available</Text>
              </View>
            )}
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

/* SUB-COMPONENTS */

function ChecklistItem({
  label,
  checked,
  icon,
  isLast,
}: {
  label: string;
  checked: boolean;
  icon: string;
  isLast: boolean;
}) {
  return (
    <View style={[styles.checkItem, isLast && { borderBottomWidth: 0 }]}>
      <View
        style={[
          styles.checkIconBox,
          checked && { backgroundColor: "rgba(34, 197, 94, 0.15)" },
        ]}
      >
        <Ionicons
          name={checked ? "checkmark-circle" : (icon as any)}
          size={20}
          color={checked ? "#22c55e" : "#64748b"}
        />
      </View>
      <Text style={[styles.checkText, checked && styles.checkTextCompleted]}>
        {label}
      </Text>
      {checked && (
        <Ionicons
          name="checkmark"
          size={16}
          color="#22c55e"
          style={{ marginLeft: "auto" }}
        />
      )}
    </View>
  );
}

function InfoField({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.infoField}>
      <Text style={styles.infoFieldLabel}>{label}</Text>
      <Text style={styles.infoFieldValue}>{value || "-"}</Text>
    </View>
  );
}

function formatEvent(type: string) {
  switch (type) {
    case "created":
      return "Request Created";
    case "assigned":
      return "Technician Assigned";
    case "accepted":
      return "Technician Accepted";
    case "in-progress":
      return "Work Started";
    case "completed":
      return "Service Completed";
    case "report-submitted":
      return "Report Submitted";
    default:
      return type;
  }
}

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

  /* SCREEN */
  screen: {
    flex: 1,
  },

  /* LOADING / EMPTY */
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 20,
  },
  emptySubtitle: {
    color: "#94a3b8",
    fontSize: 15,
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 30,
    lineHeight: 22,
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
  completedRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
  },
  heroContent: {
    flex: 1,
    gap: 6,
  },
  completedPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    gap: 6,
  },
  completedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22c55e",
  },
  completedPillText: {
    color: "#22c55e",
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

  /* GLASS CARDS */
  glassCard: {
    backgroundColor: "rgba(17, 24, 39, 0.55)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.4)",
  },

  /* PROFILES */
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  profileImage: {
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

  /* EQUIPMENT */
  equipmentRow: {
    flexDirection: "row",
    gap: 16,
  },
  infoField: {
    flex: 1,
  },
  infoFieldLabel: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 4,
  },
  infoFieldValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  equipmentDivider: {
    height: 1,
    backgroundColor: "rgba(30, 41, 59, 0.4)",
    marginVertical: 12,
  },

  /* BODY TEXT */
  bodyText: {
    color: "#e2e8f0",
    fontSize: 15,
    lineHeight: 24,
  },

  /* INFO ROW */
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
  },
  infoLabel: {
    color: "#94a3b8",
    fontSize: 14,
  },
  infoValue: {
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

  /* CHECKLIST */
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(30, 41, 59, 0.3)",
    gap: 12,
  },
  checkIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(100, 116, 139, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  checkText: {
    color: "#94a3b8",
    fontSize: 14,
    flex: 1,
  },
  checkTextCompleted: {
    color: "#fff",
    fontWeight: "600",
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
  timelineDescription: {
    color: "#cbd5e1",
    marginTop: 8,
    lineHeight: 22,
    fontSize: 13,
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
