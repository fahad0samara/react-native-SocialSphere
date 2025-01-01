import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { getThemeColors, spacing, typography } from '../../../styles/theme';

interface User {
  id: string;
  displayName: string;
  photoURL: string;
  selected?: boolean;
}

export default function AddMembersScreen() {
  const { id } = useLocalSearchParams();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const { user } = useAuth();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  useEffect(() => {
    const loadUsers = async () => {
      if (!search.trim()) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const existingMembers = await firestore()
          .collection('groups')
          .doc(id as string)
          .collection('members')
          .get();

        const memberIds = new Set(
          existingMembers.docs.map((doc) => doc.data().userId)
        );

        const usersSnapshot = await firestore()
          .collection('users')
          .where('displayName', '>=', search)
          .where('displayName', '<=', search + '\uf8ff')
          .limit(20)
          .get();

        setUsers(
          usersSnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
              selected: false,
            }))
            .filter((u) => !memberIds.has(u.id))
        );
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(loadUsers, 500);
    return () => clearTimeout(debounce);
  }, [search, id]);

  const toggleUser = (userId: string) => {
    setUsers(
      users.map((u) =>
        u.id === userId ? { ...u, selected: !u.selected } : u
      )
    );
  };

  const handleAddMembers = async () => {
    const selectedUsers = users.filter((u) => u.selected);
    if (selectedUsers.length === 0) return;

    setAdding(true);
    try {
      const batch = firestore().batch();
      selectedUsers.forEach((selectedUser) => {
        const memberRef = firestore()
          .collection('groups')
          .doc(id as string)
          .collection('members')
          .doc(selectedUser.id);

        batch.set(memberRef, {
          userId: selectedUser.id,
          role: 'member',
          joinedAt: Date.now(),
        });
      });

      await batch.commit();
      router.back();
    } catch (error) {
      console.error('Error adding members:', error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { color: colors.text, backgroundColor: colors.card }]}
          placeholder="Search users..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          style={styles.loading}
          color={colors.primary}
          size="large"
        />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.userItem,
                { backgroundColor: colors.card },
                item.selected && styles.selectedUser,
              ]}
              onPress={() => toggleUser(item.id)}
            >
              <Image source={{ uri: item.photoURL }} style={styles.avatar} />
              <Text style={[styles.userName, { color: colors.text }]}>
                {item.displayName}
              </Text>
              {item.selected && (
                <FontAwesome
                  name="check-circle"
                  size={24}
                  color={colors.primary}
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity
        style={[
          styles.addButton,
          {
            backgroundColor: colors.primary,
            opacity:
              adding || users.filter((u) => u.selected).length === 0 ? 0.5 : 1,
          },
        ]}
        onPress={handleAddMembers}
        disabled={adding || users.filter((u) => u.selected).length === 0}
      >
        {adding ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.addButtonText}>
            Add {users.filter((u) => u.selected).length} Members
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: spacing.md,
  },
  searchInput: {
    ...typography.body,
    padding: spacing.md,
    borderRadius: 12,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: spacing.md,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  selectedUser: {
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.md,
  },
  userName: {
    ...typography.body,
    flex: 1,
  },
  checkIcon: {
    marginLeft: spacing.sm,
  },
  addButton: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    ...typography.subtitle,
    fontWeight: '600',
  },
});
