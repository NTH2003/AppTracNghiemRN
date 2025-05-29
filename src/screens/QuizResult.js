import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#667eea',
  success: '#4CAF50',
  error: '#F44336',
  white: '#ffffff',
  background: '#f8f9fa',
  text: '#333333',
  textLight: '#666666',
  border: '#e9ecef',
  cardShadow: '#000000',
};

const QuizResult = ({ route, navigation }) => {
  const { result, quiz } = route.params;

  const getScoreColor = () => {
    const score = parseInt(result.score, 10);
    if (score >= 80) return COLORS.success;
    if (score >= 60) return '#FF9800';
    return COLORS.error;
  };

  const renderAnswerReview = () => {
    return quiz.questions.map((question, index) => {
      const answer = result.answers[index];
      const isAnswered = answer && typeof answer.selectedAnswer === 'number';
      const isCorrect = answer && answer.isCorrect;
      return (
        <View key={index} style={styles.answerContainer}>
          <View style={styles.questionHeader}>
            <View style={styles.questionNumberBadge}>
              <Text style={styles.questionNumber}>Câu {index + 1}</Text>
            </View>
            <View style={[
              styles.resultIndicator,
              { backgroundColor: isCorrect ? `${COLORS.success}20` : `${COLORS.error}20` }
            ]}>
              <Icon 
                name={isCorrect ? "check-circle" : "cancel"} 
                size={16} 
                color={isCorrect ? COLORS.success : COLORS.error} 
              />
              <Text style={[
                styles.resultText,
                { color: isCorrect ? COLORS.success : COLORS.error }
              ]}>
                {isCorrect ? 'Đúng' : 'Sai'}
              </Text>
            </View>
          </View>
          <Text style={styles.questionText}>{question.content}</Text>
          <View style={styles.answerDetails}>
            <View style={styles.answerRow}>
              <Text style={styles.answerLabel}>Câu trả lời của bạn:</Text>
              <Text style={[
                styles.answerText,
                isCorrect ? { color: COLORS.success } : { color: COLORS.error }
              ]}>
                {isAnswered && question.options[answer.selectedAnswer] !== undefined
                  ? question.options[answer.selectedAnswer]
                  : 'Chưa trả lời'}
              </Text>
            </View>
            {(!isCorrect || !isAnswered) && (
              <View style={styles.answerRow}>
                <Text style={styles.answerLabel}>Đáp án đúng:</Text>
                <Text style={[styles.answerText, { color: COLORS.success }]}> 
                  {typeof question.correctAnswer === 'number' && question.options[question.correctAnswer] !== undefined
                    ? question.options[question.correctAnswer]
                    : question.correctAnswer}
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons name="trophy" size={28} color={COLORS.primary} />
          <Text style={styles.title}>Kết quả Quiz</Text>
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Điểm số của bạn</Text>
          <View style={styles.scoreCircle}>
            <Text style={[styles.score, { color: getScoreColor() }]}>
              {parseInt(result.score, 10)}
            </Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
          <Text style={styles.scoreDetail}>
            {result.correctAnswers} đúng trên tổng {result.totalQuestions} câu hỏi
          </Text>
          
          {/* Statistics Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.success} />
              <Text style={styles.statNumber}>{result.correctAnswers}</Text>
              <Text style={styles.statLabel}>Đúng</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="close-circle" size={24} color={COLORS.error} />
              <Text style={styles.statNumber}>{result.totalQuestions - result.correctAnswers}</Text>
              <Text style={styles.statLabel}>Sai</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="percent" size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>{Math.round((result.correctAnswers / result.totalQuestions) * 100)}%</Text>
              <Text style={styles.statLabel}>Độ chính xác</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.reviewHeader}>
          <MaterialCommunityIcons name="clipboard-text" size={24} color={COLORS.text} />
          <Text style={styles.reviewTitle}>Chi tiết câu trả lời</Text>
        </View>
        {renderAnswerReview()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('UserMain')}
        >
          <Icon name="home" size={20} color={COLORS.white} />
          <Text style={styles.primaryButtonText}>Về trang chủ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 12,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 16,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  score: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  scoreMax: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 4,
  },
  scoreDetail: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 8,
  },
  answerContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionNumberBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  resultIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  resultText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  questionText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  answerDetails: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
  },
  answerRow: {
    marginBottom: 12,
  },
  answerLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  answerText: {
    fontSize: 16,
    fontWeight: '500',
  },
  correctAnswer: {
    color: COLORS.success,
  },
  wrongAnswer: {
    color: COLORS.error,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default QuizResult;