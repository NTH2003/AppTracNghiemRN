import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  FlatList,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import { getTopics } from '../services/quiz.service';

const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  background: '#f8f9fa',
  card: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e9ecef',
  inputBorder: '#ddd',
  inputFocus: '#667eea',
  placeholder: '#999999',
  correct: '#4caf50',
  incorrect: '#f5f5f5',
};

const AddQuiz = ({ route, navigation }) => {
  const { topicId, topicName } = route.params || {};
  const [title, setTitle] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([{
    content: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  }]);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const topicsData = await getTopics();
      setTopics(topicsData);
      if (topicsData.length > 0) {
        setSelectedTopic(topicsData[0].id);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách chủ đề');
    }
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, {
      content: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }]);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    } else {
      Alert.alert('Thông báo', 'Quiz phải có ít nhất 1 câu hỏi');
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
    
    // Clear error when user starts typing
    if (errors[`question_${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`question_${index}`];
      setErrors(newErrors);
    }
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].correctAnswer = optionIndex;
    setQuestions(newQuestions);
  };

  const validateQuiz = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề quiz';
    }

    if (!timeLimit || isNaN(timeLimit) || parseInt(timeLimit) <= 0) {
      newErrors.timeLimit = 'Vui lòng nhập thời gian hợp lệ';
    }

    if (!selectedTopic) {
      newErrors.topic = 'Vui lòng chọn chủ đề';
    }

    questions.forEach((question, i) => {
      if (!question.content.trim()) {
        newErrors[`question_${i}`] = `Vui lòng nhập nội dung câu hỏi ${i + 1}`;
      }

      const emptyOptions = question.options.filter(option => !option.trim());
      if (emptyOptions.length > 0) {
        newErrors[`question_${i}_options`] = `Vui lòng nhập đầy đủ các lựa chọn cho câu hỏi ${i + 1}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddQuiz = async () => {
    if (!validateQuiz()) return;

    try {
      setLoading(true);
      // 1. Lưu quiz trước, không lưu trường questions
      const quizRef = await firestore().collection('quizzes').add({
        title: title.trim(),
        timeLimit: parseInt(timeLimit),
        topicId: selectedTopic,
        totalQuestions: questions.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      });
      // 2. Lưu từng câu hỏi vào collection 'questions'
      for (const q of questions) {
        await firestore().collection('questions').add({
          quizId: quizRef.id,
          question: q.content.trim(),
          options: q.options.map(o => o.trim()),
          answer: q.correctAnswer
        });
      }
      // 3. Reset form
      setTitle('');
      setTimeLimit('');
      setQuestions([{ content: '', options: ['', '', '', ''], correctAnswer: 0 }]);
      setSelectedTopic(topics.length > 0 ? topics[0].id : null);
      setErrors({});
      Alert.alert(
        'Thành công',
        'Quiz đã được thêm thành công!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm quiz. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = ({ item, index }) => (
    <View style={styles.questionCard}>
      <View style={styles.questionHeader}>
        <View style={styles.questionNumberContainer}>
          <Text style={styles.questionNumber}>{index + 1}</Text>
        </View>
        <Text style={styles.questionTitle}>Câu hỏi {index + 1}</Text>
        {questions.length > 1 && (
          <TouchableOpacity
            style={styles.removeQuestionButton}
            onPress={() => handleRemoveQuestion(index)}
          >
            <MaterialCommunityIcons name="close" size={20} color={COLORS.error} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.questionInputContainer}>
        <TextInput
          style={[
            styles.questionInput,
            errors[`question_${index}`] && styles.inputError
          ]}
          value={item.content}
          onChangeText={(value) => handleQuestionChange(index, 'content', value)}
          placeholder="Nhập nội dung câu hỏi..."
          placeholderTextColor={COLORS.placeholder}
          multiline
          textAlignVertical="top"
        />
        {errors[`question_${index}`] && (
          <Text style={styles.errorText}>{errors[`question_${index}`]}</Text>
        )}
      </View>

      <Text style={styles.optionsLabel}>Các lựa chọn:</Text>
      {item.options.map((option, optionIndex) => (
        <View key={optionIndex} style={styles.optionContainer}>
          <TouchableOpacity
            style={[
              styles.optionRadio,
              item.correctAnswer === optionIndex && styles.optionRadioSelected
            ]}
            onPress={() => handleCorrectAnswerChange(index, optionIndex)}
          >
            {item.correctAnswer === optionIndex && (
              <MaterialCommunityIcons name="check" size={14} color={COLORS.card} />
            )}
          </TouchableOpacity>
          
          <View style={styles.optionInputContainer}>
            <Text style={styles.optionLabel}>{String.fromCharCode(65 + optionIndex)}.</Text>
            <TextInput
              style={[
                styles.optionInput,
                item.correctAnswer === optionIndex && styles.correctOptionInput
              ]}
              value={option}
              onChangeText={(value) => handleOptionChange(index, optionIndex, value)}
              placeholder={`Lựa chọn ${String.fromCharCode(65 + optionIndex)}`}
              placeholderTextColor={COLORS.placeholder}
            />
          </View>
        </View>
      ))}
      
      {errors[`question_${index}_options`] && (
        <Text style={styles.errorText}>{errors[`question_${index}_options`]}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Quiz Info Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="information" size={24} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Thông tin quiz</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Tiêu đề quiz <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedInput === 'title' && styles.inputFocused,
                    errors.title && styles.inputError
                  ]}
                  value={title}
                  onChangeText={(text) => {
                    setTitle(text);
                    if (errors.title) {
                      const newErrors = { ...errors };
                      delete newErrors.title;
                      setErrors(newErrors);
                    }
                  }}
                  onFocus={() => setFocusedInput('title')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Nhập tiêu đề quiz..."
                  placeholderTextColor={COLORS.placeholder}
                  maxLength={100}
                />
                {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
                <Text style={styles.helperText}>{title.length}/100 ký tự</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Thời gian (phút) <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedInput === 'timeLimit' && styles.inputFocused,
                    errors.timeLimit && styles.inputError
                  ]}
                  value={timeLimit}
                  onChangeText={(text) => {
                    setTimeLimit(text);
                    if (errors.timeLimit) {
                      const newErrors = { ...errors };
                      delete newErrors.timeLimit;
                      setErrors(newErrors);
                    }
                  }}
                  onFocus={() => setFocusedInput('timeLimit')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Nhập thời gian làm bài..."
                  placeholderTextColor={COLORS.placeholder}
                  keyboardType="numeric"
                />
                {errors.timeLimit && <Text style={styles.errorText}>{errors.timeLimit}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Chủ đề <Text style={styles.required}>*</Text>
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.topicsContainer}>
                    {topics.map(topic => (
                      <TouchableOpacity
                        key={topic.id}
                        style={[
                          styles.topicChip,
                          selectedTopic === topic.id && styles.topicChipSelected
                        ]}
                        onPress={() => setSelectedTopic(topic.id)}
                      >
                        <MaterialCommunityIcons 
                          name="book-outline" 
                          size={16} 
                          color={selectedTopic === topic.id ? COLORS.card : COLORS.primary} 
                        />
                        <Text style={[
                          styles.topicChipText,
                          selectedTopic === topic.id && styles.topicChipTextSelected
                        ]}>
                          {topic.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                {errors.topic && <Text style={styles.errorText}>{errors.topic}</Text>}
              </View>
            </View>

            {/* Questions Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="help-circle" size={24} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Câu hỏi ({questions.length})</Text>
              </View>

              <FlatList
                data={questions}
                renderItem={renderQuestion}
                keyExtractor={(_, index) => index.toString()}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
              />

              <TouchableOpacity
                style={styles.addQuestionButton}
                onPress={handleAddQuestion}
              >
                <MaterialCommunityIcons name="plus" size={20} color={COLORS.primary} />
                <Text style={styles.addQuestionButtonText}>Thêm câu hỏi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled
            ]}
            onPress={handleAddQuiz}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.card} />
                <Text style={styles.submitButtonText}>Đang lưu...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <MaterialCommunityIcons name="content-save" size={20} color={COLORS.card} />
                <Text style={styles.submitButtonText}>Lưu quiz</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardContainer: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },

  // Sections
  section: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 8,
  },

  // Input Groups
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  inputFocused: {
    borderColor: COLORS.inputFocus,
    backgroundColor: COLORS.card,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
    textAlign: 'right',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },

  // Topics
  topicsContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  topicChipSelected: {
    backgroundColor: COLORS.primary,
  },
  topicChipText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  topicChipTextSelected: {
    color: COLORS.card,
  },

  // Questions
  questionCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.card,
  },
  questionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  removeQuestionButton: {
    padding: 4,
  },
  questionInputContainer: {
    marginBottom: 16,
  },
  questionInput: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioSelected: {
    backgroundColor: COLORS.primary,
  },
  optionInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: 8,
    width: 20,
  },
  optionInput: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.text,
  },
  correctOptionInput: {
    borderColor: COLORS.correct,
    backgroundColor: `${COLORS.correct}10`,
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    paddingVertical: 16,
    marginTop: 16,
  },
  addQuestionButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // Bottom Actions
  bottomActions: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  submitButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.card,
    marginLeft: 8,
  },
});

export default AddQuiz;