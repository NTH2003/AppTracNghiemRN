import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';
import { getUserProfile } from '../services/quiz.service';
import { UserProvider, useUser } from '../context/UserContext';

import Login from '../screens/Login';
import SignUp from '../screens/SignUp';
import Home from '../screens/Home';
import Quiz from '../screens/Quiz';
import QuizResult from '../screens/QuizResult';
import Profile from '../screens/Profile';
import AddTopic from '../screens/AddTopic';
import AddQuiz from '../screens/AddQuiz';
import AdminHome from '../screens/AdminHome';
import Topic from '../screens/Topic';
import EditProfile from '../screens/EditProfile';
import ChangePassword from '../screens/ChangePassword';
import Leaderboard from '../screens/Leaderboard';
import TopicDetail from '../screens/TopicDetail';
import QuizPreview from '../screens/QuizPreview';
import EditQuiz from '../screens/EditQuiz';
import EditTopic from '../screens/EditTopic';
import Settings from '../screens/Settings';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Theme colors để match với Home screen
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  accent: '#ff6b6b',
  white: '#ffffff',
  background: '#f8f9fa',
  text: '#333333',
  textLight: '#666666',
};

// Custom Header Component cho Home
function CustomHomeHeader({ navigation }) {
  return (
    <View style={styles.homeHeader}>
      <TouchableOpacity 
        onPress={() => navigation.openDrawer()}
        style={styles.menuButton}
        activeOpacity={0.8}
      >
        <Icon name="menu" size={28} color={COLORS.white} />
      </TouchableOpacity>
      
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>🎯 Quiz Master</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.notificationButton}
        activeOpacity={0.8}
      >
        <Icon name="notifications" size={24} color={COLORS.white} />
        <View style={styles.notificationBadge}>
          <Text style={styles.badgeText}>3</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

// Custom Drawer Content Component
function CustomDrawerContent(props) {
  const { user } = useUser();

  return (
    <View style={styles.drawerContainer}>
      {/* Header */}
      <View style={styles.drawerHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.userName}>{user?.username || '...'}</Text>
        <Text style={styles.userEmail}>{user?.email || '...'}</Text>
      </View>
      
      {/* Menu Items */}
      <View style={styles.drawerContent}>
        {props.state.routes.map((route, index) => {
          const isFocused = props.state.index === index;
          
          const onPress = () => {
            const event = props.navigation.emit({
              type: 'drawerItemPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              props.navigation.navigate(route.name);
            }
          };

          // Icon mapping
          const getIcon = (routeName) => {
            switch (routeName) {
              case 'Trang chủ': return 'home';
              case 'Thông tin cá nhân': return 'person';
              case 'Bảng xếp hạng': return 'bar-chart';
              case 'Thống kê': return 'bar-chart';
              case 'Cài đặt': return 'settings';
              case 'Đăng xuất': return 'logout';
              case 'Quản trị': return 'dashboard';
              case 'Thêm chủ đề': return 'add-circle';
              case 'Thêm câu hỏi': return 'quiz';
              case 'ThongKe': return 'bar-chart';
              default: return 'circle';
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={[
                styles.drawerItem,
                isFocused && styles.drawerItemActive
              ]}
              onPress={onPress}
              activeOpacity={0.8}
            >
              <Icon 
                name={getIcon(route.name)} 
                size={24} 
                color={isFocused ? COLORS.white : COLORS.text} 
              />
              <Text style={[
                styles.drawerItemText,
                isFocused && styles.drawerItemTextActive
              ]}>
                {route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* Footer */}
      <View style={styles.drawerFooter}>
        <Text style={styles.footerText}>Quiz Master v1.0</Text>
      </View>
    </View>
  );
}

// User Drawer Navigation
function UserDrawerScreens() {
  return (
    <Drawer.Navigator
      initialRouteName="Trang chủ"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: COLORS.white,
          width: 280,
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <Drawer.Screen 
        name="Trang chủ" 
        component={Home}
        options={({ navigation }) => ({
          header: () => <CustomHomeHeader navigation={navigation} />,
        })}
      />
      <Drawer.Screen 
        name="Thông tin cá nhân" 
        component={Profile}
        options={{
          title: '👤 Thông tin cá nhân',
        }}
      />
      <Drawer.Screen 
        name="Bảng xếp hạng" 
        component={Leaderboard}
        options={{
          title: '📊 Bảng xếp hạng',
        }}
      />
      <Drawer.Screen 
        name="Cài đặt" 
        component={Settings}
        options={{
          title: '⚙️ Cài đặt',
        }}
      />
      <Drawer.Screen 
        name="Đăng xuất" 
        component={Login} 
        options={{ 
          headerShown: false,
        }} 
      />
    </Drawer.Navigator>
  );
}

// Admin Drawer Navigation
function AdminDrawerScreens() {
  return (
    <Drawer.Navigator
      initialRouteName="Quản trị"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: COLORS.white,
          width: 280,
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <Drawer.Screen 
        name="Quản trị" 
        component={AdminHome}
        options={{
          title: '🏠 Quản trị',
        }}
      />
      <Drawer.Screen 
        name="Thêm chủ đề" 
        component={AddTopic}
        options={{
          title: '➕ Thêm chủ đề',
        }}
      />
      <Drawer.Screen 
        name="Thêm câu hỏi" 
        component={AddQuiz}
        options={{
          title: '❓ Thêm câu hỏi',
        }}
      />
      <Drawer.Screen 
        name="Đăng xuất" 
        component={Login} 
        options={{ 
          headerShown: false,
        }} 
      />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator 
          screenOptions={{
            headerStyle: {
              backgroundColor: COLORS.primary,
              elevation: 4,
              shadowOpacity: 0.3,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
            },
            headerTintColor: COLORS.white,
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
            },
            cardStyle: {
              backgroundColor: COLORS.background,
            },
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="SignUp" 
            component={SignUp}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="UserMain" 
            component={UserDrawerScreens}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AdminMain" 
            component={AdminDrawerScreens}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Topic" 
            component={Topic}
            options={({ navigation }) => ({
              title: '📚 Chọn chủ đề',
              headerLeft: () => (
                <TouchableOpacity 
                  onPress={() => navigation.goBack()}
                  style={styles.headerButton}
                  activeOpacity={0.8}
                >
                  <Icon name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen 
            name="Quiz" 
            component={Quiz}
            options={({ navigation, route }) => ({
              title: `�� ${route.params?.quizTitle || 'Làm bài quiz'}`,
              headerLeft: () => (
                <TouchableOpacity 
                  onPress={() => navigation.goBack()}
                  style={styles.headerButton}
                  activeOpacity={0.8}
                >
                  <Icon name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
              ),
              headerRight: () => (
                <TouchableOpacity 
                  onPress={() => navigation.navigate('UserMain')}
                  style={styles.headerButton}
                  activeOpacity={0.8}
                >
                  <Icon name="home" size={24} color={COLORS.white} />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen 
            name="QuizResult" 
            component={QuizResult}
            options={({ navigation }) => ({
              title: '🏆 Kết quả',
              headerLeft: () => null, // Không cho phép quay lại
              headerRight: () => (
                <TouchableOpacity 
                  onPress={() => navigation.navigate('UserMain')}
                  style={styles.headerButton}
                  activeOpacity={0.8}
                >
                  <Icon name="home" size={24} color={COLORS.white} />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen name="EditProfile" component={EditProfile} options={{ title: "Chỉnh sửa hồ sơ" }} />
          <Stack.Screen 
            name="ChangePassword" 
            component={ChangePassword} 
            options={({ navigation }) => ({ 
              title: "🔐 Đổi mật khẩu",
              headerLeft: () => (
                <TouchableOpacity 
                  onPress={() => navigation.goBack()}
                  style={styles.headerButton}
                  activeOpacity={0.8}
                >
                  <Icon name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
              ),
            })} 
          />
          <Stack.Screen name="ThongKe" component={Leaderboard} options={{ title: 'Thống kê' }} />
          <Stack.Screen
            name="TopicDetail"
            component={TopicDetail}
            options={({ route }) => ({
              title: route.params?.topicName || 'Quiz theo chủ đề'
            })}
          />
          <Stack.Screen name="Leaderboard" component={Leaderboard} />
          <Stack.Screen name="QuizPreview" component={QuizPreview} />
          <Stack.Screen name="EditQuiz" component={EditQuiz} />
          <Stack.Screen
            name="EditTopic"
            component={EditTopic}
            options={{ title: 'Sửa chủ đề' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  // Custom Home Header Styles
  homeHeader: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50, // StatusBar height
    paddingBottom: 15,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Drawer Styles
  drawerContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  drawerHeader: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 40,
    color: COLORS.white,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  drawerContent: {
    flex: 1,
    paddingTop: 20,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 12,
    marginBottom: 5,
  },
  drawerItemActive: {
    backgroundColor: COLORS.primary,
  },
  drawerItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: 15,
  },
  drawerItemTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  
  // Header Button Styles
  headerButton: {
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});