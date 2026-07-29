import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
  Switch,
  Alert,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { api } from "../../api/client";
import { useNavigation } from "@react-navigation/native";
import AppSelect from "../../components/common/AppSelect";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";

export default function CreateProductScreen() {
  const navigation = useNavigation<any>();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [inStock, setInStock] = useState(true);

  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    loadCategories();
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.log("CATEGORY ERROR:", err);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setErrorTitle("Permission Required");
      setErrorMessage(
        "Please allow access to your photo library to upload product images.",
      );
      setErrorVisible(true);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: 3,
    });

    if (!result.canceled) {
      setImages((prev) => {
        const combined = [...prev, ...result.assets];
        return combined.slice(0, 3);
      });
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setErrorTitle("Validation Error");
      setErrorMessage("Product name is required.");
      setErrorVisible(true);
      return;
    }

    if (!selectedCategory) {
      setErrorTitle("Validation Error");
      setErrorMessage("Please select a product category.");
      setErrorVisible(true);
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("price", JSON.stringify(Number(price)));
      formData.append("quantity", JSON.stringify(Number(quantity)));
      formData.append("inStock", JSON.stringify(inStock));
      formData.append("categoryId", selectedCategory);

      images.forEach((img, index) => {
        const fileName = img.uri.split("/").pop();
        formData.append("image", {
          uri: img.uri,
          name: fileName || `product-${index}.jpg`,
          type: "image/jpeg",
        } as any);
      });

      await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessVisible(true);

      setName("");
      setDescription("");
      setPrice("");
      setQuantity("");
      setInStock(true);
      setImages([]);
      setSelectedCategory("");
    } catch (err: any) {
      console.log("CREATE PRODUCT ERROR:", err?.response?.data || err.message);

      const errorMessage = Array.isArray(err?.response?.data?.message)
        ? err.response.data.message.join("\n")
        : err?.response?.data?.message ||
          "Check admin access or validation rules";

      setErrorTitle("Create Product Failed");
      setErrorMessage(errorMessage);
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = () => {
    const filled = [
      name,
      description,
      price,
      quantity,
      selectedCategory,
    ].filter(Boolean).length;
    if (filled <= 2) return "#ef4444";
    if (filled <= 4) return "#f59e0b";
    return "#10b981";
  };

  const getProgressWidth = () => {
    const fields = [name, description, price, quantity, selectedCategory];
    const filled = fields.filter(Boolean).length;
    return `${(filled / fields.length) * 100}%`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#f8fafc" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Create Product</Text>
          <Text style={styles.headerSubtitle}>Add to inventory</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              {
                width: getProgressWidth(),
                backgroundColor: getProgressColor(),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {
            [name, description, price, quantity, selectedCategory].filter(
              Boolean,
            ).length
          }
          /5 fields completed
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* IMAGE UPLOAD SECTION */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: "rgba(236, 72, 153, 0.15)" },
                ]}
              >
                <Ionicons name="images" size={18} color="#ec4899" />
              </View>
              <Text style={styles.sectionTitle}>Product Images</Text>
              <Text style={styles.sectionBadge}>{images.length}/3</Text>
            </View>

            {images.length > 0 ? (
              <View style={styles.galleryContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.galleryScroll}
                >
                  {images.map((img, index) => (
                    <View key={index} style={styles.imageCard}>
                      <Image
                        source={{ uri: img.uri }}
                        style={styles.previewImage}
                      />
                      <Pressable
                        style={styles.removeBtn}
                        onPress={() => removeImage(index)}
                      >
                        <View style={styles.removeBtnInner}>
                          <Ionicons name="close" size={14} color="#fff" />
                        </View>
                      </Pressable>
                      {index === 0 && (
                        <View style={styles.mainBadge}>
                          <Ionicons name="star" size={10} color="#fff" />
                          <Text style={styles.mainBadgeText}>Cover</Text>
                        </View>
                      )}
                    </View>
                  ))}
                  {images.length < 3 && (
                    <Pressable style={styles.addMoreCard} onPress={pickImage}>
                      <Ionicons name="add" size={32} color="#ec4899" />
                      <Text style={styles.addMoreText}>Add</Text>
                    </Pressable>
                  )}
                </ScrollView>
              </View>
            ) : (
              <Pressable style={styles.uploadCard} onPress={pickImage}>
                <View style={styles.uploadGradient}>
                  <View style={styles.uploadIconBg}>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={36}
                      color="#ec4899"
                    />
                  </View>
                  <Text style={styles.uploadTitle}>Tap to upload images</Text>
                  <Text style={styles.uploadSubtitle}>
                    JPG, PNG up to 3 photos
                  </Text>
                  <View style={styles.uploadHint}>
                    <Ionicons name="images-outline" size={14} color="#64748b" />
                    <Text style={styles.uploadHintText}>Max 3 images</Text>
                  </View>
                </View>
              </Pressable>
            )}
          </View>

          {/* BASIC INFO SECTION */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: "rgba(59, 130, 246, 0.15)" },
                ]}
              >
                <Ionicons name="information-circle" size={18} color="#3b82f6" />
              </View>
              <Text style={styles.sectionTitle}>Basic Details</Text>
            </View>

            {/* Product Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Product Name <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputContainer, name && styles.inputActive]}>
                <Ionicons
                  name="cube-outline"
                  size={18}
                  color={name ? "#3b82f6" : "#64748b"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter product name"
                  placeholderTextColor="#475569"
                  value={name}
                  onChangeText={setName}
                />
                {name.length > 0 && (
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                )}
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <View
                style={[
                  styles.textAreaContainer,
                  description && styles.inputActive,
                ]}
              >
                <TextInput
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={4}
                  placeholder="Describe your product features..."
                  placeholderTextColor="#475569"
                  value={description}
                  onChangeText={setDescription}
                  textAlignVertical="top"
                />
              </View>
              <Text style={styles.charCount}>{description.length}/500</Text>
            </View>
          </View>

          {/* CATEGORY SECTION */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: "rgba(139, 92, 246, 0.15)" },
                ]}
              >
                <Ionicons name="pricetag" size={18} color="#8b5cf6" />
              </View>
              <Text style={styles.sectionTitle}>Category</Text>
            </View>
            <AppSelect
              label=""
              placeholder="Select a category"
              value={selectedCategory}
              options={categories}
              onSelect={setSelectedCategory}
            />
          </View>

          {/* PRICING SECTION */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: "rgba(16, 185, 129, 0.15)" },
                ]}
              >
                <Ionicons name="cash" size={18} color="#10b981" />
              </View>
              <Text style={styles.sectionTitle}>Pricing & Stock</Text>
            </View>

            <View style={styles.row}>
              {/* Price */}
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.inputLabel}>Price (₹)</Text>
                <View
                  style={[styles.inputContainer, price && styles.inputActive]}
                >
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor="#475569"
                    keyboardType="decimal-pad"
                    value={price}
                    onChangeText={setPrice}
                  />
                </View>
              </View>

              {/* Quantity */}
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Quantity</Text>
                <View
                  style={[
                    styles.inputContainer,
                    quantity && styles.inputActive,
                  ]}
                >
                  <Ionicons
                    name="layers-outline"
                    size={18}
                    color={quantity ? "#10b981" : "#64748b"}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#475569"
                    keyboardType="number-pad"
                    value={quantity}
                    onChangeText={setQuantity}
                  />
                </View>
              </View>
            </View>

            {/* Stock Toggle */}
            <View
              style={[styles.toggleCard, inStock && styles.toggleCardActive]}
            >
              <View style={styles.toggleInfo}>
                <View
                  style={[
                    styles.toggleIcon,
                    {
                      backgroundColor: inStock
                        ? "rgba(16, 185, 129, 0.2)"
                        : "rgba(239, 68, 68, 0.2)",
                    },
                  ]}
                >
                  <Ionicons
                    name={inStock ? "bag-check-outline" : "bag-remove-outline"}
                    size={24}
                    color={inStock ? "#10b981" : "#ef4444"}
                  />
                </View>
                <View>
                  <Text style={styles.toggleTitle}>
                    {inStock ? "Available in Stock" : "Out of Stock"}
                  </Text>
                  <Text style={styles.toggleSubtitle}>
                    {inStock
                      ? "Customers can purchase this item"
                      : "Item will be marked as unavailable"}
                  </Text>
                </View>
              </View>
              <Switch
                value={inStock}
                onValueChange={setInStock}
                trackColor={{
                  false: "#334155",
                  true: "rgba(16, 185, 129, 0.4)",
                }}
                thumbColor={inStock ? "#10b981" : "#64748b"}
                ios_backgroundColor="#334155"
              />
            </View>
          </View>

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <Pressable
          style={[
            styles.createBtn,
            loading && styles.createBtnDisabled,
            (!name || !selectedCategory) && styles.createBtnInactive,
          ]}
          onPress={handleCreate}
          disabled={loading || !name || !selectedCategory}
        >
          {loading ? (
            <View style={styles.btnContent}>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.createBtnText}>Creating...</Text>
            </View>
          ) : (
            <View style={styles.btnContent}>
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.createBtnText}>Create Product</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Modals */}
      <SuccessModal
        visible={successVisible}
        title="Product Created"
        message="The product has been added to your inventory successfully."
        buttonText="Continue"
        onContinue={() => {
          setSuccessVisible(false);
          navigation.goBack();
        }}
      />
      <ErrorModal
        visible={errorVisible}
        title={errorTitle}
        message={errorMessage}
        buttonText="OK"
        onClose={() => {
          setErrorVisible(false);
          setErrorTitle("");
          setErrorMessage("");
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },

  headerCenter: {
    alignItems: "center",
  },

  headerTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },

  // Progress
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },

  progressBg: {
    height: 6,
    backgroundColor: "#1e293b",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },

  progressFill: {
    height: "100%",
    borderRadius: 3,
    transition: "width 0.3s",
  },

  progressText: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "right",
  },

  // Scroll
  scrollContent: {
    flexGrow: 1,
  },

  content: {
    padding: 20,
    paddingTop: 16,
  },

  // Section
  section: {
    marginBottom: 28,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },

  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  sectionTitle: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
  },

  sectionBadge: {
    color: "#ec4899",
    fontSize: 13,
    fontWeight: "700",
    backgroundColor: "rgba(236, 72, 153, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  // Image Upload
  uploadCard: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#334155",
    borderStyle: "dashed",
    overflow: "hidden",
    backgroundColor: "#1e293b",
  },

  uploadGradient: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },

  uploadIconBg: {
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: "rgba(236, 72, 153, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(236, 72, 153, 0.3)",
  },

  uploadTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },

  uploadSubtitle: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 12,
  },

  uploadHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0f172a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  uploadHintText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
  },

  // Gallery
  galleryContainer: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },

  galleryScroll: {
    gap: 12,
  },

  imageCard: {
    width: 110,
    height: 110,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    borderWidth: 2,
    borderColor: "#334155",
  },

  previewImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#0f172a",
  },

  removeBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    zIndex: 10,
  },

  removeBtnInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
  },

  mainBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ec4899",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  mainBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  addMoreCard: {
    width: 110,
    height: 110,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#334155",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(236, 72, 153, 0.08)",
  },

  addMoreText: {
    color: "#ec4899",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },

  // Inputs
  inputGroup: {
    marginBottom: 16,
  },

  inputLabel: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  required: {
    color: "#ef4444",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#334155",
    paddingHorizontal: 14,
    minHeight: 54,
  },

  inputActive: {
    borderColor: "#3b82f6",
    backgroundColor: "rgba(59, 130, 246, 0.05)",
  },

  inputIcon: {
    marginRight: 10,
  },

  currencySymbol: {
    color: "#10b981",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
  },

  input: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "500",
    paddingVertical: 14,
  },

  textAreaContainer: {
    alignItems: "flex-start",
    paddingTop: 14,
    minHeight: 120,
    borderWidth: 1.5,
    borderColor: "#334155",
    borderRadius: 16,
    backgroundColor: "#1e293b",
    paddingHorizontal: 14,
  },

  textArea: {
    height: 100,
    textAlignVertical: "top",
    lineHeight: 22,
  },

  charCount: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "500",
    textAlign: "right",
    marginTop: 4,
  },

  // Row
  row: {
    flexDirection: "row",
  },

  // Toggle
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#334155",
    marginTop: 8,
  },

  toggleCardActive: {
    borderColor: "rgba(16, 185, 129, 0.4)",
    backgroundColor: "rgba(16, 185, 129, 0.05)",
  },

  toggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },

  toggleIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  toggleTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "700",
  },

  toggleSubtitle: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 30,
  },

  createBtn: {
    backgroundColor: "#ec4899",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ec4899",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  createBtnDisabled: {
    opacity: 0.6,
  },

  createBtnInactive: {
    backgroundColor: "#334155",
    shadowOpacity: 0,
  },

  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  createBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
