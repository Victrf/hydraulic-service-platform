import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  FlatList,
  Dimensions,
  Pressable,
  Animated,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../api/client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function ProductDetailsScreen({ route }: any) {
  const { product } = route.params;
  const navigation = useNavigation<any>();

  const images = product.images || [];
  const flatListRef = useRef<FlatList>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Auto slide
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % images.length;
      setActiveIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [activeIndex, images.length]);

  const onScroll = useCallback((event: any) => {
    const slideSize = width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveIndex(index);
  }, []);

  const scrollToImage = (index: number) => {
    setActiveIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const getStockColor = () => {
    if (!product.inStock || product.quantity === 0) return "#ef4444";
    if (product.quantity < 5) return "#f59e0b";
    return "#10b981";
  };

  const getStockBgColor = () => {
    if (!product.inStock || product.quantity === 0)
      return "rgba(239, 68, 68, 0.15)";
    if (product.quantity < 5) return "rgba(245, 158, 11, 0.15)";
    return "rgba(16, 185, 129, 0.15)";
  };

  const getStockLabel = () => {
    if (!product.inStock || product.quantity === 0) return "Out of Stock";
    if (product.quantity < 5) return "Low Stock";
    return "In Stock";
  };

  // Parallax header effect
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0, 200],
    outputRange: [1.2, 1, 1],
    extrapolate: "clamp",
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0.3],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      {/* Floating Back Button - appears on scroll */}
      <Animated.View
        style={[styles.backButtonContainer, { opacity: headerOpacity }]}
      >
        <Pressable
          style={styles.backButtonBlur}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#f8fafc" />
        </Pressable>
      </Animated.View>

      {/* Always visible back button */}
      <Pressable
        style={styles.backButtonAbsolute}
        onPress={() => navigation.goBack()}
      >
        <View style={styles.backButtonBg}>
          <Ionicons name="arrow-back" size={22} color="#f8fafc" />
        </View>
      </Pressable>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HERO IMAGE CAROUSEL */}
        <Animated.View
          style={[styles.heroContainer, { opacity: imageOpacity }]}
        >
          <Animated.View style={{ transform: [{ scale: imageScale }] }}>
            {images.length > 0 ? (
              <>
                <FlatList
                  ref={flatListRef}
                  data={images}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(_, i) => i.toString()}
                  getItemLayout={(_, index) => ({
                    length: width,
                    offset: width * index,
                    index,
                  })}
                  onScroll={onScroll}
                  scrollEventThrottle={16}
                  renderItem={({ item }) => {
                    const imageUrl =
                      typeof item === "string" ? item : item?.url;
                    return (
                      <Image
                        source={{
                          uri: `${api.defaults.baseURL}/uploads/products/${imageUrl}`,
                        }}
                        style={styles.heroImage}
                        resizeMode="cover"
                      />
                    );
                  }}
                />
                {/* Bottom gradient fade */}
                <View style={styles.gradientOverlay} />
              </>
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="image-outline" size={48} color="#475569" />
                <Text style={styles.noImageText}>No Image Available</Text>
              </View>
            )}
          </Animated.View>

          {/* Pagination Dots */}
          {images.length > 1 && (
            <View style={styles.pagination}>
              {images.map((_, i) => (
                <Pressable
                  key={i}
                  onPress={() => scrollToImage(i)}
                  style={[styles.dot, i === activeIndex && styles.dotActive]}
                />
              ))}
            </View>
          )}

          {/* Image Count Badge */}
          {images.length > 0 && (
            <View style={styles.imageCountBadge}>
              <Ionicons name="images-outline" size={12} color="#fff" />
              <Text style={styles.imageCountText}>
                {activeIndex + 1} / {images.length}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* CONTENT CARD */}
        <Animated.View
          style={[
            styles.contentCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Category & Actions Row */}
          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Ionicons name="pricetag-outline" size={12} color="#a78bfa" />
              <Text style={styles.categoryText}>
                {product.category?.name || "Uncategorized"}
              </Text>
            </View>
            <View style={styles.actionRow}>
              <Pressable style={styles.iconAction}>
                <Ionicons name="share-outline" size={20} color="#94a3b8" />
              </Pressable>
              <Pressable style={styles.iconAction}>
                <Ionicons name="heart-outline" size={20} color="#94a3b8" />
              </Pressable>
            </View>
          </View>

          {/* Product Name */}
          <Text style={styles.name}>{product.name}</Text>

          {/* Price & Stock Row */}
          <View style={styles.priceStockRow}>
            <View>
              <Text style={styles.priceLabel}>Price</Text>
              <View style={styles.priceRow}>
                <Text style={styles.currency}>₹</Text>
                <Text style={styles.price}>
                  {product.price ? product.price.toLocaleString() : "—"}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.stockBadge,
                { backgroundColor: getStockBgColor() },
              ]}
            >
              <View
                style={[styles.stockDot, { backgroundColor: getStockColor() }]}
              />
              <Text style={[styles.stockText, { color: getStockColor() }]}>
                {getStockLabel()}
              </Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: "rgba(139, 92, 246, 0.15)" },
                ]}
              >
                <Ionicons name="cube-outline" size={18} color="#a78bfa" />
              </View>
              <Text style={styles.statValue}>{product.quantity ?? 0}</Text>
              <Text style={styles.statLabel}>In Stock</Text>
            </View>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: "rgba(96, 165, 250, 0.15)" },
                ]}
              >
                <Ionicons name="cash-outline" size={18} color="#60a5fa" />
              </View>
              <Text style={styles.statValue}>
                {product.price ? `₹${product.price}` : "—"}
              </Text>
              <Text style={styles.statLabel}>Unit Price</Text>
            </View>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: "rgba(16, 185, 129, 0.15)" },
                ]}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color="#34d399"
                />
              </View>
              <Text style={styles.statValue}>
                {product.inStock ? "Yes" : "No"}
              </Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description Section */}
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={18} color="#f8fafc" />
            <Text style={styles.sectionTitle}>Description</Text>
          </View>
          <Text style={styles.description}>
            {product.description || "No description provided for this product."}
          </Text>

          {/* Gallery Section */}
          {images.length > 0 && (
            <>
              <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                <Ionicons name="images-outline" size={18} color="#f8fafc" />
                <Text style={styles.sectionTitle}>Gallery</Text>
              </View>
              <FlatList
                data={images}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, i) => i.toString()}
                contentContainerStyle={styles.galleryRow}
                renderItem={({ item, index }) => {
                  const imageUrl = typeof item === "string" ? item : item?.url;
                  const isActive = index === activeIndex;
                  return (
                    <Pressable
                      onPress={() => scrollToImage(index)}
                      style={[
                        styles.galleryCard,
                        isActive && styles.galleryCardActive,
                      ]}
                    >
                      <Image
                        source={{
                          uri: `${api.defaults.baseURL}/uploads/products/${imageUrl}`,
                        }}
                        style={styles.galleryImage}
                        resizeMode="cover"
                      />
                      {isActive && <View style={styles.galleryOverlay} />}
                    </Pressable>
                  );
                }}
              />
            </>
          )}

          {/* Extra bottom padding so content clears the fixed bottom bar */}
          <View style={{ height: 100 }} />
        </Animated.View>
      </Animated.ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <Pressable
          style={styles.editButton}
          onPress={() => navigation.navigate("EditProduct", { product })}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.editButtonText}>Edit Product</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  scrollContent: {
    flexGrow: 1,
  },

  // Back Button
  backButtonContainer: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 100,
  },
  backButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  backButtonAbsolute: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 99,
  },
  backButtonBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Hero Image
  heroContainer: {
    position: "relative",
    height: 380,
    width: width,
  },
  heroImage: {
    width: width,
    height: 380,
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: "transparent",
  },
  placeholder: {
    width: width,
    height: 380,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    color: "#475569",
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
  },

  // Pagination
  pagination: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  dotActive: {
    width: 24,
    backgroundColor: "#fff",
    borderRadius: 4,
  },

  // Image Count
  imageCountBadge: {
    position: "absolute",
    top: 60,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  imageCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  // Content Card
  contentCard: {
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -60,
    paddingHorizontal: 24,
    paddingTop: 28,
    minHeight: 400,
  },

  // Meta Row
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
  categoryText: {
    color: "#a78bfa",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  iconAction: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },

  // Name
  name: {
    color: "#f8fafc",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 16,
  },

  // Price & Stock
  priceStockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 24,
  },
  priceLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  currency: {
    color: "#a78bfa",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 2,
    marginRight: 2,
  },
  price: {
    color: "#f8fafc",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stockText: {
    fontSize: 12,
    fontWeight: "800",
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  statLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: "#334155",
    marginVertical: 4,
  },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
  },

  // Description
  description: {
    color: "#94a3b8",
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "400",
  },

  // Gallery
  galleryRow: {
    paddingRight: 24,
    gap: 12,
  },
  galleryCard: {
    width: 100,
    height: 100,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#334155",
    position: "relative",
  },
  galleryCardActive: {
    borderColor: "#8b5cf6",
    borderWidth: 2,
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
  galleryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(139, 92, 246, 0.2)",
  },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "#334155",
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 30,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8b5cf6",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#8b5cf6",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
