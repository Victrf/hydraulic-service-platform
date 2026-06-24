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
} from "react-native";
import { useState, useCallback } from "react";
import { api } from "../../api/client";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

export default function ProductsScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  const [search, setSearch] = useState("");

  // 🔥 NEW FILTER STATE
  const [filter, setFilter] = useState<"all" | "crane" | "tail_lift">("all");

  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      loadProducts(1);
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

  const handleDelete = (id: string) => {
    Alert.alert("Delete Product", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/products/${id}`);
            setProducts((prev) => prev.filter((p) => p.id !== id));
          } catch (err: any) {
            console.log("DELETE ERROR:", err?.response?.data || err.message);
            Alert.alert("Delete failed", "Check admin access");
          }
        },
      },
    ]);
  };

  const getStockColor = (item: any) => {
    if (!item.inStock || item.quantity === 0) return "#ef4444";
    if (item.quantity < 5) return "#facc15";
    return "#10b981";
  };

  const getStockLabel = (item: any) => {
    if (!item.inStock || item.quantity === 0) return "Out of Stock";
    if (item.quantity < 5) return "Low Stock";
    return "In Stock";
  };

  // 🔥 UPDATED FILTER LOGIC
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
        (categoryName.includes("tail") ||
          categoryName.includes("lift")));

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Products</Text>
          <Text style={styles.subtitle}>
            Manage inventory and product catalog
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            style={styles.toggleBtn}
            onPress={() =>
              setViewMode((prev) =>
                prev === "card" ? "table" : "card"
              )
            }
          >
            <Ionicons
              name={viewMode === "card" ? "grid-outline" : "list-outline"}
              size={18}
              color="#fff"
            />
          </Pressable>

          <Pressable
            style={styles.addBtn}
            onPress={() => navigation.navigate("CreateProduct")}
          >
            <Ionicons name="add" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color="#9ca3af" />

        <TextInput
          placeholder="Search products..."
          placeholderTextColor="#6b7280"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />

        {search ? (
          <Pressable onPress={() => setSearch("")}>
            <Ionicons name="close" size={16} color="#9ca3af" />
          </Pressable>
        ) : null}
      </View>

      {/* 🔥 FILTER ROW */}
      <View style={styles.filterRow}>
        {[
          { label: "All", value: "all" },
          { label: "Cranes", value: "crane" },
          { label: "Tail Lift", value: "tail_lift" },
        ].map((f) => (
          <Pressable
            key={f.value}
            onPress={() => setFilter(f.value as any)}
            style={[
              styles.filterBtn,
              filter === f.value && styles.filterActive,
            ]}
          >
            <Text
              style={{
                color: filter === f.value ? "#fff" : "#9ca3af",
              }}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* TABLE HEADER */}
      {viewMode === "table" && (
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>Name</Text>
          <Text style={styles.headerCell}>Price</Text>
          <Text style={styles.headerCell}>Qty</Text>
          <Text style={styles.headerCell}>Status</Text>
          <Text style={styles.headerCell}>Category</Text>
        </View>
      )}

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={{ marginVertical: 20 }} color="#7c3aed" />
          ) : null
        }
        renderItem={({ item }) =>
          viewMode === "card" ? (
            <View style={styles.card}>
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
                    <Ionicons name="cube-outline" size={28} color="#6b7280" />
                  </View>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Pressable
                  onPress={() =>
                    navigation.navigate("ProductDetails", { product: item })
                  }
                >
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.category}>
                    {item.category?.name || "No Category"}
                  </Text>
                  <Text style={styles.price}>
                    {item.price ? `₹${item.price}` : "No price"}
                  </Text>
                  <Text style={[styles.stock, { color: getStockColor(item) }]}>
                    {getStockLabel(item)}
                  </Text>
                  <Text style={styles.meta}>
                    Qty: {item.quantity ?? 0}
                  </Text>
                </Pressable>

                <View style={styles.actions}>
                  <Pressable
                    style={styles.editBtn}
                    onPress={() =>
                      navigation.navigate("EditProduct", { product: item })
                    }
                  >
                    <Text style={{ color: "#fff" }}>Edit</Text>
                  </Pressable>

                  <Pressable
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item.id)}
                  >
                    <Text style={{ color: "#fff" }}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : (
            <Pressable
              style={styles.tableRow}
              onPress={() =>
                navigation.navigate("ProductDetails", { product: item })
              }
            >
              <Text style={styles.cell}>{item.name}</Text>
              <Text style={styles.cell}>{item.price ?? "-"}</Text>
              <Text style={styles.cell}>{item.quantity ?? 0}</Text>
              <Text style={[styles.cell, { color: getStockColor(item) }]}>
                {getStockLabel(item)}
              </Text>
              <Text style={styles.cell}>
                {item.category?.name || "-"}
              </Text>
            </Pressable>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 16,
    paddingTop: 50,
  },

  imageContainer: {
    position: "relative",
    marginRight: 12,
  },

  imageBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "#020617",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  imageBadgeText: {
    color: "#fff",
    fontSize: 10,
  },

  toggleBtn: {
    backgroundColor: "#334155",
    padding: 10,
    borderRadius: 12,
  },

  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#1e293b",
  },

  headerCell: {
    flex: 1,
    color: "#9ca3af",
    fontSize: 12,
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#1e293b",
  },

  cell: {
    flex: 1,
    color: "#fff",
    fontSize: 12,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#fff",
    fontSize: 14,
  },

  // 🔥 FILTER STYLES (NEW)
  filterRow: {
    flexDirection: "row",
    marginBottom: 14,
    gap: 10,
  },

  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  filterActive: {
    backgroundColor: "#7c3aed",
    borderColor: "#7c3aed",
    shadowColor: "#7c3aed",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },

  filterText: {
    fontSize: 13,
    color: "#9ca3af",
    fontWeight: "500",
  },

  filterTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  subtitle: {
    color: "#9ca3af",
    fontSize: 12,
  },

  addBtn: {
    backgroundColor: "#7c3aed",
    padding: 10,
    borderRadius: 12,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  image: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },

  placeholder: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
  },

  name: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  category: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },

  price: {
    color: "#a78bfa",
    marginTop: 2,
    fontSize: 13,
  },

  stock: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "500",
  },

  meta: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 2,
  },

  actions: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },

  editBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  deleteBtn: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});