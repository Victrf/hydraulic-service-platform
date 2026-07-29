import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../api/client";
import SuccessModal from "../../components/common/SuccessModal";

export default function SubmitReportScreen({ route }: any) {
  const { requestId } = route.params;

  const [job, setJob] = useState<any>(null);
  const [findings, setFindings] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [workPerformed, setWorkPerformed] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [loading, setLoading] = useState(true);
  const [equipmentTested, setEquipmentTested] = useState(false);
  const [operational, setOperational] = useState(false);
  const [customerInformed, setCustomerInformed] = useState(false);
  const [areaCleaned, setAreaCleaned] = useState(false);
  const [safetyChecks, setSafetyChecks] = useState(false);
  const [customerAccepted, setCustomerAccepted] = useState(false);
  const navigation = useNavigation<any>();
  const [successVisible, setSuccessVisible] = useState(false);

  useEffect(() => {
    loadJob();
  }, []);

  const loadJob = async () => {
    try {
      const res = await api.get(`/technicians/my-jobs/${requestId}`);
      setJob(res.data);
    } catch (err) {
      console.log("LOAD JOB ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const submitReport = async () => {
    try {
      await api.post("/reports", {
        serviceRequestId: requestId,

        findings,
        rootCause,
        workPerformed,
        recommendations,

        equipmentTested,
        operational,
        customerInformed,
        areaCleaned,
        safetyChecks,
        customerAccepted,
      });

      setSuccessVisible(true);
    } catch (err: any) {
      console.log(
        "REPORT ERROR:",
        JSON.stringify(err?.response?.data, null, 2),
      );

      const errorMessage = Array.isArray(err?.response?.data?.message)
        ? err.response.data.message.join("\n")
        : err?.response?.data?.message || "Unable to submit report.";

      Alert.alert("Submission Failed", errorMessage);
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
        <Text style={styles.empty}>Unable to load this job.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        {/* HERO */}
        <View style={styles.hero}>
          <Text style={styles.pageTitle}>Service Completion Report</Text>

          <Text style={styles.pageSubtitle}>
            Complete the report before finishing this job.
          </Text>
        </View>
        {/* EQUIPMENT */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="construct-outline" size={22} color="#7c3aed" />

            <Text style={styles.cardTitle}>Equipment</Text>
          </View>

          <Text style={styles.mainText}>{job.equipment?.name}</Text>

          <Text style={styles.subText}>{job.company?.name}</Text>
        </View>
        {/* CUSTOMER REQUEST */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={22} color="#7c3aed" />

            <Text style={styles.cardTitle}>Customer Request</Text>
          </View>

          <Text style={styles.mainText}>{job.description}</Text>
        </View>
        {/* INSPECTION */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="search-outline" size={22} color="#7c3aed" />

            <Text style={styles.cardTitle}>Inspection</Text>
          </View>

          <Text style={styles.inputLabel}>Findings</Text>

          <TextInput
            value={findings}
            onChangeText={setFindings}
            placeholder="Describe what you found during inspection..."
            placeholderTextColor="#64748b"
            multiline
            textAlignVertical="top"
            style={styles.textArea}
          />

          <Text style={[styles.inputLabel, { marginTop: 20 }]}>Root Cause</Text>

          <TextInput
            value={rootCause}
            onChangeText={setRootCause}
            placeholder="Describe the root cause of the issue..."
            placeholderTextColor="#64748b"
            multiline
            textAlignVertical="top"
            style={styles.textArea}
          />
        </View>
        {/* WORK PERFORMED */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="construct-outline" size={22} color="#7c3aed" />

            <Text style={styles.cardTitle}>Work Performed</Text>
          </View>

          <Text style={styles.inputLabel}>Work Performed</Text>

          <TextInput
            value={workPerformed}
            onChangeText={setWorkPerformed}
            placeholder="Describe the repair or maintenance performed..."
            placeholderTextColor="#64748b"
            multiline
            textAlignVertical="top"
            style={styles.textArea}
          />

          <Text style={[styles.inputLabel, { marginTop: 20 }]}>
            Recommendations
          </Text>

          <TextInput
            value={recommendations}
            onChangeText={setRecommendations}
            placeholder="Provide recommendations for future maintenance..."
            placeholderTextColor="#64748b"
            multiline
            textAlignVertical="top"
            style={styles.textArea}
          />
        </View>
        {/* COMPLETION CHECKLIST */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="checkbox-outline" size={22} color="#7c3aed" />

            <Text style={styles.cardTitle}>Completion Checklist</Text>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Equipment Tested</Text>

            <Switch
              value={equipmentTested}
              onValueChange={setEquipmentTested}
              trackColor={{
                false: "#374151",
                true: "#7c3aed",
              }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Equipment Operational</Text>

            <Switch
              value={operational}
              onValueChange={setOperational}
              trackColor={{
                false: "#374151",
                true: "#7c3aed",
              }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Customer Informed</Text>

            <Switch
              value={customerInformed}
              onValueChange={setCustomerInformed}
              trackColor={{
                false: "#374151",
                true: "#7c3aed",
              }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Work Area Cleaned</Text>

            <Switch
              value={areaCleaned}
              onValueChange={setAreaCleaned}
              trackColor={{
                false: "#374151",
                true: "#7c3aed",
              }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Safety Checks Completed</Text>

            <Switch
              value={safetyChecks}
              onValueChange={setSafetyChecks}
              trackColor={{
                false: "#374151",
                true: "#7c3aed",
              }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Customer Accepted Service</Text>

            <Switch
              value={customerAccepted}
              onValueChange={setCustomerAccepted}
              trackColor={{
                false: "#374151",
                true: "#7c3aed",
              }}
              thumbColor="#fff"
            />
          </View>
        </View>
        {/* TIME TRACKING */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={22} color="#7c3aed" />

            <Text style={styles.cardTitle}>Time Tracking</Text>
          </View>

          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Started</Text>

            <Text style={styles.timeValue}>
              {job.startedAt
                ? new Date(job.startedAt).toLocaleString()
                : "Automatically recorded"}
            </Text>
          </View>

          <View style={styles.timeDivider} />

          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Completed</Text>

            <Text style={styles.timeValue}>
              Automatically recorded when report is submitted
            </Text>
          </View>
        </View>
        {/* SUBMIT */}

        <TouchableOpacity style={styles.submitButton} onPress={submitReport}>
          <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />

          <Text style={styles.submitButtonText}>Submit Service Report</Text>
        </TouchableOpacity>
      </ScrollView>
      <SuccessModal
        visible={successVisible}
        title="Service Completed"
        message="The service report has been submitted successfully."
        buttonText="View Completed Jobs"
        onContinue={() => {
          setSuccessVisible(false);

          navigation.navigate("TechnicianTabs", {
            screen: "Completed",
          });
        }}
      />
    </>
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
    paddingBottom: 30,
  },

  pageTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },

  pageSubtitle: {
    color: "#94a3b8",
    marginTop: 8,
    fontSize: 15,
  },

  card: {
    backgroundColor: "#111827",
    marginHorizontal: 20,
    marginBottom: 18,
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

  mainText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  subText: {
    color: "#94a3b8",
    marginTop: 8,
    fontSize: 14,
  },

  empty: {
    color: "#fff",
    fontSize: 16,
  },
  inputLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },

  textArea: {
    backgroundColor: "#1f2937",
    color: "#fff",
    borderRadius: 12,
    padding: 14,
    minHeight: 120,
    fontSize: 15,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },

  switchLabel: {
    color: "#fff",
    fontSize: 15,
    flex: 1,
    marginRight: 16,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },

  timeLabel: {
    color: "#94a3b8",
    fontSize: 15,
  },

  timeValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },

  timeDivider: {
    height: 1,
    backgroundColor: "#1f2937",
  },
  submitButton: {
    backgroundColor: "#10b981",
    marginHorizontal: 20,
    marginBottom: 40,
    marginTop: 10,
    borderRadius: 16,
    paddingVertical: 18,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  submitButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 10,
  },
});
