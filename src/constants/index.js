export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

export const QUIZ_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password must be at least 6 characters long',
  INVALID_USERNAME: 'Username must be between 3 and 20 characters',
  INVALID_QUIZ_TITLE: 'Quiz title must be between 3 and 100 characters',
  INVALID_TIME_LIMIT: 'Time limit must be between 1 and 120 minutes',
  INVALID_QUESTION: 'Please fill in all question fields',
  INVALID_TOPIC: 'Topic name must be between 3 and 50 characters',
  NETWORK_ERROR: 'Network error. Please check your connection',
  UNKNOWN_ERROR: 'An unexpected error occurred',
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  SIGNUP_SUCCESS: 'Account created successfully',
  QUIZ_ADDED: 'Quiz added successfully',
  TOPIC_ADDED: 'Topic added successfully',
  QUIZ_UPDATED: 'Quiz updated successfully',
  TOPIC_UPDATED: 'Topic updated successfully',
  QUIZ_DELETED: 'Quiz deleted successfully',
  TOPIC_DELETED: 'Topic deleted successfully',
};

export const NAVIGATION_ROUTES = {
  LOGIN: 'Login',
  SIGNUP: 'SignUp',
  HOME: 'Home',
  QUIZ: 'Quiz',
  QUIZ_RESULT: 'QuizResult',
  PROFILE: 'Profile',
  ADMIN_HOME: 'AdminHome',
  ADD_QUIZ: 'AddQuiz',
  ADD_TOPIC: 'AddTopic',
  EDIT_QUIZ: 'EditQuiz',
  EDIT_TOPIC: 'EditTopic',
}; 