import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../config/theme';
import api from '../config/api';

export default function TrainingsScreen() {
  const navigation = useNavigation();
  const [trainings, setTrainings] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [trainingsRes, dogsRes] = await Promise.all([
        api.get('/api/trainings'),
        api.get('/api/dogs'),
      ]);
      setTrainings(trainingsRes.data);
      setDogs(dogsRes.data);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
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

  const getDogName = (dogId) => {
    const dog = dogs.find(d => d.id === dogId);
    return dog?.name || '-';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const statusColors = {
      agendado: colors.warning,
      em_andamento: colors.secondary,
      concluido: colors.success,
      cancelado: colors.danger,
    };
    return statusColors[status] || colors.textMuted;
  };

  const handleDelete = (training) => {
    Alert.alert(
      'Excluir Sessão',
      'Tem certeza que deseja excluir esta sessão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/trainings/${training.id}`);
              loadData();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir');
            }
          },
        },
      ]
    );
  };

  const renderTraining = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🎓</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.dogName}>{getDogName(item.dog_id)}</Text>
          <Text style={styles.trainingType}>{item.training_type}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '25' }]}>
          <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
          <Text style={styles.detailText}>{formatDate(item.scheduled_date)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={colors.textMuted} />
          <Text style={styles.detailText}>{item.duration_minutes} min</Text>
        </View>
      </View>

      {item.progress_report && (
        <View style={styles.progressReport}>
          <Text style={styles.progressLabel}>Relatório de Progresso:</Text>
          <Text style={styles.progressText}>{item.progress_report}</Text>
        </View>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => navigation.navigate('EditTraining', { training: item })}
        >
          <Ionicons name="pencil-outline" size={18} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎓 Adestramento</Text>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddTraining')}
        >
          <Ionicons name="add" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={trainings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTraining}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🎓</Text>
            <Text style={styles.emptyText}>Nenhuma sessão agendada</Text>
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
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: spacing.md,
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
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  cardInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  dogName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  trainingType: {
    fontSize: fontSize.sm,
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
  cardDetails: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  progressReport: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.cardHover,
    borderRadius: borderRadius.sm,
  },
  progressLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  progressText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: {
    width: 36,
    height: 36,
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

