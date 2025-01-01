import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getThemeColors, spacing, typography } from '../../styles/theme';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const { user } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Image
          source={{ uri: user?.photoURL || 'https://via.placeholder.com/100' }}
          style={styles.avatar}
        />
        <Text style={[styles.name, { color: colors.text }]}>
          {user?.displayName || 'User Name'}
        </Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>
          {user?.email || 'user@example.com'}
        </Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.text }]}>120</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Posts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.text }]}>1.5K</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Followers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.text }]}>890</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Following</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.editButton, { backgroundColor: colors.primary }]}
        onPress={() => {}}>
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.md,
  },
  name: {
    ...typography.title,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.body,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.title,
    fontWeight: '600',
  },
  statLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  editButton: {
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    ...typography.button,
    fontWeight: '600',
  },
});
