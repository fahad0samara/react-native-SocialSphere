import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { ChatProvider } from '../context/ChatContext';
import { getThemeColors } from '../styles/theme';

function TabLayout() {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="user" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <Stack>
            <Stack.Screen name="(tabs)" component={TabLayout} options={{ headerShown: false }} />
          </Stack>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
