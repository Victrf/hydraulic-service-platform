import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Modal,
  Animated,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { api } from "../../api/client";
import { useNavigation, useRoute } from "@react-navigation/native";
import SuccessModal from "../../components/common/SuccessModal";

export default function CreateEquipmentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [successVisible, setSuccessVisible] = useState(false);

  const presetCompanyId = route.params?.companyId ?? null;
  const presetCompanyName = route.params?.companyName ?? "";
  const hasAssignedCompany = !!presetCompanyId;
  const lockCompany =
    (route.params?.lockCompany ?? false) && hasAssignedCompany;

  const [name, setName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [installationDate, setInstallationDate] = useState("");
  const [warrantyExpiry, setWarrantyExpiry] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(presetCompanyId);
  const [companies, setCompanies] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadCompanies();
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
    ]).start();
  }, []);

  const loadCompanies = async () => {
    try {
      const res = await api.get("/companies");
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setCompanies(data);
      if (lockCompany && presetCompanyId) {
        setCompanyId(presetCompanyId);
      }
    } catch (err: any) {
      console.log("COMPANY LOAD ERROR:", err?.response?.data || err.message);
      setCompanies([]);
    }
  };

  const createEquipment = async () => {
    if (!name.trim() || !serialNumber.trim()) {
      setError("Name and Serial Number are required");
      return;
    }
    if (!companyId) {
      setError("Select a company");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/equipment", {
        name: name.trim(),
        serialNumber: serialNumber.trim(),
        brand: brand.trim(),
        model: model.trim(),
        companyId,
        installationDate: installationDate
          ? new Date(installationDate).toISOString()
          : undefined,
        warrantyExpiry: warrantyExpiry
          ? new Date(warrantyExpiry).toISOString()
          : undefined,
      });

      setSuccessVisible(true);
    } catch (err: any) {
      console.log(
        "CREATE EQUIPMENT ERROR:",
        err?.response?.data || err.message,
      );
      if (err?.response?.data?.message?.includes("serialNumber")) {
        setError("Serial number already exists");
      } else {
        setError(err?.response?.data?.message || "Failed to create equipment");
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedCompany = companies.find((c) => c.id === companyId);

  return (
    <View style={styles.screen}>
      {/* Background Accents */}
      <View style={styles.bgAccent} />
      <View style={styles.bgAccent2} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.headerTag}>NEW EQUIPMENT</Text>
          <Text style={styles.title}>Create Equipment</Text>
          <Text style={styles.subtitle}>
            Add new equipment and assign it to a company
          </Text>
        </Animated.View>

        {/* EQUIPMENT INFO CARD */}
        <Animated.View
          style={[
            styles.glassCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.cardLabel}>Equipment Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Equipment Name *</Text>
            <TextInput
              placeholder="Enter equipment name"
              placeholderTextColor="#64748b"
              style={[styles.input, focused === "name" && styles.inputFocused]}
              value={name}
              onFocus={() => setFocused("name")}
              onBlur={() => setFocused(null)}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Serial Number *</Text>
            <TextInput
              placeholder="Enter serial number"
              placeholderTextColor="#64748b"
              style={[
                styles.input,
                focused === "serial" && styles.inputFocused,
              ]}
              value={serialNumber}
              onFocus={() => setFocused("serial")}
              onBlur={() => setFocused(null)}
              onChangeText={setSerialNumber}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Brand</Text>
              <TextInput
                placeholder="Brand"
                placeholderTextColor="#64748b"
                style={styles.input}
                value={brand}
                onChangeText={setBrand}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Model</Text>
              <TextInput
                placeholder="Model"
                placeholderTextColor="#64748b"
                style={styles.input}
                value={model}
                onChangeText={setModel}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Install Date</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#64748b"
                style={styles.input}
                value={installationDate}
                onChangeText={setInstallationDate}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Warranty Until</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#64748b"
                style={styles.input}
                value={warrantyExpiry}
                onChangeText={setWarrantyExpiry}
              />
            </View>
          </View>
        </Animated.View>

        {/* COMPANY CARD */}
        <Animated.View
          style={[
            styles.glassCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.cardLabel}>Company Assignment *</Text>

          {companies.length === 0 ? (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>🏢</Text>
              </View>
              <Text style={styles.empty}>No companies available</Text>
              <Pressable
                onPress={() => navigation.navigate("CreateCompany")}
                style={styles.linkBtn}
              >
                <Text style={styles.linkText}>+ Create New Company</Text>
              </Pressable>
            </View>
          ) : lockCompany ? (
            <View style={styles.lockedCompany}>
              <View style={styles.lockedIcon}>
                <Text style={styles.lockedIconText}>🔒</Text>
              </View>
              <View style={styles.lockedContent}>
                <Text style={styles.lockedLabel}>Pre-assigned Company</Text>
                <Text style={styles.lockedName}>{presetCompanyName}</Text>
              </View>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.selector,
                pressed && styles.selectorPressed,
              ]}
              onPress={() => setModalVisible(true)}
            >
              <View style={styles.selectorContent}>
                <View
                  style={[
                    styles.companyIcon,
                    !selectedCompany && styles.companyIconEmpty,
                  ]}
                >
                  <Text style={styles.companyIconText}>
                    {selectedCompany?.name?.charAt(0)?.toUpperCase() || "?"}
                  </Text>
                </View>
                <View style={styles.selectorTextBox}>
                  <Text style={styles.selectorLabel}>Assigned Company</Text>
                  <Text
                    style={[
                      styles.selectorValue,
                      !selectedCompany && styles.selectorValueEmpty,
                    ]}
                  >
                    {selectedCompany?.name || "Select a company..."}
                  </Text>
                </View>
                <View style={styles.chevron}>
                  <Text style={{ color: "#94a3b8", fontSize: 18 }}>›</Text>
                </View>
              </View>
            </Pressable>
          )}

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠</Text>
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}
        </Animated.View>

        {/* CREATE BUTTON */}
        <Pressable
          disabled={loading}
          style={({ pressed }) => [
            styles.btn,
            pressed && styles.btnPressed,
            loading && styles.btnLoading,
          ]}
          onPress={createEquipment}
        >
          <View style={styles.btnInner}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.btnText}>Create Equipment</Text>
                <Text style={styles.btnArrow}>+</Text>
              </>
            )}
          </View>
          <View style={styles.btnGlow} />
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* COMPANY MODAL */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalBox}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Company</Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalList}
            >
              {companies.map((c) => (
                <Pressable
                  key={c.id}
                  style={({ pressed }) => [
                    styles.modalItem,
                    c.id === companyId && styles.modalItemActive,
                    pressed && styles.modalItemPressed,
                  ]}
                  onPress={() => {
                    setCompanyId(c.id);
                    setModalVisible(false);
                  }}
                >
                  <View
                    style={[
                      styles.modalItemDot,
                      c.id === companyId && styles.modalItemDotActive,
                    ]}
                  />
                  <Text
                    style={[
                      styles.modalText,
                      c.id === companyId && styles.modalTextActive,
                    ]}
                  >
                    {c.name}
                  </Text>
                  {c.id === companyId && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>

            <Pressable
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <SuccessModal
        visible={successVisible}
        title="Equipment Created"
        message="The equipment has been created successfully."
        buttonText="Continue"
        onContinue={() => {
          setSuccessVisible(false);
          setName("");
          setSerialNumber("");
          setBrand("");
          setModel("");
          setInstallationDate("");
          setWarrantyExpiry("");
          if (lockCompany) {
            setCompanyId(presetCompanyId);
          } else {
            setCompanyId(null);
          }
          navigation.goBack();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#030712",
  },

  bgAccent: {
    position: "absolute",
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#4f46e5",
    opacity: 0.15,
  },

  bgAccent2: {
    position: "absolute",
    bottom: -80,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#7c3aed",
    opacity: 0.12,
  },

  scroll: {
    flex: 1,
  },

  container: {
    padding: 20,
    paddingTop: 60,
  },

  header: {
    marginBottom: 28,
  },

  headerTag: {
    color: "#6366f1",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  title: {
    color: "#f8fafc",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 8,
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: 15,
    lineHeight: 22,
    maxWidth: "90%",
  },

  glassCard: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },

  cardLabel: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: 0.5,
  },

  inputGroup: {
    marginBottom: 14,
  },

  inputLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  input: {
    backgroundColor: "rgba(2, 6, 23, 0.5)",
    color: "#f1f5f9",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.15)",
    fontSize: 15,
    fontWeight: "500",
  },

  inputFocused: {
    borderColor: "#6366f1",
    backgroundColor: "rgba(2, 6, 23, 0.7)",
  },

  row: {
    flexDirection: "row",
  },

  selector: {
    backgroundColor: "rgba(2, 6, 23, 0.5)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.15)",
    padding: 14,
  },

  selectorPressed: {
    backgroundColor: "rgba(2, 6, 23, 0.7)",
    borderColor: "rgba(99, 102, 241, 0.3)",
  },

  selectorContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  companyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  companyIconEmpty: {
    backgroundColor: "rgba(148, 163, 184, 0.15)",
  },

  companyIconText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  selectorTextBox: {
    flex: 1,
  },

  selectorLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  selectorValue: {
    color: "#f1f5f9",
    fontSize: 15,
    fontWeight: "600",
  },

  selectorValueEmpty: {
    color: "#64748b",
    fontWeight: "400",
  },

  chevron: {
    marginLeft: 8,
  },

  emptyBox: {
    alignItems: "center",
    paddingVertical: 24,
  },

  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  emptyIconText: {
    fontSize: 24,
  },

  empty: {
    color: "#64748b",
    fontSize: 14,
    marginBottom: 8,
  },

  linkBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
  },

  linkText: {
    color: "#818cf8",
    fontSize: 13,
    fontWeight: "700",
  },

  lockedCompany: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.08)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.2)",
    padding: 16,
  },

  lockedIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  lockedIconText: {
    fontSize: 18,
  },

  lockedContent: {
    flex: 1,
  },

  lockedLabel: {
    color: "#22c55e",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  lockedName: {
    color: "#f1f5f9",
    fontSize: 16,
    fontWeight: "700",
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },

  errorIcon: {
    marginRight: 8,
    fontSize: 14,
  },

  error: {
    color: "#f87171",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },

  btn: {
    marginTop: 8,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
  },

  btnPressed: {
    transform: [{ scale: 0.98 }],
  },

  btnLoading: {
    opacity: 0.8,
  },

  btnInner: {
    backgroundColor: "#4f46e5",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },

  btnArrow: {
    color: "#fff",
    fontSize: 20,
    marginLeft: 8,
    fontWeight: "400",
  },

  btnGlow: {
    position: "absolute",
    top: 0,
    left: "20%",
    right: "20%",
    height: "50%",
    backgroundColor: "#6366f1",
    opacity: 0.3,
    borderRadius: 18,
    zIndex: -1,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },

  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  modalBox: {
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderBottomWidth: 0,
    maxHeight: "70%",
  },

  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: "#334155",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },

  modalTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },

  modalList: {
    paddingBottom: 8,
  },

  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 4,
  },

  modalItemPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },

  modalItemActive: {
    backgroundColor: "rgba(79, 70, 229, 0.15)",
  },

  modalItemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#334155",
    marginRight: 12,
  },

  modalItemDotActive: {
    backgroundColor: "#6366f1",
  },

  modalText: {
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },

  modalTextActive: {
    color: "#e2e8f0",
    fontWeight: "700",
  },

  checkmark: {
    color: "#6366f1",
    fontSize: 16,
    fontWeight: "700",
  },

  closeBtn: {
    marginTop: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },

  closeBtnText: {
    color: "#94a3b8",
    fontWeight: "600",
    fontSize: 15,
  },
});
