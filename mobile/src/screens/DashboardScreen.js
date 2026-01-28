import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState({
    total_dogs: 0,
    total_owners: 0,
    pending_walks: 0,
    pending_trainings: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const response = await api.get('/api/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.name}! 👋</Text>
          <Text style={styles.subtitle}>Visão geral do seu negócio</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.statOrange]}>
          <Text style={styles.statIcon}>🐶</Text>
          <Text style={styles.statValue}>{stats.total_dogs}</Text>
          <Text style={styles.statLabel}>Cães</Text>
        </View>

        <View style={[styles.statCard, styles.statCoral]}>
          <Text style={styles.statIcon}>👤</Text>
          <Text style={styles.statValue}>{stats.total_owners}</Text>
          <Text style={styles.statLabel}>Donos</Text>
        </View>

        <View style={[styles.statCard, styles.statMint]}>
          <Text style={styles.statIcon}>🚶</Text>
          <Text style={styles.statValue}>{stats.pending_walks}</Text>
          <Text style={styles.statLabel}>Passeios Agendados</Text>
        </View>

        <View style={[styles.statCard, styles.statYellow]}>
          <Text style={styles.statIcon}>🎓</Text>
          <Text style={styles.statValue}>{stats.pending_trainings}</Text>
          <Text style={styles.statLabel}>Sessões Agendadas</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>➕🐶</Text>
            <Text style={styles.actionText}>Novo Cão</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>➕🚶</Text>
            <Text style={styles.actionText}>Novo Passeio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>➕🎓</Text>
            <Text style={styles.actionText}>Nova Sessão</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  greeting: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    fontSize: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statOrange: {
    borderTopWidth: 4,
    borderTopColor: colors.primary,
  },
  statCoral: {
    borderTopWidth: 4,
    borderTopColor: colors.coral,
  },
  statMint: {
    borderTopWidth: 4,
    borderTopColor: colors.secondary,
  },
  statYellow: {
    borderTopWidth: 4,
    borderTopColor: colors.yellow,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  quickActions: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  actionText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});

