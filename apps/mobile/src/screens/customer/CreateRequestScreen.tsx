import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
  ImageBackground,
  Animated,
  Easing,
  StatusBar,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { api } from "../../api/client";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";

export default function CreateRequestScreen() {
  const navigation = useNavigation();

  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [coords, setCoords] = useState<any>(null);

  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(
    null,
  );

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  const isValid =
    description.trim().length > 0 &&
    location.trim().length > 0 &&
    selectedEquipment !== null;

  useEffect(() => {
    const loadContext = async () => {
      try {
        const res = await api.get("/service-requests/create-context");
        const equipment = res.data.equipment;
        setEquipmentList(equipment);
        if (equipment.length === 1) setSelectedEquipment(equipment[0].id);
      } catch (err) {
        console.log("CONTEXT ERROR:", err);
      }
    };

    loadContext();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission required to access photos");
      return;
    }

    setUploading(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...newUris].slice(0, 5));
    }
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const getLocation = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) return;

      const loc = await Location.getCurrentPositionAsync({});
      setCoords(loc.coords);

      const address = await Location.reverseGeocodeAsync(loc.coords);
      if (address.length > 0) {
        const place = address[0];
        const formatted = [place.name, place.street, place.city, place.region]
          .filter(Boolean)
          .join(", ");
        setLocation(formatted);
      }
    } catch {
      alert("Could not fetch location");
    }
  };

  const submit = async () => {
    if (!selectedEquipment) {
      alert("Select equipment first");
      return;
    }

    try {
      setLoading(true);
      setStatus("idle");

      const formData = new FormData();
      formData.append("description", description.trim());
      formData.append("location", location.trim());
      formData.append("equipmentId", selectedEquipment);

      images.forEach((uri, index) => {
        formData.append("images", {
          uri,
          name: `image-${index}.jpg`,
          type: "image/jpeg",
        } as any);
      });

      await api.post("/service-requests", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatus("success");
      setTimeout(() => {
        setDescription("");
        setLocation("");
        setImages([]);
        setCoords(null);
        setSelectedEquipment(
          equipmentList.length === 1 ? equipmentList[0].id : null,
        );
        (navigation as any).navigate("MyRequests");
        setStatus("idle");
      }, 1800);
    } catch (err: any) {
      console.log("CREATE ERROR:", err?.response?.data || err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const selectedEquipmentData = equipmentList.find(
    (e) => e.id === selectedEquipment,
  );

  return (
    <ImageBackground
      source={require("../../assets/bg.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => (navigation as any).goBack()}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
              <View style={styles.headerText}>
                <Text style={styles.pageTitle}>New Request</Text>
                <Text style={styles.pageSubtitle}>
                  Submit a service request
                </Text>
              </View>
              <View style={styles.backButtonPlaceholder} />
            </View>

            <Animated.View
              style={{ opacity: fadeAnim, transform: [{ translateY }] }}
            >
              {/* Status Alerts */}
              {status === "success" && (
                <View style={styles.alertBox}>
                  <View style={styles.alertIconCircle}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#10b981"
                    />
                  </View>
                  <Text style={styles.alertText}>
                    Request created! Redirecting...
                  </Text>
                </View>
              )}

              {status === "error" && (
                <View style={[styles.alertBox, styles.alertError]}>
                  <View
                    style={[
                      styles.alertIconCircle,
                      { backgroundColor: "rgba(239,68,68,0.12)" },
                    ]}
                  >
                    <Ionicons name="close-circle" size={20} color="#ef4444" />
                  </View>
                  <Text style={[styles.alertText, { color: "#ef4444" }]}>
                    Failed to create request
                  </Text>
                </View>
              )}

              {/* Equipment Selector */}
              {equipmentList.length > 1 && (
                <View style={styles.glassCard}>
                  <Text style={styles.sectionLabel}>Select Equipment</Text>
                  <View style={styles.pickerWrapper}>
                    <View style={styles.pickerIcon}>
                      <Ionicons
                        name="hardware-chip-outline"
                        size={16}
                        color="#64748b"
                      />
                    </View>
                    <Picker
                      selectedValue={selectedEquipment}
                      onValueChange={(value) => setSelectedEquipment(value)}
                      style={styles.picker}
                      dropdownIconColor="#64748b"
                    >
                      <Picker.Item
                        label="Choose equipment..."
                        value={null}
                        color="#475569"
                      />
                      {equipmentList.map((item) => (
                        <Picker.Item
                          key={item.id}
                          label={item.name || item.serialNumber || "Equipment"}
                          value={item.id}
                          color="#e2e8f0"
                        />
                      ))}
                    </Picker>
                  </View>

                  {selectedEquipmentData && (
                    <View style={styles.equipmentPreview}>
                      <View style={styles.equipmentPreviewIcon}>
                        <Ionicons
                          name="cube-outline"
                          size={18}
                          color="#818cf8"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.equipmentPreviewName}>
                          {selectedEquipmentData.name}
                        </Text>
                        <Text style={styles.equipmentPreviewMeta}>
                          S/N: {selectedEquipmentData.serialNumber || "—"}
                        </Text>
                      </View>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#10b981"
                      />
                    </View>
                  )}
                </View>
              )}

              {/* Main Form Card */}
              <View style={styles.glassCard}>
                <Text style={styles.sectionLabel}>Issue Details</Text>

                {/* Description */}
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="create-outline" size={18} color="#64748b" />
                  </View>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe the issue you're experiencing..."
                    placeholderTextColor="#475569"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    style={styles.textArea}
                    maxLength={500}
                  />
                  <Text style={styles.charCount}>{description.length}/500</Text>
                </View>

                {/* Location */}
                <Text style={[styles.sectionLabel, { marginTop: 8 }]}>
                  Service Location
                </Text>
                <View style={styles.locationRow}>
                  <View
                    style={[styles.inputWrapper, { flex: 1, marginBottom: 0 }]}
                  >
                    <View style={styles.inputIcon}>
                      <Ionicons
                        name="location-outline"
                        size={18}
                        color="#64748b"
                      />
                    </View>
                    <TextInput
                      value={location}
                      onChangeText={setLocation}
                      placeholder="Enter location"
                      placeholderTextColor="#475569"
                      style={styles.locationInput}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.locationBtn}
                    onPress={getLocation}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="navigate" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>

                {coords && (
                  <View style={styles.coordsBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={12}
                      color="#10b981"
                    />
                    <Text style={styles.coordsText}>GPS location captured</Text>
                  </View>
                )}
              </View>

              {/* Attachments Card */}
              <View style={styles.glassCard}>
                <Text style={styles.sectionLabel}>Attachments</Text>

                <TouchableOpacity
                  style={styles.uploadBox}
                  onPress={pickImage}
                  activeOpacity={0.7}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator color="#818cf8" size="small" />
                  ) : (
                    <>
                      <View style={styles.uploadIconCircle}>
                        <Ionicons
                          name="cloud-upload-outline"
                          size={28}
                          color="#818cf8"
                        />
                      </View>
                      <Text style={styles.uploadTitle}>
                        Tap to upload images
                      </Text>
                      <Text style={styles.uploadSubtitle}>
                        {images.length > 0
                          ? `${images.length}/5 photos`
                          : "Up to 5 photos • JPG, PNG"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {images.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.previewScroll}
                    contentContainerStyle={styles.previewContent}
                  >
                    {images.map((img, index) => (
                      <View key={index} style={styles.previewWrapper}>
                        <Image source={{ uri: img }} style={styles.preview} />
                        <TouchableOpacity
                          style={styles.removeBtn}
                          onPress={() => removeImage(index)}
                          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                        >
                          <Ionicons
                            name="close-circle"
                            size={22}
                            color="#ef4444"
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!isValid || loading) && styles.submitButtonDisabled,
                ]}
                onPress={submit}
                disabled={!isValid || loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Submit Request</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color="#fff"
                      style={{ marginLeft: 8 }}
                    />
                  </>
                )}
              </TouchableOpacity>

              {!isValid && status === "idle" && (
                <Text style={styles.hintText}>
                  Fill in all fields to submit
                </Text>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.88)",
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    marginTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  backButtonPlaceholder: { width: 40 },
  headerText: { alignItems: "center", flex: 1 },
  pageTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  pageSubtitle: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 2,
  },

  // Alerts
  alertBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16,185,129,0.08)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.15)",
    gap: 10,
  },
  alertError: {
    backgroundColor: "rgba(239,68,68,0.08)",
    borderColor: "rgba(239,68,68,0.15)",
  },
  alertIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(16,185,129,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertText: {
    color: "#10b981",
    fontWeight: "600",
    fontSize: 14,
    flex: 1,
  },

  // Cards
  glassCard: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  sectionLabel: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },

  // Picker
  pickerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  pickerIcon: {
    paddingLeft: 14,
    justifyContent: "center",
  },
  picker: {
    flex: 1,
    color: "#f8fafc",
    height: 50,
  },
  equipmentPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    padding: 12,
    backgroundColor: "rgba(99,102,241,0.06)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.12)",
    gap: 10,
  },
  equipmentPreviewIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(99,102,241,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  equipmentPreviewName: {
    color: "#e2e8f0",
    fontWeight: "700",
    fontSize: 14,
  },
  equipmentPreviewMeta: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 1,
  },

  // Inputs
  inputWrapper: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 0,
    overflow: "hidden",
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    top: 14,
    zIndex: 1,
  },
  textArea: {
    color: "#f8fafc",
    fontSize: 15,
    lineHeight: 22,
    paddingTop: 14,
    paddingLeft: 44,
    paddingRight: 14,
    paddingBottom: 14,
    minHeight: 120,
  },
  charCount: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "500",
    alignSelf: "flex-end",
    paddingRight: 14,
    paddingBottom: 10,
    marginTop: -6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
  },
  locationInput: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 15,
    paddingVertical: 14,
    paddingLeft: 44,
    paddingRight: 14,
  },
  locationBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  coordsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "rgba(16,185,129,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.12)",
  },
  coordsText: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "600",
  },

  // Upload
  uploadBox: {
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(129, 140, 248, 0.15)",
    borderStyle: "dashed",
  },
  uploadIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "rgba(129, 140, 248, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(129, 140, 248, 0.2)",
  },
  uploadTitle: {
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: "600",
  },
  uploadSubtitle: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 3,
  },
  previewScroll: {
    marginTop: 14,
  },
  previewContent: {
    gap: 10,
    paddingRight: 4,
  },
  previewWrapper: {
    position: "relative",
  },
  preview: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.08)",
  },
  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#0f172a",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
  },

  // Submit
  submitButton: {
    backgroundColor: "#7c3aed",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 6,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#334155",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  hintText: {
    color: "#475569",
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
    fontWeight: "500",
  },
});
