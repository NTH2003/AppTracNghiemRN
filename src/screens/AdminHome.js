import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  TextInput,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getQuizzes, getTopics } from '../services/quiz.service';
import { logoutUser } from '../services/auth.service';
import firestore from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#667eea', // Màu xanh phù hợp với drawer
  secondary: '#764ba2',
  accent: '#ff6b6b',
  success: '#4caf50',
  warning: '#ff9800',
  background: '#f8f9fa',
  card: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e9ecef',
};

const AdminHome = ({ navigation }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [resultCount, setResultCount] = useState(0);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [quizzesData, topicsData, usersSnap, resultsSnap] = await Promise.all([
        getQuizzes(),
        getTopics(),
        firestore().collection('users').get(),
        firestore().collection('quizResults').get(),
      ]);
      setQuizzes(quizzesData);
      setTopics(topicsData);
      setFilteredQuizzes(quizzesData);
      setUserCount(usersSnap.size);
      setResultCount(resultsSnap.size);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutUser();
              navigation.replace('Login');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể đăng xuất');
            }
          }
        }
      ]
    );
  };

  const handleAddQuiz = () => {
    navigation.navigate('Thêm câu hỏi');
  };

  const handleAddTopic = () => {
    navigation.navigate('Thêm chủ đề');
  };

  const handleTopicSelect = (topicId) => {
    setSelectedTopic(topicId);
    if (topicId) {
      setFilteredQuizzes(quizzes.filter(q => q.topicId === topicId));
    } else {
      setFilteredQuizzes(quizzes);
    }
  };

  const handleEditTopic = (topic) => {
    setMenuVisible(false);
    navigation.navigate('EditTopic', { topicId: topic.id });
  };

  const handleDeleteTopic = (topic) => {
    setMenuVisible(false);
    Alert.alert(
      'Xóa chủ đề',
      `Bạn có chắc chắn muốn xóa chủ đề "${topic.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore().collection('topics').doc(topic.id).delete();
              setTopics(prev => prev.filter(t => t.id !== topic.id));
              Alert.alert('Thành công', 'Đã xóa chủ đề!');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa chủ đề!');
            }
          }
        }
      ]
    );
  };

  const openMenu = (topic) => {
    if (selectedTopic?.id === topic.id && menuVisible) {
      setMenuVisible(false);
      setSelectedTopic(null);
    } else {
      setSelectedTopic(topic);
      setMenuVisible(true);
    }
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setSelectedTopic(null);
  };

  const renderStatCard = (number, title, icon, color, borderColor) => (
    <View style={[styles.statCard, { borderLeftColor: borderColor }]}>
      <View style={styles.statContent}>
        <View style={styles.statNumbers}>
          <Text style={styles.statNumber}>{number}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
          <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
      </View>
    </View>
  );

  const renderQuickAction = (title, subtitle, icon, color, onPress) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <View style={[styles.quickActionIconContainer, { backgroundColor: `${color}20` }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  const renderTopicItem = (topic) => {
    return (
      <TouchableOpacity 
        key={topic.id} 
        style={styles.listItemCard}
        onPress={() => navigation.navigate('TopicDetail', { 
          topicId: topic.id, 
          topicName: topic.name 
        })}
        activeOpacity={0.8}
      >
        <View style={styles.listItemIconContainer}>
          <MaterialCommunityIcons name="book-outline" size={20} color={COLORS.primary} />
        </View>
        <View style={styles.listItemContent}>
          <Text style={styles.listItemTitle}>{topic.name}</Text>
          <Text style={styles.listItemSubtitle}>{topic.description || 'Không có mô tả'}</Text>
        </View>
        <View style={styles.topicActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleEditTopic(topic)}
          >
            <MaterialCommunityIcons name="pencil" size={20} color="#4caf50" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleDeleteTopic(topic)}
          >
            <MaterialCommunityIcons name="delete" size={20} color="#f44336" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderQuizItem = (quiz) => (
    <View key={quiz.id} style={styles.listItemCard}>
      <View style={[styles.listItemIconContainer, { backgroundColor: `${COLORS.success}10` }]}>
        <MaterialCommunityIcons name="clipboard-text" size={20} color={COLORS.success} />
      </View>
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>{quiz.title}</Text>
        <View style={styles.quizMetaContainer}>
          <View style={styles.quizMetaItem}>
            <MaterialCommunityIcons name="help-circle-outline" size={14} color={COLORS.textLight} />
            <Text style={styles.quizMetaText}>{quiz.totalQuestions} câu hỏi</Text>
          </View>
          <View style={styles.quizMetaItem}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={COLORS.textLight} />
            <Text style={styles.quizMetaText}>{quiz.timeLimit} phút</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.listItemAction}>
        <Icon name="more-vert" size={20} color={COLORS.textLight} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Tổng quan</Text>
          <View style={styles.statsGrid}>
            {renderStatCard(topics.length, 'Chủ đề', 'book-multiple', '#5c6bc0', '#5c6bc0')}
            {renderStatCard(quizzes.length, 'Quiz', 'clipboard-list', '#4caf50', '#4caf50')}
            {renderStatCard(userCount, 'Người dùng', 'account-group', '#ff9800', '#ff9800')}
            {renderStatCard(resultCount, 'Kết quả', 'chart-line', '#f44336', '#f44336')}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Thao tác nhanh</Text>
          <View style={styles.quickActionsGrid}>
            {renderQuickAction(
              'Thêm chủ đề',
              'Tạo chủ đề mới',
              'plus',
              COLORS.primary,
              handleAddTopic
            )}
            {renderQuickAction(
              'Thêm quiz',
              'Tạo quiz mới',
              'plus',
              COLORS.success,
              handleAddQuiz
            )}
          </View>
        </View>

        {/* Topics List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWithIcon}>
              <MaterialCommunityIcons name="book-multiple" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitleText}>Chủ đề ({topics.length})</Text>
            </View>
            {!showAllTopics ? (
              <TouchableOpacity style={styles.viewAllButton} onPress={() => setShowAllTopics(true)}>
                <Text style={styles.viewAllText}>Xem tất cả</Text>
                <Icon name="chevron-right" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.viewAllButton} onPress={() => setShowAllTopics(false)}>
                <Text style={styles.viewAllText}>Thu gọn</Text>
                <Icon name="expand-less" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>

          {topics.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="book-remove" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyText}>Chưa có chủ đề nào</Text>
            </View>
          ) : (
            (showAllTopics ? topics : topics.slice(0, 3)).map(renderTopicItem)
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
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
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textLight,
  },

  scrollView: {
    flex: 1,
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    marginRight: 4,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: COLORS.card,
    width: (width - 50) / 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 3,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statNumbers: {
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statTitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: COLORS.card,
    width: (width - 50) / 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },

  // List Items
  listItemCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 36,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative',
    overflow: 'visible',
  },
  listItemIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  listItemAction: {
    padding: 4,
  },
  quizMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  quizMetaText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 4,
  },

  // Empty State
  emptyState: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 12,
  },

  header: {
    paddingTop: 48,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 6,
    shadowColor: '#764ba2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
  },
  logoutHeaderButton: {
    padding: 8,
  },

  topicActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionBtn: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
});

export default AdminHome;