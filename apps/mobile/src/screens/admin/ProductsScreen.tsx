import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  Animated,
  Dimensions,
} from "react-native";
import { useState, useCallback, useRef, useEffect } from "react";
import { api } from "../../api/client";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import EmptyState from "../../components/common/EmptyState";
import SuccessModal from "../../components/common/SuccessModal";
import ConfirmationModal from "../../components/common/ConfirmationModal";

const { width } = Dimensions.get("window");

export default function ProductsScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "crane" | "tail_lift">("all");

  const navigation = useNavigation<any>();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useFocusEffect(
    useCallback(() => {
      loadProducts(1);
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
    }, []),
  );

  const loadProducts = async (pageNumber = 1) => {
    try {
      if (pageNumber === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await api.get(`/products?page=${pageNumber}&limit=10`);
      const data = res.data?.data || [];
      const meta = res.data?.meta || {};

      if (pageNumber === 1) {
        setProducts(data);
      } else {
        setProducts((prev) => [...prev, ...data]);
      }

      setPage(meta.page || 1);
      setLastPage(meta.lastPage || 1);
    } catch (err: any) {
      console.log("PRODUCT LOAD ERROR:", err?.response?.data || err.message);
      Alert.alert("Error", "Failed to load products");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (loadingMore || page >= lastPage) return;
    loadProducts(page + 1);
  };

  const handleDelete = (product: any) => {
    setSelectedProduct(product);
    setDeleteVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      setDeleting(true);
      await api.delete(`/products/${selectedProduct.id}`);
      setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
      setDeleteVisible(false);
      setSuccessVisible(true);
    } catch (err: any) {
      console.log("DELETE ERROR:", err?.response?.data || err.message);
      Alert.alert("Delete Failed", "Unable to delete this product.");
    } finally {
      setDeleting(false);
    }
  };

  const getStockColor = (item: any) => {
    if (!item.inStock || item.quantity === 0) return "#ef4444";
    if (item.quantity < 5) return "#f59e0b";
    return "#10b981";
  };

  const getStockBgColor = (item: any) => {
    if (!item.inStock || item.quantity === 0) return "rgba(239, 68, 68, 0.15)";
    if (item.quantity < 5) return "rgba(245, 158, 11, 0.15)";
    return "rgba(16, 185, 129, 0.15)";
  };

  const getStockLabel = (item: any) => {
    if (!item.inStock || item.quantity === 0) return "Out of Stock";
    if (item.quantity < 5) return "Low Stock";
    return "In Stock";
  };

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.name?.toLowerCase().includes(q) ||
      String(p.price ?? "").includes(q) ||
      String(p.quantity ?? "").includes(q);
    const categoryName = p.category?.name?.toLowerCase() || "";
    const matchesFilter =
      filter === "all" ||
      (filter === "crane" && categoryName.includes("crane")) ||
      (filter === "tail_lift" &&
        (categoryName.includes("tail") || categoryName.includes("lift")));
    return matchesSearch && matchesFilter;
  });

  // Header blur effect on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading inventory...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Blur Header Background */}
      <Animated.View style={[styles.headerBlur, { opacity: headerOpacity }]} />

      {/* HEADER */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="cube" size={22} color="#8b5cf6" />
          </View>
          <View>
            <Text style={styles.title}>Products</Text>
            <Text style={styles.subtitle}>
              {filteredProducts.length} items in catalog
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            style={styles.iconBtn}
            onPress={() =>
              setViewMode((prev) => (prev === "card" ? "table" : "card"))
            }
          >
            <Ionicons
              name={viewMode === "card" ? "grid-outline" : "list-outline"}
              size={20}
              color="#94a3b8"
            />
          </Pressable>

          <Pressable
            style={styles.addBtn}
            onPress={() => navigation.navigate("CreateProduct")}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </Pressable>
        </View>
      </Animated.View>

      {/* SEARCH */}
      <Animated.View
        style={[
          styles.searchContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#64748b" />
          <TextInput
            placeholder="Search products..."
            placeholderTextColor="#475569"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <Pressable onPress={() => setSearch("")} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color="#64748b" />
            </Pressable>
          ) : null}
        </View>
      </Animated.View>

      {/* FILTER ROW */}
      <Animated.View
        style={[
          styles.filterContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.filterRow}>
          {[
            { label: "All", value: "all", icon: "layers-outline" },
            { label: "Cranes", value: "crane", icon: "construct-outline" },
            {
              label: "Tail Lift",
              value: "tail_lift",
              icon: "arrow-up-outline",
            },
          ].map((f) => (
            <Pressable
              key={f.value}
              onPress={() => setFilter(f.value as any)}
              style={[
                styles.filterBtn,
                filter === f.value && styles.filterActive,
              ]}
            >
              <Ionicons
                name={f.icon as any}
                size={14}
                color={filter === f.value ? "#fff" : "#64748b"}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.filterText,
                  filter === f.value && styles.filterTextActive,
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      {/* TABLE HEADER */}
      {viewMode === "table" && (
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 2 }]}>Product</Text>
          <Text style={styles.headerCell}>Price</Text>
          <Text style={styles.headerCell}>Qty</Text>
          <Text style={styles.headerCell}>Status</Text>
        </View>
      )}

      <Animated.FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              icon={products.length === 0 ? "cube-outline" : "search-outline"}
              title={
                products.length === 0
                  ? "No Products Yet"
                  : "No Matching Products"
              }
              message={
                products.length === 0
                  ? "Start building your catalog by creating your first product."
                  : "Try a different search term or change the selected filter."
              }
            />
            {products.length === 0 && (
              <Pressable
                style={styles.createButton}
                onPress={() => navigation.navigate("CreateProduct")}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.createButtonText}>Create Product</Text>
              </Pressable>
            )}
          </View>
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator color="#8b5cf6" />
              <Text style={styles.loadingMoreText}>Loading more...</Text>
            </View>
          ) : null
        }
        renderItem={({ item, index }) =>
          viewMode === "card" ? (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
              onPress={() =>
                navigation.navigate("ProductDetails", { product: item })
              }
            >
              {/* Image Section */}
              <View style={styles.imageContainer}>
                {item.images?.length ? (
                  <Image
                    source={{
                      uri: `${api.defaults.baseURL}/uploads/products/${item.images[0]}`,
                    }}
                    style={styles.image}
                  />
                ) : (
                  <View style={styles.placeholder}>
                    <Ionicons name="cube-outline" size={32} color="#475569" />
                  </View>
                )}
              </View>

              {/* Content Section */}
              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.name} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: getStockBgColor(item) },
                      ]}
                    >
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: getStockColor(item) },
                        ]}
                      />
                      <Text
                        style={[
                          styles.badgeText,
                          { color: getStockColor(item) },
                        ]}
                      >
                        {getStockLabel(item)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.category}>
                    {item.category?.name || "Uncategorized"}
                  </Text>
                </View>

                <View style={styles.cardBottom}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Price</Text>
                    <Text style={styles.price}>
                      {item.price ? `₹${item.price}` : "—"}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.qtyContainer}>
                    <Text style={styles.qtyLabel}>Quantity</Text>
                    <Text style={styles.qtyValue}>{item.quantity ?? 0}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.actions}>
                    <Pressable
                      style={styles.actionBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        navigation.navigate("EditProduct", { product: item });
                      }}
                    >
                      <Ionicons
                        name="create-outline"
                        size={18}
                        color="#60a5fa"
                      />
                    </Pressable>
                    <Pressable
                      style={[styles.actionBtn, styles.deleteActionBtn]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDelete(item);
                      }}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#f87171"
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.tableRow,
                pressed && styles.tableRowPressed,
              ]}
              onPress={() =>
                navigation.navigate("ProductDetails", { product: item })
              }
            >
              <View
                style={[
                  styles.tableCell,
                  { flex: 2, flexDirection: "row", alignItems: "center" },
                ]}
              >
                {item.images?.length ? (
                  <Image
                    source={{
                      uri: `${api.defaults.baseURL}/uploads/products/${item.images[0]}`,
                    }}
                    style={styles.tableImage}
                  />
                ) : (
                  <View style={styles.tablePlaceholder}>
                    <Ionicons name="cube-outline" size={16} color="#475569" />
                  </View>
                )}
                <Text style={styles.cellText} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
              <Text style={styles.cellText}>{item.price ?? "—"}</Text>
              <Text style={styles.cellText}>{item.quantity ?? 0}</Text>
              <View style={styles.cellText}>
                <View
                  style={[
                    styles.tableBadge,
                    { backgroundColor: getStockBgColor(item) },
                  ]}
                >
                  <View
                    style={[
                      styles.tableDot,
                      { backgroundColor: getStockColor(item) },
                    ]}
                  />
                  <Text
                    style={[
                      styles.tableBadgeText,
                      { color: getStockColor(item) },
                    ]}
                  >
                    {getStockLabel(item)}
                  </Text>
                </View>
              </View>
            </Pressable>
          )
        }
      />

      <ConfirmationModal
        visible={deleteVisible}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleting}
        onCancel={() => {
          setDeleteVisible(false);
          setSelectedProduct(null);
        }}
        onConfirm={confirmDelete}
      />
      <SuccessModal
        visible={successVisible}
        title="Product Deleted"
        message="The product has been deleted successfully."
        buttonText="Continue"
        onContinue={() => {
          setSuccessVisible(false);
          setSelectedProduct(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingTop: 60,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },

  loadingText: {
    color: "#64748b",
    marginTop: 16,
    fontSize: 14,
    fontWeight: "500",
  },

  headerBlur: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 110,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(30, 41, 59, 0.8)",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    zIndex: 11,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },

  title: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  subtitle: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 2,
    fontWeight: "500",
  },

  headerActions: {
    flexDirection: "row",
    gap: 10,
  },

  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },

  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#8b5cf6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8b5cf6",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  searchContainer: {
    marginBottom: 16,
    zIndex: 11,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },

  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: "#f1f5f9",
    fontSize: 15,
    fontWeight: "500",
  },

  clearBtn: {
    padding: 4,
  },

  filterContainer: {
    marginBottom: 20,
    zIndex: 11,
  },

  filterRow: {
    flexDirection: "row",
    gap: 10,
  },

  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },

  filterActive: {
    backgroundColor: "#8b5cf6",
    borderColor: "#8b5cf6",
    shadowColor: "#8b5cf6",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  filterText: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "600",
  },

  filterTextActive: {
    color: "#fff",
    fontWeight: "700",
  },

  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#334155",
    marginBottom: 8,
  },

  headerCell: {
    flex: 1,
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  listContent: {
    paddingBottom: 40,
    flexGrow: 1,
    paddingTop: 8,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
    borderColor: "#8b5cf6",
  },

  imageContainer: {
    marginRight: 16,
  },

  image: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#0f172a",
  },

  placeholder: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
    borderStyle: "dashed",
  },

  cardContent: {
    flex: 1,
    justifyContent: "space-between",
  },

  cardTop: {
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },

  name: {
    color: "#f8fafc",
    fontWeight: "700",
    fontSize: 15,
    flex: 1,
    lineHeight: 20,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },

  category: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },

  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  priceContainer: {
    flex: 1,
  },

  priceLabel: {
    color: "#475569",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  price: {
    color: "#a78bfa",
    fontSize: 16,
    fontWeight: "800",
  },

  divider: {
    width: 1,
    height: 28,
    backgroundColor: "#334155",
  },

  qtyContainer: {
    minWidth: 50,
    alignItems: "center",
  },

  qtyLabel: {
    color: "#475569",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  qtyValue: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "800",
  },

  actions: {
    flexDirection: "row",
    gap: 8,
  },

  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(96, 165, 250, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(96, 165, 250, 0.2)",
  },

  deleteActionBtn: {
    backgroundColor: "rgba(248, 113, 113, 0.1)",
    borderColor: "rgba(248, 113, 113, 0.2)",
  },

  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#1e293b",
    backgroundColor: "#1e293b",
    marginBottom: 4,
    borderRadius: 12,
  },

  tableRowPressed: {
    backgroundColor: "#334155",
  },

  tableCell: {
    flex: 1,
  },

  tableImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#0f172a",
  },

  tablePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },

  cellText: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "500",
  },

  tableBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
    alignSelf: "flex-start",
  },

  tableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  tableBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },

  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 28,
    shadowColor: "#8b5cf6",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  createButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  loadingMore: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
  },

  loadingMoreText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "600",
  },
});
