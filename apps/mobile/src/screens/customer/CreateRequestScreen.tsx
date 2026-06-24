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
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { api } from "../../api/client";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native"; // ✅ ADDED

export default function CreateRequestScreen() {
  const navigation = useNavigation(); // ✅ ADDED

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
  const translateY = useRef(new Animated.Value(40)).current;

  const isValid = description && location && selectedEquipment;

  useEffect(() => {
    const loadContext = async () => {
      try {
        const res = await api.get("/service-requests/create-context");
        const equipment = res.data.equipment;

        setEquipmentList(equipment);

        if (equipment.length === 1) {
          setSelectedEquipment(equipment[0].id);
        }
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
    setUploading(true);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission required");
      setUploading(false);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages(result.assets.map((a) => a.uri));
    }

    setUploading(false);
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
        setLocation(
          `${place.name || ""} ${place.street || ""}, ${
            place.city || ""
          }, ${place.region || ""}`,
        );
      }
    } catch {
      alert("Location failed");
    }
  };

  const submit = async () => {
    try {
      if (!selectedEquipment) {
        alert("Select equipment");
        return;
      }

      setLoading(true);
      setStatus("idle");

      const formData = new FormData();
      formData.append("description", description);
      formData.append("location", location);
      formData.append("equipmentId", selectedEquipment);

      images.forEach((uri, index) => {
        formData.append("images", {
          uri,
          name: `image-${index}.jpg`,
          type: "image/jpeg",
        } as any);
      });

      // ✅ KEEP YOUR WORKING REQUEST
      await api.post("/service-requests", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // ✅ SHOW SUCCESS
      setStatus("success");

      // ✅ DELAY so user SEES it
      setTimeout(() => {
        // reset form
        setDescription("");
        setLocation("");
        setImages([]);
        setCoords(null);
        setSelectedEquipment(null);

        // ✅ NAVIGATE
        (navigation as any).navigate("MyRequests");

        setStatus("idle");
      }, 2000);
    } catch (err: any) {
      console.log("CREATE ERROR:", err?.response?.data || err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={require("../../assets/bg.jpg")} style={styles.bg}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.pageTitle}>Create Request</Text>
            <Text style={styles.pageSubtitle}>
              Describe your issue and submit a service request
            </Text>

            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY }],
              }}
            >
              <View style={styles.card}>
                {/* ✅ SUCCESS */}
                {status === "success" && (
                  <View style={styles.successBox}>
                    <Text style={styles.successText}>
                      Request created successfully. Redirecting...
                    </Text>
                  </View>
                )}

                {/* ❌ ERROR */}
                {status === "error" && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>
                      Failed to create request
                    </Text>
                  </View>
                )}

                {/* DETAILS */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Details</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      value={description}
                      onChangeText={setDescription}
                      placeholder="Describe the issue..."
                      placeholderTextColor="#6b7280"
                      multiline
                      style={[styles.input, styles.textArea]}
                    />
                  </View>
                </View>

                {/* LOCATION */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Location</Text>
                  <View style={styles.locationRow}>
                    <View style={styles.locationInputContainer}>
                      <TextInput
                        value={location}
                        onChangeText={setLocation}
                        placeholder="Enter location"
                        placeholderTextColor="#6b7280"
                        style={styles.input}
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.locationBtn}
                      onPress={getLocation}
                    >
                      <Ionicons name="navigate" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* EQUIPMENT */}
                {equipmentList.length > 1 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Equipment</Text>

                    <View style={styles.inputWrapper}>
                      <Picker
                        selectedValue={selectedEquipment}
                        onValueChange={(value) => setSelectedEquipment(value)}
                        style={{ color: "#fff", flex: 1 }}
                      >
                        <Picker.Item label="Select equipment..." value={null} />

                        {equipmentList.map((item) => (
                          <Picker.Item
                            key={item.id}
                            label={
                              item.name || item.serialNumber || "Equipment"
                            }
                            value={item.id}
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>
                )}

                {/* UPLOAD */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Attachments</Text>

                  <TouchableOpacity
                    style={styles.uploadBox}
                    onPress={pickImage}
                  >
                    {uploading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Ionicons
                          name="image-outline"
                          size={22}
                          color="#9ca3af"
                        />
                        <Text style={styles.uploadText}>
                          Upload images (optional)
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <ScrollView horizontal>
                    {images.map((img, index) => (
                      <View key={index} style={styles.previewWrapper}>
                        <Image source={{ uri: img }} style={styles.preview} />
                        <TouchableOpacity
                          style={styles.removeBtn}
                          onPress={() =>
                            setImages(images.filter((_, i) => i !== index))
                          }
                        >
                          <Ionicons name="close" size={14} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>

                {/* BUTTON */}
                <TouchableOpacity
                  style={[
                    styles.button,
                    (!isValid || loading) && styles.buttonDisabled,
                  ]}
                  onPress={submit}
                  disabled={!isValid || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Create Request</Text>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { flex: 1, backgroundColor: "rgba(2,6,23,0.85)" },

  pageTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginHorizontal: 20,
    marginTop: 40,
  },

  pageSubtitle: {
    color: "#9ca3af",
    marginHorizontal: 20,
    marginBottom: 10,
  },

  card: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 20,
  },

  section: { marginBottom: 16 },

  sectionTitle: {
    color: "#fff",
    fontWeight: "600",
    marginBottom: 8,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f2937",
    borderRadius: 10,
    paddingHorizontal: 10,
  },

  locationInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f2937",
    borderRadius: 10,
    paddingHorizontal: 10,
  },

  input: { flex: 1, color: "#fff", padding: 12 },
  textArea: { height: 100 },

  inputFocused: {
    borderWidth: 1,
    borderColor: "#7c3aed",
  },

  locationRow: { flexDirection: "row", alignItems: "center" },

  locationBtn: {
    width: 48,
    height: 48,
    backgroundColor: "#2563eb",
    borderRadius: 12,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  mapPreview: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginTop: 10,
  },

  uploadBox: {
    backgroundColor: "#1f2937",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },

  uploadText: { color: "#9ca3af", marginTop: 6 },

  previewWrapper: { position: "relative", marginRight: 10 },

  preview: { width: 80, height: 80, borderRadius: 10 },

  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#ef4444",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  button: {
    backgroundColor: "#7c3aed",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
  },

  buttonDisabled: { opacity: 0.5 },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  successBox: {
    backgroundColor: "rgba(34,197,94,0.1)",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  successText: { color: "#22c55e" },

  errorBox: {
    backgroundColor: "rgba(239,68,68,0.1)",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  errorText: { color: "#ef4444" },
});
