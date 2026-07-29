import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../api/client";

export default function TechnicianReportScreen({ route }: any) {
  const { requestId } = route.params;

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReport();
  }, [requestId]);

  const loadReport = async () => {
    try {
      const res = await api.get(`/reports/request/${requestId}`);
      setReport(res.data);
    } catch (err: any) {
      console.log("REPORT ERROR:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };
  const onRefresh = async () => {
    setRefreshing(true);

    await loadReport();

    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingHero} />

        <View style={styles.loadingCard} />

        <View style={styles.loadingCard} />

        <View style={styles.loadingCard} />

        <ActivityIndicator
          size="large"
          color="#7c3aed"
          style={{ marginTop: 24 }}
        />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.center}>
        <Ionicons name="document-text-outline" size={60} color="#475569" />

        <Text style={styles.emptyTitle}>Report Not Found</Text>

        <Text style={styles.emptyText}>
          No service report exists for this job.
        </Text>
      </View>
    );
  }
  const formatEvent = (type: string) => {
    switch (type) {
      case "submitted":
        return "Request Submitted";

      case "assigned":
        return "Assigned";

      case "accepted":
        return "Job Accepted";

      case "in-progress":
        return "Work Started";

      case "completed":
        return "Service Completed";

      default:
        return type;
    }
  };

  const renderChecklistItem = (label: string, checked: boolean) => (
    <View style={styles.checkRow}>
      <Ionicons
        name={checked ? "checkmark-circle" : "close-circle"}
        size={20}
        color={checked ? "#22c55e" : "#ef4444"}
      />

      <Text style={styles.checkLabel}>{label}</Text>
    </View>
  );
  const duration =
    report?.startedAt && report?.completedAt
      ? Math.round(
          (new Date(report.completedAt).getTime() -
            new Date(report.startedAt).getTime()) /
            60000,
        )
      : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#7c3aed"
        />
      }
    >
      {/* HERO */}
      <View style={styles.hero}>
        <View style={styles.completedBadge}>
          <Ionicons
            name="checkmark-circle"
            size={18}
            color="#020617"
            style={{ marginRight: 6 }}
          />

          <Text style={styles.completedText}>REPORT SUBMITTED</Text>
        </View>

        <Text style={styles.title}>Service Completion Report</Text>

        <Text style={styles.subtitle}>
          Review the report you submitted for this service request.
        </Text>
      </View>

      {/* REPORT INFORMATION */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Report Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Report ID</Text>

          <Text style={styles.infoValue}>
            SR-{report.id.slice(0, 8).toUpperCase()}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Submitted</Text>

          <Text style={styles.infoValue}>
            {new Date(report.createdAt).toLocaleString()}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Company</Text>

          <Text style={styles.infoValue}>
            {report.serviceRequest?.company?.name || "-"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Equipment</Text>

          <Text style={styles.infoValue}>
            {report.serviceRequest?.equipment?.name || "-"}
          </Text>
        </View>
      </View>

      {/* INSPECTION */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name="search-circle-outline" size={22} color="#7c3aed" />

          <Text style={styles.sectionTitle}>Inspection</Text>
        </View>

        <Text style={styles.fieldLabel}>Findings</Text>

        <Text style={styles.value}>
          {report.findings || "No findings recorded."}
        </Text>

        <View style={styles.dividerLarge} />

        <Text style={styles.fieldLabel}>Root Cause</Text>

        <Text style={styles.value}>
          {report.rootCause || "No root cause recorded."}
        </Text>
      </View>

      {/* WORK SUMMARY */}

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name="construct-outline" size={22} color="#7c3aed" />

          <Text style={styles.sectionTitle}>Work Summary</Text>
        </View>

        <Text style={styles.fieldLabel}>Work Performed</Text>

        <Text style={styles.value}>
          {report.workPerformed || "No work details provided."}
        </Text>

        <View style={styles.dividerLarge} />

        <Text style={styles.fieldLabel}>Recommendations</Text>

        <Text style={styles.value}>
          {report.recommendations || "No recommendations provided."}
        </Text>
      </View>

      {/* COMPLETION CHECKLIST */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name="checkbox-outline" size={22} color="#7c3aed" />

          <Text style={styles.sectionTitle}>Completion Checklist</Text>
        </View>

        {renderChecklistItem("Equipment Tested", report.equipmentTested)}

        {renderChecklistItem("Operational", report.operational)}

        {renderChecklistItem("Customer Informed", report.customerInformed)}

        {renderChecklistItem("Area Cleaned", report.areaCleaned)}

        {renderChecklistItem("Safety Checks", report.safetyChecks)}

        {renderChecklistItem("Customer Accepted", report.customerAccepted)}
      </View>

      {/* TIME */}
      {/* SERVICE TIME */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name="time-outline" size={22} color="#7c3aed" />

          <Text style={styles.sectionTitle}>Service Time</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Started</Text>

          <Text style={styles.infoValue}>
            {report.startedAt
              ? new Date(report.startedAt).toLocaleString()
              : "-"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Completed</Text>

          <Text style={styles.infoValue}>
            {report.completedAt
              ? new Date(report.completedAt).toLocaleString()
              : "-"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Duration</Text>

          <Text style={styles.infoValue}>
            {duration !== null
              ? `${Math.floor(duration / 60)}h ${duration % 60}m`
              : "-"}
          </Text>
        </View>
      </View>
      {/* ORIGINAL CUSTOMER REQUEST */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name="document-text-outline" size={22} color="#7c3aed" />

          <Text style={styles.sectionTitle}>Original Customer Request</Text>
        </View>

        <Text style={styles.fieldLabel}>Description</Text>

        <Text style={styles.value}>
          {report.serviceRequest?.description || "No description provided."}
        </Text>

        <View style={styles.dividerLarge} />

        <Text style={styles.fieldLabel}>Service Location</Text>

        <Text style={styles.value}>
          {report.serviceRequest?.location || "No location provided."}
        </Text>
      </View>
      {/* CUSTOMER PHOTOS */}
      {report.serviceRequest?.images?.length > 0 && (
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="images-outline" size={22} color="#7c3aed" />

            <Text style={styles.sectionTitle}>Customer Photos</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {report.serviceRequest.images.map((image: any) => (
              <Image
                key={image.id}
                source={{
                  uri: image.imageUrl,
                }}
                style={styles.photo}
              />
            ))}
          </ScrollView>
        </View>
      )}
      {/* SERVICE TIMELINE */}
      {report.serviceRequest?.events?.length > 0 && (
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="git-network-outline" size={22} color="#7c3aed" />

            <Text style={styles.sectionTitle}>Service Timeline</Text>
          </View>

          {report.serviceRequest.events.map((event: any, index: number) => (
            <View key={event.id} style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={styles.timelineDot} />

                {index !== report.serviceRequest.events.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>

              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>
                  {formatEvent(event.type)}
                </Text>

                <Text style={styles.timelineMessage}>{event.message}</Text>

                <Text style={styles.timelineDate}>
                  {new Date(event.createdAt).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 50,
  },

  center: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },

  subtitle: {
    color: "#94a3b8",
    marginTop: 6,
    marginBottom: 24,
  },

  card: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,

    borderWidth: 1,
    borderColor: "#312e81",

    borderLeftWidth: 4,
    borderLeftColor: "#7c3aed",

    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },

  cardTitle: {
    color: "#7c3aed",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 12,
  },

  value: {
    color: "#fff",
    lineHeight: 24,
    fontSize: 15,
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 18,
  },

  emptyText: {
    color: "#94a3b8",
    marginTop: 10,
    textAlign: "center",
  },
  hero: {
    marginBottom: 24,
  },

  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#22c55e",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 18,
  },

  completedText: {
    color: "#020617",
    fontWeight: "700",
    fontSize: 12,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },

  infoLabel: {
    color: "#94a3b8",
    fontSize: 14,
  },

  infoValue: {
    color: "#fff",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
    marginLeft: 20,
  },

  divider: {
    height: 1,
    backgroundColor: "#1f2937",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 10,
  },

  fieldLabel: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
  },

  dividerLarge: {
    height: 1,
    backgroundColor: "#1f2937",
    marginVertical: 18,
  },

  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  checkLabel: {
    color: "#fff",
    fontSize: 15,
    marginLeft: 12,
  },
  photo: {
    width: 180,
    height: 140,
    borderRadius: 14,
    marginRight: 12,
    backgroundColor: "#1f2937",
  },
  timelineRow: {
    flexDirection: "row",
  },

  timelineLeft: {
    width: 30,
    alignItems: "center",
  },

  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#7c3aed",
    marginTop: 6,
  },

  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#334155",
    marginTop: 4,
  },

  timelineContent: {
    flex: 1,
    paddingBottom: 24,
    paddingLeft: 8,
  },

  timelineTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  timelineMessage: {
    color: "#cbd5e1",
    marginTop: 4,
    lineHeight: 22,
  },

  timelineDate: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  loadingHero: {
    height: 110,
    backgroundColor: "#111827",
    borderRadius: 18,
    marginBottom: 20,
  },

  loadingCard: {
    height: 130,
    backgroundColor: "#111827",
    borderRadius: 18,
    marginBottom: 16,
  },
});
