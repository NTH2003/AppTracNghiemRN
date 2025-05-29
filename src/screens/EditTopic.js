import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';

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
};

const EditTopic = ({ route, navigation }) => {
  const { topicId } = route.params;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [nameError, setNameError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchTopic();
  }, [topicId]);

  useEffect(() => {
    // Check if there are changes
    const changed = name !== originalData.name || description !== originalData.description;
    setHasChanges(changed);
  }, [name, description, originalData]);

  const fetchTopic = async () => {
    try {
      setLoading(true);
      const doc = await firestore().collection('topics').doc(topicId).get();
      if (doc.exists) {
        const data = doc.data();
        const topicName = data.name || '';
        const topicDescription = data.description || '';
        
        setName(topicName);
        setDescription(topicDescription);
        setOriginalData({ name: topicName, description: topicDescription });
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy chủ đề!');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching topic:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin chủ đề!');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async () => {
    if (!validateName(name)) {
      return;
    }

    try {
      setSaving(true);
      await firestore().collection('topics').doc(topicId).update({
        name: name.trim(),
        description: description.trim(),
        updatedAt: new Date().toISOString(),
      });

      Alert.alert(
        'Thành công',
        'Chủ đề đã được cập nhật!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error updating topic:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật chủ đề. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Hủy thay đổi',
        'Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu.',
        [
          { text: 'Tiếp tục chỉnh sửa', style: 'cancel' },
          { text: 'Hủy', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={COLORS.card} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa chủ đề</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin chủ đề...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
                <MaterialCommunityIcons name="book-edit" size={48} color={COLORS.primary} />
              </View>
              <Text style={styles.introTitle}>Chỉnh sửa thông tin</Text>
              <Text style={styles.introSubtitle}>
                Cập nhật tên và mô tả cho chủ đề của bạn
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
                    multiline
                    numberOfLines={4}
                    maxLength={200}
                    textAlignVertical="top"
                  />
                </View>
                <Text style={styles.helperText}>{description.length}/200 ký tự</Text>
              </View>

              {/* Changes indicator */}
              {hasChanges && (
                <View style={styles.changesIndicator}>
                  <MaterialCommunityIcons name="information" size={16} color={COLORS.warning} />
                  <Text style={styles.changesText}>Bạn có thay đổi chưa được lưu</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (!hasChanges || nameError || saving) && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={!hasChanges || nameError || saving}
          >
            {saving ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.card} />
                <Text style={styles.saveButtonText}>Đang lưu...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <MaterialCommunityIcons name="content-save" size={20} color={COLORS.card} />
                <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
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
  headerButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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

  // Changes Indicator
  changesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.warning}15`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  changesText: {
    fontSize: 12,
    color: COLORS.warning,
    marginLeft: 6,
    fontWeight: '500',
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
  saveButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.card,
    marginLeft: 8,
  },
});

export default EditTopic;