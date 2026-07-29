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
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";

export default function EditProductScreen({ route }: any) {
  const { product } = route.params;
  const navigation = useNavigation<any>();

  const [name, setName] = useState(product.name || "");
  const [description, setDescription] = useState(product.description || "");
  const [price, setPrice] = useState(String(product.price ?? ""));
  const [quantity, setQuantity] = useState(String(product.quantity ?? ""));
  const [inStock, setInStock] = useState(product.inStock ?? true);
  const [successVisible, setSuccessVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [images, setImages] = useState<any[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(
    product.images || [],
  );
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(
    product.categoryId || product.category?.id || "",
  );

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadCategories();
    // Entrance animation
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

  const loadCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.log("CATEGORY ERROR:", err);
    }
  };

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow access to your photo library.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      setErrorTitle("Validation Error");
      setErrorMessage("Product name is required.");
      setErrorVisible(true);
      return;
    }

    if (!selectedCategory) {
      setErrorTitle("Validation Error");
      setErrorMessage("Please select a category.");
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
      formData.append("existingImages", JSON.stringify(existingImages));

      images.forEach((img) => {
        const fileName = img.uri.split("/").pop();
        formData.append("image", {
          uri: img.uri,
          name: fileName || "product.jpg",
          type: "image/jpeg",
        } as any);
      });

      await api.patch(`/products/${product.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessVisible(true);
    } catch (err: any) {
      console.log("UPDATE ERROR:", err?.response?.data || err.message);
      setErrorTitle("Update Failed");
      setErrorMessage(
        err?.response?.data?.message ||
          "Something went wrong while updating the product.",
      );
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const getTotalImages = () => existingImages.length + images.length;

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
        <View>
          <Text style={styles.headerTitle}>Edit Product</Text>
          <Text style={styles.headerSubtitle}>Update product details</Text>
        </View>
        <View style={{ width: 40 }} />
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
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* IMAGE GALLERY SECTION */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="images-outline" size={18} color="#a78bfa" />
              <Text style={styles.sectionTitle}>Product Images</Text>
              <View style={styles.imageCountBadge}>
                <Text style={styles.imageCountText}>{getTotalImages()}</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryContainer}
            >
              {/* Existing Images */}
              {existingImages.map((img, i) => (
                <View key={`old-${i}`} style={styles.imageCard}>
                  <Image
                    source={{
                      uri: `${api.defaults.baseURL}/uploads/products/${img}`,
                    }}
                    style={styles.previewImage}
                  />
                  <Pressable
                    style={styles.removeBtn}
                    onPress={() => removeExistingImage(i)}
                  >
                    <View style={styles.removeBtnInner}>
                      <Ionicons name="close" size={14} color="#fff" />
                    </View>
                  </Pressable>
                  <View style={styles.imageTag}>
                    <Text style={styles.imageTagText}>Saved</Text>
                  </View>
                </View>
              ))}

              {/* New Images */}
              {images.map((img, i) => (
                <View key={`new-${i}`} style={styles.imageCard}>
                  <Image
                    source={{ uri: img.uri }}
                    style={styles.previewImage}
                  />
                  <Pressable
                    style={styles.removeBtn}
                    onPress={() => removeNewImage(i)}
                  >
                    <View style={styles.removeBtnInner}>
                      <Ionicons name="close" size={14} color="#fff" />
                    </View>
                  </Pressable>
                  <View
                    style={[
                      styles.imageTag,
                      { backgroundColor: "rgba(16, 185, 129, 0.9)" },
                    ]}
                  >
                    <Text style={styles.imageTagText}>New</Text>
                  </View>
                </View>
              ))}

              {/* Add Button */}
              <Pressable style={styles.addImageCard} onPress={pickImages}>
                <View style={styles.addImageInner}>
                  <Ionicons name="camera-outline" size={28} color="#8b5cf6" />
                  <Text style={styles.addImageText}>Add Photo</Text>
                </View>
              </Pressable>
            </ScrollView>
          </View>

          {/* BASIC INFO SECTION */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#a78bfa"
              />
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Product Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="cube-outline"
                  size={18}
                  color="#64748b"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter product name"
                  placeholderTextColor="#475569"
                />
              </View>
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe your product..."
                  placeholderTextColor="#475569"
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          {/* CATEGORY SECTION */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pricetag-outline" size={18} color="#a78bfa" />
              <Text style={styles.sectionTitle}>Category</Text>
            </View>
            <View style={styles.categoriesRow}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat.id && styles.categoryChipActive,
                  ]}
                >
                  <Ionicons
                    name={
                      selectedCategory === cat.id
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={14}
                    color={selectedCategory === cat.id ? "#fff" : "#64748b"}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === cat.id &&
                        styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* PRICING SECTION */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cash-outline" size={18} color="#a78bfa" />
              <Text style={styles.sectionTitle}>Pricing & Inventory</Text>
            </View>

            <View style={styles.row}>
              {/* Price Input */}
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.inputLabel}>Price (₹)</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.input}
                    value={price}
                    keyboardType="decimal-pad"
                    onChangeText={setPrice}
                    placeholder="0.00"
                    placeholderTextColor="#475569"
                  />
                </View>
              </View>

              {/* Quantity Input */}
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Quantity</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="layers-outline"
                    size={18}
                    color="#64748b"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={quantity}
                    keyboardType="number-pad"
                    onChangeText={setQuantity}
                    placeholder="0"
                    placeholderTextColor="#475569"
                  />
                </View>
              </View>
            </View>

            {/* Stock Toggle */}
            <View style={styles.toggleCard}>
              <View style={styles.toggleInfo}>
                <View
                  style={[
                    styles.toggleIcon,
                    {
                      backgroundColor: inStock
                        ? "rgba(16, 185, 129, 0.15)"
                        : "rgba(239, 68, 68, 0.15)",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      inStock
                        ? "checkmark-circle-outline"
                        : "close-circle-outline"
                    }
                    size={22}
                    color={inStock ? "#10b981" : "#ef4444"}
                  />
                </View>
                <View>
                  <Text style={styles.toggleTitle}>Stock Status</Text>
                  <Text style={styles.toggleSubtitle}>
                    {inStock
                      ? "Product is available for purchase"
                      : "Product is currently unavailable"}
                  </Text>
                </View>
              </View>
              <Switch
                value={inStock}
                onValueChange={setInStock}
                trackColor={{
                  false: "#334155",
                  true: "rgba(16, 185, 129, 0.3)",
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
          style={[styles.updateBtn, loading && styles.updateBtnDisabled]}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Ionicons
                name="refresh"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.updateBtnText}>Updating...</Text>
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <Ionicons
                name="save-outline"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.updateBtnText}>Update Product</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Modals */}
      <SuccessModal
        visible={successVisible}
        title="Product Updated"
        message="The product has been updated successfully."
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
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

  headerTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
    textAlign: "center",
  },

  headerSubtitle: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 2,
  },

  scrollContent: {
    flexGrow: 1,
  },

  content: {
    padding: 20,
    paddingTop: 8,
  },

  // Section styling
  section: {
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },

  sectionTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },

  imageCountBadge: {
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },

  imageCountText: {
    color: "#a78bfa",
    fontSize: 12,
    fontWeight: "700",
  },

  // Image Gallery
  galleryContainer: {
    paddingRight: 20,
    gap: 12,
  },

  imageCard: {
    width: 120,
    height: 120,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    borderWidth: 2,
    borderColor: "#334155",
  },

  previewImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1e293b",
  },

  removeBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    zIndex: 10,
  },

  removeBtnInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  imageTag: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(139, 92, 246, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  imageTagText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  addImageCard: {
    width: 120,
    height: 120,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#334155",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(139, 92, 246, 0.05)",
  },

  addImageInner: {
    alignItems: "center",
    gap: 6,
  },

  addImageText: {
    color: "#8b5cf6",
    fontSize: 12,
    fontWeight: "600",
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

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 14,
    minHeight: 52,
  },

  inputIcon: {
    marginRight: 10,
  },

  currencySymbol: {
    color: "#a78bfa",
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
  },

  textArea: {
    height: 100,
    textAlignVertical: "top",
    lineHeight: 22,
  },

  // Categories
  categoriesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },

  categoryChipActive: {
    backgroundColor: "#8b5cf6",
    borderColor: "#8b5cf6",
    shadowColor: "#8b5cf6",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  categoryChipText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
  },

  categoryChipTextActive: {
    color: "#fff",
    fontWeight: "700",
  },

  // Row layout
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
    borderWidth: 1,
    borderColor: "#334155",
    marginTop: 8,
  },

  toggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },

  toggleIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
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

  updateBtn: {
    backgroundColor: "#8b5cf6",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8b5cf6",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  updateBtnDisabled: {
    opacity: 0.6,
  },

  updateBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
