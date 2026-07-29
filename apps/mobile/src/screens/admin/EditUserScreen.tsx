import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
  Animated,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { api } from "../../api/client";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

export default function EditUserScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = route.params;

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [password, setPassword] = useState("");
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const [companyId, setCompanyId] = useState(user.companyId);
  const [companies, setCompanies] = useState<any[]>([]);
  const [companyModalVisible, setCompanyModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  const [phone, setPhone] = useState(user.phone || "");
  const [image, setImage] = useState<any>(null);
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
      setCompanies(res.data || []);
    } catch (err) {
      console.log("COMPANY LOAD ERROR:", err);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const updateUser = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Name and Email are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("role", role);
      if (companyId) {
        formData.append("companyId", companyId);
      }

      if (password) {
        formData.append("password", password);
      }

      if (image) {
        formData.append("image", {
          uri: image.uri,
          name: image.fileName || "profile.jpg",
          type: image.mimeType || "image/jpeg",
        } as any);
      }

      await api.patch(`/users/${user.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessModalVisible(true);
    } catch (err: any) {
      console.log("UPDATE ERROR:", err.response?.data);
      setError(
        typeof err?.response?.data?.message === "string"
          ? err.response.data.message
          : "Failed to update user",
      );
    } finally {
      setLoading(false);
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
        onChangeText={(val) => {
          onChange(val);
          if (error) setError("");
        }}
        keyboardType={keyboardType}
        secureTextEntry={secure}
        autoCapitalize={fieldKey.includes("email") ? "none" : "sentences"}
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
          <Text style={styles.headerTag}>USER MANAGEMENT</Text>
          <Text style={styles.title}>Edit User</Text>
          <Text style={styles.subtitle}>
            Update user details, role, and company assignment
          </Text>
        </Animated.View>

        {/* PROFILE IMAGE CARD */}
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
              <Image source={{ uri: image.uri }} style={styles.profileImage} />
            ) : user.profileImage ? (
              <Image
                source={{
                  uri: `${api.defaults.baseURL}/uploads/users/${user.profileImage}`,
                }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Text style={styles.profileInitial}>
                  {user.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.cameraOverlay}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </Pressable>
          <Text style={styles.changePhoto}>Tap to change profile photo</Text>
        </Animated.View>

        {/* BASIC INFO CARD */}
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
          {renderInput("Phone Number", phone, setPhone, "phone", "phone-pad")}
          {renderInput(
            "New Password (optional)",
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
          <Pressable
            style={({ pressed }) => [
              styles.selector,
              pressed && styles.selectorPressed,
            ]}
            onPress={() => setRoleModalVisible(true)}
          >
            <View style={styles.selectorContent}>
              <View
                style={[
                  styles.roleDot,
                  { backgroundColor: getRoleColor(role) },
                ]}
              />
              <View style={styles.selectorTextBox}>
                <Text style={styles.selectorLabel}>Current Role</Text>
                <Text style={styles.selectorValue}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#64748b" />
            </View>
          </Pressable>
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
                  {selectedCompany?.name || "Select a company"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#64748b" />
            </View>
          </Pressable>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠</Text>
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}
        </Animated.View>

        {/* UPDATE BUTTON */}
        <Pressable
          disabled={loading}
          style={({ pressed }) => [
            styles.btn,
            pressed && styles.btnPressed,
            loading && styles.btnLoading,
          ]}
          onPress={updateUser}
        >
          <View style={styles.btnInner}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.btnText}>Update User</Text>
                <Ionicons
                  name="checkmark"
                  size={20}
                  color="#fff"
                  style={{ marginLeft: 8 }}
                />
              </>
            )}
          </View>
          <View style={styles.btnGlow} />
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* COMPANY MODAL */}
      <Modal
        visible={companyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCompanyModalVisible(false)}
      >
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
      </Modal>

      {/* ROLE MODAL */}
      <Modal
        visible={roleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setRoleModalVisible(false)}
          />
          <View style={styles.modalBox}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Role</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {["admin", "technician", "customer"].map((item) => (
                <Pressable
                  key={item}
                  style={({ pressed }) => [
                    styles.modalItem,
                    role === item && styles.modalItemActive,
                    pressed && styles.modalItemPressed,
                  ]}
                  onPress={() => {
                    setRole(item);
                    setRoleModalVisible(false);
                  }}
                >
                  <View
                    style={[
                      styles.modalItemDot,
                      { backgroundColor: getRoleColor(item) },
                      role !== item && styles.modalItemDotInactive,
                    ]}
                  />
                  <Text
                    style={[
                      styles.modalText,
                      role === item && styles.modalTextActive,
                    ]}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </Text>
                  {role === item && <Text style={styles.checkmark}>✓</Text>}
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              style={styles.closeBtn}
              onPress={() => setRoleModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* SUCCESS MODAL */}
      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalBox}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={32} color="#fff" />
            </View>
            <Text style={styles.successTitle}>User Updated</Text>
            <Text style={styles.successMessage}>
              The user information has been updated successfully.
            </Text>
            <Pressable
              style={styles.successButton}
              onPress={() => {
                setSuccessModalVisible(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.successButtonText}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    backgroundColor: "rgba(79, 70, 229, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },

  profileInitial: {
    color: "#818cf8",
    fontSize: 48,
    fontWeight: "800",
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

  roleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 14,
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

  /* ERROR */
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

  modalItemDotInactive: {
    backgroundColor: "#334155",
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

  /* SUCCESS MODAL */
  successModalBox: {
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    margin: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  successTitle: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },

  successMessage: {
    color: "#94a3b8",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },

  successButton: {
    backgroundColor: "#4f46e5",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  successButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
