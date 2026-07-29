import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { api } from "../../api/client";

export default function MaintenanceVisitDetailsScreen({ route }: any) {
  const { visitId } = route.params;

  const [visit, setVisit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVisit();
  }, []);

  const loadVisit = async () => {
    try {
      const res = await api.get(`/maintenance-visits/${visitId}`);

      console.log("VISIT:", res.data);

      setVisit(res.data);
    } catch (err) {
      console.log("VISIT ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={{ color: "#fff" }}>Loading...</Text>
      </View>
    );
  }

  if (!visit) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Maintenance Report Not Found</Text>

        <Text style={styles.emptySubtitle}>
          Unable to load this maintenance report.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={["#020617", "#0f172a"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Maintenance Report</Text>

        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <Text style={styles.planName}>
              {visit.subscription.plan.displayName}
            </Text>

            <View
              style={[
                styles.statusBadge,
                visit.status === "completed"
                  ? styles.completedBadge
                  : styles.pendingBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  visit.status === "completed"
                    ? styles.completedText
                    : styles.pendingText,
                ]}
              >
                {visit.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.completedDate}>
            Completed{" "}
            {visit.completedAt
              ? new Date(visit.completedAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "-"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Equipment</Text>
              <Text style={styles.value}>{visit.equipment.name}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.label}>Brand</Text>
              <Text style={styles.value}>{visit.equipment.brand}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.label}>Model</Text>
              <Text style={styles.value}>{visit.equipment.model}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.label}>Serial Number</Text>
              <Text style={styles.value}>{visit.equipment.serialNumber}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inspection Findings</Text>

          {visit.findings.map((finding: any) => (
            <View key={finding.id} style={styles.findingCard}>
              <View style={styles.findingRow}>
                <MaterialCommunityIcons
                  name="tools"
                  size={22}
                  color="#f59e0b"
                />

                <View style={styles.findingContent}>
                  <Text style={styles.findingLabel}>Problem</Text>
                  <Text style={styles.findingValue}>{finding.problem}</Text>
                </View>
              </View>

              <View style={styles.findingRow}>
                <MaterialCommunityIcons
                  name="clipboard-pulse-outline"
                  size={22}
                  color="#3b82f6"
                />

                <View style={styles.findingContent}>
                  <Text style={styles.findingLabel}>Condition</Text>
                  <Text style={styles.findingValue}>{finding.condition}</Text>
                </View>
              </View>

              <View style={styles.findingRow}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={22}
                  color="#ef4444"
                />

                <View style={styles.findingContent}>
                  <Text style={styles.findingLabel}>Cause</Text>
                  <Text style={styles.findingValue}>{finding.cause}</Text>
                </View>
              </View>

              <View style={styles.findingRow}>
                <MaterialCommunityIcons
                  name="lightbulb-on-outline"
                  size={22}
                  color="#22c55e"
                />

                <View style={styles.findingContent}>
                  <Text style={styles.findingLabel}>Recommendation</Text>

                  <Text style={styles.findingValue}>
                    {finding.recommendation}
                  </Text>
                </View>
              </View>

              {finding.notes ? (
                <View style={styles.findingRow}>
                  <MaterialCommunityIcons
                    name="note-text-outline"
                    size={22}
                    color="#8b5cf6"
                  />

                  <View style={styles.findingContent}>
                    <Text style={styles.findingLabel}>Notes</Text>

                    <Text style={styles.findingValue}>{finding.notes}</Text>
                  </View>
                </View>
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>

          {visit.findings.map((finding: any) => (
            <View key={finding.id}>
              {finding.photos && finding.photos.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {finding.photos.map((photo: any, index: number) => (
                    <Image
                      key={index}
                      source={{ uri: photo.url || photo }}
                      style={styles.photo}
                    />
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.noPhotosCard}>
                  <MaterialCommunityIcons
                    name="image-off-outline"
                    size={40}
                    color="#64748b"
                  />

                  <Text style={styles.noPhotosText}>
                    No photos were uploaded for this inspection.
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit Summary</Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Image
                source={{
                  uri: `${api.defaults.baseURL}/uploads/users/${visit.technician.profileImage}`,
                }}
                style={styles.avatar}
              />

              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Technician</Text>
                <Text style={styles.summaryValue}>{visit.technician.name}</Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Image
                source={{
                  uri: `${api.defaults.baseURL}/uploads/companies/${visit.company.logoUrl}`,
                }}
                style={styles.companyLogo}
                resizeMode="contain"
              />

              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Company</Text>
                <Text style={styles.summaryValue}>{visit.company.name}</Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <MaterialCommunityIcons
                name="clipboard-text-outline"
                size={22}
                color="#8b5cf6"
              />

              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Maintenance Plan</Text>
                <Text style={styles.summaryValue}>
                  {visit.subscription.plan.displayName}
                </Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <MaterialCommunityIcons
                name="calendar-clock"
                size={22}
                color="#8b5cf6"
              />

              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Next Scheduled Visit</Text>
                <Text style={styles.summaryValue}>
                  {new Date(
                    visit.subscription.nextVisitDate,
                  ).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },

  subHeading: {
    fontSize: 15,
    color: "#94a3b8",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
    padding: 24,
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 20,
  },

  emptySubtitle: {
    color: "#94a3b8",
    fontSize: 15,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
  },

  headerCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  planName: {
    flex: 1,
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginRight: 12,
  },

  completedDate: {
    color: "#94a3b8",
    marginTop: 14,
    fontSize: 15,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  completedBadge: {
    backgroundColor: "#14532d",
  },

  pendingBadge: {
    backgroundColor: "#78350f",
  },

  completedText: {
    color: "#bbf7d0",
  },

  pendingText: {
    color: "#fde68a",
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 14,
  },

  infoCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  infoItem: {
    marginBottom: 18,
  },

  label: {
    color: "#94a3b8",
    fontSize: 13,
    marginBottom: 4,
  },

  value: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },

  findingCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  findingRow: {
    marginBottom: 18,
  },

  findingLabel: {
    color: "#94a3b8",
    fontSize: 13,
    marginBottom: 6,
  },

  findingValue: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 24,
  },

  photo: {
    width: 220,
    height: 170,
    borderRadius: 16,
    marginRight: 14,
    backgroundColor: "#1f2937",
  },

  noPhotosCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  noPhotosText: {
    color: "#94a3b8",
    marginTop: 12,
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  summaryContent: {
    marginLeft: 16,
    flex: 1,
  },

  summaryLabel: {
    color: "#94a3b8",
    fontSize: 13,
  },

  summaryValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 2,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: "#1f2937",
    marginVertical: 18,
  },
  findingContent: {
    flex: 1,
    marginLeft: 14,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1f2937",
  },

  companyLogo: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#fff",
    padding: 4,
  },
});
