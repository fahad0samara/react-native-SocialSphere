import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getThemeColors, spacing, typography } from '../styles/theme';
import PageTransition from '../components/PageTransition';

export default function CreatePostScreen() {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets[0].uri) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!content.trim() && !image) {
      Alert.alert('Error', 'Please add some content to your post');
      return;
    }

    setLoading(true);

    try {
      let imageUrl;
      if (image) {
        const filename = image.substring(image.lastIndexOf('/') + 1);
        const ref = storage().ref(`posts/${filename}`);
        await ref.putFile(image);
        imageUrl = await ref.getDownloadURL();
      }

      await firestore().collection('posts').add({
        userId: user?.uid,
        content,
        image: imageUrl,
        likes: [],
        comments: 0,
        timestamp: Date.now(),
      });

      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome name="times" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.postButton, { backgroundColor: colors.primary }]}
            onPress={handlePost}
            disabled={loading}
          >
            <Text style={styles.postButtonText}>
              {loading ? 'Posting...' : 'Post'}
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="What's on your mind?"
          placeholderTextColor={colors.textSecondary}
          multiline
          value={content}
          onChangeText={setContent}
        />

        {image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.removeImage}
              onPress={() => setImage(null)}
            >
              <FontAwesome name="times-circle" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolbarButton} onPress={pickImage}>
            <FontAwesome name="image" size={24} color={colors.primary} />
            <Text style={[styles.toolbarText, { color: colors.text }]}>
              Add Photo
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  postButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    ...typography.body,
    minHeight: 100,
  },
  imageContainer: {
    marginTop: spacing.md,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImage: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  toolbar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: spacing.md,
    marginTop: 'auto',
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toolbarText: {
    ...typography.body,
    fontWeight: '500',
  },
});
