import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import React, { useCallback, useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../api/client";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function SubscriptionDetailScreen({ route }: any) {
  const { subscription } = route.params;
  const navigation = useNavigation<any>();
  const [payments, setPayments] = useState<any[]>(subscription.payments || []);

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [renewModalVisible, setRenewModalVisible] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [cancellationNotes, setCancellationNotes] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const cancellationReasons = [
    "Customer Requested Cancellation",
    "Non-Payment",
    "Equipment Decommissioned",
    "Equipment Replaced",
    "Service Contract Terminated",
    "Administrative Correction",
    "Other",
  ];

  useFocusEffect(
    useCallback(() => {
      loadPayments();
      loadPlans();
      animateIn();
    }, []),
  );

  const loadPayments = async () => {
    try {
      const res = await api.get(`/payments/subscription/${subscription.id}`);
      setPayments(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const loadPlans = async () => {
    try {
      const res = await api.get("/plans");
      setPlans(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const lastPayment = payments.length > 0 ? payments[0] : null;
  const isAtRisk =
    !lastPayment || new Date(subscription.currentPeriodEnd) < new Date();
  const daysRemaining = Math.ceil(
    (new Date(subscription.currentPeriodEnd).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const getStatusConfig = () => {
    if (subscription.status === "cancelled")
      return {
        label: "Cancelled",
        color: "#6b7280",
        bg: "rgba(55, 65, 81, 0.8)",
        border: "#4b5563",
        icon: "close-circle",
      };
    if (isAtRisk)
      return {
        label: "At Risk",
        color: "#fbbf24",
        bg: "rgba(146, 64, 14, 0.6)",
        border: "#b45309",
        icon: "warning",
      };
    if (subscription.status === "active")
      return {
        label: "Active",
        color: "#34d399",
        bg: "rgba(30, 27, 75, 0.8)",
        border: "#4338ca",
        icon: "checkmark-circle",
      };
    return {
      label: subscription.status,
      color: "#9ca3af",
      bg: "rgba(55, 65, 81, 0.8)",
      border: "#4b5563",
      icon: "help-circle",
    };
  };

  const status = getStatusConfig();

  const handleCancel = async () => {
    if (!selectedReason) {
      Alert.alert(
        "Cancellation Reason Required",
        "Please select a reason before cancelling.",
      );
      return;
    }
    if (selectedReason === "Other" && cancellationNotes.trim().length === 0) {
      Alert.alert(
        "Additional Notes Required",
        "Please explain the reason for cancellation.",
      );
      return;
    }
    try {
      await api.patch(`/subscriptions/admin/${subscription.id}/cancel`, {
        reason: selectedReason,
        notes: cancellationNotes,
      });
      Alert.alert("Success", "Subscription cancelled successfully.");
      setCancelModalVisible(false);
      setSelectedReason("");
      setCancellationNotes("");
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(
        "Cancel failed",
        JSON.stringify(err?.response?.data ?? err.message, null, 2),
      );
    }
  };

  const handleRenew = async () => {
    if (!selectedPlanId) {
      Alert.alert(
        "Maintenance Plan Required",
        "Please select a maintenance plan.",
      );
      return;
    }
    try {
      await api.patch(`/subscriptions/admin/${subscription.id}/renew`, {
        planId: selectedPlanId,
      });
      Alert.alert("Success", "Subscription renewed successfully.");
      setRenewModalVisible(false);
      setSelectedPlanId("");
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(
        "Renewal Failed",
        JSON.stringify(err?.response?.data ?? err.message, null, 2),
      );
    }
  };

  const lifecycleItems = [
    {
      icon: "play-outline",
      label: "Start Date",
      value: new Date(subscription.startDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      color: "#60a5fa",
    },
    {
      icon: "calendar-outline",
      label: "Next Visit",
      value: new Date(subscription.nextVisitDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      color: "#a78bfa",
    },
    {
      icon: "time-outline",
      label: "Expiry",
      value: new Date(subscription.currentPeriodEnd).toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric", year: "numeric" },
      ),
      color: isAtRisk ? "#f87171" : "#34d399",
    },
    {
      icon: "hourglass-outline",
      label: "Days Left",
      value: daysRemaining > 0 ? `${daysRemaining} days` : "Expired",
      color: isAtRisk ? "#fbbf24" : "#34d399",
    },
  ];

  return (
    <View style={styles.screen}>
      {/* Background Orbs */}
      <View style={styles.bgGradient}>
        <View style={[styles.bgOrb, styles.bgOrb1]} />
        <View style={[styles.bgOrb, styles.bgOrb2]} />
        <View style={[styles.bgOrb, styles.bgOrb3]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
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
            <Text style={styles.title}>Subscription</Text>
            <Text style={styles.subtitle}>Detailed overview</Text>
          </View>
          <View style={{ width: 44 }} />
        </Animated.View>

        {/* Main Status Card */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
        >
          <View style={[styles.heroCard, { borderColor: status.border }]}>
            <View
              style={[styles.accentBar, { backgroundColor: status.border }]}
            />
            <View style={styles.heroHeader}>
              <View style={styles.heroLeft}>
                {subscription.company?.logoUrl ? (
                  <Image
                    source={{
                      uri: `${api.defaults.baseURL}/uploads/companies/${subscription.company.logoUrl}`,
                    }}
                    style={styles.companyLogo}
                  />
                ) : (
                  <View style={styles.logoPlaceholder}>
                    <Ionicons
                      name="business-outline"
                      size={22}
                      color="#8b5cf6"
                    />
                  </View>
                )}
                <View style={styles.heroInfo}>
                  <Text style={styles.company}>
                    {subscription.company?.name}
                  </Text>
                  <Text style={styles.equipment}>
                    {subscription.equipment?.name}
                  </Text>
                  <Text style={styles.plan}>{subscription.plan?.name}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: status.bg, borderColor: status.border },
                ]}
              >
                <Ionicons
                  name={status.icon as any}
                  size={14}
                  color={status.color}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.statusText, { color: status.color }]}>
                  {status.label}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressWrap}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.max(0, Math.min(100, (daysRemaining / 365) * 100))}%`,
                      backgroundColor: isAtRisk ? "#ef4444" : "#8b5cf6",
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Lifecycle Timeline */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: "rgba(124, 58, 237, 0.15)" },
                ]}
              >
                <Ionicons name="timer-outline" size={16} color="#a78bfa" />
              </View>
              <Text style={styles.section}>Lifecycle</Text>
            </View>
            <View style={styles.timelineGrid}>
              {lifecycleItems.map((item, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View
                    style={[
                      styles.timelineIcon,
                      { backgroundColor: `${item.color}20` },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={16}
                      color={item.color}
                    />
                  </View>
                  <Text style={styles.timelineLabel}>{item.label}</Text>
                  <Text style={[styles.timelineValue, { color: item.color }]}>
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Payment History */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: "rgba(16, 185, 129, 0.15)" },
                ]}
              >
                <Ionicons name="card-outline" size={16} color="#34d399" />
              </View>
              <Text style={styles.section}>Payment History</Text>
              <View style={styles.paymentCount}>
                <Text style={styles.paymentCountText}>{payments.length}</Text>
              </View>
            </View>

            {payments.length === 0 ? (
              <View style={styles.emptyPayments}>
                <Ionicons name="receipt-outline" size={32} color="#374151" />
                <Text style={styles.emptyPaymentsText}>
                  No payments recorded yet
                </Text>
              </View>
            ) : (
              payments.map((p: any, index: number) => (
                <View
                  key={p.id}
                  style={[
                    styles.paymentCard,
                    index === payments.length - 1 && { marginBottom: 0 },
                  ]}
                >
                  <View style={styles.paymentHeader}>
                    <View style={styles.paymentLeft}>
                      <View
                        style={[
                          styles.paymentIcon,
                          {
                            backgroundColor:
                              p.status === "success"
                                ? "rgba(16, 185, 129, 0.15)"
                                : "rgba(239, 68, 68, 0.15)",
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            p.status === "success"
                              ? "checkmark-circle"
                              : "alert-circle"
                          }
                          size={18}
                          color={p.status === "success" ? "#34d399" : "#f87171"}
                        />
                      </View>
                      <View>
                        <Text style={styles.paymentAmount}>
                          ₹{Number(p.amount).toLocaleString()}
                        </Text>
                        <Text style={styles.paymentDate}>
                          {new Date(
                            p.paymentDate || p.createdAt,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.paymentStatusBadge,
                        {
                          backgroundColor:
                            p.status === "success"
                              ? "rgba(16, 185, 129, 0.2)"
                              : "rgba(239, 68, 68, 0.2)",
                          borderColor:
                            p.status === "success"
                              ? "rgba(16, 185, 129, 0.4)"
                              : "rgba(239, 68, 68, 0.4)",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.paymentStatusText,
                          {
                            color:
                              p.status === "success" ? "#34d399" : "#f87171",
                          },
                        ]}
                      >
                        {p.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.paymentDivider} />

                  <View style={styles.paymentMetaGrid}>
                    <View style={styles.paymentMetaItem}>
                      <Text style={styles.paymentMetaLabel}>Method</Text>
                      <Text style={styles.paymentMetaValue}>
                        {p.method || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.paymentMetaItem}>
                      <Text style={styles.paymentMetaLabel}>Reference</Text>
                      <Text style={styles.paymentMetaValue} numberOfLines={1}>
                        {p.transactionReference || "-"}
                      </Text>
                    </View>
                    <View style={styles.paymentMetaItem}>
                      <Text style={styles.paymentMetaLabel}>Recorded By</Text>
                      <Text style={styles.paymentMetaValue}>
                        {p.recordedBy?.name || "-"}
                      </Text>
                    </View>
                  </View>

                  {p.notes ? (
                    <>
                      <View style={styles.paymentDivider} />
                      <View style={styles.notesRow}>
                        <Ionicons
                          name="document-text-outline"
                          size={14}
                          color="#6b7280"
                        />
                        <Text style={styles.notesText}>{p.notes}</Text>
                      </View>
                    </>
                  ) : null}
                </View>
              ))
            )}
          </View>
        </Animated.View>

        {/* Actions */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: "rgba(245, 158, 11, 0.15)" },
                ]}
              >
                <Ionicons name="flash-outline" size={16} color="#fbbf24" />
              </View>
              <Text style={styles.section}>Actions</Text>
            </View>

            {subscription.status === "active" ? (
              <>
                <Pressable
                  style={styles.actionBtnPrimary}
                  onPress={() =>
                    navigation.navigate("RecordPayment", { subscription })
                  }
                >
                  <View style={styles.actionBtnIconWrap}>
                    <Ionicons name="card-outline" size={18} color="#7c3aed" />
                  </View>
                  <View style={styles.actionBtnTextWrap}>
                    <Text style={styles.actionBtnTitle}>Record Payment</Text>
                    <Text style={styles.actionBtnSubtitle}>
                      Add a new payment for this subscription
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#6b7280" />
                </Pressable>

                <View style={{ height: 10 }} />

                <Pressable
                  style={styles.actionBtnDanger}
                  onPress={() => setCancelModalVisible(true)}
                >
                  <View
                    style={[
                      styles.actionBtnIconWrap,
                      { backgroundColor: "rgba(239, 68, 68, 0.15)" },
                    ]}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={18}
                      color="#f87171"
                    />
                  </View>
                  <View style={styles.actionBtnTextWrap}>
                    <Text style={[styles.actionBtnTitle, { color: "#f87171" }]}>
                      Cancel Subscription
                    </Text>
                    <Text style={styles.actionBtnSubtitle}>
                      Terminate this subscription permanently
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#6b7280" />
                </Pressable>
              </>
            ) : (
              <Pressable
                style={styles.actionBtnPrimary}
                onPress={() => setRenewModalVisible(true)}
              >
                <View style={styles.actionBtnIconWrap}>
                  <Ionicons name="refresh-outline" size={18} color="#7c3aed" />
                </View>
                <View style={styles.actionBtnTextWrap}>
                  <Text style={styles.actionBtnTitle}>Renew Subscription</Text>
                  <Text style={styles.actionBtnSubtitle}>
                    Reactivate with a new maintenance plan
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#6b7280" />
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* System Info */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: "rgba(99, 102, 241, 0.15)" },
                ]}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color="#818cf8"
                />
              </View>
              <Text style={styles.section}>System Behavior</Text>
            </View>
            {[
              {
                icon: "construct-outline",
                text: "Generates maintenance requests automatically",
              },
              {
                icon: "alarm-outline",
                text: "Triggers based on plan interval schedule",
              },
              {
                icon: "warning-outline",
                text: "Expires if payment period ends without renewal",
              },
            ].map((item, index) => (
              <View key={index} style={styles.behaviorRow}>
                <Ionicons
                  name={item.icon as any}
                  size={16}
                  color="#6b7280"
                  style={{ marginRight: 12, marginTop: 2 }}
                />
                <Text style={styles.behaviorText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Cancel Modal */}
      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View
              style={[styles.modalAccent, { backgroundColor: "#ef4444" }]}
            />
            <View style={styles.modalHeader}>
              <View
                style={[
                  styles.modalIconWrap,
                  { backgroundColor: "rgba(239, 68, 68, 0.15)" },
                ]}
              >
                <Ionicons name="close-circle" size={24} color="#f87171" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Cancel Subscription</Text>
                <Text style={styles.modalSubtitle}>
                  This action cannot be undone
                </Text>
              </View>
            </View>

            <Text style={styles.modalLabel}>Select a reason</Text>
            {cancellationReasons.map((reason) => (
              <Pressable
                key={reason}
                style={[
                  styles.reasonItem,
                  selectedReason === reason && styles.reasonItemSelected,
                ]}
                onPress={() => setSelectedReason(reason)}
              >
                <View
                  style={[
                    styles.reasonRadio,
                    selectedReason === reason && {
                      borderColor: "#ef4444",
                      backgroundColor: "rgba(239, 68, 68, 0.2)",
                    },
                  ]}
                >
                  {selectedReason === reason && (
                    <View style={styles.reasonRadioDot} />
                  )}
                </View>
                <Text style={styles.reasonText}>{reason}</Text>
              </Pressable>
            ))}

            <TextInput
              placeholder="Additional notes (optional)"
              placeholderTextColor="#4b5563"
              value={cancellationNotes}
              onChangeText={setCancellationNotes}
              multiline
              style={styles.notesInput}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalSecondaryBtn}
                onPress={() => {
                  setCancelModalVisible(false);
                  setSelectedReason("");
                  setCancellationNotes("");
                }}
              >
                <Text style={styles.modalSecondaryText}>Keep Active</Text>
              </Pressable>
              <Pressable style={styles.modalDangerBtn} onPress={handleCancel}>
                <Ionicons
                  name="close-circle-outline"
                  size={16}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.modalPrimaryText}>Cancel Now</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Renew Modal */}
      <Modal
        visible={renewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRenewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View
              style={[styles.modalAccent, { backgroundColor: "#10b981" }]}
            />
            <View style={styles.modalHeader}>
              <View
                style={[
                  styles.modalIconWrap,
                  { backgroundColor: "rgba(16, 185, 129, 0.15)" },
                ]}
              >
                <Ionicons name="refresh-circle" size={24} color="#34d399" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Renew Subscription</Text>
                <Text style={styles.modalSubtitle}>
                  Choose a new maintenance plan
                </Text>
              </View>
            </View>

            {plans.map((plan: any) => (
              <Pressable
                key={plan.id}
                style={[
                  styles.planItem,
                  selectedPlanId === plan.id && styles.planItemSelected,
                ]}
                onPress={() => setSelectedPlanId(plan.id)}
              >
                <View style={styles.planItemLeft}>
                  <View
                    style={[
                      styles.planRadio,
                      selectedPlanId === plan.id && {
                        borderColor: "#10b981",
                        backgroundColor: "rgba(16, 185, 129, 0.2)",
                      },
                    ]}
                  >
                    {selectedPlanId === plan.id && (
                      <View
                        style={[
                          styles.planRadioDot,
                          { backgroundColor: "#10b981" },
                        ]}
                      />
                    )}
                  </View>
                  <View>
                    <Text style={styles.planItemName}>{plan.name}</Text>
                    <Text style={styles.planItemInterval}>
                      {plan.intervalMonths} month
                      {plan.intervalMonths > 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name={
                    selectedPlanId === plan.id
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={22}
                  color={selectedPlanId === plan.id ? "#10b981" : "#374151"}
                />
              </Pressable>
            ))}

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalSecondaryBtn}
                onPress={() => {
                  setRenewModalVisible(false);
                  setSelectedPlanId("");
                }}
              >
                <Text style={styles.modalSecondaryText}>Dismiss</Text>
              </Pressable>
              <Pressable style={styles.modalSuccessBtn} onPress={handleRenew}>
                <Ionicons
                  name="refresh-outline"
                  size={16}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.modalPrimaryText}>Renew Now</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    top: -120,
    right: -80,
  },
  bgOrb2: {
    width: 280,
    height: 280,
    backgroundColor: "#2563eb",
    top: 250,
    left: -100,
  },
  bgOrb3: {
    width: 200,
    height: 200,
    backgroundColor: "#ec4899",
    bottom: 150,
    right: -40,
    opacity: 0.08,
  },
  content: { padding: 16, paddingTop: 50, paddingBottom: 20 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
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
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 4,
    letterSpacing: 0.2,
  },

  // Hero Card
  heroCard: {
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  accentBar: { height: 3, width: "100%" },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    paddingBottom: 14,
  },
  heroLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  heroInfo: { marginLeft: 14, flex: 1 },
  company: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: -0.3,
  },
  equipment: { color: "#9ca3af", fontSize: 13, marginTop: 2 },
  plan: { color: "#6b7280", fontSize: 12, marginTop: 2 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
    letterSpacing: 0.3,
  },
  progressWrap: { paddingHorizontal: 18, paddingBottom: 18 },
  progressBarBg: {
    height: 4,
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", borderRadius: 2 },

  // Common Card
  card: {
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.6)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  section: {
    color: "#e5e7eb",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },

  // Timeline
  timelineGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  timelineItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "rgba(2, 6, 23, 0.5)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.5)",
    alignItems: "center",
  },
  timelineIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  timelineLabel: {
    color: "#6b7280",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
    marginBottom: 4,
  },
  timelineValue: { fontSize: 13, fontWeight: "700" },

  // Payments
  paymentCount: {
    marginLeft: "auto",
    backgroundColor: "rgba(124, 58, 237, 0.15)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  paymentCountText: { color: "#a78bfa", fontSize: 12, fontWeight: "700" },
  emptyPayments: { alignItems: "center", paddingVertical: 30 },
  emptyPaymentsText: {
    color: "#4b5563",
    marginTop: 10,
    fontSize: 13,
    fontWeight: "500",
  },
  paymentCard: {
    backgroundColor: "rgba(2, 6, 23, 0.5)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.5)",
    marginBottom: 10,
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  paymentLeft: { flexDirection: "row", alignItems: "center" },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  paymentAmount: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  paymentDate: { color: "#6b7280", fontSize: 12, marginTop: 2 },
  paymentStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  paymentStatusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  paymentDivider: {
    height: 1,
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    marginVertical: 12,
  },
  paymentMetaGrid: { flexDirection: "row", gap: 16 },
  paymentMetaItem: { flex: 1 },
  paymentMetaLabel: {
    color: "#6b7280",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
    marginBottom: 4,
  },
  paymentMetaValue: { color: "#e5e7eb", fontSize: 12, fontWeight: "600" },
  notesRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  notesText: { color: "#9ca3af", fontSize: 12, flex: 1, lineHeight: 18 },

  // Actions
  actionBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(124, 58, 237, 0.1)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
  actionBtnDanger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  actionBtnIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(124, 58, 237, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  actionBtnTextWrap: { flex: 1 },
  actionBtnTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  actionBtnSubtitle: { color: "#6b7280", fontSize: 12, marginTop: 2 },

  // System Info
  behaviorRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  behaviorText: { color: "#9ca3af", fontSize: 13, flex: 1, lineHeight: 20 },

  // Images
  companyLogo: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  logoPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.6)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 12,
  },
  modalAccent: { height: 4, width: "100%" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingBottom: 16,
    gap: 14,
  },
  modalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  modalSubtitle: { color: "#6b7280", fontSize: 13, marginTop: 2 },
  modalLabel: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  modalActions: { flexDirection: "row", padding: 20, paddingTop: 10, gap: 10 },

  // Reason Items
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "rgba(2, 6, 23, 0.5)",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  reasonItemSelected: {
    borderColor: "rgba(239, 68, 68, 0.5)",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
  },
  reasonRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#4b5563",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  reasonRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ef4444",
  },
  reasonText: { color: "#e5e7eb", fontSize: 14, fontWeight: "500", flex: 1 },

  // Plan Items
  planItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "rgba(2, 6, 23, 0.5)",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  planItemSelected: {
    borderColor: "rgba(16, 185, 129, 0.5)",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
  },
  planItemLeft: { flexDirection: "row", alignItems: "center" },
  planRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#4b5563",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  planRadioDot: { width: 10, height: 10, borderRadius: 5 },
  planItemName: { color: "#fff", fontSize: 14, fontWeight: "600" },
  planItemInterval: { color: "#6b7280", fontSize: 12, marginTop: 2 },

  // Notes Input
  notesInput: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: "rgba(2, 6, 23, 0.5)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    color: "#e5e7eb",
    minHeight: 90,
    padding: 14,
    textAlignVertical: "top",
    fontSize: 14,
  },

  // Modal Buttons
  modalSecondaryBtn: {
    flex: 1,
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  modalSecondaryText: { color: "#9ca3af", fontWeight: "700", fontSize: 14 },
  modalDangerBtn: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalSuccessBtn: {
    flex: 1,
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalPrimaryText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: -0.2,
  },
});
