export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateUsername = (username) => {
  return username.length >= 3 && username.length <= 20;
};

export const validateQuizTitle = (title) => {
  return title.length >= 3 && title.length <= 100;
};

export const validateTimeLimit = (timeLimit) => {
  const minutes = parseInt(timeLimit);
  return !isNaN(minutes) && minutes > 0 && minutes <= 120;
};

export const validateQuestion = (question) => {
  if (!question.content.trim()) return false;
  if (question.options.length !== 4) return false;
  return question.options.every(option => option.trim().length > 0);
};

export const validateTopic = (topic) => {
  return topic.name.trim().length >= 3 && topic.name.trim().length <= 50;
}; 