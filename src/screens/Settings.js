import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Settings = () => {
  const navigation = useNavigation();
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // TODO: Thêm logic đổi theme toàn app nếu muốn
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ChangePassword')}>
        <Icon name="lock" size={22} color="#667eea" style={styles.icon} />
        <Text style={styles.itemText}>Đổi mật khẩu</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('EditProfile')}>
        <Icon name="person" size={22} color="#667eea" style={styles.icon} />
        <Text style={styles.itemText}>Chỉnh sửa thông tin cá nhân</Text>
      </TouchableOpacity>

      <View style={styles.item}>
        <Icon name="brightness-6" size={22} color="#667eea" style={styles.icon} />
        <Text style={styles.itemText}>Chế độ tối</Text>
        <Switch
          value={isDarkMode}
          onValueChange={handleToggleTheme}
        />
      </View>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Đăng xuất')}>
        <Icon name="logout" size={22} color="#ff6b6b" style={styles.icon} />
        <Text style={[styles.itemText, { color: '#ff6b6b' }]}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 32, alignSelf: 'center' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  icon: { marginRight: 16 },
  itemText: { fontSize: 16, color: '#333', flex: 1 },
});

export default Settings; 