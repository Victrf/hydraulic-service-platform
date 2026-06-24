import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  FlatList,
  Dimensions,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../api/client";
import { useEffect, useRef } from "react";

const { width } = Dimensions.get("window");

export default function ProductDetailsScreen({ route }: any) {
  const { product } = route.params;

  const images = product.images || [];

  const flatListRef = useRef<FlatList>(null);
  const currentIndex = useRef(0);

  // 🔥 AUTO SLIDE
  useEffect(() => {
    if (!images.length) return;

    const interval = setInterval(() => {
      currentIndex.current =
        (currentIndex.current + 1) % images.length;

      flatListRef.current?.scrollToIndex({
        index: currentIndex.current,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [images]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
    >
      {/* 🔥 IMAGE SLIDER */}
      {images.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          getItemLayout={(_, index) => ({
            length: width - 32,
            offset: (width - 32) * index,
            index,
          })}
          renderItem={({ item }) => {
            const imageUrl =
              typeof item === "string" ? item : item?.url;

            return (
              <Image
                source={{
                  uri: `${api.defaults.baseURL}/uploads/products/${imageUrl}`,
                }}
                style={styles.image}
                resizeMode="cover"
              />
            );
          }}
        />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="image-outline" size={40} color="#6b7280" />
          <Text style={styles.noImageText}>No Image</Text>
        </View>
      )}

      {/* 🔥 GALLERY ROW */}
      {images.length > 0 && (
        <>
          <Text style={styles.section}>Gallery</Text>

          <FlatList
            data={images}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={styles.galleryRow}
            renderItem={({ item, index }) => {
              const imageUrl =
                typeof item === "string" ? item : item?.url;

              return (
                <Pressable
                  onPress={() => {
                    currentIndex.current = index;
                    flatListRef.current?.scrollToIndex({
                      index,
                      animated: true,
                    });
                  }}
                  style={styles.galleryCard}
                >
                  <Image
                    source={{
                      uri: `${api.defaults.baseURL}/uploads/products/${imageUrl}`,
                    }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                </Pressable>
              );
            }}
          />
        </>
      )}

      {/* 🔥 HEADER */}
      <Text style={styles.name}>{product.name}</Text>

      <Text style={styles.category}>
        {product.category?.name || "No Category"}
      </Text>

      {/* 🔥 INFO ROW */}
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Price</Text>
          <Text style={styles.value}>
            {product.price ? `₹${product.price}` : "-"}
          </Text>
        </View>

        <View>
          <Text style={styles.label}>Quantity</Text>
          <Text style={styles.value}>
            {product.quantity ?? 0}
          </Text>
        </View>
      </View>

      {/* 🔥 STATUS */}
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: product.inStock ? "#064e3b" : "#7f1d1d",
          },
        ]}
      >
        <Text style={styles.statusText}>
          {product.inStock ? "In Stock" : "Out of Stock"}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* 🔥 DESCRIPTION */}
      <Text style={styles.section}>Description</Text>

      <Text style={styles.description}>
        {product.description || "No description provided"}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
  },

  container: {
    padding: 16,
    paddingTop: 40,
  },

  image: {
    width: width - 32,
    height: 200,
    borderRadius: 16,
    marginRight: 10,
  },

  placeholder: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  noImageText: {
    color: "#6b7280",
    marginTop: 6,
    fontSize: 12,
  },

  section: {
    color: "#fff",
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },

  // 🔥 GALLERY ROW STYLES
  galleryRow: {
    marginTop: 10,
    paddingRight: 10,
  },

  galleryCard: {
    width: 120,
    height: 120,
    borderRadius: 14,
    overflow: "hidden",
    marginRight: 12,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  galleryImage: {
    width: "100%",
    height: "100%",
  },

  name: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 16,
  },

  category: {
    color: "#9ca3af",
    marginTop: 4,
    fontSize: 13,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },

  label: {
    color: "#6b7280",
    fontSize: 12,
  },

  value: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 2,
  },

  statusBadge: {
    marginTop: 16,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#1e293b",
    marginVertical: 16,
  },

  description: {
    color: "#d1d5db",
    lineHeight: 20,
  },
});