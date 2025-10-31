import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { ClientWithCategory } from '@/types/subscription';
import Colors from '@/constants/colors';
import { ArrowUpDown, Calendar, ChevronRight } from 'lucide-react-native';

type SortOption = 'name' | 'expiry';

export default function HomeScreen() {
  const router = useRouter();
  const { getClientsWithCategories, getExpiryDate, getSubscriptionStatus } = useSubscription();
  const [sortBy, setSortBy] = useState<SortOption>('expiry');

  const clients = useMemo(() => {
    const clientsWithCategories = getClientsWithCategories();
    
    return clientsWithCategories.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        const expiryA = getExpiryDate(a.startDate, a.duration).getTime();
        const expiryB = getExpiryDate(b.startDate, b.duration).getTime();
        return expiryA - expiryB;
      }
    });
  }, [sortBy, getClientsWithCategories, getExpiryDate]);

  const toggleSort = () => {
    setSortBy((prev) => (prev === 'name' ? 'expiry' : 'name'));
  };

  const getStatusColor = (client: ClientWithCategory) => {
    const status = getSubscriptionStatus(client);
    switch (status) {
      case 'active':
        return Colors.light.active;
      case 'expiring_soon':
        return Colors.light.expiringSoon;
      case 'expired':
        return Colors.light.expired;
    }
  };

  const getStatusText = (client: ClientWithCategory) => {
    const status = getSubscriptionStatus(client);
    const expiryDate = getExpiryDate(client.startDate, client.duration);
    const now = new Date();
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (status === 'expired') {
      return 'Expired';
    } else if (status === 'expiring_soon') {
      return `${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} left`;
    }
    return 'Active';
  };

  const formatExpiryDate = (client: ClientWithCategory) => {
    const expiryDate = getExpiryDate(client.startDate, client.duration);
    return expiryDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDurationText = (duration: ClientWithCategory['duration']) => {
    switch (duration) {
      case 'ONE_WEEK':
        return 'Weekly';
      case 'ONE_MONTH':
        return 'Monthly';
      case 'ONE_YEAR':
        return 'Yearly';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Subscriptions</Text>
        <TouchableOpacity style={styles.sortButton} onPress={toggleSort}>
          <ArrowUpDown size={20} color={Colors.light.tint} />
          <Text style={styles.sortButtonText}>
            {sortBy === 'name' ? 'By Name' : 'By Expiry'}
          </Text>
        </TouchableOpacity>
      </View>

      {clients.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No Clients Yet</Text>
          <Text style={styles.emptyStateText}>
            Add your first client to start tracking subscriptions
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {clients.map((client) => (
            <TouchableOpacity
              key={client.id}
              style={styles.clientCard}
              onPress={() => router.push(`/client/${client.id}` as any)}
              activeOpacity={0.7}
            >
              <View style={styles.clientCardHeader}>
                <View style={styles.clientInfo}>
                  <View
                    style={[
                      styles.categoryIndicator,
                      { backgroundColor: client.category.color },
                    ]}
                  />
                  <View style={styles.clientDetails}>
                    <Text style={styles.clientName}>{client.name}</Text>
                    <Text style={styles.categoryName}>
                      {client.category.name} • {getDurationText(client.duration)}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(client) + '15' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: getStatusColor(client) },
                    ]}
                  >
                    {getStatusText(client)}
                  </Text>
                </View>
              </View>

              <View style={styles.clientCardFooter}>
                <View style={styles.expiryInfo}>
                  <Calendar size={16} color={Colors.light.textSecondary} />
                  <Text style={styles.expiryText}>
                    Expires: {formatExpiryDate(client)}
                  </Text>
                </View>
                <ChevronRight size={20} color={Colors.light.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.light.tint + '10',
    borderRadius: 8,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.tint,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 12,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  clientCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  clientCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  categoryIndicator: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 3,
  },
  categoryName: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  clientCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expiryText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
});
