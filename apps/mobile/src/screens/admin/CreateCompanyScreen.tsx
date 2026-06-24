import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  Alert,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../api/client";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function CreateCompanyScreen() {
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState("company");
  const [logo, setLogo] = useState<any | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactPosition, setContactPosition] = useState("");

  const [escalatingName, setEscalatingName] = useState("");
  const [escalatingEmail, setEscalatingEmail] = useState("");
  const [escalatingPhone, setEscalatingPhone] = useState("");
  const [escalatingPosition, setEscalatingPosition] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const flatListRef = useRef<FlatList>(null);
  const currentIndex = useRef(0);

  const slides = [
    {
      id: "1",
      title: "Create Company",
      subtitle: "Start your system foundation",
      image:
        "https://images.unsplash.com/photo-1664575602276-acd073f104c1?w=600",
    },
    {
      id: "2",
      title: "Add Equipment",
      subtitle: "Attach machines to company",
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600",
    },
    {
      id: "3",
      title: "Assign Users",
      subtitle: "Technicians & staff",
      image:
        "https://plus.unsplash.com/premium_photo-1681487178876-a1156952ec60?w=600",
    },
    {
      id: "4",
      title: "Manage Requests",
      subtitle: "Track operations",
      image: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=600",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      currentIndex.current =
        currentIndex.current < slides.length - 1 ? currentIndex.current + 1 : 0;

      flatListRef.current?.scrollToIndex({
        index: currentIndex.current,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const pickLogo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: false,
    });

    if (!result.canceled) {
      setLogo(result.assets[0]);
    }
  };

  const createCompany = async () => {
    if (!name.trim()) {
      setError("Company name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("address", address.trim());
      formData.append("phone", phone.trim());

      formData.append("contactName", contactName.trim());
      formData.append("contactEmail", contactEmail.trim());
      formData.append("contactPhone", contactPhone.trim());
      formData.append("contactPosition", contactPosition.trim());

      formData.append("escalatingName", escalatingName.trim());
      formData.append("escalatingEmail", escalatingEmail.trim());
      formData.append("escalatingPhone", escalatingPhone.trim());
      formData.append("escalatingPosition", escalatingPosition.trim());

      if (logo) {
        const fileName = logo.uri.split("/").pop();

        formData.append("logo", {
          uri: logo.uri,
          name: fileName || "company-logo.jpg",
          type: "image/jpeg",
        } as any);
      }

      await api.post("/companies", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      Alert.alert("Success", "Company created");

      setName("");
      setEmail("");
      setAddress("");
      setPhone("");

      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setContactPosition("");

      setEscalatingName("");
      setEscalatingEmail("");
      setEscalatingPhone("");
      setEscalatingPosition("");
      setLogo(null);
      navigation.goBack();
    } catch (err: any) {
      console.log("CREATE COMPANY ERROR:", err?.response?.data || err.message);

      setError(err?.response?.data?.message || "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Company</Text>
        <Text style={styles.subtitle}>
          Add a company to organize users and equipment
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        style={{ marginBottom: 20 }}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / (width - 40),
          );
          currentIndex.current = index;
        }}
        getItemLayout={(_, index) => ({
          length: width - 40,
          offset: (width - 40) * index,
          index,
        })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: width - 40 }]}>
            <Image source={{ uri: item.image }} style={styles.slideImage} />
            <View style={styles.overlay} />

            <View style={styles.slideContent}>
              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.card}>
        <Pressable style={styles.logoBox} onPress={pickLogo}>
          {logo ? (
            <Image source={{ uri: logo.uri }} style={styles.logoPreview} />
          ) : (
            <>
              <Ionicons name="image-outline" size={40} color="#6b7280" />
              <Text style={styles.logoText}>Upload Company Logo</Text>
            </>
          )}
        </Pressable>

        <View style={styles.tabsContainer}>
          <Pressable style={styles.tab} onPress={() => setActiveTab("company")}>
            <Text
              style={[
                styles.tabText,
                activeTab === "company" && styles.activeTabText,
              ]}
            >
              Company Info
            </Text>

            {activeTab === "company" && <View style={styles.activeUnderline} />}
          </Pressable>

          <Pressable style={styles.tab} onPress={() => setActiveTab("contact")}>
            <Text
              style={[
                styles.tabText,
                activeTab === "contact" && styles.activeTabText,
              ]}
            >
              Contact Person
            </Text>

            {activeTab === "contact" && <View style={styles.activeUnderline} />}
          </Pressable>

          <Pressable
            style={styles.tab}
            onPress={() => setActiveTab("escalating")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "escalating" && styles.activeTabText,
              ]}
            >
              Escalating Person
            </Text>

            {activeTab === "escalating" && (
              <View style={styles.activeUnderline} />
            )}
          </Pressable>
        </View>

        {activeTab === "company" && (
          <>
            <TextInput
              placeholder="Company Name"
              placeholderTextColor="#6b7280"
              style={styles.input}
              value={name}
              onChangeText={(val) => {
                setName(val);
                if (error) setError("");
              }}
            />

            <TextInput
              placeholder="Email"
              placeholderTextColor="#6b7280"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              placeholder="Address"
              placeholderTextColor="#6b7280"
              style={styles.input}
              value={address}
              onChangeText={setAddress}
            />

            <TextInput
              placeholder="Phone"
              placeholderTextColor="#6b7280"
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
            />
          </>
        )}

        {activeTab === "contact" && (
          <>
            <TextInput
              placeholder="Contact Name"
              placeholderTextColor="#6b7280"
              style={styles.input}
              value={contactName}
              onChangeText={setContactName}
            />

            <TextInput
              placeholder="Contact Email"
              placeholderTextColor="#6b7280"
              style={styles.input}
              value={contactEmail}
              onChangeText={setContactEmail}
            />

            <TextInput
              placeholder="Contact Phone"
              placeholderTextColor="#6b7280"
              style={styles.input}
              value={contactPhone}
              onChangeText={setContactPhone}
            />

            <TextInput
              placeholder="Position"
              placeholderTextColor="#6b7280"
              style={styles.input}
              value={contactPosition}
              onChangeText={setContactPosition}
            />
          </>
        )}

        {activeTab === "escalating" && (
          <>
            <TextInput
              placeholder="Escalating Name"
              placeholderTextColor="#6b7280"
              style={styles.input}
              value={escalatingName}
              onChangeText={setEscalatingName}
            />

            <TextInput
              placeholder="Escalating Email"
              placeholderTextColor="#6b7280"
              style={styles.input}
              value={escalatingEmail}
              onChangeText={setEscalatingEmail}
            />

            <TextInput
              placeholder="Escalating Phone"
              placeholderTextColor="#6b7280"
              style={styles.input}
              value={escalatingPhone}
              onChangeText={setEscalatingPhone}
            />

            <TextInput
              placeholder="Position"
              placeholderTextColor="#6b7280"
              style={styles.input}
              value={escalatingPosition}
              onChangeText={setEscalatingPosition}
            />
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <Pressable
        disabled={loading}
        style={({ pressed }) => [
          styles.createBtn,
          pressed && styles.pressed,
          loading && { opacity: 0.7 },
        ]}
        onPress={createCompany}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.createText}>Create Company</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
  },

  container: {
    padding: 20,
    paddingTop: 70,
    paddingBottom: 50,
  },

  header: {
    marginBottom: 20,
  },

  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },

  subtitle: {
    color: "#9ca3af",
    marginTop: 6,
    fontSize: 13,
  },

  // SLIDER
  slide: {
    height: 140,
    borderRadius: 18,
    overflow: "hidden",
    marginRight: 10,
  },

  slideImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,6,23,0.6)",
  },

  slideContent: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 14,
  },

  slideTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  slideSubtitle: {
    color: "#cbd5f5",
    fontSize: 12,
    marginTop: 2,
  },

  // FORM CARD
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },

  tab: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 12,
  },

  tabText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },

  activeTabText: {
    color: "#ffffff",
  },

  activeUnderline: {
    position: "absolute",
    bottom: -1,
    height: 3,
    width: "100%",
    backgroundColor: "#7c3aed",
    borderRadius: 999,
  },

  sectionTitle: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 12,
    textTransform: "uppercase",
  },

  input: {
    backgroundColor: "#020617",
    color: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  error: {
    color: "#ef4444",
    fontSize: 12,
  },

  createBtn: {
    backgroundColor: "#7c3aed",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  logoBox: {
    height: 140,
    borderRadius: 20,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },

  logoPreview: {
    width: "100%",
    height: "100%",
  },

  logoText: {
    color: "#94a3b8",
    marginTop: 8,
  },

  createText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
