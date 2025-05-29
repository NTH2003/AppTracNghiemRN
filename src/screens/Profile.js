"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Alert,
} from "react-native"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"
import Icon from "react-native-vector-icons/MaterialIcons"
import auth from "@react-native-firebase/auth"
import { getUserQuizResults } from "../services/quiz.service"
import { logoutUser } from "../services/auth.service"
import { useUser } from "../context/UserContext"

const { width } = Dimensions.get("window")

const COLORS = {
  primary: "#667eea",
  secondary: "#764ba2",
  accent: "#ff6b6b",
  success: "#4caf50",
  warning: "#ff9800",
  background: "#f8f9fa",
  card: "#ffffff",
  text: "#333333",
  textLight: "#666666",
  border: "#e9ecef",
  gradient1: "#667eea",
  gradient2: "#764ba2",
}

const Profile = ({ navigation }) => {
  const { user, loading: userLoading } = useUser()
  const [loading, setLoading] = useState(true)
  const [quizResults, setQuizResults] = useState([])

  useEffect(() => {
    if (user) {
      getUserQuizResults(user.uid).then(results => {
        setQuizResults(results)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [user])

  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await logoutUser()
          navigation.replace("Login")
        },
      },
    ])
  }

  const handleEditProfile = () => {
    navigation.navigate("EditProfile")
  }

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  }

  const getUserInitials = () => {
    const name = user?.username || user?.email || "U"
    return name.charAt(0).toUpperCase()
  }

  const getJoinedDays = () => {
    if (!user?.createdAt) return 0
    const joinDate = new Date(user.createdAt)
    const today = new Date()
    const diffTime = Math.abs(today - joinDate)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  if (userLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    )
  }

  // Calculate statistics
  const totalQuizzes = quizResults.length
  const averageScore = totalQuizzes > 0 
    ? Math.round(quizResults.reduce((sum, q) => sum + (q.score || 0), 0) / totalQuizzes) 
    : 0

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getUserInitials()}</Text>
            </View>
            <View style={styles.onlineIndicator} />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.username}>{user?.username || "Chưa đặt tên"}</Text>
            <Text style={styles.email}>{user?.email || ""}</Text>
            <View style={styles.joinedContainer}>
              <MaterialCommunityIcons name="calendar-check" size={16} color={COLORS.success} />
              <Text style={styles.joinedText}>Tham gia {getJoinedDays()} ngày</Text>
            </View>
          </View>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>📊 Thống kê học tập</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="clipboard-check" size={32} color={COLORS.primary} />
              <Text style={styles.statNumber}>{totalQuizzes}</Text>
              <Text style={styles.statLabel}>Quiz đã làm</Text>
            </View>

            <View style={styles.statCard}>
              <FontAwesome5 name="trophy" size={28} color={COLORS.warning} />
              <Text style={styles.statNumber}>{averageScore}</Text>
              <Text style={styles.statLabel}>Điểm TB</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>⚡ Thao tác nhanh</Text>

          <TouchableOpacity style={styles.actionItem} onPress={handleEditProfile}>
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="account-edit" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Chỉnh sửa hồ sơ</Text>
              <Text style={styles.actionSubtitle}>Cập nhật thông tin cá nhân</Text>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleChangePassword}>
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="lock-reset" size={24} color={COLORS.warning} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Đổi mật khẩu</Text>
              <Text style={styles.actionSubtitle}>Thay đổi mật khẩu bảo mật</Text>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        {/* Account Info */}
        <View style={styles.accountContainer}>
          <Text style={styles.sectionTitle}>🔐 Thông tin tài khoản</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="email" size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email || "Chưa cập nhật"}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="calendar-plus" size={20} color={COLORS.success} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ngày tham gia</Text>
                <Text style={styles.infoValue}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "Chưa xác định"}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={20} color={COLORS.card} />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Quiz App v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textLight,
  },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.card,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },

  scrollView: {
    flex: 1,
  },

  // Profile Card
  profileCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.card,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    borderWidth: 3,
    borderColor: COLORS.card,
  },
  profileInfo: {
    alignItems: "center",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  joinedContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.success}20`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  joinedText: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: "600",
    marginLeft: 6,
  },

  // Statistics
  statsContainer: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: COLORS.card,
    width: (width - 60) / 2,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
    textAlign: "center",
  },

  // Actions
  actionsContainer: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  actionItem: {
    backgroundColor: COLORS.card,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
  },

  // Account Info
  accountContainer: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: COLORS.success,
    fontWeight: "500",
  },

  // Logout
  logoutContainer: {
    marginHorizontal: 20,
    marginTop: 32,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: COLORS.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  logoutText: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },

  // Version
  versionContainer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
})

export default Profile
