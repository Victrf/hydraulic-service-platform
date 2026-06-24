import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  TextInput,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../api/client";

export default function ProductsSection({ products }: any) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "crane" | "tail">(
    "all",
  );

  // 🔥 MODAL STATE
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productDetails, setProductDetails] = useState<any>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);

  const chunk = (arr: any[], size: number) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  // 🔥 FETCH PRODUCT
  const fetchProductDetails = async (id: string) => {
    try {
      setLoadingProduct(true);
      const res = await api.get(`/products/${id}`);
      setProductDetails(res.data);
    } catch (err) {
      console.log("Error fetching product:", err);
    } finally {
      setLoadingProduct(false);
    }
  };

  // 🔥 SEARCH + FILTER
  const filteredProducts = products.filter((p: any) => {
    const name = p.name?.toLowerCase() || "";
    const category = p.category?.name?.toLowerCase() || "";

    const matchesSearch = name.includes(search.toLowerCase());

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "crane" && category.includes("crane")) ||
      (activeFilter === "tail" && category.includes("tail"));

    return matchesSearch && matchesFilter;
  });

  const craneProducts = filteredProducts.filter((p: any) =>
    (p.category?.name?.toLowerCase() || "").includes("crane"),
  );

  const tailProducts = filteredProducts.filter((p: any) =>
    (p.category?.name?.toLowerCase() || "").includes("tail"),
  );

  const craneRows = chunk(craneProducts, 6);
  const tailRows = chunk(tailProducts, 6);

  const AnimatedProductCard = ({ children }: any) => {
    const scale = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={{
          transform: [{ scale }],
        }}
      >
        {children}
      </Animated.View>
    );
  };

  const ProductImageSlider = ({ images }: any) => {
    const ref = useRef<ScrollView>(null);
    const index = useRef(0);

    const normalizedImages = Array.isArray(images)
      ? images
          .map((img: any) => (typeof img === "string" ? img : img?.url))
          .filter(Boolean)
      : [];

    useEffect(() => {
      if (!normalizedImages.length) return;

      const interval = setInterval(() => {
        index.current =
          index.current === normalizedImages.length - 1 ? 0 : index.current + 1;

        ref.current?.scrollTo({
          x: index.current * 150,
          animated: true,
        });
      }, 2500);

      return () => clearInterval(interval);
    }, [normalizedImages]);

    return (
      <ScrollView
        horizontal
        pagingEnabled
        ref={ref}
        showsHorizontalScrollIndicator={false}
        style={{ width: 150, height: 160 }}
      >
        {normalizedImages.map((img: string, i: number) => (
          <Image
            key={i}
            source={{
              uri: `${api.defaults.baseURL}/uploads/products/${img}`,
            }}
            style={styles.coverImage}
          />
        ))}
      </ScrollView>
    );
  };

  const { width } = Dimensions.get("window");
  const MODAL_WIDTH = width * 0.9;
  const MODAL_HEIGHT = 420;

  const ModalImageSlider = ({ images }: any) => {
    const ref = useRef<ScrollView>(null);
    const index = useRef(0);

    const normalizedImages = Array.isArray(images)
      ? images
          .map((img: any) => (typeof img === "string" ? img : img?.url))
          .filter(Boolean)
      : [];

    useEffect(() => {
      if (!normalizedImages.length) return;

      const interval = setInterval(() => {
        index.current =
          index.current === normalizedImages.length - 1 ? 0 : index.current + 1;

        ref.current?.scrollTo({
          x: index.current * MODAL_WIDTH, // ✅ matches item width
          animated: true,
        });
      }, 3000);

      return () => clearInterval(interval);
    }, [normalizedImages]);

    return (
      <View
        style={{
          width: MODAL_WIDTH,
          height: MODAL_HEIGHT,
        }}
      >
        <ScrollView
          horizontal
          pagingEnabled
          ref={ref}
          showsHorizontalScrollIndicator={false}
        >
          {normalizedImages.map((img: string, i: number) => (
            <Image
              key={i}
              source={{
                uri: `${api.defaults.baseURL}/uploads/products/${img}`,
              }}
              style={{
                width: MODAL_WIDTH, // ✅ same as scroll step
                height: MODAL_HEIGHT, // ✅ same as modal
              }}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      </View>
    );
  };
  return (
    <View>
      <View style={styles.productsSection}>
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={16} color="#9ca3af" />
              <TextInput
                placeholder="Search products..."
                placeholderTextColor="#6b7280"
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
            </View>

            <TouchableOpacity
              style={styles.filterBtn}
              onPress={() => {
                setActiveFilter((prev) =>
                  prev === "all" ? "crane" : prev === "crane" ? "tail" : "all",
                );
              }}
            >
              <Ionicons
                name="options-outline"
                size={18}
                color={activeFilter === "all" ? "#fff" : "#38bdf8"}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Featured Products</Text>
        </View>

        {/* CRANES */}
        <Text style={styles.sectionSubTitle}>Cranes</Text>

        {craneRows.map((row, i) => (
          <ScrollView key={i} horizontal style={styles.productRow}>
            {row.map((item: any) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                onPress={() => {
                  setSelectedProduct(item);
                  fetchProductDetails(item.id);
                }}
              >
                <AnimatedProductCard>
                  <View style={styles.productCard}>
                    {Array.isArray(item.images) && item.images.length > 0 ? (
                      <ProductImageSlider images={item.images} />
                    ) : (
                      <View style={styles.coverImage}>
                        <Ionicons
                          name="image-outline"
                          size={20}
                          color="#6b7280"
                        />
                      </View>
                    )}

                    <View style={styles.cardOverlay} />

                    <View style={styles.cardContent}>
                      <Text style={styles.productName}>{item.name}</Text>
                      <Text style={styles.productPrice}>
                        ${item.price || 0}
                      </Text>
                    </View>
                  </View>
                </AnimatedProductCard>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ))}

        {/* TAIL */}
        <Text style={styles.sectionSubTitle}>Tail Lift</Text>

        {tailRows.map((row, i) => (
          <ScrollView key={i} horizontal style={styles.productRow}>
            {row.map((item: any) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                onPress={() => {
                  setSelectedProduct(item);
                  fetchProductDetails(item.id);
                }}
              >
                <AnimatedProductCard>
                  <View style={styles.productCard}>
                    {Array.isArray(item.images) && item.images.length > 0 ? (
                      <ProductImageSlider images={item.images} />
                    ) : (
                      <View style={styles.coverImage}>
                        <Ionicons
                          name="image-outline"
                          size={20}
                          color="#6b7280"
                        />
                      </View>
                    )}

                    <View style={styles.cardOverlay} />

                    <View style={styles.cardContent}>
                      <Text style={styles.productName}>{item.name}</Text>
                      <Text style={styles.productPrice}>
                        ${item.price || 0}
                      </Text>
                    </View>
                  </View>
                </AnimatedProductCard>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ))}

        {/* EMPTY */}
        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={28} color="#6b7280" />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or filter
            </Text>
          </View>
        )}
      </View>

      {/* MODAL */}
      <Modal visible={!!selectedProduct} animationType="fade" transparent>
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => {
            setSelectedProduct(null);
            setProductDetails(null);
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            {/* IMAGE BACKGROUND */}
            {productDetails?.images?.length > 0 && (
              <ModalImageSlider images={productDetails.images} />
            )}

            {/* DARK OVERLAY */}
            <View style={styles.modalOverlay} />

            {/* CLOSE BUTTON */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                setSelectedProduct(null);
                setProductDetails(null);
              }}
            >
              <Ionicons name="close" size={18} color="#fff" />
            </TouchableOpacity>

            {loadingProduct ? (
              <ActivityIndicator style={{ marginTop: 40 }} color="#fff" />
            ) : productDetails ? (
              <>
                {/* 🔥 TOP CONTENT */}
                <View style={styles.modalTopContent}>
                  <Text style={styles.modalTitle}>{productDetails.name}</Text>
                  <Text style={styles.modalCategory}>
                    {productDetails.category?.name}
                  </Text>
                </View>

                {/* 🔥 BOTTOM CONTENT */}
                <View style={styles.modalBottomContent}>
                  <Text style={styles.modalPrice}>
                    ${productDetails.price || 0}
                  </Text>

                  <Text style={styles.modalDescription}>
                    {productDetails.description || "No description"}
                  </Text>

                  <Text style={styles.modalStock}>
                    {productDetails.inStock ? "In Stock" : "Out of Stock"}
                  </Text>
                </View>
              </>
            ) : null}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  productsSection: { marginTop: 40 },

  headerContainer: { paddingHorizontal: 16, marginBottom: 10 },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  searchInput: {
    marginLeft: 8,
    flex: 1,
    color: "#fff",
    fontSize: 13,
  },

  filterBtn: {
    marginLeft: 10,
    height: 40,
    width: 40,
    borderRadius: 12,
    backgroundColor: "#1f2937",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f3f3f3",
    textAlign: "center",
    marginTop: 10,
    marginBottom: -30,
  },

  sectionSubTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9ca3af",
    marginBottom: 10,
    paddingHorizontal: 16,
    marginTop: 12,
  },

  productRow: { marginBottom: 16 },

  productCard: {
    width: 150,
    height: 160,
    marginLeft: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#192233",
  },

  coverImage: {
    width: 150,
    height: 160,
  },

  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  cardContent: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
  },

  productName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },

  productPrice: {
    fontSize: 12,
    color: "#e4e4e7",
    marginTop: 3,
  },

  emptyState: { alignItems: "center", marginTop: 40 },

  emptyTitle: { color: "#fff", marginTop: 10 },

  emptySubtitle: { color: "#9ca3af", marginTop: 4 },

  // 🔥 MODAL (NEW DESIGN)

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  modalContent: {
    width: "100%",
    height: 420, // 🔥 full visual card
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#000",
  },

  // 🔥 FULL IMAGE BACKGROUND
  modalImage: {
    width: "100%",
    height: "100%",
  },

  // 🔥 DARK OVERLAY (readability)
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  // 🔥 CLOSE BUTTON (visible)
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 20,
  },

  // 🔥 TOP TEXT (title + category)
  modalTopContent: {
    position: "absolute",
    top: 20,
    left: 16,
    right: 16,
  },

  // 🔥 BOTTOM TEXT (price + description)
  modalBottomContent: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },

  modalCategory: {
    fontSize: 16,
    color: "#1e1e1e",
    marginTop: 4,
  },

  modalPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#38bdf8",
  },

  modalDescription: {
    fontSize: 13,
    color: "#e5e7eb",
    marginTop: 8,
    lineHeight: 18,
  },

  modalStock: {
    fontSize: 12,
    marginTop: 8,
    color: "#22c55e",
  },
});
