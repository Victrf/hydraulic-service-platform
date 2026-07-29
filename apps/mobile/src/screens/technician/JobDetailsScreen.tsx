import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, useCallback } from "react";
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import { api } from "../../api/client";

export default function JobDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const { requestId } = route.params;

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJob();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadJob();
    }, [requestId]),
  );

  const loadJob = async () => {
    try {
      const res = await api.get(`/technicians/my-jobs/${requestId}`);
      setJob(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  const acceptJob = async () => {
    try {
      await api.patch(`/technicians/my-jobs/${job.id}/accept`);

      loadJob();
    } catch (err) {
      console.log(err);

      Alert.alert("Error", "Unable to accept this job.");
    }
  };
  const startJob = async () => {
    try {
      await api.patch(`/technicians/my-jobs/${job.id}/start`);

      loadJob();
    } catch (err) {
      console.log(err);

      Alert.alert("Error", "Unable to start this job.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#f59e0b";

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";

      case "accepted":
        return "Accepted";

      case "in-progress":
        return "In Progress";

      case "completed":
        return "Completed";

      default:
        return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Job not found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../assets/images/dashboard-bg.png")}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
      >
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "rgba(2,6,23,0.74)",
            },
          ]}
        />
      </ImageBackground>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        {/* HERO */}

        <View style={styles.hero}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: getStatusColor(job.status),
              },
            ]}
          >
            <Text style={styles.statusText}>{getStatusLabel(job.status)}</Text>
          </View>

          <Text style={styles.title}>{job.equipment?.name}</Text>

          <Text style={styles.subtitle}>{job.company?.name}</Text>

          <Text style={styles.requestDescription}>{job.description}</Text>
        </View>

        {/* EQUIPMENT */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="construct-outline" size={22} color="#7c3aed" />

            <Text style={styles.cardTitle}>Equipment Details</Text>
          </View>

          <Text style={styles.mainText}>{job.equipment?.name}</Text>

          <Text style={styles.subText}>
            Brand: {job.equipment?.brand || "-"}
          </Text>

          <Text style={styles.subText}>
            Model: {job.equipment?.model || "-"}
          </Text>

          <Text style={styles.subText}>
            Serial Number: {job.equipment?.serialNumber || "-"}
          </Text>
        </View>

        {/* COMPANY */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="business-outline" size={22} color="#7c3aed" />

            <Text style={styles.cardTitle}>Company Information</Text>
          </View>

          <Text style={styles.mainText}>{job.company?.name}</Text>

          <Text style={styles.subText}>
            Address: {job.company?.address || "-"}
          </Text>

          <Text style={styles.subText}>Phone: {job.company?.phone || "-"}</Text>

          <Text style={styles.subText}>Email: {job.company?.email || "-"}</Text>

          <Text style={styles.subText}>
            Contact: {job.company?.contactName || "-"}
          </Text>

          <Text style={styles.subText}>
            Contact Phone: {job.company?.contactPhone || "-"}
          </Text>
        </View>

        {/* CUSTOMER REQUEST */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={22} color="#7c3aed" />

            <Text style={styles.cardTitle}>Customer Request</Text>
          </View>

          <Text style={styles.mainText}>{job.description}</Text>

          <Text style={styles.subText}>Location: {job.location || "-"}</Text>

          <Text style={styles.subText}>
            Created: {new Date(job.createdAt).toLocaleString()}
          </Text>
        </View>

        {/* CUSTOMER PHOTOS */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="images-outline" size={22} color="#7c3aed" />

            <Text style={styles.cardTitle}>Customer Photos</Text>
          </View>

          {job.images?.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {job.images.map((image: any) => (
                <Image
                  key={image.id}
                  source={{
                    uri: `${api.defaults.baseURL}/${image.imageUrl}`,
                  }}
                  style={styles.photo}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="image-outline" size={34} color="#64748b" />

              <Text style={styles.emptyTitle}>No Photos Uploaded</Text>

              <Text style={styles.emptySubtitle}>
                The customer didn't attach any images to this request.
              </Text>
            </View>
          )}
        </View>

        {/* SERVICE TIMELINE */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={22} color="#7c3aed" />

            <Text style={styles.cardTitle}>Service Timeline</Text>
          </View>

          {job.events?.length ? (
            job.events.map((event: any, index: number) => (
              <View key={event.id} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={styles.timelineDot} />

                  {index !== job.events.length - 1 && (
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

                  <Text style={styles.timelineDescription}>
                    {event.message}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noTimeline}>
              No activity has been recorded yet.
            </Text>
          )}
        </View>

        {/* ACTION PANEL */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flash-outline" size={22} color="#7c3aed" />

            <Text style={styles.cardTitle}>Job Actions</Text>
          </View>

          {job.status === "pending" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={acceptJob}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#fff"
              />

              <Text style={styles.actionButtonText}>Accept Job</Text>
            </TouchableOpacity>
          )}

          {job.status === "accepted" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.startButton]}
              onPress={startJob}
            >
              <Ionicons name="play-circle-outline" size={20} color="#fff" />

              <Text style={styles.actionButtonText}>Start Work</Text>
            </TouchableOpacity>
          )}

          {job.status === "in-progress" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.reportButton]}
              onPress={() =>
                navigation.navigate("SubmitReport", {
                  requestId: job.id,
                })
              }
            >
              <Ionicons name="document-text-outline" size={20} color="#fff" />

              <Text style={styles.actionButtonText}>
                Complete Service Report
              </Text>
            </TouchableOpacity>
          )}

          {job.status === "completed" && (
            <View style={styles.completedBox}>
              <Ionicons name="checkmark-circle" size={42} color="#22c55e" />

              <Text style={styles.completedTitle}>Job Completed</Text>

              <Text style={styles.completedText}>
                This job has already been completed and the service report has
                been submitted.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
      return "Job Accepted";

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
    backgroundColor: "transparent",
  },

  center: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 10,
    marginHorizontal: 20,
  },

  subtitle: {
    color: "#94a3b8",
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 30,
    fontSize: 16,
  },

  empty: {
    color: "#fff",
    fontSize: 16,
  },

  hero: {
    paddingHorizontal: 22,
    paddingTop: 70,
    paddingBottom: 30,
  },

  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 18,
  },

  statusText: {
    color: "#020617",
    fontWeight: "700",
    fontSize: 13,
  },

  requestDescription: {
    color: "#cbd5e1",
    marginTop: 18,
    lineHeight: 24,
    fontSize: 15,
  },

  card: {
    marginHorizontal: 20,
    marginBottom: 18,

    padding: 20,

    backgroundColor: "rgba(17,24,39,0.78)",

    borderRadius: 18,

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
    elevation: 5,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },

  mainText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  subText: {
    color: "#94a3b8",
    marginTop: 8,
    fontSize: 14,
  },

  photo: {
    width: 220,
    height: 170,
    borderRadius: 14,
    marginRight: 12,
  },

  emptyBox: {
    alignItems: "center",
    paddingVertical: 25,
  },

  emptyTitle: {
    color: "#fff",
    fontWeight: "700",
    marginTop: 10,
    fontSize: 15,
  },

  emptySubtitle: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 22,
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
  actionButton: {
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  acceptButton: {
    backgroundColor: "#7c3aed",
  },

  startButton: {
    backgroundColor: "#2563eb",
  },

  reportButton: {
    backgroundColor: "#10b981",
  },

  actionButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 10,
  },

  completedBox: {
    alignItems: "center",
    paddingVertical: 20,
  },

  completedTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },

  completedText: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
});
