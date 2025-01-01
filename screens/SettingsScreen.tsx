import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getThemeColors, spacing, typography } from '../styles/theme';
import AnimatedSettingItem from '../components/AnimatedSettingItem';
import PageTransition from '../components/PageTransition';
import SharedElement from '../components/SharedElement';

export default function SettingsScreen() {
  const { isDark, toggleTheme } = useTheme();
  const colors = getThemeColors(isDark);

  return (
    <PageTransition>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <SharedElement id="settings-account">
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
            <AnimatedSettingItem
              icon="user"
              title="Personal Information"
              description="Update your profile details"
              onPress={() => {}}
            />
            <AnimatedSettingItem
              icon="lock"
              title="Security"
              description="Password and authentication"
              onPress={() => {}}
            />
            <AnimatedSettingItem
              icon="bell"
              title="Notifications"
              description="Manage your notifications"
              hasSwitch
              onToggle={() => {}}
            />
          </View>
        </SharedElement>

        <SharedElement id="settings-preferences">
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
            <AnimatedSettingItem
              icon="moon-o"
              title="Dark Mode"
              description="Switch between light and dark theme"
              hasSwitch
              isEnabled={isDark}
              onToggle={toggleTheme}
            />
            <AnimatedSettingItem
              icon="globe"
              title="Language"
              description="Choose your preferred language"
              onPress={() => {}}
            />
          </View>
        </SharedElement>

        <SharedElement id="settings-support">
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
            <AnimatedSettingItem
              icon="question-circle"
              title="Help Center"
              description="Get help and support"
              onPress={() => {}}
            />
            <AnimatedSettingItem
              icon="info-circle"
              title="About"
              description="App version and information"
              onPress={() => {}}
            />
          </View>
        </SharedElement>
      </ScrollView>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.header,
    fontSize: 18,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
});
