import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar 
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Picker } from '@react-native-picker/picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';

const COLORS = {
  primary: '#667eea',
  background: '#f8f9fa',
  card: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e9ecef',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  success: '#4caf50',
};

const Leaderboard = ({ navigation }) => {
  const [quizId, setQuizId] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizList, setQuizList] = useState([]);
  const [quizTitles, setQuizTitles] = useState({});
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);

  useEffect(() => {
    const fetchRecentQuiz = async () => {
      const userId = auth().currentUser?.uid;
      if (!userId) return;
      const snapshot = await firestore()
        .collection('quizResults')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
      if (!snapshot.empty) {
        setQuizId(snapshot.docs[0].data().quizId);
      }
    };
    fetchRecentQuiz();
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      const topicSnap = await firestore().collection('topics').get();
      const topicList = [];
      topicSnap.forEach(doc => {
        topicList.push({ id: doc.id, ...doc.data() });
      });
      setTopics(topicList);
      if (topicList.length > 0) setSelectedTopic(topicList[0].id);
    };
    fetchTopics();
  }, []);

  useEffect(() => {
    if (!selectedTopic) return;
    const fetchQuizList = async () => {
      const quizSnap = await firestore()
        .collection('quizzes')
        .where('topicId', '==', selectedTopic)
        .get();
      const list = [];
      const titles = {};
      quizSnap.forEach(doc => {
        list.push(doc.id);
        titles[doc.id] = doc.data().title || doc.id;
      });
      setQuizList(list);
      setQuizTitles(titles);
      // Tự động chọn quiz đầu tiên nếu có
      if (list.length > 0) setQuizId(list[0]);
      else setQuizId(null);
    };
    fetchQuizList();
  }, [selectedTopic]);

  useEffect(() => {
    if (!quizId) return;
    const fetchLeaderboard = async () => {
      setLoading(true);
      const snapshot = await firestore()
        .collection('quizResults')
        .where('quizId', '==', quizId)
        .get();

      const data = snapshot.docs.map(doc => doc.data());

      // Lọc thành tích tốt nhất cho mỗi user
      const bestResults = {};
      data.forEach(item => {
        const userId = item.userId;
        if (!bestResults[userId]) {
          bestResults[userId] = item;
        } else {
          if (
            item.score > bestResults[userId].score ||
            (item.score === bestResults[userId].score && item.duration < bestResults[userId].duration)
          ) {
            bestResults[userId] = item;
          }
        }
      });
      const uniqueResults = Object.values(bestResults);

      // Sắp xếp lại
      uniqueResults.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.duration - b.duration;
      });

      setResults(uniqueResults);
      setLoading(false);
    };

    fetchLeaderboard();
  }, [quizId]);

  const getRankIcon = (index) => {
    if (index === 0) return { name: 'trophy', color: COLORS.gold };
    if (index === 1) return { name: 'medal', color: COLORS.silver };
    if (index === 2) return { name: 'medal', color: COLORS.bronze };
    return null;
  };

  const getRankStyle = (index) => {
    if (index === 0) return styles.goldRank;
    if (index === 1) return styles.silverRank;
    if (index === 2) return styles.bronzeRank;
    return {};
  };

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}s`;
  };

  const renderLeaderboardItem = ({ item, index }) => {
    const rankIcon = getRankIcon(index);
    const isCurrentUser = item.userId === auth().currentUser?.uid;
    
    return (
      <View style={[
        styles.row, 
        getRankStyle(index),
        isCurrentUser && styles.currentUserRow
      ]}>
        <View style={styles.rankContainer}>
          {rankIcon ? (
            <MaterialCommunityIcons 
              name={rankIcon.name} 
              size={24} 
              color={rankIcon.color} 
            />
          ) : (
            <Text style={styles.rank}>{index + 1}</Text>
          )}
        </View>
        
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(item.username || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            {isCurrentUser && (
              <View style={styles.currentUserBadge}>
                <MaterialCommunityIcons name="account" size={12} color={COLORS.card} />
              </View>
            )}
          </View>
          
          <View style={styles.nameContainer}>
            <Text style={[styles.name, isCurrentUser && styles.currentUserName]}>
              {item.username || 'Người dùng ẩn danh'}
            </Text>
            {isCurrentUser && <Text style={styles.youLabel}>Bạn</Text>}
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.scoreContainer}>
            <Text style={styles.score}>{item.score}</Text>
            <Text style={styles.scoreLabel}>điểm</Text>
          </View>
          <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <View style={styles.content}>
        {/* Chọn chủ đề */}
        <View style={styles.selectorCard}>
          <View style={styles.selectorHeader}>
            <MaterialCommunityIcons name="book-multiple" size={20} color={COLORS.primary} />
            <Text style={styles.selectorLabel}>Chọn chủ đề</Text>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedTopic}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedTopic(itemValue)}
              dropdownIconColor={COLORS.primary}
            >
              {topics.map(topic => (
                <Picker.Item 
                  key={topic.id} 
                  label={topic.name} 
                  value={topic.id} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Chọn quiz */}
        <View style={styles.selectorCard}>
          <View style={styles.selectorHeader}>
            <MaterialCommunityIcons name="clipboard-list" size={20} color={COLORS.primary} />
            <Text style={styles.selectorLabel}>Chọn bài kiểm tra</Text>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={quizId}
              style={styles.picker}
              onValueChange={(itemValue) => setQuizId(itemValue)}
              dropdownIconColor={COLORS.primary}
              enabled={quizList.length > 0}
            >
              {quizList.length === 0 ? (
                <Picker.Item label="Không có đề nào" value={null} />
              ) : (
                quizList.map(id => (
                  <Picker.Item 
                    key={id} 
                    label={quizTitles[id] || id} 
                    value={id} 
                  />
                ))
              )}
            </Picker>
          </View>
        </View>

        {/* Leaderboard */}
        <View style={styles.leaderboardCard}>
          <View style={styles.leaderboardHeader}>
            <MaterialCommunityIcons name="podium" size={24} color={COLORS.primary} />
            <Text style={styles.leaderboardTitle}>Xếp hạng</Text>
            <View style={styles.participantCount}>
              <Text style={styles.participantText}>{results.length} người tham gia</Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Đang tải bảng xếp hạng...</Text>
            </View>
          ) : results.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="trophy-broken" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>Chưa có kết quả</Text>
              <Text style={styles.emptyText}>Hãy là người đầu tiên làm bài quiz này!</Text>
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(_, idx) => idx.toString()}
              renderItem={renderLeaderboardItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.card,
    marginLeft: 8,
  },
  placeholder: {
    width: 40,
  },

  content: {
    flex: 1,
    padding: 20,
  },

  // Quiz Selector
  selectorCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  picker: {
    height: 50,
    color: COLORS.text,
  },

  // Leaderboard
  leaderboardCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    flex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  participantCount: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  participantText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },

  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },

  // List
  listContainer: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  goldRank: {
    backgroundColor: `${COLORS.gold}15`,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gold,
  },
  silverRank: {
    backgroundColor: `${COLORS.silver}15`,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.silver,
  },
  bronzeRank: {
    backgroundColor: `${COLORS.bronze}15`,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.bronze,
  },
  currentUserRow: {
    backgroundColor: `${COLORS.primary}10`,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },

  // Rank
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  // User Info
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.card,
  },
  currentUserBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  currentUserName: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  youLabel: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
    marginTop: 2,
  },

  // Stats
  statsContainer: {
    alignItems: 'flex-end',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scoreLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  duration: {
    fontSize: 14,
    color: COLORS.textLight,
  },
});

export default Leaderboard;