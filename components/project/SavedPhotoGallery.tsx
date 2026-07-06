import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

import type { Photo } from '../../types/entities';

type SavedPhotoGalleryProps = {
  photos: Photo[];
  onDelete: (photoId: number) => void;
};

export function SavedPhotoGallery({ photos, onDelete }: SavedPhotoGalleryProps) {
  if (photos.length === 0) {
    return (
      <Text variant="bodyMedium" style={styles.empty}>
        Сохранённых фотографий нет
      </Text>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
      {photos.map((photo) => (
        <View key={photo.id} style={styles.photoWrap}>
          <Image source={{ uri: photo.filePath }} style={styles.photo} />
          <IconButton
            icon="close"
            size={16}
            style={styles.removeButton}
            onPress={() => onDelete(photo.id)}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  gallery: {
    marginBottom: 8,
  },
  photoWrap: {
    marginRight: 8,
    position: 'relative',
  },
  photo: {
    width: 96,
    height: 96,
    borderRadius: 8,
    backgroundColor: '#e3e7ee',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ffffff',
    margin: 0,
  },
  empty: {
    color: '#6b7280',
    marginBottom: 8,
  },
});
