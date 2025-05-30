import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Animated
} from 'react-native';
import { getQuizById, submitQuizResult } from '../services/quiz.service';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  accent: '#ff6b6b',
  success: '#4caf50',
  warning: '#ff9800',
  white: '#ffffff',
  background: '#f8f9fa',
  text: '#333333',
  textLight: '#666666',
  border: '#e9ecef',
  correct: '#4caf50',
  incorrect: '#f44336',
  selected: '#667eea',
};

const Quiz = ({ route, navigation }) => {
  const { quizId, quizTitle } = route.params;
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progressAnim] = useState(new Animated.Value(0));
  const [showExitDialog, setShowExitDialog] = useState(false);

  useEffect(() => {
    loadQuiz();
    // Set header options
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity 
          onPress={handleExitQuiz}
          style={styles.headerButton}
        >
          <Icon name="close" size={24} color={COLORS.white} />
        </TouchableOpacity>
      ),
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <MaterialCommunityIcons name="clipboard-text" size={24} color={COLORS.white} />
          <Text style={styles.headerTitle}>{quizTitle || 'Quiz'}</Text>
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity style={styles.headerButton}>
          <MaterialCommunityIcons name="help-circle-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      ),
    });
  }, []);

  useEffect(() => {
    if (quiz) {
      setTimeRemaining(quiz.timeLimit * 60);
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz]);

  useEffect(() => {
    if (questions.length > 0) {
      const progress = (currentQuestionIndex + 1) / questions.length;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [currentQuestionIndex, quiz]);

  const loadQuiz = async () => {
    try {
      // 1. Lấy quiz info
      const quizDoc = await firestore().collection('quizzes').doc(quizId).get();
      if (quizDoc.exists) {
        setQuiz({ id: quizDoc.id, ...quizDoc.data() });
      }
      // 2. Lấy câu hỏi
      const snap = await firestore().collection('questions').where('quizId', '==', quizId).get();
      const fetchedQuestions = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuestions(fetchedQuestions);
      setTimeRemaining((quizDoc.data().timeLimit || 10) * 60);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleExitQuiz = () => {
    Alert.alert(
      'Thoát quiz',
      'Bạn có chắc chắn muốn thoát? Tiến trình sẽ không được lưu.',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Thoát', style: 'destructive', onPress: () => navigation.goBack() }
      ]
    );
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswers(prev => {
      if (prev[currentQuestionIndex] === answerIndex) {
        // Nếu bấm lại đáp án đã chọn thì bỏ chọn
        const newAnswers = { ...prev };
        delete newAnswers[currentQuestionIndex];
        return newAnswers;
      } else {
        return {
          ...prev,
          [currentQuestionIndex]: answerIndex
        };
      }
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const doSubmitQuiz = async () => {
    try {
      const userId = auth().currentUser?.uid;
      let username = 'Người dùng';
      if (userId) {
        // Lấy username từ Firestore
        const userDoc = await firestore().collection('users').doc(userId).get();
        username = userDoc.data()?.username || 'Người dùng';
      }
      if (!userId) {
        Alert.alert('Lỗi', 'Không xác định được người dùng. Vui lòng đăng nhập lại.');
        return;
      }
      const score = calculateScore();
      const duration = (quiz.timeLimit * 60) - timeRemaining;
      const result = {
        score,
        correctAnswers: countCorrectAnswers(),
        totalQuestions: questions.length,
        timeSpent: duration,
        answers: Object.entries(selectedAnswers).map(([index, answerIndex]) => {
          const idx = parseInt(index, 10);
          return {
            questionId: questions[idx]?.id || idx,
            selectedAnswer: answerIndex
          };
        }),
        quizTitle: quiz.title || quizTitle || 'Quiz',
      };

      // Lưu vào Firestore
      await firestore().collection('quizResults').add({
        quizId,
        userId,
        username,
        score,
        duration,
        submittedAt: new Date().toISOString(),
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      navigation.replace('QuizResult', { result, quiz });
    } catch (error) {
      console.log('Submit error:', error, JSON.stringify(error));
      Alert.alert('Lỗi', 'Không thể nộp bài');
    }
  };

  const handleSubmit = async () => {
    const unansweredCount = questions.length - Object.keys(selectedAnswers).length;
    if (unansweredCount > 0) {
      Alert.alert(
        'Chưa hoàn thành',
        `Bạn còn ${unansweredCount} câu chưa trả lời. Bạn có muốn nộp bài không?`,
        [
          { text: 'Tiếp tục làm', style: 'cancel' },
          { text: 'Nộp bài', onPress: doSubmitQuiz }
        ]
      );
    } else {
      doSubmitQuiz();
    }
  };

  const calculateScore = () => {
    const correctCount = countCorrectAnswers();
    return Math.round((correctCount / questions.length) * 100);
  };

  const countCorrectAnswers = () => {
    return Object.entries(selectedAnswers).reduce((count, [index, answerIndex]) => {
      return answerIndex === questions[index]?.answer ? count + 1 : count;
    }, 0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining < 300) return COLORS.accent; // < 5 minutes
    if (timeRemaining < 600) return COLORS.warning; // < 10 minutes
    return COLORS.success;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Quiz không có câu hỏi nào.</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Progress Header */}
      <View style={styles.progressHeader}>
        <View style={styles.progressInfo}>
          <Text style={styles.questionCounter}>
            Câu {currentQuestionIndex + 1} / {questions.length}
          </Text>
          <Text style={styles.progressPercentage}>
            {Math.round(progressPercentage)}% hoàn thành
          </Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <Animated.View 
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }
            ]} 
          />
        </View>

        <View style={styles.timerContainer}>
          <MaterialCommunityIcons 
            name="timer-outline" 
            size={20} 
            color={getTimeColor()} 
          />
          <Text style={[styles.timerText, { color: getTimeColor() }]}>
            {formatTime(timeRemaining)}
          </Text>
        </View>
      </View>

      {/* Question Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <View style={styles.questionNumberBadge}>
              <Text style={styles.questionNumberText}>{currentQuestionIndex + 1}</Text>
            </View>
            <View style={styles.questionTypeContainer}>
              <MaterialCommunityIcons name="help-circle" size={16} color={COLORS.primary} />
              <Text style={styles.questionType}>Câu hỏi trắc nghiệm</Text>
            </View>
          </View>
          
          <Text style={styles.questionText}>
            {currentQuestion.question || currentQuestion.content || 'Không có nội dung câu hỏi'}
          </Text>
        </View>

        {/* Answer Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestionIndex] === index;
            const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionCard,
                  isSelected && styles.selectedOptionCard
                ]}
                onPress={() => handleAnswerSelect(index)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.optionLetter,
                  isSelected && styles.selectedOptionLetter
                ]}>
                  <Text style={[
                    styles.optionLetterText,
                    isSelected && styles.selectedOptionLetterText
                  ]}>
                    {optionLetter}
                  </Text>
                </View>
                <Text style={[
                  styles.optionText,
                  isSelected && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
                {isSelected && (
                  <View style={styles.checkIcon}>
                    <Icon name="check-circle" size={24} color={COLORS.primary} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Question Navigation Dots */}
        <View style={styles.questionDots}>
          {questions.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                index === currentQuestionIndex && styles.activeDot,
                selectedAnswers[index] && styles.answeredDot
              ]}
              onPress={() => setCurrentQuestionIndex(index)}
            >
              <Text style={[
                styles.dotText,
                index === currentQuestionIndex && styles.activeDotText,
                selectedAnswers[index] && styles.answeredDotText
              ]}>
                {index + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.previousButton,
            currentQuestionIndex === 0 && styles.disabledButton
          ]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
          activeOpacity={0.8}
        >
          <Icon name="arrow-back" size={20} color={COLORS.white} />
          <Text style={styles.navButtonText}>Trước</Text>
        </TouchableOpacity>

        <View style={styles.centerInfo}>
          <Text style={styles.answeredCount}>
            Đã trả lời: {Object.keys(selectedAnswers).length}/{questions.length}
          </Text>
        </View>

        {currentQuestionIndex === questions.length - 1 ? (
          <TouchableOpacity
            style={[styles.navButton, styles.submitButton]}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.navButtonText}>Nộp bài</Text>
            <MaterialCommunityIcons name="send" size={20} color={COLORS.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.navButtonText}>Tiếp</Text>
            <Icon name="arrow-forward" size={20} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>
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
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: 8,
  },

  // Progress Header
  progressHeader: {
    backgroundColor: COLORS.white,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionCounter: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  progressPercentage: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },

  // Content
  content: {
    flex: 1,
    padding: 20,
  },
  questionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  questionTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}10`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  questionType: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    color: COLORS.text,
    fontWeight: '500',
  },

  // Options
  optionsContainer: {
    marginBottom: 30,
  },
  optionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  selectedOptionCard: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}08`,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedOptionLetter: {
    backgroundColor: COLORS.primary,
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  selectedOptionLetterText: {
    color: COLORS.white,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 22,
  },
  selectedOptionText: {
    color: COLORS.text,
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 12,
  },

  // Question Dots
  questionDots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
  },
  answeredDot: {
    backgroundColor: COLORS.success,
  },
  dotText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  activeDotText: {
    color: COLORS.white,
  },
  answeredDotText: {
    color: COLORS.white,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 100,
    justifyContent: 'center',
  },
  previousButton: {
    backgroundColor: COLORS.textLight,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
  },
  submitButton: {
    backgroundColor: COLORS.success,
  },
  disabledButton: {
    backgroundColor: COLORS.border,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
    marginHorizontal: 4,
  },
  centerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  answeredCount: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
  },
});

export default Quiz;