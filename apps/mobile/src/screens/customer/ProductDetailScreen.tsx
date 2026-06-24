import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useEffect, useState } from "react";

const { width } = Dimensions.get("window");

const productImages = [
  require("../../assets/card1.jpg"),
  require("../../assets/card2.png"),
  require("../../assets/card3.png"),
];

export default function ProductDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const { id } = route.params;

  const flatListRef = useRef<FlatList>(null);
  const currentIndex = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      currentIndex.current = (currentIndex.current + 1) % productImages.length;

      flatListRef.current?.scrollToIndex({
        index: currentIndex.current,
        animated: true,
      });

      setActiveIndex(currentIndex.current);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 🔥 IMAGE CAROUSEL */}
        <View style={styles.carouselWrapper}>
          <FlatList
            ref={flatListRef}
            data={productImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => i.toString()}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              currentIndex.current = index;
              setActiveIndex(index);
            }}
            renderItem={({ item }) => (
              <ImageBackground source={item} style={styles.image}>
                <LinearGradient
                  colors={["transparent", "rgba(2,6,23,0.95)"]}
                  style={styles.overlay}
                >
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Pumps</Text>
                  </View>

                  <Text style={styles.heroTitle}>Hydraulic Pump</Text>
                  <Text style={styles.heroSub}>Industrial Grade Equipment</Text>
                </LinearGradient>
              </ImageBackground>
            )}
          />

          {/* DOTS */}
          <View style={styles.dotsContainer}>
            {productImages.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, activeIndex === index && styles.activeDot]}
              />
            ))}
          </View>
        </View>

        {/* 🔥 FLOATING CONTENT */}
        <View style={styles.floatingContent}>
          {/* QUICK INFO */}
          <View style={styles.quickInfo}>
            <View style={styles.infoBox}>
              <Text style={styles.infoValue}>300 bar</Text>
              <Text style={styles.infoLabel}>Pressure</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoValue}>5kW</Text>
              <Text style={styles.infoLabel}>Power</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoValue}>Steel</Text>
              <Text style={styles.infoLabel}>Material</Text>
            </View>
          </View>

          {/* OVERVIEW */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.description}>
              High-performance hydraulic pump designed for demanding industrial
              environments. Built with durability and efficiency in mind.
            </Text>
          </View>

          {/* FEATURES */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Key Features</Text>

            <View style={styles.featureRow}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>
                High pressure output (300 bar)
              </Text>
            </View>

            <View style={styles.featureRow}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>
                Energy efficient performance
              </Text>
            </View>

            <View style={styles.featureRow}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Long operational lifespan</Text>
            </View>
          </View>

          {/* SPECIFICATIONS */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Specifications</Text>

            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Power</Text>
              <Text style={styles.specValue}>5kW</Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Pressure</Text>
              <Text style={styles.specValue}>300 bar</Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Material</Text>
              <Text style={styles.specValue}>Steel</Text>
            </View>
          </View>

          {/* 🔥 RELATED PRODUCTS */}
          <Text style={styles.sectionTitle}>Related Products</Text>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[1, 2, 3, 4]}
            keyExtractor={(item) => item.toString()}
            renderItem={({ item }) => (
              <View style={styles.relatedCard}>
                <ImageBackground
                  source={require("../../assets/card1.jpg")}
                  style={styles.relatedImage}
                />
                <Text style={styles.relatedText}>Pump {item}</Text>
              </View>
            )}
          />
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("CreateRequest")}
        >
          <Text style={styles.buttonText}>Request Service</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },

  carouselWrapper: {
    height: 300,
  },

  image: {
    width: width,
    height: 300,
    justifyContent: "flex-end",
  },

  overlay: {
    padding: 20,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(124,58,237,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },

  badgeText: {
    color: "#a78bfa",
    fontSize: 12,
  },

  heroTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },

  heroSub: {
    color: "#9ca3af",
    marginTop: 4,
  },

  dotsContainer: {
    position: "absolute",
    bottom: 10,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6b7280",
    marginHorizontal: 4,
  },

  activeDot: {
    backgroundColor: "#fff",
    width: 10,
    height: 10,
  },

  floatingContent: {
    marginTop: -40,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  quickInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  infoBox: {
    backgroundColor: "#111827",
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  infoValue: {
    color: "#fff",
    fontWeight: "700",
  },

  infoLabel: {
    color: "#9ca3af",
    fontSize: 12,
  },

  card: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },

  description: {
    color: "#d1d5db",
    lineHeight: 20,
  },

  featureRow: {
    flexDirection: "row",
    marginBottom: 8,
  },

  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#7c3aed",
    marginTop: 6,
    marginRight: 10,
  },

  featureText: {
    color: "#d1d5db",
  },

  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  specLabel: {
    color: "#9ca3af",
  },

  specValue: {
    color: "#fff",
    fontWeight: "500",
  },

  relatedCard: {
    width: 140,
    marginRight: 12,
  },

  relatedImage: {
    height: 90,
    borderRadius: 12,
    overflow: "hidden",
  },

  relatedText: {
    color: "#fff",
    marginTop: 6,
    fontSize: 13,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 16,
    backgroundColor: "#020617",
    borderTopWidth: 1,
    borderTopColor: "#111827",
  },

  button: {
    backgroundColor: "#7c3aed",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",

    shadowColor: "#7c3aed",
    shadowOpacity: 0.6,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
