import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getThemeColors, spacing, typography } from '../../styles/theme';
import Story from '../../components/Story';

export default function HomeScreen() {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={styles.storiesContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Stories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Story />
            <Story />
            <Story />
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  storiesContainer: {
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
});
