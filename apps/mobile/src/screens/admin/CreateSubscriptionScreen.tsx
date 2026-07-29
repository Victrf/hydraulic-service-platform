import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { api } from "../../api/client";

const { width } = Dimensions.get("window");

export default function CreateSubscriptionScreen() {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

  const [companyId, setCompanyId] = useState("");
  const [userId, setUserId] = useState("");
  const [equipmentId, setEquipmentId] = useState("");
  const [planId, setPlanId] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    loadData();
  }, []);

  const animateIn = () => {
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadData = async () => {
    try {
      const [companyRes, userRes, equipmentRes, planRes] = await Promise.all([
        api.get("/companies"),
        api.get("/users"),
        api.get("/equipment"),
        api.get("/plans"),
      ]);

      setCompanies(companyRes.data || []);
      setUsers(userRes.data || []);
      setEquipment(equipmentRes.data || []);
      setPlans(planRes.data || []);
      animateIn();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const companyUsers = useMemo(() => {
    return users.filter(
      (u) => u.companyId === companyId && u.role === "customer",
    );
  }, [users, companyId]);

  const companyEquipment = useMemo(() => {
    return equipment.filter((e) => e.company?.id === companyId);
  }, [equipment, companyId]);

  const customerEquipment = useMemo(() => {
    if (!userId) return companyEquipment;
    const assigned = companyEquipment.filter((eq) =>
      eq.assignedUsers?.some((a: any) => a.user?.id === userId),
    );
    return assigned;
  }, [companyEquipment, userId]);

  useEffect(() => {
    setUserId("");
    setEquipmentId("");
  }, [companyId]);

  useEffect(() => {
    setEquipmentId("");
  }, [userId]);

  const getStepStatus = (step: number) => {
    if (step === 1) return companyId ? "completed" : "active";
    if (step === 2)
      return !companyId ? "pending" : userId ? "completed" : "active";
    if (step === 3)
      return !userId ? "pending" : equipmentId ? "completed" : "active";
    if (step === 4)
      return !equipmentId ? "pending" : planId ? "completed" : "active";
    return "pending";
  };

  const handleCreate = async () => {
    if (!companyId) {
      Alert.alert("Validation", "Please select a company.");
      return;
    }
    if (!userId) {
      Alert.alert("Validation", "Please select a customer.");
      return;
    }
    if (!equipmentId) {
      Alert.alert("Validation", "Please select equipment.");
      return;
    }
    if (!planId) {
      Alert.alert("Validation", "Please select a maintenance plan.");
      return;
    }

    try {
      setSaving(true);
      await api.post("/subscriptions/admin", {
        companyId,
        userId,
        equipmentId,
        planId,
      });
      Alert.alert("Success", "Subscription created successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      let message =
        err?.response?.data?.message || "Unable to create subscription.";
      if (Array.isArray(message)) message = message.join("\\n");
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <View style={styles.bgGradient}>
          <View style={[styles.bgOrb, styles.bgOrb1]} />
          <View style={[styles.bgOrb, styles.bgOrb2]} />
        </View>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading resources...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.screen}
    >
      <View style={styles.bgGradient}>
        <View style={[styles.bgOrb, styles.bgOrb1]} />
        <View style={[styles.bgOrb, styles.bgOrb2]} />
        <View style={[styles.bgOrb, styles.bgOrb3]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Create Subscription</Text>
            <Text style={styles.subtitle}>Set up a new maintenance plan</Text>
          </View>
          <View style={{ width: 44 }} />
        </Animated.View>

        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <View style={styles.stepsContainer}>
            {[1, 2, 3, 4].map((step, index) => {
              const status = getStepStatus(step);
              const isLast = index === 3;
              return (
                <View key={step} style={styles.stepWrapper}>
                  <View style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepCircle,
                        status === "completed" && styles.stepCompleted,
                        status === "active" && styles.stepActive,
                      ]}
                    >
                      {status === "completed" ? (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      ) : (
                        <Text
                          style={[
                            styles.stepNumber,
                            status === "active" && styles.stepNumberActive,
                          ]}
                        >
                          {step}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        status === "active" && styles.stepLabelActive,
                        status === "completed" && styles.stepLabelCompleted,
                      ]}
                    >
                      {step === 1
                        ? "Company"
                        : step === 2
                          ? "Customer"
                          : step === 3
                            ? "Equipment"
                            : "Plan"}
                    </Text>
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        styles.stepLine,
                        status === "completed" && styles.stepLineCompleted,
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
        >
          <View style={styles.formCard}>
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <View
                  style={[
                    styles.labelIcon,
                    { backgroundColor: "rgba(124, 58, 237, 0.15)" },
                  ]}
                >
                  <Ionicons name="business-outline" size={16} color="#a78bfa" />
                </View>
                <Text style={styles.label}>Company</Text>
                {companyId && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={12} color="#34d399" />
                  </View>
                )}
              </View>
              <View
                style={[styles.pickerBox, companyId && styles.pickerBoxActive]}
              >
                <Picker
                  selectedValue={companyId}
                  onValueChange={setCompanyId}
                  dropdownIconColor="#8b5cf6"
                  style={styles.picker}
                >
                  <Picker.Item label="Select a company..." value="" />
                  {companies.map((c) => (
                    <Picker.Item key={c.id} label={c.name} value={c.id} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <View
                  style={[
                    styles.labelIcon,
                    { backgroundColor: "rgba(59, 130, 246, 0.15)" },
                  ]}
                >
                  <Ionicons name="person-outline" size={16} color="#60a5fa" />
                </View>
                <Text
                  style={[styles.label, !companyId && styles.labelDisabled]}
                >
                  Customer
                </Text>
                {userId && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={12} color="#34d399" />
                  </View>
                )}
              </View>
              <View
                style={[
                  styles.pickerBox,
                  !companyId && styles.pickerBoxDisabled,
                  userId && styles.pickerBoxActive,
                ]}
              >
                <Picker
                  enabled={!!companyId}
                  selectedValue={userId}
                  onValueChange={setUserId}
                  dropdownIconColor={companyId ? "#3b82f6" : "#4b5563"}
                  style={styles.picker}
                >
                  <Picker.Item
                    label={
                      companyId
                        ? "Select a customer..."
                        : "Select company first"
                    }
                    value=""
                  />
                  {companyUsers.map((u) => (
                    <Picker.Item key={u.id} label={u.name} value={u.id} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <View
                  style={[
                    styles.labelIcon,
                    { backgroundColor: "rgba(16, 185, 129, 0.15)" },
                  ]}
                >
                  <Ionicons
                    name="hardware-chip-outline"
                    size={16}
                    color="#34d399"
                  />
                </View>
                <Text style={[styles.label, !userId && styles.labelDisabled]}>
                  Equipment
                </Text>
                {equipmentId && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={12} color="#34d399" />
                  </View>
                )}
              </View>
              <View
                style={[
                  styles.pickerBox,
                  !userId && styles.pickerBoxDisabled,
                  equipmentId && styles.pickerBoxActive,
                ]}
              >
                <Picker
                  enabled={!!userId}
                  selectedValue={equipmentId}
                  onValueChange={setEquipmentId}
                  dropdownIconColor={userId ? "#10b981" : "#4b5563"}
                  style={styles.picker}
                >
                  <Picker.Item
                    label={
                      userId ? "Select equipment..." : "Select customer first"
                    }
                    value=""
                  />
                  {customerEquipment.map((eq) => (
                    <Picker.Item key={eq.id} label={eq.name} value={eq.id} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <View
                  style={[
                    styles.labelIcon,
                    { backgroundColor: "rgba(245, 158, 11, 0.15)" },
                  ]}
                >
                  <Ionicons
                    name="clipboard-outline"
                    size={16}
                    color="#fbbf24"
                  />
                </View>
                <Text
                  style={[styles.label, !equipmentId && styles.labelDisabled]}
                >
                  Maintenance Plan
                </Text>
                {planId && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={12} color="#34d399" />
                  </View>
                )}
              </View>
              <View
                style={[
                  styles.pickerBox,
                  !equipmentId && styles.pickerBoxDisabled,
                  planId && styles.pickerBoxActive,
                ]}
              >
                <Picker
                  enabled={!!equipmentId}
                  selectedValue={planId}
                  onValueChange={setPlanId}
                  dropdownIconColor={equipmentId ? "#f59e0b" : "#4b5563"}
                  style={styles.picker}
                >
                  <Picker.Item
                    label={
                      equipmentId
                        ? "Select a plan..."
                        : "Select equipment first"
                    }
                    value=""
                  />
                  {plans.map((plan) => (
                    <Picker.Item
                      key={plan.id}
                      label={`${plan.name} (${plan.intervalMonths} months)`}
                      value={plan.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        </Animated.View>

        {companyId && userId && equipmentId && planId && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Ionicons name="receipt-outline" size={18} color="#a78bfa" />
                <Text style={styles.summaryTitle}>Subscription Summary</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Company</Text>
                <Text style={styles.summaryValue}>
                  {companies.find((c) => c.id === companyId)?.name}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Customer</Text>
                <Text style={styles.summaryValue}>
                  {users.find((u) => u.id === userId)?.name}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Equipment</Text>
                <Text style={styles.summaryValue}>
                  {equipment.find((e) => e.id === equipmentId)?.name}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Plan</Text>
                <Text style={styles.summaryValue}>
                  {plans.find((p) => p.id === planId)?.name}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <Pressable
            style={[
              styles.createButton,
              (!companyId || !userId || !equipmentId || !planId) &&
                styles.createButtonDisabled,
              saving && styles.createButtonSaving,
            ]}
            disabled={
              saving || !companyId || !userId || !equipmentId || !planId
            }
            onPress={handleCreate}
          >
            {saving ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={[styles.createButtonText, { marginLeft: 10 }]}>
                  Creating...
                </Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <View style={styles.buttonIconWrap}>
                  <Ionicons name="sparkles" size={20} color="#7c3aed" />
                </View>
                <Text style={styles.createButtonText}>Create Subscription</Text>
              </View>
            )}
          </Pressable>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  scroll: { flex: 1 },
  bgGradient: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
  bgOrb: { position: "absolute", borderRadius: 999, opacity: 0.1 },
  bgOrb1: {
    width: 350,
    height: 350,
    backgroundColor: "#7c3aed",
    top: -100,
    right: -80,
  },
  bgOrb2: {
    width: 280,
    height: 280,
    backgroundColor: "#2563eb",
    top: 200,
    left: -100,
  },
  bgOrb3: {
    width: 200,
    height: 200,
    backgroundColor: "#ec4899",
    bottom: 100,
    right: -50,
    opacity: 0.08,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },
  loadingText: {
    color: "#6b7280",
    marginTop: 14,
    fontSize: 14,
    fontWeight: "500",
  },
  content: { padding: 20, paddingTop: 50, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.5)",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 4,
    letterSpacing: 0.2,
  },

  stepsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  stepWrapper: { flexDirection: "row", alignItems: "center", flex: 1 },
  stepItem: { alignItems: "center" },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#334155",
  },
  stepActive: {
    borderColor: "#8b5cf6",
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  stepCompleted: { borderColor: "#10b981", backgroundColor: "#10b981" },
  stepNumber: { color: "#6b7280", fontSize: 13, fontWeight: "700" },
  stepNumberActive: { color: "#a78bfa" },
  stepLabel: {
    color: "#4b5563",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  stepLabelActive: { color: "#a78bfa" },
  stepLabelCompleted: { color: "#10b981" },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#1e293b",
    marginHorizontal: 6,
    marginBottom: 18,
  },
  stepLineCompleted: { backgroundColor: "#10b981" },

  formCard: {
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.6)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
    backdropFilter: "blur(20px)",
  },
  fieldGroup: { marginBottom: 20 },
  labelRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  labelIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  label: {
    color: "#e5e7eb",
    fontWeight: "700",
    fontSize: 14,
    flex: 1,
    letterSpacing: -0.2,
  },
  labelDisabled: { color: "#4b5563" },
  checkBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.4)",
  },
  pickerBox: {
    backgroundColor: "rgba(2, 6, 23, 0.6)",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#1e293b",
    overflow: "hidden",
  },
  pickerBoxActive: {
    borderColor: "rgba(139, 92, 246, 0.5)",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  pickerBoxDisabled: { opacity: 0.5, borderColor: "#1e293b" },
  picker: { color: "#e5e7eb", height: Platform.OS === "ios" ? 180 : 52 },

  summaryCard: {
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.6)",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  summaryTitle: {
    color: "#a78bfa",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  summaryLabel: { color: "#6b7280", fontSize: 13, fontWeight: "500" },
  summaryValue: {
    color: "#e5e7eb",
    fontSize: 13,
    fontWeight: "700",
    maxWidth: "60%",
    textAlign: "right",
  },
  summaryDivider: { height: 1, backgroundColor: "rgba(30, 41, 59, 0.6)" },

  createButton: {
    marginTop: 24,
    backgroundColor: "#7c3aed",
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.4)",
  },
  createButtonDisabled: {
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    shadowOpacity: 0,
    elevation: 0,
    borderColor: "#1e293b",
  },
  createButtonSaving: { opacity: 0.8 },
  buttonContent: { flexDirection: "row", alignItems: "center" },
  buttonIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: -0.2,
  },
});
