import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Share,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius, fontSize } from '../config/theme';
import api, { API_URL } from '../config/api';

export default function DogDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { dogId } = route.params;
  const [dog, setDog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDog();
  }, [dogId]);

  const loadDog = async () => {
    try {
      const response = await api.get(`/api/dogs/${dogId}`);
      setDog(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const profileUrl = `${API_URL}/pet/${dog.access_code}`;
    try {
      await Share.share({
        message: `Veja o perfil de ${dog.name} no PetWalker: ${profileUrl}`,
        url: profileUrl,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const handleUploadMedia = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const formData = new FormData();
      
      const uriParts = asset.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      formData.append('file', {
        uri: asset.uri,
        name: `media.${fileType}`,
        type: asset.type === 'video' ? `video/${fileType}` : `image/${fileType}`,
      });
      formData.append('caption', '');

      try {
        await api.post(`/api/dogs/${dogId}/media`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Alert.alert('Sucesso', 'Mídia enviada com sucesso!');
        loadDog();
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível enviar a mídia');
      }
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAge = (months) => {
    if (!months) return '-';
    if (months >= 12) return `${Math.floor(months / 12)} anos`;
    return `${months} meses`;
  };

  if (loading || !dog) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{dog.name}</Text>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Perfil */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          {dog.photo_url ? (
            <Image source={{ uri: dog.photo_url }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>🐕</Text>
          )}
        </View>
        <Text style={styles.dogName}>{dog.name}</Text>
        <Text style={styles.dogBreed}>{dog.breed || 'Sem raça definida'}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatAge(dog.age)}</Text>
            <Text style={styles.statLabel}>Idade</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{dog.weight ? `${dog.weight} kg` : '-'}</Text>
            <Text style={styles.statLabel}>Peso</Text>
          </View>
        </View>

        {dog.description && (
          <Text style={styles.description}>{dog.description}</Text>
        )}
      </View>

      {/* Passeios */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚶 Passeios Recentes</Text>
        {dog.walks?.length > 0 ? (
          dog.walks.slice(0, 3).map((walk) => (
            <View key={walk.id} style={styles.scheduleItem}>
              <View style={[styles.scheduleIcon, { backgroundColor: colors.primary }]}>
                <Text style={styles.scheduleIconText}>🚶</Text>
              </View>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleDate}>{formatDate(walk.scheduled_date)}</Text>
                <Text style={styles.scheduleDetails}>
                  {walk.duration_minutes} min • {walk.location || 'Local não informado'}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: walk.status === 'concluido' ? colors.success + '25' : colors.warning + '25' }]}>
                <Text style={[styles.badgeText, { color: walk.status === 'concluido' ? colors.success : colors.warning }]}>
                  {walk.status}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhum passeio registrado</Text>
          </View>
        )}
      </View>

      {/* Adestramento */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎓 Sessões de Adestramento</Text>
        {dog.trainings?.length > 0 ? (
          dog.trainings.slice(0, 3).map((training) => (
            <View key={training.id} style={styles.scheduleItem}>
              <View style={[styles.scheduleIcon, { backgroundColor: colors.secondary }]}>
                <Text style={styles.scheduleIconText}>🎓</Text>
              </View>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleDate}>{formatDate(training.scheduled_date)}</Text>
                <Text style={styles.scheduleDetails}>
                  {training.training_type} • {training.duration_minutes} min
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: training.status === 'concluido' ? colors.success + '25' : colors.warning + '25' }]}>
                <Text style={[styles.badgeText, { color: training.status === 'concluido' ? colors.success : colors.warning }]}>
                  {training.status}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhuma sessão registrada</Text>
          </View>
        )}
      </View>

      {/* Galeria */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📸 Galeria</Text>
          <TouchableOpacity style={styles.addMediaBtn} onPress={handleUploadMedia}>
            <Ionicons name="add" size={20} color={colors.text} />
            <Text style={styles.addMediaText}>Adicionar</Text>
          </TouchableOpacity>
        </View>
        
        {dog.media?.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {dog.media.map((item) => (
              <View key={item.id} style={styles.mediaItem}>
                <Image 
                  source={{ uri: `${API_URL}${item.file_path}` }} 
                  style={styles.mediaImage}
                />
                {item.file_type === 'video' && (
                  <View style={styles.playIcon}>
                    <Text>▶️</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhuma mídia adicionada</Text>
          </View>
        )}
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
  },
  profileCard: {
    backgroundColor: colors.card,
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.cardHover,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.primary,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 60,
  },
  dogName: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  dogBreed: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.xxl,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.secondary,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  section: {
    margin: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardHover,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  scheduleIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleIconText: {
    fontSize: 20,
  },
  scheduleInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  scheduleDate: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  scheduleDetails: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  addMediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardHover,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  addMediaText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  mediaItem: {
    width: 150,
    height: 150,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
    overflow: 'hidden',
    backgroundColor: colors.cardHover,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
});

