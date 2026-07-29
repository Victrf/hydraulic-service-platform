import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { api } from "../../api/client";

export default function MaintenanceFindingPhotosScreen() {
  const route = useRoute<any>();
  const { findingId } = route.params;

  const [finding, setFinding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadFinding();
  }, []);

  async function loadFinding() {
    try {
      setLoading(true);

      const res = await api.get(`/maintenance-findings/${findingId}`);

      setFinding(res.data);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Unable to load finding.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function pickImages() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Photo library permission is required.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (result.canceled) return;

    try {
      setUploading(true);

      const formData = new FormData();

      result.assets.forEach((image: any) => {
        formData.append("photos", {
          uri: image.uri,
          name: image.fileName || `photo-${Date.now()}.jpg`,
          type: image.mimeType || "image/jpeg",
        } as any);
      });

      await api.post(`/maintenance-findings/${findingId}/photos`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await loadFinding();

      Alert.alert("Success", "Photos uploaded.");
    } catch (err: any) {
      Alert.alert(
        "Upload Failed",
        err.response?.data?.message || "Unable to upload photos.",
      );
    } finally {
      setUploading(false);
    }
  }

  function confirmDelete(photoId: string) {
    Alert.alert("Delete Photo", "Delete this photo?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deletePhoto(photoId),
      },
    ]);
  }

  async function deletePhoto(photoId: string) {
    try {
      await api.delete(`/maintenance-findings/photos/${photoId}`);

      await loadFinding();
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Unable to delete photo.",
      );
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Finding Photos</Text>

      <Pressable
        style={styles.uploadButton}
        onPress={pickImages}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={22} color="#fff" />

            <Text style={styles.uploadText}>Upload Photos</Text>
          </>
        )}
      </Pressable>

      <FlatList
        data={finding?.photos || []}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{
          paddingVertical: 20,
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="images-outline" size={70} color="#475569" />

            <Text style={styles.emptyTitle}>No Photos</Text>

            <Text style={styles.emptyText}>
              Upload inspection photos for this finding.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.photoCard}>
            <Image source={{ uri: item.url }} style={styles.photo} />

            <Pressable
              style={styles.deleteButton}
              onPress={() => confirmDelete(item.id)}
            >
              <Ionicons name="trash" size={18} color="#fff" />
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 20,
    paddingTop: 60,
  },

  center: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },

  uploadButton: {
    backgroundColor: "#7c3aed",
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  uploadText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 10,
    fontSize: 16,
  },

  empty: {
    marginTop: 80,
    alignItems: "center",
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 20,
  },

  emptyText: {
    color: "#94a3b8",
    marginTop: 8,
    textAlign: "center",
  },

  photoCard: {
    width: "48%",
    aspectRatio: 1,
    margin: "1%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#0f172a",
  },

  photo: {
    width: "100%",
    height: "100%",
  },

  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
  },
});
