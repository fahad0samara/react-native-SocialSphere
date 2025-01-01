import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getThemeColors, spacing, typography } from '../../styles/theme';

export default function NewGroupScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets[0].uri) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (!user || !name.trim()) return;

    setLoading(true);
    try {
      let groupImage = null;
      if (image) {
        const filename = image.substring(image.lastIndexOf('/') + 1);
        const ref = storage().ref(`groups/${filename}`);
        await ref.putFile(image);
        groupImage = await ref.getDownloadURL();
      }

      const groupRef = firestore().collection('groups').doc();
      await groupRef.set({
        name: name.trim(),
        description: description.trim(),
        image: groupImage,
        createdBy: user.uid,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Add creator as admin
      await groupRef.collection('members').doc(user.uid).set({
        userId: user.uid,
        role: 'admin',
        joinedAt: Date.now(),
      });

      router.push(`/group-chat/${groupRef.id}/add-members`);
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.imageContainer}>
        <TouchableOpacity
          style={[styles.imageButton, { backgroundColor: colors.card }]}
          onPress={handleImagePick}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.groupImage} />
          ) : (
            <FontAwesome name="camera" size={24} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.card }]}
          placeholder="Group Name"
          placeholderTextColor={colors.textSecondary}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={[
            styles.input,
            styles.descriptionInput,
            { color: colors.text, backgroundColor: colors.card },
          ]}
          placeholder="Group Description (optional)"
          placeholderTextColor={colors.textSecondary}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity
          style={[
            styles.createButton,
            {
              backgroundColor: colors.primary,
              opacity: loading || !name.trim() ? 0.5 : 1,
            },
          ]}
          onPress={handleCreate}
          disabled={loading || !name.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Create Group</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  imageButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  form: {
    flex: 1,
  },
  input: {
    ...typography.body,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  createButton: {
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  createButtonText: {
    color: '#fff',
    ...typography.subtitle,
    fontWeight: '600',
  },
});
