import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
  ScrollView,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { api } from "../../api/client";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

import HomeSwitcher from "../../components/HomeSwitcher";
import ProductsSection from "../../components/ProductsSection";
import BottomSlider from "../../components/BottomSlider";
import HeroSection from "../../components/HeroSection";

const { width } = Dimensions.get("window");

export default function CustomerHomeScreen() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

  const listRef = useRef<Animated.FlatList<any>>(null);
  const indexRef = useRef(0);

  const bottomRef = useRef<Animated.FlatList<any>>(null);
  const bottomIndex = useRef(0);

  // 🔥 BACKGROUND SLIDER
  const bgImages = [
    "https://images.unsplash.com/photo-1647427060118-4911c9821b82?w=600",
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600",
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600",
  ];

  const bgRef = useRef<Animated.FlatList<any>>(null);
  const bgIndex = useRef(0);

  const ITEM_WIDTH = width;

  useEffect(() => {
    loadUser();
    loadProducts();
    loadAnnouncements();
    loadSubscription();
    loadPlans();
  }, []);

  // HEADER CAROUSEL AUTO SCROLL
  useEffect(() => {
    if (!user?.availableEquipment?.length) return;

    const interval = setInterval(() => {
      const data = user.availableEquipment;

      indexRef.current =
        indexRef.current === data.length - 1 ? 0 : indexRef.current + 1;

      listRef.current?.scrollToOffset({
        offset: indexRef.current * ITEM_WIDTH,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [user]);

  // BACKGROUND AUTO SLIDE
  useEffect(() => {
    const interval = setInterval(() => {
      bgIndex.current =
        bgIndex.current === bgImages.length - 1 ? 0 : bgIndex.current + 1;

      bgRef.current?.scrollToOffset({
        offset: bgIndex.current * width,
        animated: true,
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const slides = [
    ...announcements.map((a) => ({
      type: "announcement",
      data: a,
    })),
    ...(subscriptions.length > 0
      ? subscriptions.map((sub) => ({
          type: "subscription",
          data: sub,
        }))
      : [
          { type: "no-subscription" },
          ...plans.map((p) => ({
            type: "plan",
            data: p,
          })),
        ]),
  ];

  // BOTTOM SLIDER AUTO SCROLL
  useEffect(() => {
    if (!slides.length) return;
    const interval = setInterval(() => {
      bottomIndex.current =
        bottomIndex.current === slides.length - 1 ? 0 : bottomIndex.current + 1;

      bottomRef.current?.scrollToOffset({
        offset: bottomIndex.current * (width - 32),
        animated: true,
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [slides]);

  const loadUser = async () => {
    try {
      const res = await api.get("/users/me");
      setUser(res.data);
    } catch (err) {
      console.log("USER ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await api.get("/products?page=1&limit=10");
      setProducts(res.data.data);
    } catch (err) {
      console.log("PRODUCT ERROR:", err);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const res = await api.get("/announcements");
      setAnnouncements(res.data);
    } catch (err) {
      console.log("ANNOUNCEMENT ERROR:", err);
    }
  };

  const loadSubscription = async () => {
    try {
      const res = await api.get("/subscriptions/me");
      setSubscriptions(res.data);
    } catch (err) {
      console.log("SUBSCRIPTION ERROR:", err);
    }
  };

  const loadPlans = async () => {
    try {
      const res = await api.get("/plans");
      setPlans(res.data);
    } catch (err) {
      console.log("PLANS ERROR:", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#6b7280" }}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#ef4444" }}>Failed to load user</Text>
      </View>
    );
  }

  const equipment = user.availableEquipment || [];

  return (
    <LinearGradient
      colors={["#eef2ff", "#e0f2fe", "#f8fafc"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safe}>
        {/* 🔥 SCROLLABLE CONTENT */}
        <ScrollView
          style={styles.mainContainer}
          contentContainerStyle={{ paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
        >
          {/* BACKGROUND SLIDER */}
          <Animated.FlatList
            ref={bgRef}
            data={bgImages}
            keyExtractor={(_, i) => i.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.topBgImage}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.bgSlide} />
            )}
          />

          {/* OVERLAY */}
          <LinearGradient
            colors={[
              "rgba(2,6,23,0.8)",
              "rgba(2,6,23,0.6)",
              "rgba(2,6,23,0.4)",
              "#0b1220",
            ]}
            locations={[0, 0.3, 0.6, 1]}
            style={styles.topOverlay}
          />

          <HeroSection
            user={user}
            equipment={equipment}
            listRef={listRef}
            ITEM_WIDTH={ITEM_WIDTH}
            navigation={navigation}
            subscriptions={subscriptions}
            plans={plans}
          />

          {/* <HomeSwitcher /> */}
          <ProductsSection products={products} />
        </ScrollView>

        {/* FLOATING BOTTOM */}
        <BottomSlider slides={slides} bottomRef={bottomRef} />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#020617",
  },

  mainContainer: {
    flex: 1,
  },

  topBgImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },

  bgSlide: {
    width: width,
    height: 200,
    resizeMode: "cover",
  },

  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 230,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },
});
