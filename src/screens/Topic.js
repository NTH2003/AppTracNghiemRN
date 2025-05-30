import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { getTopics, getQuizzes } from '../services/quiz.service';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  accent: '#ff6b6b',
  white: '#ffffff',
  background: '#f8f9fa',
  text: '#333333',
  textLight: '#666666',
  success: '#4caf50',
  warning: '#ff9800',
  info: '#2196f3',
  purple: '#9c27b0',
  teal: '#009688',
  indigo: '#3f51b5',
};

// Topic icons mapping
const getTopicIcon = (topicName) => {
  const name = topicName.toLowerCase();
  if (name.includes('toán') || name.includes('math')) return 'calculator';
  if (name.includes('văn') || name.includes('literature')) return 'book-open';
  if (name.includes('giáo dục công dân')) return 'account-group';
  if (name.includes('lịch sử') || name.includes('history')) return 'history';
  if (name.includes('địa lý') || name.includes('geography')) return 'earth';
  if (name.includes('tiếng anh') || name.includes('english')) return 'translate';
  if (name.includes('vật lý') || name.includes('physics')) return 'atom';
  if (name.includes('hóa học') || name.includes('chemistry')) return 'test-tube';
  if (name.includes('sinh học') || name.includes('biology')) return 'dna';
  return 'book-outline';
};

const getTopicColor = (index) => {
  const colors = [COLORS.primary, COLORS.info, COLORS.success, COLORS.warning, COLORS.purple, COLORS.teal, COLORS.indigo];
  return colors[index % colors.length];
};

const Topic = ({ navigation }) => {
  const [topics, setTopics] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const topicsData = await getTopics();
      // Lấy số lượng đề thi cho từng chủ đề
      const topicsWithQuizCount = await Promise.all(
        topicsData.map(async (topic) => {
          const quizzes = await getQuizzes(topic.id);
          return { ...topic, quizCount: quizzes.length };
        })
      );
      setTopics(topicsWithQuizCount);

      if (topicsWithQuizCount.length > 0) {
        const quizzesData = await getQuizzes(topicsWithQuizCount[0].id);
        setQuizzes(quizzesData);
        setSelectedTopic(topicsWithQuizCount[0].id);
      }
    } catch (error) {
      console.log('Load data error:', error, JSON.stringify(error));
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSelect = async (topicId) => {
    if (selectedTopic === topicId) return;
    
    try {
      setLoadingQuizzes(true);
      const quizzesData = await getQuizzes(topicId);
      setQuizzes(quizzesData);
      setSelectedTopic(topicId);
    } catch (error) {
      console.log('Select topic error:', error, JSON.stringify(error));
      Alert.alert('Lỗi', 'Không thể tải đề thi');
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const renderTopicCard = ({ item, index }) => {
    const isSelected = selectedTopic === item.id;
    const topicColor = getTopicColor(index);
    
    return (
      <TouchableOpacity
        style={[
          styles.topicCard,
          isSelected && { ...styles.selectedTopicCard, borderColor: topicColor }
        ]}
        onPress={() => handleTopicSelect(item.id)}
        activeOpacity={0.8}
      >
        <View style={[styles.topicIconContainer, { backgroundColor: `${topicColor}20` }]}>
          <MaterialCommunityIcons 
            name={getTopicIcon(item.name)} 
            size={32} 
            color={topicColor} 
          />
        </View>
        <Text style={[
          styles.topicName,
          isSelected && { color: topicColor }
        ]}>
          {item.name}
        </Text>
        <Text style={styles.topicQuizCount}>
          {item.quizCount || 0} đề thi
        </Text>
        {isSelected && (
          <View style={[styles.selectedIndicator, { backgroundColor: topicColor }]}>
            <Icon name="check" size={16} color={COLORS.white} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderQuizCard = ({ item, index }) => {
    return (
      <View style={styles.quizCard}>
        <View style={styles.quizRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={styles.quizNumberContainer}>
              <Text style={styles.quizNumber}>#{index + 1}</Text>
            </View>
            <View>
              <Text style={styles.quizTitle}>{item.title || `Đề số ${index + 1}`}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <MaterialCommunityIcons name="help-circle-outline" size={16} color={COLORS.textLight} />
                <Text style={styles.metaText}>{item.totalQuestions} câu hỏi</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="timer-outline" size={16} color={COLORS.textLight} style={{ marginRight: 4 }} />
            <Text style={styles.metaText}>{item.timeLimit} phút</Text>
            <TouchableOpacity
              style={[styles.startQuizButton, { marginLeft: 16 }]}
              onPress={() => navigation.navigate('Quiz', { 
                quizId: item.id,
                quizTitle: item.title
              })}
            >
              <Text style={styles.startQuizText}>Bắt đầu</Text>
              <Icon name="play-arrow" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>Khám phá kiến thức</Text>
            <Text style={styles.welcomeSubtitle}>
              Chọn chủ đề yêu thích và bắt đầu hành trình học tập
            </Text>
          </View>
          <View style={styles.illustrationContainer}>
            <MaterialCommunityIcons name="school" size={80} color={COLORS.primary} />
          </View>
        </View>

        {/* Topics Grid */}
        <View style={styles.topicsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Chủ đề học tập</Text>
            <Text style={styles.sectionSubtitle}>{topics.length} chủ đề có sẵn</Text>
          </View>
          
          <FlatList
            data={topics}
            keyExtractor={item => item.id.toString()}
            renderItem={renderTopicCard}
            numColumns={2}
            columnWrapperStyle={styles.topicsRow}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Quizzes Section */}
        {selectedTopic && (
          <View style={styles.quizzesSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.quizSectionTitle}>
                <MaterialCommunityIcons name="clipboard-list" size={24} color={COLORS.text} />
                <Text style={styles.sectionTitle}>Danh sách đề thi</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                {quizzes.length} đề thi trong chủ đề này
              </Text>
            </View>

            {loadingQuizzes ? (
              <View style={styles.loadingQuizzes}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingQuizzesText}>Đang tải đề thi...</Text>
              </View>
            ) : (
              <FlatList
                data={quizzes}
                keyExtractor={item => item.id.toString()}
                renderItem={renderQuizCard}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="clipboard-remove" size={64} color={COLORS.textLight} />
                    <Text style={styles.emptyText}>Chưa có đề thi nào</Text>
                    <Text style={styles.emptySubtext}>Hãy thử chọn chủ đề khác</Text>
                  </View>
                }
              />
            )}
          </View>
        )}
      </ScrollView>
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
    backgroundColor: COLORS.background,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textLight,
  },
  
  // Header
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: 8,
  },
  searchButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  scrollView: {
    flex: 1,
  },

  // Welcome Section
  welcomeSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  illustrationContainer: {
    marginLeft: 20,
  },

  // Section Headers
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  quizSectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  // Topics Section
  topicsSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  topicsRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  topicCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    width: (width - 60) / 2,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedTopicCard: {
    borderWidth: 2,
    elevation: 4,
  },
  topicIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  topicName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  topicQuizCount: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Quizzes Section
  quizzesSection: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 30,
  },
  loadingQuizzes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingQuizzesText: {
    marginLeft: 12,
    fontSize: 14,
    color: COLORS.textLight,
  },
  quizCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quizRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quizNumberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quizNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  startQuizButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  startQuizText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default Topic;