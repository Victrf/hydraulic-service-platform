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
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { api } from "../../api/client";
import { useNavigation } from "@react-navigation/native";

export default function CreateProductScreen() {
  const navigation = useNavigation<any>();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [inStock, setInStock] = useState(true);

  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.log("CATEGORY ERROR:", err);
    }
  };

  // 🔥 REMOVE IMAGE
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 🔥 PICK IMAGES
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required");
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
      Alert.alert("Validation", "Name is required");
      return;
    }

    if (!selectedCategory) {
      Alert.alert("Validation", "Please select a category");
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

      Alert.alert("Success", "Product created");

      setName("");
      setDescription("");
      setPrice("");
      setQuantity("");
      setInStock(true);
      setImages([]);
      setSelectedCategory("");

      navigation.goBack();

    } catch (err: any) {
      console.log("CREATE PRODUCT ERROR:", err?.response?.data || err.message);

      const errorMessage = Array.isArray(err?.response?.data?.message)
        ? err.response.data.message.join("\n")
        : err?.response?.data?.message ||
          "Check admin access or validation rules";

      Alert.alert("Create failed", errorMessage);

    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Create Product</Text>
      <Text style={styles.subtitle}>Add new item to inventory</Text>

      {/* 🔥 IMAGE PICKER */}
      <Pressable style={styles.imageBox} onPress={pickImage}>
        {images.length > 0 ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {images.map((img, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image
                    source={{ uri: img.uri }}
                    style={styles.multiImage}
                  />

                  {/* REMOVE */}
                  <Pressable
                    style={styles.removeBtn}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close" size={14} color="#fff" />
                  </Pressable>

                  {/* MAIN */}
                  {index === 0 && (
                    <View style={styles.mainBadge}>
                      <Text style={styles.mainText}>Main</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            <Text style={styles.imageCount}>
              {images.length}/3 images selected
            </Text>
          </>
        ) : (
          <Ionicons name="image-outline" size={40} color="#6b7280" />
        )}
      </Pressable>

      <TextInput
        placeholder="Product Name"
        placeholderTextColor="#6b7280"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Description"
        placeholderTextColor="#6b7280"
        style={[styles.input, { height: 80 }]}
        multiline
        value={description}
        onChangeText={setDescription}
      />

      {/* CATEGORY */}
      <View style={styles.input}>
        <Text style={{ color: "#9ca3af", marginBottom: 6 }}>
          Select Category
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={[
                styles.categoryItem,
                selectedCategory === cat.id && styles.categoryActive,
              ]}
            >
              <Text
                style={{
                  color:
                    selectedCategory === cat.id ? "#fff" : "#9ca3af",
                }}
              >
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <TextInput
        placeholder="Price"
        placeholderTextColor="#6b7280"
        style={styles.input}
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />

      <TextInput
        placeholder="Quantity"
        placeholderTextColor="#6b7280"
        style={styles.input}
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
      />

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>In Stock</Text>
        <Switch value={inStock} onValueChange={setInStock} />
      </View>

      <Pressable
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleCreate}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Creating..." : "Create Product"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  title: { color: "#fff", fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#9ca3af", marginBottom: 20 },

  imageBox: {
    minHeight: 120,
    borderRadius: 16,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: 10,
  },

  imageWrapper: {
    position: "relative",
    marginRight: 10,
  },

  multiImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },

  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#ef4444",
    borderRadius: 12,
    padding: 4,
  },

  mainBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "#7c3aed",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  mainText: {
    color: "#fff",
    fontSize: 10,
  },

  imageCount: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 6,
  },

  input: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    color: "#fff",
  },

  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  toggleLabel: { color: "#fff" },

  button: {
    backgroundColor: "#7c3aed",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: { color: "#fff", fontWeight: "600" },

  categoryItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1e293b",
    marginRight: 8,
  },

  categoryActive: {
    backgroundColor: "#7c3aed",
    borderColor: "#7c3aed",
  },
});