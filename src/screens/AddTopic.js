import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';

const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4caf50',
  background: '#f8f9fa',
  card: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e9ecef',
  inputBorder: '#ddd',
  inputFocus: '#667eea',
  error: '#f44336',
  placeholder: '#999999',
};

const AddTopic = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);

  const validateName = (text) => {
    if (!text.trim()) {
      setNameError('Tên chủ đề không được để trống');
      return false;
    }
    if (text.trim().length < 2) {
      setNameError('Tên chủ đề phải có ít nhất 2 ký tự');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleNameChange = (text) => {
    setName(text);
    if (nameError) {
      validateName(text);
    }
  };

  const handleAddTopic = async () => {
    if (!validateName(name)) {
      return;
    }

    try {
      setLoading(true);
      await firestore().collection('topics').add({
        name: name.trim(),
        description: description.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      });

      Alert.alert(
        'Thành công',
        'Chủ đề đã được thêm thành công!',
        [{ 
          text: 'OK', 
          onPress: () => navigation.goBack() 
        }]
      );
    } catch (error) {
      console.error('Error adding topic:', error);
      Alert.alert('Lỗi', 'Không thể thêm chủ đề. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (name.trim() || description.trim()) {
      Alert.alert(
        'Hủy thêm chủ đề',
        'Bạn có chắc chắn muốn hủy? Dữ liệu đã nhập sẽ bị mất.',
        [
          { text: 'Tiếp tục', style: 'cancel' },
          { text: 'Hủy', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

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
            {/* Icon và mô tả */}
            <View style={styles.introSection}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="book-plus" size={48} color={COLORS.primary} />
              </View>
              <Text style={styles.introTitle}>Tạo chủ đề mới</Text>
              <Text style={styles.introSubtitle}>
                Thêm chủ đề mới để tổ chức các quiz của bạn một cách hiệu quả
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formSection}>
              {/* Tên chủ đề */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Tên chủ đề <Text style={styles.required}>*</Text>
                </Text>
                <View style={[
                  styles.inputContainer,
                  focusedInput === 'name' && styles.inputContainerFocused,
                  nameError && styles.inputContainerError
                ]}>
                  <MaterialCommunityIcons 
                    name="book-outline" 
                    size={20} 
                    color={nameError ? COLORS.error : (focusedInput === 'name' ? COLORS.inputFocus : COLORS.textLight)} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={handleNameChange}
                    onFocus={() => setFocusedInput('name')}
                    onBlur={() => {
                      setFocusedInput(null);
                      validateName(name);
                    }}
                    placeholder="Nhập tên chủ đề"
                    placeholderTextColor={COLORS.placeholder}
                    maxLength={50}
                  />
                </View>
                {nameError ? (
                  <View style={styles.errorContainer}>
                    <MaterialCommunityIcons name="alert-circle" size={16} color={COLORS.error} />
                    <Text style={styles.errorText}>{nameError}</Text>
                  </View>
                ) : null}
                <Text style={styles.helperText}>{name.length}/50 ký tự</Text>
              </View>

              {/* Mô tả */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mô tả (Tùy chọn)</Text>
                <View style={[
                  styles.inputContainer,
                  styles.textAreaContainer,
                  focusedInput === 'description' && styles.inputContainerFocused
                ]}>
                  <MaterialCommunityIcons 
                    name="text" 
                    size={20} 
                    color={focusedInput === 'description' ? COLORS.inputFocus : COLORS.textLight} 
                    style={[styles.inputIcon, styles.textAreaIcon]}
                  />
                  <TextInput
                    style={[styles.input, styles.textAreaInput]}
                    value={description}
                    onChangeText={setDescription}
                    onFocus={() => setFocusedInput('description')}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="Nhập mô tả cho chủ đề này..."
                    placeholderTextColor={COLORS.placeholder}
                    multiline={true}
                    numberOfLines={4}
                    maxLength={200}
                    textAlignVertical="top"
                  />
                </View>
                <Text style={styles.helperText}>{description.length}/200 ký tự</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!name.trim() || nameError || loading) && styles.submitButtonDisabled
            ]}
            onPress={handleAddTopic}
            disabled={!name.trim() || nameError || loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.card} />
                <Text style={styles.submitButtonText}>Đang thêm...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <MaterialCommunityIcons name="plus" size={20} color={COLORS.card} />
                <Text style={styles.submitButtonText}>Thêm chủ đề</Text>
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
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.card,
  },
  headerPlaceholder: {
    width: 40,
  },

  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },

  // Intro Section
  introSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  introSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  // Form Section
  formSection: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputGroup: {
    marginBottom: 24,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputContainerFocused: {
    borderColor: COLORS.inputFocus,
    backgroundColor: COLORS.card,
  },
  inputContainerError: {
    borderColor: COLORS.error,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  textAreaIcon: {
    marginTop: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 12,
  },
  textAreaInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
    textAlign: 'right',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginLeft: 4,
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

export default AddTopic;