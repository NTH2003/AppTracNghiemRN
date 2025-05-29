import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  StatusBar,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { getTopics, getQuizzes, getUserQuizResults, getQuizById, getUserProfile } from '../services/quiz.service';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import auth from '@react-native-firebase/auth';
import { useUser } from '../context/UserContext';

const { width, height } = Dimensions.get('window');

const Home = ({ navigation }) => {
  const { user } = useUser();
  const [topics, setTopics] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadData();
    loadRecentResults();
    const unsubscribe = navigation.addListener('focus', () => {
      loadRecentResults();
    });
    // Lấy username từ Firestore
    if (user) {
      const userId = user.uid;
      console.log('Current userId:', userId);
      getUserProfile(userId).then(profile => {
        console.log('User profile:', profile);
        setUserName(profile?.username || '');
      }).catch((err) => {
        console.log('Get user profile error:', err);
        setUserName('');
      });
    } else {
      setUserName('');
    }
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.headerButton}>
          <Icon name="menu" size={28} color="#fff" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="search" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <View style={styles.notificationContainer}>
              <Icon name="notifications" size={24} color="#fff" />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      ),
      headerStyle: {
        backgroundColor: '#667eea',
        elevation: 4,
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <MaterialCommunityIcons name="brain" size={24} color="#fff" />
          <Text style={styles.headerTitle}>Quiz Master</Text>
        </View>
      ),
    });
    return unsubscribe;
  }, [navigation, user]);

  const loadData = async () => {
    try {
      const topicsData = await getTopics();
      setTopics(topicsData);
      
      if (topicsData.length > 0) {
        const quizzesData = await getQuizzes(topicsData[0].id);
        setQuizzes(quizzesData);
        setSelectedTopic(topicsData[0].id);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentResults = async () => {
    try {
      const userId = auth().currentUser?.uid;
      console.log('Current userId:', userId);
      if (!userId) return;
      const results = await getUserQuizResults(userId);
      console.log('Recent quiz results:', results);
      setRecentResults(results.slice(0, 3));
    } catch (error) {
      console.log('Load recent results error:', error);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'stats':
        navigation.navigate('Statistics');
        break;
      case 'achievements':
        navigation.navigate('Achievements');
        break;
      case 'settings':
        navigation.navigate('Settings');
        break;
      case 'help':
        navigation.navigate('Help');
        break;
      default:
        Alert.alert('Thông báo', 'Tính năng đang được phát triển!');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.subtitle}>
            {userName ? `Chào mừng bạn trở lại, ${userName}!` : 'Chào mừng!'}
          </Text>
          
          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <View style={styles.illustration}>
              <MaterialCommunityIcons name="brain" size={60} color="#fff" />
              <Text style={styles.illustrationText}>Thử thách trí tuệ</Text>
            </View>
          </View>
          
          {/* Start Button */}
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={() => navigation.navigate('Topic')}
            activeOpacity={0.9}
          >
            <View style={styles.buttonContent}>
              <FontAwesome5 name="rocket" size={18} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.startButtonText}>BẮT ĐẦU NGAY</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="gamepad-variant" size={24} color="#333" />
            <Text style={styles.sectionTitle}>Hành động nhanh</Text>
          </View>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionCard} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Bảng xếp hạng')}
            >
              <FontAwesome5 name="trophy" size={30} color="#ff9800" />
              <Text style={styles.actionText}>Bảng xếp hạng</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard} 
              activeOpacity={0.8}
              onPress={() => handleQuickAction('settings')}
            >
              <Icon name="settings" size={30} color="#666" />
              <Text style={styles.actionText}>Cài đặt</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Quizzes Section */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="book-open-variant" size={24} color="#333" />
            <Text style={styles.sectionTitle}>Quiz gần đây</Text>
          </View>
          <View style={styles.recentQuizzes}>
            {recentResults.length === 0 ? (
              <Text style={{ color: '#999', fontStyle: 'italic', textAlign: 'center' }}>Bạn chưa có bài làm nào gần đây</Text>
            ) : (
              recentResults.map((result, idx) => (
                <RecentQuizCard key={result.id || idx} result={result} navigation={navigation} />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

function RecentQuizCard({ result, navigation }) {
  const [quizTitle, setQuizTitle] = React.useState(result.quizTitle || 'Quiz');
  React.useEffect(() => {
    if (!result.quizTitle && result.quizId) {
      getQuizById(result.quizId).then(q => {
        if (q && q.title) setQuizTitle(q.title);
      });
    }
  }, [result.quizTitle, result.quizId]);
  return (
    <View style={styles.recentQuizCard}>
      <View style={[styles.recentQuizIcon, { backgroundColor: '#e3f2fd' }]}>
        <MaterialCommunityIcons name="clipboard-text" size={24} color="#2196f3" />
      </View>
      <View style={styles.recentQuizInfo}>
        <Text style={styles.recentQuizTitle}>{quizTitle}</Text>
        <View style={styles.quizMeta}>
          <Text style={styles.metaText}>
            <MaterialCommunityIcons name="help-circle-outline" size={12} /> {result.totalQuestions} câu hỏi
          </Text>
          <Text style={styles.metaText}>
            <MaterialCommunityIcons name="timer-outline" size={12} /> {Math.round((result.timeSpent || 0) / 60)} phút
          </Text>
        </View>
      </View>
      <View style={styles.recentQuizScore}>
        <FontAwesome5 name="star" size={12} color="#4caf50" />
        <Text style={styles.scoreText}>{result.score || 0}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 10,
    fontWeight: '500',
  },
  
  // Header Styles
  headerButton: {
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff6b6b',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Welcome Section
  welcomeSection: {
    backgroundColor: '#667eea',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 30,
  },
  illustrationContainer: {
    marginBottom: 30,
  },
  illustration: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  illustrationText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  startButton: {
    width: width * 0.7,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonContent: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Quick Actions
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 30,
    marginTop: 24,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 28,
    alignItems: 'center',
    width: (width - 60) / 2,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 12,
  },

  // Recent Quizzes
  recentSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  recentQuizzes: {
    gap: 15,
  },
  recentQuizCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 10,
  },
  recentQuizIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  recentQuizInfo: {
    flex: 1,
  },
  recentQuizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  quizMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  recentQuizScore: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4caf50',
    marginLeft: 4,
  },

  // Quick Actions
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
});

export default Home;