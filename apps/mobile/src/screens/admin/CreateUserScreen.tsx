import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Image,
  Animated,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../api/client";
import { useNavigation } from "@react-navigation/native";
import SuccessModal from "../../components/common/SuccessModal";

export default function CreateUserScreen() {
  const navigation = useNavigation<any>();
  const [image, setImage] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "technician" | "customer">(
    "customer",
  );

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [successVisible, setSuccessVisible] = useState(false);

  const [equipment, setEquipment] = useState<any[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [companyModalVisible, setCompanyModalVisible] = useState(false);
  const [equipmentModalVisible, setEquipmentModalVisible] = useState(false);
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

  useEffect(() => {
    if (!companyId) {
      setEquipment([]);
      setSelectedEquipment([]);
      return;
    }
    loadEquipment(companyId);
  }, [companyId]);

  const loadCompanies = async () => {
    try {
      const res = await api.get("/companies");
      setCompanies(res.data || []);
    } catch (err) {
      console.log("COMPANY LOAD ERROR:", err);
    }
  };

  const loadEquipment = async (companyId: string) => {
    try {
      const res = await api.get("/equipment");
      const filtered = (res.data || []).filter(
        (e: any) => e.companyId === companyId,
      );
      setEquipment(filtered);
      setSelectedEquipment([]);
    } catch (err) {
      console.log("EQUIPMENT LOAD ERROR:", err);
    }
  };

  const pickImage = async () => {
    const { launchImageLibraryAsync, MediaTypeOptions } =
      await import("expo-image-picker");
    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const createUser = async () => {
    try {
      if (!name || !email || !password) {
        return Alert.alert("Missing fields", "Fill all required fields");
      }
      if (!companyId && selectedEquipment.length > 0) {
        return Alert.alert(
          "Invalid selection",
          "Select a company before assigning equipment",
        );
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);
      if (companyId) formData.append("companyId", companyId);
      selectedEquipment.forEach((id) => formData.append("equipmentIds", id));

      if (image) {
        const filename = image.split("/").pop() || "profile.jpg";
        const extension = filename.split(".").pop()?.toLowerCase();
        let type = "image/jpeg";
        if (extension === "png") type = "image/png";
        if (extension === "webp") type = "image/webp";
        formData.append("image", { uri: image, name: filename, type } as any);
      }

      await api.post("/users", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessVisible(true);
    } catch (err: any) {
      console.log("CREATE USER ERROR:", err?.response?.data || err);
      Alert.alert(
        "Create Failed",
        err?.response?.data?.message || "User creation failed",
      );
    }
  };

  const getRoleColor = (r: string) => {
    if (r === "admin") return "#6366f1";
    if (r === "technician") return "#f59e0b";
    return "#10b981";
  };

  const getRoleBgColor = (r: string) => {
    if (r === "admin") return "rgba(99, 102, 241, 0.15)";
    if (r === "technician") return "rgba(245, 158, 11, 0.15)";
    return "rgba(16, 185, 129, 0.15)";
  };

  const getRoleBorderColor = (r: string) => {
    if (r === "admin") return "rgba(99, 102, 241, 0.3)";
    if (r === "technician") return "rgba(245, 158, 11, 0.3)";
    return "rgba(16, 185, 129, 0.3)";
  };

  const getRoleIcon = (r: string) => {
    if (r === "admin") return "shield-outline";
    if (r === "technician") return "construct-outline";
    return "person-outline";
  };

  const selectedCompany = companies.find((c) => c.id === companyId);

  const renderInput = (
    placeholder: string,
    value: string,
    onChange: (val: string) => void,
    fieldKey: string,
    keyboardType: any = "default",
    secure: boolean = false,
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{placeholder}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#475569"
        style={[styles.input, focused === fieldKey && styles.inputFocused]}
        value={value}
        onFocus={() => setFocused(fieldKey)}
        onBlur={() => setFocused(null)}
        onChangeText={onChange}
        keyboardType={keyboardType}
        secureTextEntry={secure}
        autoCapitalize={fieldKey === "email" ? "none" : "sentences"}
      />
    </View>
  );

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
          <Text style={styles.headerTag}>ONBOARDING</Text>
          <Text style={styles.title}>Create User</Text>
          <Text style={styles.subtitle}>
            Add a new user and assign their role and company
          </Text>
        </Animated.View>

        {/* PROFILE PHOTO */}
        <Animated.View
          style={[
            styles.glassCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.cardLabel}>Profile Photo</Text>
          <Pressable
            style={({ pressed }) => [
              styles.imageContainer,
              pressed && styles.imageContainerPressed,
            ]}
            onPress={pickImage}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Ionicons name="camera-outline" size={32} color="#818cf8" />
              </View>
            )}
            <View style={styles.cameraOverlay}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </Pressable>
          <Text style={styles.changePhoto}>Tap to upload profile photo</Text>
        </Animated.View>

        {/* BASIC INFO */}
        <Animated.View
          style={[
            styles.glassCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.cardLabel}>Basic Information</Text>
          {renderInput("Full Name *", name, setName, "name")}
          {renderInput(
            "Email Address *",
            email,
            setEmail,
            "email",
            "email-address",
          )}
          {renderInput(
            "Password *",
            password,
            setPassword,
            "password",
            "default",
            true,
          )}
        </Animated.View>

        {/* ROLE SELECTOR */}
        <Animated.View
          style={[
            styles.glassCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.cardLabel}>Role Assignment</Text>
          <View style={styles.roleGrid}>
            {(["admin", "technician", "customer"] as const).map((r) => {
              const active = role === r;
              return (
                <Pressable
                  key={r}
                  style={({ pressed }) => [
                    styles.roleBtn,
                    active && {
                      backgroundColor: getRoleBgColor(r),
                      borderColor: getRoleBorderColor(r),
                    },
                    pressed && !active && styles.roleBtnPressed,
                  ]}
                  onPress={() => setRole(r)}
                >
                  <View
                    style={[
                      styles.roleIconBox,
                      active && { backgroundColor: getRoleColor(r) + "30" },
                    ]}
                  >
                    <Ionicons
                      name={getRoleIcon(r) as any}
                      size={20}
                      color={active ? getRoleColor(r) : "#64748b"}
                    />
                  </View>
                  <Text
                    style={[
                      styles.roleText,
                      active && { color: getRoleColor(r) },
                    ]}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </Text>
                  {active && (
                    <View
                      style={[
                        styles.roleActiveDot,
                        { backgroundColor: getRoleColor(r) },
                      ]}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* COMPANY SELECTOR */}
        <Animated.View
          style={[
            styles.glassCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.cardLabel}>Company Assignment</Text>
          <Pressable
            style={({ pressed }) => [
              styles.selector,
              pressed && styles.selectorPressed,
            ]}
            onPress={() => setCompanyModalVisible(true)}
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
              <Ionicons name="chevron-forward" size={18} color="#64748b" />
            </View>
          </Pressable>
        </Animated.View>

        {/* EQUIPMENT SELECTOR */}
        <Animated.View
          style={[
            styles.glassCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.cardLabel}>Equipment Assignment</Text>
          <Pressable
            style={({ pressed }) => [
              styles.selector,
              !companyId && styles.selectorDisabled,
              pressed && companyId && styles.selectorPressed,
            ]}
            onPress={() => companyId && setEquipmentModalVisible(true)}
            disabled={!companyId}
          >
            <View style={styles.selectorContent}>
              <View
                style={[
                  styles.equipmentIconBox,
                  !companyId && styles.equipmentIconBoxDisabled,
                ]}
              >
                <Ionicons
                  name="hardware-chip-outline"
                  size={22}
                  color={companyId ? "#818cf8" : "#475569"}
                />
              </View>
              <View style={styles.selectorTextBox}>
                <Text style={styles.selectorLabel}>Assigned Equipment</Text>
                <Text
                  style={[
                    styles.selectorValue,
                    !companyId && styles.selectorValueDisabled,
                    selectedEquipment.length === 0 &&
                      companyId &&
                      styles.selectorValueEmpty,
                  ]}
                >
                  {!companyId
                    ? "Select a company first"
                    : selectedEquipment.length > 0
                      ? `${selectedEquipment.length} equipment selected`
                      : "Select equipment..."}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={companyId ? "#64748b" : "#475569"}
              />
            </View>
          </Pressable>
          {!companyId && (
            <Text style={styles.hintText}>
              <Ionicons
                name="information-circle-outline"
                size={12}
                color="#64748b"
              />{" "}
              Choose a company to unlock equipment selection
            </Text>
          )}
        </Animated.View>

        {/* CREATE BUTTON */}
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          onPress={createUser}
        >
          <View style={styles.btnInner}>
            <Text style={styles.btnText}>Create User</Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          </View>
          <View style={styles.btnGlow} />
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* COMPANY MODAL */}
      {companyModalVisible && (
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setCompanyModalVisible(false)}
          />
          <View style={styles.modalBox}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Company</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
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
                    setCompanyModalVisible(false);
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
              onPress={() => setCompanyModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* EQUIPMENT MODAL */}
      {equipmentModalVisible && (
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setEquipmentModalVisible(false)}
          />
          <View style={styles.modalBox}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Equipment</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {equipment.length > 0 ? (
                equipment.map((e) => {
                  const isSelected = selectedEquipment.includes(e.id);
                  return (
                    <Pressable
                      key={e.id}
                      style={({ pressed }) => [
                        styles.modalItem,
                        isSelected && styles.modalItemActive,
                        pressed && styles.modalItemPressed,
                      ]}
                      onPress={() => {
                        setSelectedEquipment((prev) =>
                          isSelected
                            ? prev.filter((id) => id !== e.id)
                            : [...prev, e.id],
                        );
                      }}
                    >
                      <View
                        style={[
                          styles.modalCheckBox,
                          isSelected && styles.modalCheckBoxActive,
                        ]}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={14} color="#fff" />
                        )}
                      </View>
                      <View style={styles.modalItemInfo}>
                        <Text
                          style={[
                            styles.modalText,
                            isSelected && styles.modalTextActive,
                          ]}
                        >
                          {e.name}
                        </Text>
                        <Text style={styles.modalSubtext}>
                          SN: {e.serialNumber || "-"}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })
              ) : (
                <View style={styles.emptyModalItem}>
                  <Text style={styles.emptyModalText}>
                    No equipment available for this company
                  </Text>
                </View>
              )}
            </ScrollView>
            <Pressable
              style={styles.closeBtn}
              onPress={() => setEquipmentModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>Done</Text>
            </Pressable>
          </View>
        </View>
      )}

      <SuccessModal
        visible={successVisible}
        title="User Created"
        message="The user has been created successfully."
        buttonText="Continue"
        onContinue={() => {
          setSuccessVisible(false);
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

  /* HEADER */
  header: {
    marginBottom: 24,
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

  /* CARDS */
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

  /* PROFILE IMAGE */
  imageContainer: {
    alignSelf: "center",
    position: "relative",
  },

  imageContainerPressed: {
    transform: [{ scale: 0.97 }],
  },

  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },

  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 32,
    backgroundColor: "rgba(2, 6, 23, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(99, 102, 241, 0.2)",
    borderStyle: "dashed",
  },

  cameraOverlay: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#030712",
  },

  changePhoto: {
    color: "#818cf8",
    marginTop: 14,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },

  /* INPUTS */
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

  /* ROLE GRID */
  roleGrid: {
    flexDirection: "row",
    gap: 10,
  },

  roleBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "rgba(2, 6, 23, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.15)",
  },

  roleBtnPressed: {
    backgroundColor: "rgba(2, 6, 23, 0.7)",
  },

  roleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  roleText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  roleActiveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 6,
  },

  /* SELECTORS */
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

  selectorDisabled: {
    opacity: 0.6,
  },

  selectorContent: {
    flexDirection: "row",
    alignItems: "center",
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

  selectorValueDisabled: {
    color: "#475569",
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

  equipmentIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
  },

  equipmentIconBoxDisabled: {
    backgroundColor: "rgba(148, 163, 184, 0.05)",
    borderColor: "rgba(148, 163, 184, 0.1)",
  },

  hintText: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 10,
    textAlign: "center",
  },

  /* BUTTON */
  btn: {
    marginTop: 8,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
  },

  btnPressed: {
    transform: [{ scale: 0.98 }],
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

  /* MODALS */
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 100,
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

  modalSubtext: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },

  modalItemInfo: {
    flex: 1,
  },

  modalCheckBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "rgba(148, 163, 184, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  modalCheckBoxActive: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
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

  emptyModalItem: {
    paddingVertical: 24,
    alignItems: "center",
  },

  emptyModalText: {
    color: "#64748b",
    fontSize: 14,
  },
});
