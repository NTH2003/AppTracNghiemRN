import { useState, useEffect } from 'react';
import { getQuizzes, getQuizById, submitQuizResult } from '../services/quiz.service';
import { QUIZ_STATUS } from '../constants';

export const useQuiz = (quizId = null) => {
  const [quiz, setQuiz] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(QUIZ_STATUS.NOT_STARTED);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    } else {
      loadQuizzes();
    }
  }, [quizId]);

  useEffect(() => {
    if (quiz && status === QUIZ_STATUS.IN_PROGRESS) {
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
  }, [quiz, status]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const quizData = await getQuizById(quizId);
      setQuiz(quizData);
      setTimeRemaining(quizData.timeLimit * 60);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadQuizzes = async (topicId = null) => {
    try {
      setLoading(true);
      const quizzesData = await getQuizzes(topicId);
      setQuizzes(quizzesData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setStatus(QUIZ_STATUS.IN_PROGRESS);
    setSelectedAnswers({});
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmit = async () => {
    if (status !== QUIZ_STATUS.IN_PROGRESS) return;

    try {
      setStatus(QUIZ_STATUS.COMPLETED);
      const result = {
        score: calculateScore(),
        correctAnswers: countCorrectAnswers(),
        totalQuestions: quiz.questions.length,
        answers: Object.entries(selectedAnswers).map(([index, answer]) => ({
          questionId: quiz.questions[index].id,
          selectedAnswer: answer,
          isCorrect: answer === quiz.questions[index].correctAnswer
        }))
      };

      await submitQuizResult(quizId, result);
      return result;
    } catch (error) {
      setError(error.message);
      return null;
    }
  };

  const calculateScore = () => {
    const correctCount = countCorrectAnswers();
    return (correctCount / quiz.questions.length) * 10;
  };

  const countCorrectAnswers = () => {
    return Object.entries(selectedAnswers).reduce((count, [index, answer]) => {
      return answer === quiz.questions[index].correctAnswer ? count + 1 : count;
    }, 0);
  };

  return {
    quiz,
    quizzes,
    loading,
    error,
    status,
    selectedAnswers,
    timeRemaining,
    startQuiz,
    handleAnswerSelect,
    handleSubmit,
    loadQuizzes,
  };
}; 