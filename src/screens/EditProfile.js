import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  SafeAreaView,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import auth from "@react-native-firebase/auth";
import { getUserProfile, updateUserProfile } from "../services/quiz.service";
import { useUser } from "../context/UserContext";

const COLORS = {
  primary: "#667eea",
  accent: "#ff6b6b",
  background: "#f8f9fa",
  card: "#fff",
  text: "#333",
  textLight: "#666",
};

const EditProfile = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, updateUserData } = useUser();

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert("Lỗi", "Tên không được để trống!");
      return;
    }
    setLoading(true);
    try {
      const currentUser = auth().currentUser;
      await updateUserProfile(currentUser.uid, { username });
      await updateUserData(); // Update global user data
      Alert.alert("Thành công", "Cập nhật hồ sơ thành công!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể cập nhật hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.card}>
        <MaterialCommunityIcons name="account-edit" size={60} color={COLORS.primary} style={{ alignSelf: "center" }} />
        <Text style={styles.title}>Chỉnh sửa hồ sơ</Text>
        <Text style={styles.label}>Tên hiển thị</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Nhập tên mới..."
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={loading}>
            <Text style={styles.cancelText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
            <Text style={styles.saveText}>{loading ? "Đang lưu..." : "Lưu thay đổi"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 24,
    width: "90%",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary,
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    color: COLORS.textLight,
    alignSelf: "flex-start",
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.border || "#e9ecef",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: "#f4f6fb",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#eee",
    padding: 14,
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
  },
  cancelText: {
    color: COLORS.textLight,
    fontWeight: "bold",
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default EditProfile;
