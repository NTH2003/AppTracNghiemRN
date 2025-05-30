"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from "react-native"
import firestore from "@react-native-firebase/firestore"

const { width } = Dimensions.get("window")

const QuizPreview = ({ route, navigation }) => {
  const { quizData } = route.params
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        const snap = await firestore().collection("questions").where("quizId", "==", quizData.id).get()
        setQuestions(snap.docs.map((doc) => doc.data()))
      } catch (error) {
        console.error("Error fetching questions:", error)
        setQuestions([])
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [quizData.id])

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "#10B981"
      case "medium":
        return "#F59E0B"
      case "hard":
        return "#EF4444"
      default:
        return "#6B73FF"
    }
  }

  const getDifficultyText = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "Dễ"
      case "medium":
        return "Trung bình"
      case "hard":
        return "Khó"
      default:
        return "Không xác định"
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#6B73FF" />
        <ActivityIndicator size="large" color="#6B73FF" />
        <Text style={styles.loadingText}>Đang tải câu hỏi...</Text>
      </View>
    )
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#6B73FF" />
      <View style={styles.container}>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Quiz Info Card */}
          <View style={styles.quizInfoCard}>
            <View style={styles.quizHeader}>
              <Text style={styles.title}>{quizData.title}</Text>
              {quizData.difficulty && (
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(quizData.difficulty) }]}>
                  <Text style={styles.difficultyText}>{getDifficultyText(quizData.difficulty)}</Text>
                </View>
              )}
            </View>

            {quizData.description && <Text style={styles.description}>{quizData.description}</Text>}

            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>⏱️</Text>
                <View>
                  <Text style={styles.metaLabel}>Thời gian</Text>
                  <Text style={styles.metaValue}>{quizData.timeLimit} phút</Text>
                </View>
              </View>

              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>📝</Text>
                <View>
                  <Text style={styles.metaLabel}>Số câu hỏi</Text>
                  <Text style={styles.metaValue}>{questions.length} câu</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Questions Section */}
          <View style={styles.questionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Danh sách câu hỏi</Text>
              <Text style={styles.questionCount}>{questions.length} câu</Text>
            </View>

            {questions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyTitle}>Chưa có câu hỏi</Text>
                <Text style={styles.emptyDescription}>Quiz này chưa có câu hỏi nào được thêm vào.</Text>
              </View>
            ) : (
              questions.map((q, idx) => (
                <View key={idx} style={styles.questionCard}>
                  <View style={styles.questionHeader}>
                    <View style={styles.questionNumber}>
                      <Text style={styles.questionNumberText}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.question}>{q.question}</Text>
                  </View>

                  {q.options && (
                    <View style={styles.optionsContainer}>
                      {q.options.map((opt, oidx) => (
                        <View key={oidx} style={[styles.optionItem, oidx === q.answer && styles.correctOptionItem]}>
                          <View style={[styles.optionBullet, oidx === q.answer && styles.correctOptionBullet]}>
                            <Text style={[styles.optionLetter, oidx === q.answer && styles.correctOptionLetter]}>
                              {String.fromCharCode(65 + oidx)}
                            </Text>
                          </View>
                          <Text style={[styles.optionText, oidx === q.answer && styles.correctOptionText]}>{opt}</Text>
                          {oidx === q.answer && (
                            <View style={styles.correctIcon}>
                              <Text style={styles.correctIconText}>✓</Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#6B73FF",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  quizInfoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quizHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    flex: 1,
    marginRight: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  difficultyText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
    marginBottom: 20,
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  metaIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  metaLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  metaValue: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
  },
  questionsSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  questionCount: {
    fontSize: 14,
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: "500",
  },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  questionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  questionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#6B73FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  questionNumberText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  question: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    lineHeight: 24,
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: "#F9FAFB",
  },
  correctOptionItem: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#10B981",
  },
  optionBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  correctOptionBullet: {
    backgroundColor: "#10B981",
  },
  optionLetter: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  correctOptionLetter: {
    color: "#fff",
  },
  optionText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  correctOptionText: {
    color: "#065F46",
    fontWeight: "500",
  },
  correctIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  correctIconText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  actionContainer: {
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: "#6B73FF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#6B73FF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  startButtonIcon: {
    fontSize: 16,
  },
  editButton: {
    borderWidth: 2,
    borderColor: "#6B73FF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  editButtonText: {
    color: "#6B73FF",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default QuizPreview
