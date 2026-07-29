import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../api/client";

export default function ReportScreen({ route }: any) {
  const requestId = route?.params?.requestId;

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (requestId) {
      loadReport();
    }
  }, []);

  const loadReport = async () => {
    try {
      const res = await api.get(`/reports/request/${requestId}`);

      console.log("REPORT RESPONSE:", res.data);

      setReport(res.data);
    } catch (err: any) {
      console.log("REPORT ERROR:", err?.response?.data || err);
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

        <Text style={styles.emptyTitle}>Report Not Available</Text>

        <Text style={styles.emptyDescription}>
          This service request has been completed, but the technician has not
          submitted the completion report yet.
        </Text>

        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color="#7c3aed"
          />

          <Text style={styles.infoBoxText}>
            The report will become available once the technician completes and
            submits the service documentation.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* HERO */}
      <View style={styles.hero}>
        <View style={styles.completedBadge}>
          <Ionicons
            name="checkmark-circle"
            size={18}
            color="#020617"
            style={{ marginRight: 6 }}
          />

          <Text style={styles.completedText}>SERVICE COMPLETED</Text>
        </View>

        <Text style={styles.title}>Service Completion Report</Text>

        <Text style={styles.subtitle}>
          Official record of completed maintenance work
        </Text>
      </View>

      {/* REPORT INFORMATION */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Report Information</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Report ID</Text>

          <Text style={styles.value}>
            {report.id.slice(0, 8).toUpperCase()}...
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Completed On</Text>

          <Text style={styles.value}>
            {new Date(report.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* EQUIPMENT */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="construct-outline" size={22} color="#7c3aed" />

          <Text style={styles.cardTitle}>Equipment</Text>
        </View>

        <Text style={styles.mainText}>
          {report.serviceRequest?.equipment?.name || "-"}
        </Text>

        <Text style={styles.subText}>
          Brand: {report.serviceRequest?.equipment?.brand || "-"}
        </Text>

        <Text style={styles.subText}>
          Model: {report.serviceRequest?.equipment?.model || "-"}
        </Text>

        <Text style={styles.subText}>
          Serial Number: {report.serviceRequest?.equipment?.serialNumber || "-"}
        </Text>
      </View>

      {/* ORIGINAL REQUEST */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="document-text-outline" size={22} color="#7c3aed" />

          <Text style={styles.cardTitle}>Original Request</Text>
        </View>

        <Text style={styles.mainText}>
          {report.serviceRequest?.description}
        </Text>

        <Text style={styles.subText}>
          Location: {report.serviceRequest?.location || "-"}
        </Text>

        <Text style={styles.subText}>
          Status: {report.serviceRequest?.status || "-"}
        </Text>
      </View>

      {/* ASSIGNED TECHNICIAN */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="person-circle-outline" size={22} color="#7c3aed" />

          <Text style={styles.cardTitle}>Assigned Technician</Text>
        </View>

        {report.serviceRequest?.assignment?.technician ? (
          <>
            <Text style={styles.mainText}>
              {report.serviceRequest.assignment.technician.name}
            </Text>

            <Text style={styles.subText}>
              {report.serviceRequest.assignment.technician.email}
            </Text>

            <Text style={styles.subText}>
              {report.serviceRequest.assignment.technician.phone || "-"}
            </Text>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="person-remove-outline" size={34} color="#64748b" />

            <Text style={styles.emptyTitle}>No Technician Assigned</Text>

            <Text style={styles.emptySubtitle}>
              No technician information is available for this report.
            </Text>
          </View>
        )}
      </View>

      {/* INSPECTION FINDINGS */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="search-outline" size={22} color="#7c3aed" />

          <Text style={styles.cardTitle}>Inspection Findings</Text>
        </View>

        <Text style={styles.bodyText}>
          {report.findings || "No inspection findings available."}
        </Text>
      </View>

      {/* ROOT CAUSE */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="warning-outline" size={22} color="#7c3aed" />

          <Text style={styles.cardTitle}>Root Cause</Text>
        </View>

        <Text style={styles.bodyText}>
          {report.rootCause || "No root cause recorded."}
        </Text>
      </View>

      {/* WORK PERFORMED */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="build-outline" size={22} color="#7c3aed" />

          <Text style={styles.cardTitle}>Work Performed</Text>
        </View>

        <Text style={styles.bodyText}>
          {report.workPerformed || "No work performed recorded."}
        </Text>
      </View>

      {/* RECOMMENDATIONS */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="bulb-outline" size={22} color="#7c3aed" />

          <Text style={styles.cardTitle}>Recommendations</Text>
        </View>

        <Text style={styles.bodyText}>
          {report.recommendations || "No recommendations were provided."}
        </Text>
      </View>

      {/* COMPLETION CHECKLIST */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="checkbox-outline" size={22} color="#7c3aed" />

          <Text style={styles.cardTitle}>Completion Checklist</Text>
        </View>

        <ChecklistItem
          label="Equipment Tested"
          checked={report.equipmentTested}
        />

        <ChecklistItem
          label="Equipment Operational"
          checked={report.operational}
        />

        <ChecklistItem
          label="Customer Informed"
          checked={report.customerInformed}
        />

        <ChecklistItem label="Work Area Cleaned" checked={report.areaCleaned} />

        <ChecklistItem
          label="Safety Checks Completed"
          checked={report.safetyChecks}
        />

        <ChecklistItem
          label="Customer Accepted Work"
          checked={report.customerAccepted}
        />
      </View>

      {/* REQUEST PHOTOS */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="images-outline" size={22} color="#7c3aed" />

          <Text style={styles.cardTitle}>Customer Request Photos</Text>
        </View>

        {report.serviceRequest?.images?.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {report.serviceRequest.images.map((image: any, index: number) => (
              <Image
                key={index}
                source={{
                  uri: `${api.defaults.baseURL}/${image.imageUrl}`,
                }}
                style={styles.requestImage}
              />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noPhotos}>
            No photos were uploaded with this request.
          </Text>
        )}
      </View>

      {/* SERVICE TIMELINE */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="time-outline" size={22} color="#7c3aed" />

          <Text style={styles.cardTitle}>Service Timeline</Text>
        </View>

        {report.serviceRequest?.events?.length > 0 ? (
          report.serviceRequest.events.map((event: any, index: number) => (
            <View key={event.id} style={styles.timelineItem}>
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

                <Text style={styles.timelineDate}>
                  {new Date(event.createdAt).toLocaleString()}
                </Text>

                {event.description ? (
                  <Text style={styles.timelineDescription}>
                    {event.description}
                  </Text>
                ) : null}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noTimeline}>No service timeline available.</Text>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
function ChecklistItem({
  label,
  checked,
}: {
  label: string;
  checked: boolean;
}) {
  return (
    <View style={styles.checkItem}>
      <Ionicons
        name={checked ? "checkmark-circle" : "ellipse-outline"}
        size={22}
        color={checked ? "#22c55e" : "#64748b"}
      />

      <Text style={[styles.checkText, checked && styles.checkTextCompleted]}>
        {label}
      </Text>
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
      return "Technician Accepted Job";

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
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },

  center: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
  },

  hero: {
    paddingHorizontal: 22,
    paddingTop: 70,
    paddingBottom: 28,
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

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: 15,
    marginTop: 8,
  },

  card: {
    backgroundColor: "#111827",
    marginHorizontal: 20,
    marginBottom: 18,
    borderRadius: 18,
    padding: 20,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 18,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },

  label: {
    color: "#94a3b8",
    fontSize: 14,
  },

  value: {
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

  mainText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  subText: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 8,
  },

  placeholder: {
    color: "#94a3b8",
    fontSize: 15,
    lineHeight: 22,
  },

  emptyText: {
    color: "#fff",
    fontSize: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 20,
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 20,
  },
  emptyDescription: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 24,
    paddingHorizontal: 30,
    fontSize: 15,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#111827",
    marginTop: 30,
    marginHorizontal: 25,
    padding: 18,
    borderRadius: 16,
    alignItems: "flex-start",
  },
  infoBoxText: {
    flex: 1,
    color: "#cbd5e1",
    marginLeft: 12,
    lineHeight: 22,
  },

  emptySubtitle: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  bodyText: {
    color: "#e2e8f0",
    fontSize: 15,
    lineHeight: 24,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  checkText: {
    color: "#94a3b8",
    fontSize: 15,
    marginLeft: 12,
  },

  checkTextCompleted: {
    color: "#fff",
    fontWeight: "600",
  },
  requestImage: {
    width: 120,
    height: 120,
    borderRadius: 14,
    marginRight: 12,
    backgroundColor: "#1f2937",
  },

  noPhotos: {
    color: "#94a3b8",
    fontSize: 15,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 20,
  },

  timelineLeft: {
    alignItems: "center",
    width: 24,
  },

  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#7c3aed",
  },

  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: "#374151",
    marginTop: 4,
  },

  timelineContent: {
    flex: 1,
    paddingLeft: 16,
  },

  timelineTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  timelineDate: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 4,
  },

  timelineDescription: {
    color: "#cbd5e1",
    marginTop: 8,
    lineHeight: 22,
  },

  noTimeline: {
    color: "#94a3b8",
    fontSize: 15,
  },
});
