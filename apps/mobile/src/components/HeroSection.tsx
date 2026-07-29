import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../api/client";

export default function HeroSection({
  user,
  equipment,
  listRef,
  ITEM_WIDTH,
  navigation,
  subscriptions,
  plans,
}: any) {
  const safeUser = user || {};
  const safeEquipment = Array.isArray(equipment) ? equipment : [];

  return (
    <>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.welcome}>Welcome back</Text>

          <Text style={styles.userName}>{safeUser?.name || "User"}</Text>

          <Text style={styles.company}>
            {safeUser?.company?.name || "No Company"}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            onPress={() => {
              if (subscriptions.length > 0) {
                navigation.navigate("MySubscription", {
                  subscriptions,
                });
              } else {
                navigation.navigate("Plans", {
                  plans: plans || [],
                });
              }
            }}
            style={styles.subIcon}
          >
            <Ionicons name="wallet-outline" size={22} color="#ffffff" />
          </Pressable>

          <View style={styles.avatar}>
            {safeUser?.profileImage ? (
              <Image
                source={{
                  uri: `${api.defaults.baseURL}/uploads/users/${safeUser.profileImage}`,
                }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>
                {safeUser?.name ? safeUser.name.charAt(0).toUpperCase() : "U"}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* CAROUSEL */}
      <View style={styles.carouselContainer}>
        <Animated.FlatList
          ref={listRef}
          data={safeEquipment}
          keyExtractor={(item, index) =>
            item?.id ? item.id : index.toString()
          }
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            if (!item) return null;

            return (
              <View style={[styles.slide, { width: ITEM_WIDTH || 200 }]}>
                <Text style={styles.equipName}>{item?.name || "Unnamed"}</Text>

                <Text style={styles.equipCategory}>
                  {item?.category || "No category"}
                </Text>
              </View>
            );
          }}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  subIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  welcome: {
    color: "#94a3b8",
    fontSize: 12,
  },

  userName: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },

  company: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#7c3aed",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7c3aed",
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },

  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  carouselContainer: {
    height: 65,
    marginHorizontal: 16,
    justifyContent: "center",
  },

  slide: {
    justifyContent: "center",
    alignItems: "center",
  },

  equipName: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 13,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  equipCategory: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 1,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
});
