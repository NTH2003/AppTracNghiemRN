import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const EditQuiz = ({ route, navigation }) => {
  const { quizId, quizData } = route.params;
  const [title, setTitle] = useState(quizData.title);
  const [timeLimit, setTimeLimit] = useState(String(quizData.timeLimit));
  const [questions, setQuestions] = useState(quizData.questions);

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].content = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].options[oIdx] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (qIdx, oIdx) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].correctAnswer = oIdx;
    setQuestions(newQuestions);
  };

  const handleSave = async () => {
    try {
      await firestore().collection('quizzes').doc(quizId).update({
        title,
        timeLimit: parseInt(timeLimit),
        questions,
        updatedAt: new Date().toISOString(),
      });
      Alert.alert('Thành công', 'Quiz đã được cập nhật!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật quiz!');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Chỉnh sửa Quiz</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Tiêu đề quiz"
      />
      <TextInput
        style={styles.input}
        value={timeLimit}
        onChangeText={setTimeLimit}
        placeholder="Thời gian (phút)"
        keyboardType="numeric"
      />

      {questions.map((q, qIdx) => (
        <View key={qIdx} style={styles.questionBlock}>
          <Text style={styles.questionLabel}>Câu hỏi {qIdx + 1}</Text>
          <TextInput
            style={styles.input}
            value={q.content}
            onChangeText={value => handleQuestionChange(qIdx, value)}
            placeholder="Nội dung câu hỏi"
          />
          <Text style={styles.optionsLabel}>Các lựa chọn:</Text>
          {q.options.map((opt, oIdx) => (
            <View key={oIdx} style={styles.optionRow}>
              <TouchableOpacity
                style={[
                  styles.radio,
                  q.correctAnswer === oIdx && styles.radioSelected
                ]}
                onPress={() => handleCorrectAnswerChange(qIdx, oIdx)}
              >
                {q.correctAnswer === oIdx && <View style={styles.radioDot} />}
              </TouchableOpacity>
              <TextInput
                style={[
                  styles.input,
                  { flex: 1, marginBottom: 0, marginLeft: 8 }
                ]}
                value={opt}
                onChangeText={value => handleOptionChange(qIdx, oIdx, value)}
                placeholder={`Lựa chọn ${String.fromCharCode(65 + oIdx)}`}
              />
            </View>
          ))}
        </View>
      ))}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#ddd' },
  saveButton: { backgroundColor: '#667eea', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  questionBlock: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#eee' },
  questionLabel: { fontWeight: 'bold', marginBottom: 8, fontSize: 16 },
  optionsLabel: { marginTop: 8, marginBottom: 4, fontWeight: '600' },
  optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#667eea', alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: '#4caf50' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4caf50' },
});

export default EditQuiz;
