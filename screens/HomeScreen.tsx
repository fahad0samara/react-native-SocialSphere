import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import AnimatedCard from '../components/AnimatedCard';
import { useTheme } from '../context/ThemeContext';
import { getThemeColors, spacing, typography } from '../styles/theme';
import PageTransition from '../components/PageTransition';
import FloatingActionButton from '../components/FloatingActionButton';

type CardProps = {
  title: string;
  description: string;
  onPress: () => void;
};

const Card = ({ title, description, onPress }: CardProps) => (
  <AnimatedCard title={title} description={description} onPress={onPress} />
);

export default function HomeScreen() {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  const actions = [
    {
      icon: 'pencil',
      onPress: () => console.log('Edit'),
    },
    {
      icon: 'camera',
      onPress: () => console.log('Camera'),
    },
    {
      icon: 'share',
      onPress: () => console.log('Share'),
    },
  ];

  return (
    <PageTransition>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView>
          <View style={[styles.header, { backgroundColor: colors.primary }]}>
            <Text style={[styles.title, { color: colors.card }]}>Welcome Back!</Text>
            <Text style={[styles.subtitle, { color: colors.card }]}>
              Explore your dashboard
            </Text>
          </View>

          <View style={styles.cardsContainer}>
            <Card
              title="My Profile"
              description="View and edit your profile settings"
              onPress={() => router.push('/profile')}
            />
            <Card
              title="Settings"
              description="Customize your app preferences"
              onPress={() => router.push('/settings')}
            />
            <Card
              title="Statistics"
              description="View your activity statistics"
              onPress={() => {}}
            />
          </View>
        </ScrollView>
        
        <FloatingActionButton actions={actions} />
      </View>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
  },
  title: {
    ...typography.header,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    opacity: 0.8,
  },
  cardsContainer: {
    padding: spacing.md,
  },
});
