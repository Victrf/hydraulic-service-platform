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

export default function EditProductScreen({ route }: any) {
  const { product } = route.params;
  const navigation = useNavigation<any>();

  const [name, setName] = useState(product.name || "");
  const [description, setDescription] = useState(product.description || "");
  const [price, setPrice] = useState(String(product.price ?? ""));
  const [quantity, setQuantity] = useState(String(product.quantity ?? ""));
  const [inStock, setInStock] = useState(product.inStock ?? true);

  // 🔥 UPDATED IMAGE STATE
  const [images, setImages] = useState<any[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(
    product.images || []
  );

  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(
    product.categoryId || product.category?.id || ""
  );

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

  // 🔥 UPDATED PICKER (append)
  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required");
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

  // 🔥 REMOVE FUNCTIONS
  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Name is required");
      return;
    }

    if (!selectedCategory) {
      Alert.alert("Validation", "Select category");
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

      // 🔥 SEND EXISTING (after deletion)
      formData.append(
        "existingImages",
        JSON.stringify(existingImages)
      );

      // 🔥 SEND NEW IMAGES
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

      Alert.alert("Success", "Product updated");
      navigation.goBack();
    } catch (err: any) {
      console.log("UPDATE ERROR:", err?.response?.data || err.message);

      Alert.alert(
        "Update failed",
        err?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Edit Product</Text>

      {/* 🔥 IMAGE MANAGER */}
      <View style={styles.imageBox}>
        <ScrollView horizontal>
          {/* EXISTING */}
          {existingImages.map((img, i) => (
            <View key={`old-${i}`} style={{ marginRight: 8 }}>
              <Image
                source={{
                  uri: `${api.defaults.baseURL}/uploads/products/${img}`,
                }}
                style={styles.preview}
              />

              <Pressable
                style={styles.removeBtn}
                onPress={() => removeExistingImage(i)}
              >
                <Text style={{ color: "#fff" }}>✕</Text>
              </Pressable>
            </View>
          ))}

          {/* NEW */}
          {images.map((img, i) => (
            <View key={`new-${i}`} style={{ marginRight: 8 }}>
              <Image source={{ uri: img.uri }} style={styles.preview} />

              <Pressable
                style={styles.removeBtn}
                onPress={() => removeNewImage(i)}
              >
                <Text style={{ color: "#fff" }}>✕</Text>
              </Pressable>
            </View>
          ))}

          {/* ADD */}
          <Pressable style={styles.addBox} onPress={pickImages}>
            <Ionicons name="add" size={28} color="#9ca3af" />
          </Pressable>
        </ScrollView>
      </View>

      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        value={description}
        onChangeText={setDescription}
      />

      {/* CATEGORY */}
      <View style={styles.input}>
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
        style={styles.input}
        value={price}
        keyboardType="numeric"
        onChangeText={setPrice}
      />

      <TextInput
        style={styles.input}
        value={quantity}
        keyboardType="numeric"
        onChangeText={setQuantity}
      />

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>In Stock</Text>
        <Switch value={inStock} onValueChange={setInStock} />
      </View>

      <Pressable
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleUpdate}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Updating..." : "Update Product"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },

  imageBox: {
    height: 140,
    borderRadius: 16,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: 8,
  },

  preview: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 8,
  },

  removeBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    padding: 4,
  },

  addBox: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
  },

  input: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  toggleLabel: {
    color: "#fff",
  },

  button: {
    backgroundColor: "#7c3aed",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },

  categoryItem: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginRight: 8,
  },

  categoryActive: {
    backgroundColor: "#7c3aed",
    borderColor: "#7c3aed",
  },
});