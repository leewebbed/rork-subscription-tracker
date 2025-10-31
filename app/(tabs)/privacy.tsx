import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Shield, Lock, Database, Info, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useSubscription } from '@/contexts/SubscriptionContext';

export default function PrivacyScreen() {
  const { clearAllData } = useSubscription();

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all clients, categories, and payment records. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Success', 'All data has been reset');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Shield size={40} color={Colors.light.tint} />
          </View>
          <Text style={styles.title}>Privacy & Security</Text>
          <Text style={styles.subtitle}>
            Your data is completely secure and private
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Database size={22} color={Colors.light.tint} />
            <Text style={styles.infoCardTitle}>Local Storage Only</Text>
          </View>
          <Text style={styles.infoCardText}>
            All your data is stored locally on your device. We do not collect,
            transmit, or store any information on external servers.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Lock size={22} color={Colors.light.tint} />
            <Text style={styles.infoCardTitle}>Complete Offline</Text>
          </View>
          <Text style={styles.infoCardText}>
            This app works completely offline. Your subscription data never
            leaves your device, ensuring maximum privacy and security.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Shield size={22} color={Colors.light.tint} />
            <Text style={styles.infoCardTitle}>No Data Collection</Text>
          </View>
          <Text style={styles.infoCardText}>
            We don't collect any personal information, analytics, or tracking
            data. Your privacy is fully protected.
          </Text>
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={handleResetData}>
          <Trash2 size={20} color="#EF4444" />
          <Text style={styles.resetButtonText}>Reset All Data</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Info size={20} color={Colors.light.textSecondary} />
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
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
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.tint + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  infoCardText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.light.textSecondary,
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
  },
  versionText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
});
