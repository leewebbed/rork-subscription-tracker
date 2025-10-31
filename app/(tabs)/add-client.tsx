import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SubscriptionDuration } from '@/types/subscription';
import Colors from '@/constants/colors';
import { Calendar, Mail, Phone, Tag } from 'lucide-react-native';

export default function AddClientScreen() {
  const router = useRouter();
  const { addClient, categories } = useSubscription();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [duration, setDuration] = useState<SubscriptionDuration>('ONE_MONTH');
  const [startDate, setStartDate] = useState(new Date().toISOString());

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a client name');
      return;
    }

    if (!categoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    addClient({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      categoryId,
      duration,
      startDate,
    });

    Alert.alert('Success', 'Client added successfully', [
      {
        text: 'OK',
        onPress: () => {
          setName('');
          setEmail('');
          setPhone('');
          setCategoryId(categories[0]?.id || '');
          setDuration('ONE_MONTH');
          setStartDate(new Date().toISOString());
          router.push('/(tabs)');
        },
      },
    ]);
  };

  const durations: { value: SubscriptionDuration; label: string }[] = [
    { value: 'ONE_WEEK', label: 'One Week' },
    { value: 'ONE_MONTH', label: 'One Month' },
    { value: 'ONE_YEAR', label: 'One Year' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter client name"
              placeholderTextColor={Colors.light.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWithIcon}>
              <Mail size={20} color={Colors.light.textSecondary} style={styles.icon} />
              <TextInput
                style={styles.inputWithIconText}
                value={email}
                onChangeText={setEmail}
                placeholder="client@example.com"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <View style={styles.inputWithIcon}>
              <Phone size={20} color={Colors.light.textSecondary} style={styles.icon} />
              <TextInput
                style={styles.inputWithIconText}
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 234 567 8900"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    categoryId === cat.id && [styles.categoryChipActive, { backgroundColor: cat.color }],
                  ]}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Tag
                    size={16}
                    color={categoryId === cat.id ? '#FFFFFF' : Colors.light.text}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      categoryId === cat.id && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duration *</Text>
            <View style={styles.durationContainer}>
              {durations.map((dur) => (
                <TouchableOpacity
                  key={dur.value}
                  style={[
                    styles.durationButton,
                    duration === dur.value && styles.durationButtonActive,
                  ]}
                  onPress={() => setDuration(dur.value)}
                >
                  <Text
                    style={[
                      styles.durationButtonText,
                      duration === dur.value && styles.durationButtonTextActive,
                    ]}
                  >
                    {dur.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start Date</Text>
            <View style={styles.inputWithIcon}>
              <Calendar size={20} color={Colors.light.textSecondary} style={styles.icon} />
              <Text style={styles.dateText}>
                {new Date(startDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Add Client</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 12,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  icon: {
    marginRight: 10,
  },
  inputWithIconText: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
  },
  dateText: {
    fontSize: 15,
    color: Colors.light.text,
  },
  categoryScroll: {
    marginHorizontal: -4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 5,
  },
  categoryChipActive: {
    borderColor: 'transparent',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.light.text,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  durationContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  durationButton: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  durationButtonActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  durationButtonTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
