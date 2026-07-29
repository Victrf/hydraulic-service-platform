import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Image,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../api/client";

export default function CustomerRequestDetailsScreen() {
  const route = useRoute<any>();
  const { requestId } = route.params;

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [serviceTab, setServiceTab] = useState<"company" | "technician">(
    "company",
  );
  const [showIdModal, setShowIdModal] = useState(false);

  useEffect(() => {
    loadRequest();
  }, []);

  const loadRequest = async () => {
    try {
      const res = await api.get(`/service-requests/${requestId}`);
      setRequest(res.data);
    } catch (error) {
      console.log("REQUEST DETAILS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#facc15";

      case "in-progress":
        return "#8b5cf6";

      case "completed":
        return "#22c55e";

      case "accepted":
        return "#7c3aed";

      default:
        return "#64748b";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";

      case "in-progress":
        return "In Progress";

      case "completed":
        return "Completed";

      case "accepted":
        return "Accepted";

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

  if (!request) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Request not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* HERO */}

      <View style={styles.hero}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: getStatusColor(request.status),
            },
          ]}
        >
          <Text style={styles.statusText}>
            {getStatusLabel(request.status)}
          </Text>
        </View>

        <Text style={styles.title}>{request.description}</Text>

        <Text style={styles.requestId}>
          Request #{request.id.slice(0, 8).toUpperCase()}
        </Text>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color="#94a3b8" />

          <Text style={styles.infoText}>
            {new Date(request.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* PROGRESS */}
      {/* PROGRESS */}
      <View style={styles.progressCard}>
        <Text style={styles.sectionTitle}>Request Progress</Text>

        <View style={styles.progressRow}>
          {/* Submitted */}
          <View style={styles.progressItem}>
            <View style={styles.progressCircleActive}>
              <Ionicons name="checkmark" size={12} color="#fff" />
            </View>

            <Text style={styles.progressLabel}>Submitted</Text>
          </View>

          <View
            style={[
              styles.progressLine,
              ["accepted", "in-progress", "completed"].includes(
                request.status,
              ) && styles.progressLineActive,
            ]}
          />

          {/* Accepted */}
          <View style={styles.progressItem}>
            <View
              style={[
                styles.progressCircle,
                ["accepted", "in-progress", "completed"].includes(
                  request.status,
                ) && styles.progressCircleActive,
              ]}
            >
              {["accepted", "in-progress", "completed"].includes(
                request.status,
              ) && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>

            <Text style={styles.progressLabel}>Accepted</Text>
          </View>

          <View
            style={[
              styles.progressLine,
              ["in-progress", "completed"].includes(request.status) &&
                styles.progressLineActive,
            ]}
          />

          {/* In Progress */}
          <View style={styles.progressItem}>
            <View
              style={[
                styles.progressCircle,
                ["in-progress", "completed"].includes(request.status) &&
                  styles.progressCircleActive,
              ]}
            >
              {["in-progress", "completed"].includes(request.status) && (
                <Ionicons name="checkmark" size={12} color="#fff" />
              )}
            </View>

            <Text style={styles.progressLabel}>In Progress</Text>
          </View>

          <View
            style={[
              styles.progressLine,
              request.status === "completed" && styles.progressLineActive,
            ]}
          />

          {/* Completed */}
          <View style={styles.progressItem}>
            <View
              style={[
                styles.progressCircle,
                request.status === "completed" &&
                  styles.progressCircleCompleted,
              ]}
            >
              {request.status === "completed" && (
                <Ionicons name="checkmark" size={12} color="#fff" />
              )}
            </View>

            <Text style={styles.progressLabel}>Completed</Text>
          </View>
        </View>
      </View>

      {/* REQUEST INFORMATION */}
      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color="#7c3aed"
          />

          <Text style={styles.cardTitle}>Request Information</Text>
        </View>

        <Pressable style={styles.metaRow} onPress={() => setShowIdModal(true)}>
          <Text style={styles.metaLabel}>Reference</Text>

          <View style={styles.referenceContainer}>
            <Text style={styles.referenceValue}>
              {request.id.slice(0, 8).toUpperCase()}...
            </Text>

            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </View>
        </Pressable>

        <View style={styles.divider} />

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Created</Text>

          <Text style={styles.metaValue}>
            {new Date(request.createdAt).toLocaleString()}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Updated</Text>

          <Text style={styles.metaValue}>
            {new Date(request.updatedAt || request.createdAt).toLocaleString()}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Current Status</Text>

          <Text
            style={[
              styles.metaValue,
              {
                color: getStatusColor(request.status),
              },
            ]}
          >
            {getStatusLabel(request.status)}
          </Text>
        </View>
      </View>
      {/* CUSTOMER PHOTOS */}
      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="images-outline" size={22} color="#7c3aed" />

          <Text style={styles.cardTitle}>Customer Photos</Text>
        </View>

        {request.images?.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {request.images.map((image: any, index: number) => (
              <Pressable
                key={index}
                style={styles.photoCard}
                onPress={() => {
                  // We'll add full-screen viewer later
                }}
              >
                <Image
                  source={{
                    uri: image.url,
                  }}
                  style={styles.photo}
                />
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyPhotos}>
            <Ionicons name="images-outline" size={40} color="#64748b" />

            <Text style={styles.emptyPhotosText}>No photos were uploaded.</Text>
          </View>
        )}
      </View>

      {/* SERVICE INFORMATION */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Service Information</Text>

        {/* TABS */}

        <View style={styles.serviceTabs}>
          <Pressable
            style={[
              styles.serviceTab,
              serviceTab === "company" && styles.serviceTabActive,
            ]}
            onPress={() => setServiceTab("company")}
          >
            <Ionicons
              name="business-outline"
              size={18}
              color={serviceTab === "company" ? "#fff" : "#94a3b8"}
            />

            <Text
              style={[
                styles.serviceTabText,
                serviceTab === "company" && styles.serviceTabTextActive,
              ]}
            >
              Company
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.serviceTab,
              serviceTab === "technician" && styles.serviceTabActive,
            ]}
            onPress={() => setServiceTab("technician")}
          >
            <Ionicons
              name="person-circle-outline"
              size={18}
              color={serviceTab === "technician" ? "#fff" : "#94a3b8"}
            />

            <Text
              style={[
                styles.serviceTabText,
                serviceTab === "technician" && styles.serviceTabTextActive,
              ]}
            >
              Technician
            </Text>
          </Pressable>
        </View>

        {/* CONTENT */}
        <View style={styles.infoCard}>
          {serviceTab === "company" ? (
            <>
              <View style={styles.cardHeader}>
                <Ionicons name="business-outline" size={22} color="#7c3aed" />

                <Text style={styles.cardTitle}>Company Details</Text>
              </View>

              <Text style={styles.infoMainText}>
                {request.company?.name || "No company assigned"}
              </Text>

              <Text style={styles.infoSubText}>
                {request.company?.address || "-"}
              </Text>

              <Text style={styles.infoSubText}>
                {request.company?.phone || "-"}
              </Text>
            </>
          ) : request.assignment?.technician ? (
            <>
              <View style={styles.cardHeader}>
                <Ionicons
                  name="person-circle-outline"
                  size={22}
                  color="#7c3aed"
                />

                <Text style={styles.cardTitle}>Assigned Technician</Text>
              </View>

              <Text style={styles.infoMainText}>
                {request.assignment.technician.name}
              </Text>

              <Text style={styles.infoSubText}>
                {request.assignment.technician.email}
              </Text>

              <Text style={styles.infoSubText}>
                {request.assignment.technician.phone || "-"}
              </Text>
            </>
          ) : (
            <View style={styles.waitingBox}>
              <Ionicons name="time-outline" size={28} color="#facc15" />

              <Text style={styles.waitingTitle}>Waiting for Assignment</Text>

              <Text style={styles.waitingText}>
                A technician will be assigned after your request has been
                reviewed.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* EQUIPMENT */}
      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="construct-outline" size={22} color="#7c3aed" />

          <Text style={styles.cardTitle}>Equipment</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Name</Text>

          <Text style={styles.infoValue}>{request.equipment?.name || "-"}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Brand</Text>

          <Text style={styles.infoValue}>
            {request.equipment?.brand || "-"}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Model</Text>

          <Text style={styles.infoValue}>
            {request.equipment?.model || "-"}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Serial Number</Text>

          <Text style={styles.infoValue}>
            {request.equipment?.serialNumber || "-"}
          </Text>
        </View>
      </View>

      <Modal
        transparent
        visible={showIdModal}
        animationType="fade"
        onRequestClose={() => setShowIdModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Request Reference</Text>

            <Text style={styles.fullReference}>{request.id}</Text>

            <TouchableOpacity
              style={styles.copyButton}
              onPress={async () => {
                await Clipboard.setStringAsync(request.id);
                setShowIdModal(false);
              }}
            >
              <Ionicons name="copy-outline" size={18} color="#fff" />

              <Text style={styles.copyButtonText}>Copy Reference</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowIdModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
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
    paddingBottom: 32,
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

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 10,
  },

  requestId: {
    color: "#7c3aed",
    fontWeight: "600",
    marginBottom: 18,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  infoText: {
    color: "#94a3b8",
    marginLeft: 8,
    fontSize: 14,
  },

  placeholderCard: {
    backgroundColor: "#111827",
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },

  placeholderTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  placeholderText: {
    color: "#94a3b8",
  },

  emptyText: {
    color: "#fff",
    fontSize: 16,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 24,
  },

  progressCard: {
    marginHorizontal: 20,
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 22,
    marginBottom: 20,
  },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  progressItem: {
    alignItems: "center",
  },

  progressCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#1f2937",
    borderWidth: 2,
    borderColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
  },

  progressCircleActive: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#7c3aed",
    justifyContent: "center",
    alignItems: "center",
  },

  progressCircleCompleted: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
  },

  progressLine: {
    flex: 1,
    height: 3,
    backgroundColor: "#1f2937",
    marginHorizontal: 8,
  },

  progressLineActive: {
    backgroundColor: "#7c3aed",
  },

  progressLabel: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },

  infoCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 18,
    padding: 20,
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

  infoItem: {
    marginBottom: 16,
  },

  infoLabel: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  infoValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  serviceTabs: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    borderRadius: 14,
    padding: 4,
    marginBottom: 18,
  },

  serviceTab: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },

  serviceTabActive: {
    backgroundColor: "#7c3aed",
  },

  serviceTabText: {
    color: "#94a3b8",
    fontWeight: "600",
    marginLeft: 8,
  },

  serviceTabTextActive: {
    color: "#fff",
  },
  infoSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },

  infoMainText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  infoSubText: {
    color: "#94a3b8",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 6,
  },

  waitingBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },

  waitingTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 8,
  },

  waitingText: {
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  photoCard: {
    marginRight: 12,
  },

  photo: {
    width: 140,
    height: 140,
    borderRadius: 14,
    backgroundColor: "#1e293b",
  },

  emptyPhotos: {
    alignItems: "center",
    paddingVertical: 30,
  },

  emptyPhotosText: {
    color: "#94a3b8",
    marginTop: 12,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },

  metaLabel: {
    color: "#94a3b8",
    fontSize: 14,
  },

  metaValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },

  divider: {
    height: 1,
    backgroundColor: "#1f2937",
  },
  referenceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  referenceValue: {
    color: "#7c3aed",
    fontWeight: "700",
    marginRight: 6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  modalCard: {
    width: "100%",
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 24,
  },

  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },

  fullReference: {
    color: "#cbd5e1",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },

  copyButton: {
    backgroundColor: "#7c3aed",
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  copyButtonText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 8,
  },

  closeButton: {
    marginTop: 14,
    paddingVertical: 14,
    alignItems: "center",
  },

  closeButtonText: {
    color: "#94a3b8",
    fontWeight: "600",
  },
});
