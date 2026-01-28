import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Share,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../config/theme';
import api, { API_URL } from '../config/api';

export default function DogsScreen() {
  const navigation = useNavigation();
  const [dogs, setDogs] = useState([]);
  const [owners, setOwners] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [dogsRes, ownersRes] = await Promise.all([
        api.get('/api/dogs'),
        api.get('/api/users'),
      ]);
      setDogs(dogsRes.data);
      setOwners(ownersRes.data);
    } catch (error) {
      console.error('Erro ao carregar cães:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getOwnerName = (ownerId) => {
    const owner = owners.find(o => o.id === ownerId);
    return owner?.name || '-';
  };

  const formatAge = (months) => {
    if (!months) return '-';
    if (months >= 12) return `${Math.floor(months / 12)} anos`;
    return `${months} meses`;
  };

  const handleShare = async (dog) => {
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

  const handleDelete = (dog) => {
    Alert.alert(
      'Excluir Cão',
      `Tem certeza que deseja excluir ${dog.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/dogs/${dog.id}`);
              loadData();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir');
            }
          },
        },
      ]
    );
  };

  const renderDog = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🐕</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.dogName}>{item.name}</Text>
          <Text style={styles.dogBreed}>{item.breed || 'Sem raça definida'}</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Idade</Text>
          <Text style={styles.detailValue}>{formatAge(item.age)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Peso</Text>
          <Text style={styles.detailValue}>{item.weight ? `${item.weight} kg` : '-'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Dono</Text>
          <Text style={styles.detailValue}>{getOwnerName(item.owner_id)}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => navigation.navigate('DogDetail', { dogId: item.id })}
        >
          <Ionicons name="eye-outline" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => handleShare(item)}
        >
          <Ionicons name="share-outline" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🐶 Cães</Text>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddDog')}
        >
          <Ionicons name="add" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={dogs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDog}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🐕</Text>
            <Text style={styles.emptyText}>Nenhum cão cadastrado</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.cardHover,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarText: {
    fontSize: 28,
  },
  cardInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  dogName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  dogBreed: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  cardDetails: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.cardHover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
  },
  empty: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: spacing.md,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
});

