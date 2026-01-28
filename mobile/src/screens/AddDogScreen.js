import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { colors, spacing, borderRadius, fontSize } from '../config/theme';
import api from '../config/api';

export default function AddDogScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [owners, setOwners] = useState([]);
  const [form, setForm] = useState({
    name: '',
    breed: '',
    age: '',
    weight: '',
    owner_id: '',
    description: '',
  });

  useEffect(() => {
    loadOwners();
  }, []);

  const loadOwners = async () => {
    try {
      const response = await api.get('/api/users');
      setOwners(response.data);
    } catch (error) {
      console.error('Erro ao carregar donos:', error);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.owner_id) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/dogs', {
        name: form.name,
        breed: form.breed || null,
        age: form.age ? parseInt(form.age) : null,
        weight: form.weight ? parseFloat(form.weight) : null,
        owner_id: parseInt(form.owner_id),
        description: form.description || null,
      });
      Alert.alert('Sucesso', 'Cão cadastrado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível cadastrar o cão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Novo Cão</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome do cão"
            placeholderTextColor={colors.textMuted}
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Raça</Text>
          <TextInput
            style={styles.input}
            placeholder="Raça do cão"
            placeholderTextColor={colors.textMuted}
            value={form.breed}
            onChangeText={(text) => setForm({ ...form, breed: text })}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Idade (meses)</Text>
            <TextInput
              style={styles.input}
              placeholder="12"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={form.age}
              onChangeText={(text) => setForm({ ...form, age: text })}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.md }]}>
            <Text style={styles.label}>Peso (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="10.5"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={form.weight}
              onChangeText={(text) => setForm({ ...form, weight: text })}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dono *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.owner_id}
              onValueChange={(value) => setForm({ ...form, owner_id: value })}
              style={styles.picker}
              dropdownIconColor={colors.text}
            >
              <Picker.Item label="Selecione o dono..." value="" color={colors.textMuted} />
              {owners.map((owner) => (
                <Picker.Item 
                  key={owner.id} 
                  label={owner.name} 
                  value={owner.id.toString()} 
                  color={colors.text}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Informações adicionais sobre o cão..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonIcon}>💾</Text>
              <Text style={styles.buttonText}>Salvar</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  form: {
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  pickerContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  picker: {
    color: colors.text,
    backgroundColor: 'transparent',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonIcon: {
    fontSize: fontSize.lg,
    marginRight: spacing.sm,
  },
  buttonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});

