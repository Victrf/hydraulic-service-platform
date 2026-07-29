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
  StatusBar,
  Dimensions,
} from "react-native";
import { useState } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import { api } from "../../api/client";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function CreateEquipmentRequestScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const { equipmentId, equipmentName, serialNumber, brand, model } =
    route.params;

  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const isValid = description.trim().length > 0 && location.trim().length > 0;

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission required to access photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...newUris].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const getLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) return;

    try {
      const loc = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync(loc.coords);

      if (address.length > 0) {
        const place = address[0];
        const formatted = [place.name, place.street, place.city, place.region]
          .filter(Boolean)
          .join(", ");
        setLocation(formatted);
      }
    } catch (err) {
      alert("Could not fetch location");
    }
  };

  const submit = async () => {
    if (!isValid) return;

    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("description", description.trim());
      formData.append("location", location.trim());
      formData.append("equipmentId", equipmentId);

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

      setDescription("");
      setLocation("");
      setImages([]);

      navigation.reset({
        index: 0,
        routes: [
          {
            name: "Customer",
            state: {
              index: 0,
              routes: [
                {
                  name: "CustomerTabs",
                  state: {
                    index: 1,
                    routes: [
                      { name: "Home" },
                      { name: "Requests" },
                      { name: "Profile" },
                      { name: "Subscription" },
                      { name: "Help" },
                    ],
                  },
                },
              ],
            },
          },
        ],
      });
    } catch (err) {
      console.log("CREATE EQUIPMENT REQUEST ERROR:", err);
      alert("Failed to create request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.title}>New Service Request</Text>
              <View style={styles.backButtonPlaceholder} />
            </View>

            {/* Equipment Info Card */}
            <View style={styles.glassCard}>
              <View style={styles.equipmentHeader}>
                <View style={styles.iconCircle}>
                  <Ionicons
                    name="hardware-chip-outline"
                    size={22}
                    color="#a78bfa"
                  />
                </View>
                <View style={styles.equipmentHeaderText}>
                  <Text style={styles.equipmentLabel}>Equipment</Text>
                  <Text style={styles.equipmentName} numberOfLines={1}>
                    {equipmentName}
                  </Text>
                </View>
              </View>

              <View style={styles.metaGrid}>
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons
                    name="barcode-scan"
                    size={14}
                    color="#64748b"
                  />
                  <Text style={styles.metaText}>{serialNumber || "N/A"}</Text>
                </View>
                <View style={styles.metaDivider} />
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons
                    name="tag-outline"
                    size={14}
                    color="#64748b"
                  />
                  <Text style={styles.metaText}>{brand || "N/A"}</Text>
                </View>
                <View style={styles.metaDivider} />
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons
                    name="cube-outline"
                    size={14}
                    color="#64748b"
                  />
                  <Text style={styles.metaText}>{model || "N/A"}</Text>
                </View>
              </View>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              <Text style={styles.sectionLabel}>Issue Details</Text>

              {/* Description Input */}
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

              {/* Location Input */}
              <View style={styles.locationWrapper}>
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
                    placeholder="Service location"
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

              {/* Image Upload */}
              <Text style={styles.sectionLabel}>Attachments</Text>
              <TouchableOpacity
                style={styles.uploadBox}
                onPress={pickImage}
                activeOpacity={0.7}
              >
                <View style={styles.uploadIconCircle}>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={28}
                    color="#818cf8"
                  />
                </View>
                <Text style={styles.uploadTitle}>Tap to upload images</Text>
                <Text style={styles.uploadSubtitle}>
                  Up to 5 photos • JPG, PNG
                </Text>
              </TouchableOpacity>

              {/* Image Previews */}
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

              {/* Submit Button */}
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
                      style={styles.submitIcon}
                    />
                  </>
                )}
              </TouchableOpacity>

              {!isValid && (
                <Text style={styles.hintText}>
                  Fill in description and location to continue
                </Text>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.88)",
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 40,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 24,
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
  backButtonPlaceholder: {
    width: 40,
  },
  title: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  glassCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(10px)",
  },
  equipmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(167, 139, 250, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "rgba(167, 139, 250, 0.2)",
  },
  equipmentHeaderText: {
    flex: 1,
  },
  equipmentLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  equipmentName: {
    color: "#f1f5f9",
    fontSize: 17,
    fontWeight: "700",
  },
  metaGrid: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  metaItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  metaDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  metaText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  formCard: {
    marginHorizontal: 20,
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  sectionLabel: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 4,
  },
  inputWrapper: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 16,
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
  locationWrapper: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
    marginBottom: 24,
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
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  uploadBox: {
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(129, 140, 248, 0.15)",
    borderStyle: "dashed",
    marginBottom: 16,
  },
  uploadIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: "rgba(129, 140, 248, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(129, 140, 248, 0.2)",
  },
  uploadTitle: {
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  uploadSubtitle: {
    color: "#64748b",
    fontSize: 13,
  },
  previewScroll: {
    marginBottom: 24,
  },
  previewContent: {
    gap: 12,
    paddingRight: 4,
  },
  previewWrapper: {
    position: "relative",
  },
  preview: {
    width: 88,
    height: 88,
    borderRadius: 14,
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
  submitButton: {
    backgroundColor: "#7c3aed",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
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
  submitIcon: {
    marginLeft: 8,
  },
  hintText: {
    color: "#475569",
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
    fontWeight: "500",
  },
});
