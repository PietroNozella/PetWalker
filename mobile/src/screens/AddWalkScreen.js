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
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, borderRadius, fontSize } from '../config/theme';
import api from '../config/api';

export default function AddWalkScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [dogs, setDogs] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [form, setForm] = useState({
    dog_id: '',
    scheduled_date: new Date(),
    duration_minutes: '60',
    location: '',
    notes: '',
  });

  useEffect(() => {
    loadDogs();
  }, []);

  const loadDogs = async () => {
    try {
      const response = await api.get('/api/dogs');
      setDogs(response.data);
    } catch (error) {
      console.error('Erro ao carregar cães:', error);
    }
  };

  const handleSave = async () => {
    if (!form.dog_id) {
      Alert.alert('Erro', 'Selecione um cão');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/walks', {
        dog_id: parseInt(form.dog_id),
        scheduled_date: form.scheduled_date.toISOString(),
        duration_minutes: parseInt(form.duration_minutes) || 60,
        location: form.location || null,
        notes: form.notes || null,
      });
      Alert.alert('Sucesso', 'Passeio agendado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível agendar o passeio');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setForm({ ...form, scheduled_date: selectedDate });
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(form.scheduled_date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setForm({ ...form, scheduled_date: newDate });
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Novo Passeio</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cão *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.dog_id}
              onValueChange={(value) => setForm({ ...form, dog_id: value })}
              style={styles.picker}
              dropdownIconColor={colors.text}
            >
              <Picker.Item label="Selecione o cão..." value="" color={colors.textMuted} />
              {dogs.map((dog) => (
                <Picker.Item 
                  key={dog.id} 
                  label={dog.name} 
                  value={dog.id.toString()} 
                  color={colors.text}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Data</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.dateText}>{formatDate(form.scheduled_date)}</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.md }]}>
            <Text style={styles.label}>Hora</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.dateText}>{formatTime(form.scheduled_date)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={form.scheduled_date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={form.scheduled_date}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange}
          />
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Duração (minutos)</Text>
          <TextInput
            style={styles.input}
            placeholder="60"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={form.duration_minutes}
            onChangeText={(text) => setForm({ ...form, duration_minutes: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Local</Text>
          <TextInput
            style={styles.input}
            placeholder="Parque, praça, rua..."
            placeholderTextColor={colors.textMuted}
            value={form.location}
            onChangeText={(text) => setForm({ ...form, location: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Notas sobre o passeio..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            value={form.notes}
            onChangeText={(text) => setForm({ ...form, notes: text })}
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
              <Text style={styles.buttonText}>Agendar Passeio</Text>
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
  dateButton: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateText: {
    color: colors.text,
    fontSize: fontSize.md,
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

