import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getThemeColors, spacing } from '../../styles/theme';
import GroupChat from '../../components/GroupChat';

export default function GroupChatScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  const handleAddMembers = () => {
    router.push(`/group-chat/${id}/add-members`);
  };

  const handleLeaveGroup = async () => {
    if (!user) return;

    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore()
                .collection('groups')
                .doc(id as string)
                .collection('members')
                .doc(user.uid)
                .delete();

              router.back();
            } catch (error) {
              console.error('Error leaving group:', error);
              Alert.alert('Error', 'Failed to leave group');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GroupChat
        groupId={id as string}
        onAddMembers={handleAddMembers}
        onLeaveGroup={handleLeaveGroup}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
