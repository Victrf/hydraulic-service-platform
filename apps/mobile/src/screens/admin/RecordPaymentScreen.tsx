import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  TextInput,
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

export default function RecordPaymentScreen({ route }: any) {
  const navigation = useNavigation<any>();
  const { subscription } = route.params;

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [transactionReference, setTransactionReference] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  React.useEffect(() => {
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
  }, []);

  const recordPayment = async () => {
    if (!amount.trim()) {
      Alert.alert("Validation", "Please enter the payment amount.");
      return;
    }
    if (Number(amount) <= 0) {
      Alert.alert("Validation", "Payment amount must be greater than zero.");
      return;
    }

    try {
      setSaving(true);
      await api.post("/payments", {
        subscriptionId: subscription.id,
        amount: Number(amount),
        method,
        transactionReference,
        notes,
        paymentDate: new Date().toISOString(),
      });
      Alert.alert("Success", "Payment recorded successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      let message = err?.response?.data?.message || "Failed to record payment.";
      if (Array.isArray(message)) message = message.join("\n");
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  const methods = [
    { value: "Cash", icon: "cash-outline", color: "#34d399" },
    {
      value: "Bank Transfer",
      icon: "swap-horizontal-outline",
      color: "#60a5fa",
    },
    { value: "Cheque", icon: "document-text-outline", color: "#fbbf24" },
    { value: "UPI", icon: "phone-portrait-outline", color: "#a78bfa" },
    { value: "Card", icon: "card-outline", color: "#f472b6" },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.screen}
    >
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
        keyboardShouldPersistTaps="handled"
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
            <Text style={styles.title}>Record Payment</Text>
            <Text style={styles.subtitle}>Log a new transaction</Text>
          </View>
          <View style={{ width: 44 }} />
        </Animated.View>

        {/* Subscription Summary Card */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
        >
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View
                style={[
                  styles.summaryIcon,
                  { backgroundColor: "rgba(124, 58, 237, 0.15)" },
                ]}
              >
                <Ionicons name="receipt-outline" size={18} color="#a78bfa" />
              </View>
              <Text style={styles.summaryTitle}>Subscription</Text>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Ionicons name="business-outline" size={14} color="#6b7280" />
                <Text style={styles.summaryLabel}>Company</Text>
                <Text style={styles.summaryValue}>
                  {subscription.company?.name}
                </Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <View style={[styles.summaryItem, { flex: 1 }]}>
                <Ionicons
                  name="hardware-chip-outline"
                  size={14}
                  color="#6b7280"
                />
                <Text style={styles.summaryLabel}>Equipment</Text>
                <Text style={styles.summaryValue}>
                  {subscription.equipment?.name}
                </Text>
              </View>
              <View style={[styles.summaryItem, { flex: 1 }]}>
                <Ionicons name="clipboard-outline" size={14} color="#6b7280" />
                <Text style={styles.summaryLabel}>Plan</Text>
                <Text style={styles.summaryValue}>
                  {subscription.plan?.name}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Form Card */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
        >
          <View style={styles.formCard}>
            {/* Amount */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <View
                  style={[
                    styles.labelIcon,
                    { backgroundColor: "rgba(16, 185, 129, 0.15)" },
                  ]}
                >
                  <Ionicons name="cash-outline" size={16} color="#34d399" />
                </View>
                <Text style={styles.label}>Amount</Text>
                {amount ? (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={12} color="#34d399" />
                  </View>
                ) : null}
              </View>
              <View style={[styles.inputBox, amount && styles.inputBoxActive]}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor="#4b5563"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
            </View>

            {/* Method */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <View
                  style={[
                    styles.labelIcon,
                    { backgroundColor: "rgba(59, 130, 246, 0.15)" },
                  ]}
                >
                  <Ionicons name="card-outline" size={16} color="#60a5fa" />
                </View>
                <Text style={styles.label}>Payment Method</Text>
              </View>
              <View style={[styles.pickerBox, styles.pickerBoxActive]}>
                <Picker
                  selectedValue={method}
                  onValueChange={setMethod}
                  dropdownIconColor="#60a5fa"
                  style={styles.picker}
                >
                  {methods.map((m) => (
                    <Picker.Item
                      key={m.value}
                      label={m.value}
                      value={m.value}
                    />
                  ))}
                </Picker>
              </View>
              <View style={styles.methodChips}>
                {methods.map((m) => (
                  <Pressable
                    key={m.value}
                    style={[
                      styles.methodChip,
                      method === m.value && {
                        backgroundColor: `${m.color}20`,
                        borderColor: `${m.color}50`,
                      },
                    ]}
                    onPress={() => setMethod(m.value)}
                  >
                    <Ionicons
                      name={m.icon as any}
                      size={14}
                      color={method === m.value ? m.color : "#6b7280"}
                    />
                    <Text
                      style={[
                        styles.methodChipText,
                        method === m.value && { color: m.color },
                      ]}
                    >
                      {m.value}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Transaction Reference */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <View
                  style={[
                    styles.labelIcon,
                    { backgroundColor: "rgba(245, 158, 11, 0.15)" },
                  ]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={16}
                    color="#fbbf24"
                  />
                </View>
                <Text style={styles.label}>Transaction Reference</Text>
              </View>
              <View
                style={[
                  styles.inputBox,
                  transactionReference && styles.inputBoxActive,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Optional reference number"
                  placeholderTextColor="#4b5563"
                  value={transactionReference}
                  onChangeText={setTransactionReference}
                />
              </View>
            </View>

            {/* Notes */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <View
                  style={[
                    styles.labelIcon,
                    { backgroundColor: "rgba(236, 72, 153, 0.15)" },
                  ]}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={16}
                    color="#f472b6"
                  />
                </View>
                <Text style={styles.label}>Notes</Text>
              </View>
              <View
                style={[
                  styles.inputBox,
                  notes && styles.inputBoxActive,
                  { height: 100 },
                ]}
              >
                <TextInput
                  style={[styles.input, { height: 100 }]}
                  placeholder="Optional notes about this payment..."
                  placeholderTextColor="#4b5563"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Record Button */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <Pressable
            style={({ pressed }) => [
              styles.recordButton,
              (!amount || Number(amount) <= 0) && styles.recordButtonDisabled,
              saving && styles.recordButtonSaving,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
            disabled={saving || !amount || Number(amount) <= 0}
            onPress={recordPayment}
          >
            {saving ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={[styles.recordButtonText, { marginLeft: 10 }]}>
                  Recording...
                </Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <View style={styles.buttonIconWrap}>
                  <Ionicons name="checkmark-circle" size={22} color="#7c3aed" />
                </View>
                <Text style={styles.recordButtonText}>Record Payment</Text>
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

  content: { padding: 20, paddingTop: 50, paddingBottom: 20 },

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

  // Summary Card
  summaryCard: {
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.6)",
    marginBottom: 20,
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
    gap: 10,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryTitle: {
    color: "#a78bfa",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  summaryRow: { flexDirection: "row", gap: 12 },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    marginVertical: 12,
  },
  summaryLabel: {
    color: "#6b7280",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryValue: {
    color: "#e5e7eb",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 4,
  },

  // Form Card
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

  // Inputs
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(2, 6, 23, 0.6)",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#1e293b",
    overflow: "hidden",
    paddingHorizontal: 16,
  },
  inputBoxActive: {
    borderColor: "rgba(139, 92, 246, 0.5)",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  currencySymbol: {
    color: "#a78bfa",
    fontSize: 20,
    fontWeight: "700",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    paddingVertical: 14,
    letterSpacing: -0.5,
  },
  input: {
    flex: 1,
    color: "#e5e7eb",
    fontSize: 15,
    fontWeight: "500",
    paddingVertical: 14,
  },

  // Picker
  pickerBox: {
    backgroundColor: "rgba(2, 6, 23, 0.6)",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#1e293b",
    overflow: "hidden",
  },
  pickerBoxActive: {
    borderColor: "rgba(59, 130, 246, 0.5)",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  picker: { color: "#e5e7eb", height: Platform.OS === "ios" ? 180 : 52 },

  // Method Chips
  methodChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  methodChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  methodChipText: { color: "#6b7280", fontSize: 12, fontWeight: "600" },

  // Button
  recordButton: {
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
  recordButtonDisabled: {
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    shadowOpacity: 0,
    elevation: 0,
    borderColor: "#1e293b",
  },
  recordButtonSaving: { opacity: 0.8 },
  buttonContent: { flexDirection: "row", alignItems: "center" },
  buttonIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  recordButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: -0.2,
  },
});
