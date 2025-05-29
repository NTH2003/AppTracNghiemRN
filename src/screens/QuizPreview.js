import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const QuizPreview = ({ route }) => {
  const { quizData } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{quizData.title}</Text>
      <Text style={styles.meta}>Thời gian: {quizData.timeLimit} phút</Text>
      <Text style={styles.meta}>Số câu hỏi: {quizData.totalQuestions}</Text>
      <View style={styles.section}>
        {quizData.questions && quizData.questions.map((q, idx) => (
          <View key={idx} style={styles.questionBlock}>
            <Text style={styles.question}>{idx + 1}. {q.content}</Text>
            {q.options.map((opt, oidx) => (
              <Text
                key={oidx}
                style={[
                  styles.option,
                  oidx === q.correctAnswer && styles.correctOption
                ]}
              >
                {String.fromCharCode(65 + oidx)}. {opt}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  meta: { color: '#666', marginBottom: 4 },
  section: { marginTop: 16 },
  questionBlock: { marginBottom: 20 },
  question: { fontWeight: 'bold', marginBottom: 6 },
  option: { marginLeft: 12, marginBottom: 2 },
  correctOption: { color: '#4caf50', fontWeight: 'bold' },
});

export default QuizPreview;
