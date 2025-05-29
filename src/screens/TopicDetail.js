import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getQuizzes } from '../services/quiz.service';
import firestore from '@react-native-firebase/firestore';

const COLORS = {
  primary: '#667eea',
  background: '#f5f5f5',
  card: '#ffffff',
  text: '#333333',
  textLight: '#999999',
  border: '#e0e0e0',
  button: '#667eea',
  buttonText: '#ffffff',
  status: '#e8eaff',
  statusText: '#667eea',
  edit: '#4caf50',
  delete: '#f44336',
};

const TopicDetail = ({ route, navigation }) => {
  const { topicId, topicName } = route.params;
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const allQuizzes = await getQuizzes();
        const filteredQuizzes = allQuizzes.filter(q => q.topicId === topicId);
        setQuizzes(filteredQuizzes);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải danh sách quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [topicId]);

  const handleEditQuiz = (quiz) => {
    navigation.navigate('EditQuiz', { 
      quizId: quiz.id,
      quizData: quiz 
    });
  };

  const handleDeleteQuiz = (quiz) => {
    Alert.alert(
      'Xóa quiz',
      `Bạn có chắc chắn muốn xóa quiz "${quiz.title}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore().collection('quizzes').doc(quiz.id).delete();
              setQuizzes(prev => prev.filter(q => q.id !== quiz.id));
              Alert.alert('Thành công', 'Quiz đã được xóa!');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa quiz!');
            }
          }
        }
      ]
    );
  };

  const handleViewQuiz = (quiz) => {
    navigation.navigate('QuizPreview', { 
      quizId: quiz.id,
      quizData: quiz 
    });
  };

  const getStatusInfo = (quiz) => {
    // Admin-specific status logic
    if (quiz.isPublished) {
      return { text: 'Đã xuất bản', color: '#4caf50' };
    } else if (quiz.isDraft) {
      return { text: 'Bản nháp', color: '#ff9800' };
    } else {
      return { text: 'Chưa xác định', color: '#667eea' };
    }
  };

  const renderQuizCard = ({ item, index }) => {
    // const statusInfo = getStatusInfo(item); // Không cần status nữa
    
    return (
      <View style={styles.quizCard}>
        {/* Header với số thứ tự */}
        <View style={styles.cardHeader}>
          <View style={styles.numberContainer}>
            <Text style={styles.numberText}>#{index + 1}</Text>
          </View>
        </View>

        {/* Tiêu đề quiz */}
        <Text style={styles.quizTitle}>{item.title}</Text>

        {/* Thông tin meta */}
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="help-circle-outline" size={16} color={COLORS.textLight} />
            <Text style={styles.metaText}>{item.totalQuestions} câu hỏi</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={COLORS.textLight} />
            <Text style={styles.metaText}>{item.timeLimit} phút</Text>
          </View>
        </View>

        {/* Admin stats */}
        <View style={styles.adminStatsContainer}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="account-group" size={16} color={COLORS.textLight} />
            <Text style={styles.statText}>{item.attempts || 0} lượt làm</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="calendar" size={16} color={COLORS.textLight} />
            <Text style={styles.statText}>
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Admin Actions */}
        <View style={styles.adminActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => handleViewQuiz(item)}
          >
            <MaterialCommunityIcons name="eye" size={16} color={COLORS.buttonText} />
            <Text style={styles.actionButtonText}>Xem</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditQuiz(item)}
          >
            <MaterialCommunityIcons name="pencil" size={16} color={COLORS.buttonText} />
            <Text style={styles.actionButtonText}>Sửa</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteQuiz(item)}
          >
            <MaterialCommunityIcons name="delete" size={16} color={COLORS.buttonText} />
            <Text style={styles.actionButtonText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="clipboard-plus" size={64} color={COLORS.textLight} />
      <Text style={styles.emptyText}>Chưa có quiz nào trong chủ đề này</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <FlatList
        data={quizzes}
        keyExtractor={item => item.id}
        renderItem={renderQuizCard}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textLight,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  listContainer: {
    padding: 16,
  },

  // Quiz Card
  quizCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  numberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.buttonText,
  },

  // Quiz Title
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },

  // Meta Information
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  metaText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 6,
  },

  // Admin Stats
  adminStatsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 4,
  },

  // Admin Actions
  adminActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  viewButton: {
    backgroundColor: COLORS.primary,
  },
  editButton: {
    backgroundColor: COLORS.edit,
  },
  deleteButton: {
    backgroundColor: COLORS.delete,
  },
  actionButtonText: {
    color: COLORS.buttonText,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default TopicDetail;