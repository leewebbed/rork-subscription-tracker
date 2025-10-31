import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Client } from '@/types/subscription';
import Colors from '@/constants/colors';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  Calendar,
  Mail,
  Phone,
  Tag,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  X,
  Edit3,
  Printer,
} from 'lucide-react-native';

export default function ClientDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getClientsWithCategories,
    getExpiryDate,
    getSubscriptionStatus,
    deleteClient,
    addPayment,
    deletePayment,
    updateClient,
  } = useSubscription();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());


  const client = getClientsWithCategories().find((c) => c.id === id);

  if (!client) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Client not found</Text>
        </View>
      </View>
    );
  }

  const expiryDate = getExpiryDate(client.startDate, client.duration);
  const status = getSubscriptionStatus(client);
  const now = new Date();
  const daysUntilExpiry = Math.floor(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return Colors.light.active;
      case 'expiring_soon':
        return Colors.light.expiringSoon;
      case 'expired':
        return Colors.light.expired;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'active':
        return <CheckCircle2 size={24} color={Colors.light.active} />;
      case 'expiring_soon':
        return <AlertCircle size={24} color={Colors.light.expiringSoon} />;
      case 'expired':
        return <XCircle size={24} color={Colors.light.expired} />;
    }
  };

  const getStatusText = () => {
    if (status === 'expired') {
      return `Expired ${Math.abs(daysUntilExpiry)} day${Math.abs(daysUntilExpiry) !== 1 ? 's' : ''} ago`;
    } else if (status === 'expiring_soon') {
      return `Expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`;
    }
    return `Active - ${daysUntilExpiry} days remaining`;
  };

  const getDurationText = () => {
    switch (client.duration) {
      case 'ONE_WEEK':
        return 'One Week';
      case 'ONE_MONTH':
        return 'One Month';
      case 'ONE_YEAR':
        return 'One Year';
    }
  };

  const handleEmail = () => {
    if (client.email) {
      Linking.openURL(`mailto:${client.email}`);
    }
  };

  const handlePhone = () => {
    if (client.phone) {
      Linking.openURL(`tel:${client.phone}`);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Client',
      `Are you sure you want to delete ${client.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteClient(client.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleAddPayment = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
      return;
    }

    addPayment(client.id, {
      amount: parseFloat(paymentAmount),
      date: new Date().toISOString(),
      notes: paymentNotes.trim() || undefined,
    });

    setPaymentAmount('');
    setPaymentNotes('');
    setShowPaymentModal(false);
  };

  const handleDeletePayment = (paymentId: string) => {
    Alert.alert(
      'Delete Payment',
      'Are you sure you want to delete this payment record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePayment(client.id, paymentId),
        },
      ]
    );
  };

  const getTotalPayments = () => {
    return (client.payments || []).reduce((sum, payment) => sum + payment.amount, 0);
  };

  const handleEditExpiryDate = () => {
    setSelectedDate(expiryDate);
    setShowDatePicker(true);
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (event.type === 'set' && date) {
      const newStartDate = calculateStartDateFromExpiry(date, client.duration);
      updateClient(client.id, { startDate: newStartDate.toISOString() });
      
      if (Platform.OS === 'ios') {
        setShowDatePicker(false);
      }
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };

  const calculateStartDateFromExpiry = (expiryDate: Date, duration: Client['duration']): Date => {
    const startDate = new Date(expiryDate);
    
    switch (duration) {
      case 'ONE_WEEK':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'ONE_MONTH':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'ONE_YEAR':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }
    
    return startDate;
  };

  const generatePDF = async () => {
    try {
      const paymentsHTML = (client.payments || []).length > 0
        ? `
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 8px; text-align: left; border: 1px solid #e5e7eb;">Date</th>
                <th style="padding: 8px; text-align: left; border: 1px solid #e5e7eb;">Amount</th>
                <th style="padding: 8px; text-align: left; border: 1px solid #e5e7eb;">Notes</th>
              </tr>
            </thead>
            <tbody>
              ${client.payments.map((payment) => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${new Date(payment.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600;">£${payment.amount.toFixed(2)}</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${payment.notes || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `
        : '<p style="color: #6b7280; text-align: center; padding: 20px 0;">No payments recorded</p>';

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                padding: 40px;
                color: #1f2937;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 3px solid #2563EB;
              }
              .header h1 {
                color: #2563EB;
                margin: 0;
                font-size: 28px;
              }
              .section {
                margin-bottom: 30px;
              }
              .section-title {
                font-size: 18px;
                font-weight: 700;
                color: #2563EB;
                margin-bottom: 15px;
                padding-bottom: 8px;
                border-bottom: 2px solid #e5e7eb;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #f3f4f6;
              }
              .info-label {
                font-weight: 600;
                color: #6b7280;
              }
              .info-value {
                font-weight: 600;
                color: #1f2937;
                text-align: right;
              }
              .status-box {
                background-color: ${status === 'active' ? '#d1fae5' : status === 'expiring_soon' ? '#fef3c7' : '#fee2e2'};
                border: 2px solid ${getStatusColor()};
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
                text-align: center;
              }
              .status-text {
                color: ${getStatusColor()};
                font-size: 16px;
                font-weight: 700;
              }
              .category-badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
              }
              .category-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background-color: ${client.category.color};
                display: inline-block;
              }
              .total-payment {
                background-color: #eff6ff;
                padding: 15px;
                border-radius: 8px;
                margin-top: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .total-label {
                font-size: 16px;
                font-weight: 700;
              }
              .total-value {
                font-size: 22px;
                font-weight: 700;
                color: #2563EB;
              }
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 2px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Subscription Monitor</h1>
              <p style="margin: 5px 0 0 0; color: #6b7280;">Client Details Report</p>
            </div>

            <div class="status-box">
              <div class="status-text">${getStatusText()}</div>
            </div>

            <div class="section">
              <div class="section-title">Client Information</div>
              <div class="info-row">
                <span class="info-label">Name</span>
                <span class="info-value">${client.name}</span>
              </div>
              ${client.email ? `
                <div class="info-row">
                  <span class="info-label">Email</span>
                  <span class="info-value">${client.email}</span>
                </div>
              ` : ''}
              ${client.phone ? `
                <div class="info-row">
                  <span class="info-label">Phone</span>
                  <span class="info-value">${client.phone}</span>
                </div>
              ` : ''}
            </div>

            <div class="section">
              <div class="section-title">Subscription Details</div>
              <div class="info-row">
                <span class="info-label">Category</span>
                <span class="info-value">
                  <span class="category-badge">
                    <span class="category-dot"></span>
                    ${client.category.name}
                  </span>
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Duration Terms</span>
                <span class="info-value">${getDurationText()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Start Date</span>
                <span class="info-value">${new Date(client.startDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Expiry Date</span>
                <span class="info-value" style="color: ${getStatusColor()};">${expiryDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Payment History</div>
              ${paymentsHTML}
              <div class="total-payment">
                <span class="total-label">Total Paid</span>
                <span class="total-value">£${getTotalPayments().toFixed(2)}</span>
              </div>
            </div>

            <div class="footer">
              <p>Generated on ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}</p>
              <p>Subscription Monitor v1.0.0</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      console.log('PDF generated at:', uri);

      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = uri;
        link.download = `${client.name.replace(/\s+/g, '_')}_subscription.pdf`;
        link.click();
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Share Client Details PDF',
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert('Success', 'PDF generated successfully!');
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={[styles.statusCard, { borderColor: getStatusColor() }]}>
          <View style={styles.statusHeader}>
            <View style={{ transform: [{ scale: 0.9 }] }}>{getStatusIcon()}</View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>Subscription Status</Text>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{client.name}</Text>
            </View>

            {client.email ? (
              <TouchableOpacity style={styles.infoRow} onPress={handleEmail}>
                <View style={styles.labelWithIcon}>
                  <Mail size={18} color={Colors.light.textSecondary} />
                  <Text style={styles.label}>Email</Text>
                </View>
                <Text style={[styles.value, styles.link]}>{client.email}</Text>
              </TouchableOpacity>
            ) : null}

            {client.phone ? (
              <TouchableOpacity style={styles.infoRow} onPress={handlePhone}>
                <View style={styles.labelWithIcon}>
                  <Phone size={18} color={Colors.light.textSecondary} />
                  <Text style={styles.label}>Phone</Text>
                </View>
                <Text style={[styles.value, styles.link]}>{client.phone}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription Details</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.labelWithIcon}>
                <Tag size={18} color={Colors.light.textSecondary} />
                <Text style={styles.label}>Category</Text>
              </View>
              <View style={styles.categoryBadge}>
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: client.category.color },
                  ]}
                />
                <Text style={styles.categoryValue}>{client.category.name}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.labelWithIcon}>
                <Clock size={18} color={Colors.light.textSecondary} />
                <Text style={styles.label}>Duration Terms</Text>
              </View>
              <Text style={styles.value}>{getDurationText()}</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.labelWithIcon}>
                <Calendar size={18} color={Colors.light.textSecondary} />
                <Text style={styles.label}>Start Date</Text>
              </View>
              <Text style={styles.value}>
                {new Date(client.startDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>

            <TouchableOpacity style={styles.infoRow} onPress={handleEditExpiryDate}>
              <View style={styles.labelWithIcon}>
                <Calendar size={18} color={Colors.light.textSecondary} />
                <Text style={styles.label}>Expiry Date</Text>
              </View>
              <View style={styles.editableValue}>
                <Text style={[styles.value, { color: getStatusColor() }]}>
                  {expiryDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                <Edit3 size={16} color={Colors.light.tint} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment History</Text>
            <TouchableOpacity
              style={styles.addPaymentButton}
              onPress={() => setShowPaymentModal(true)}
            >
              <Plus size={18} color="#FFFFFF" />
              <Text style={styles.addPaymentButtonText}>Add Payment</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            <View style={styles.totalPaymentRow}>
              <Text style={styles.totalPaymentLabel}>Total Paid</Text>
              <Text style={styles.totalPaymentValue}>£{getTotalPayments().toFixed(2)}</Text>
            </View>
            
            {(client.payments || []).length === 0 ? (
              <View style={styles.emptyPayments}>
                <Text style={styles.emptyPaymentsText}>No payments recorded yet</Text>
              </View>
            ) : (
              <View style={styles.paymentsList}>
                {[...(client.payments || [])].reverse().map((payment) => (
                  <View key={payment.id} style={styles.paymentRow}>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentAmount}>£{payment.amount.toFixed(2)}</Text>
                      <Text style={styles.paymentDate}>
                        {new Date(payment.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                      {payment.notes ? (
                        <Text style={styles.paymentNotes}>{payment.notes}</Text>
                      ) : null}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeletePayment(payment.id)}
                      style={styles.deletePaymentButton}
                    >
                      <Trash2 size={18} color={Colors.light.expired} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.printButton} onPress={generatePDF}>
          <Printer size={20} color="#FFFFFF" />
          <Text style={styles.printButtonText}>Print Client Details</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Trash2 size={20} color={Colors.light.expired} />
          <Text style={styles.deleteButtonText}>Delete Client</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPaymentModal(false)}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContentWrapper}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Payment</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount (£)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                placeholderTextColor={Colors.light.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add any notes about this payment..."
                value={paymentNotes}
                onChangeText={setPaymentNotes}
                placeholderTextColor={Colors.light.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity style={styles.savePaymentButton} onPress={handleAddPayment}>
              <Text style={styles.savePaymentButtonText}>Save Payment</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

{showDatePicker && (
        Platform.OS === 'ios' ? (
          <Modal
            visible={showDatePicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.datePickerModalOverlay}>
              <TouchableOpacity
                style={styles.datePickerModalOverlayTouchable}
                activeOpacity={1}
                onPress={() => setShowDatePicker(false)}
              />
              <View style={styles.datePickerModalContent}>
                <View style={styles.datePickerHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.datePickerCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.datePickerTitle}>Select Expiry Date</Text>
                  <TouchableOpacity onPress={() => {
                    const newStartDate = calculateStartDateFromExpiry(selectedDate, client.duration);
                    updateClient(client.id, { startDate: newStartDate.toISOString() });
                    setShowDatePicker(false);
                  }}>
                    <Text style={styles.datePickerDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="inline"
                  onChange={(event: DateTimePickerEvent, date?: Date) => {
                    if (date) {
                      setSelectedDate(date);
                    }
                  }}
                  minimumDate={new Date()}
                  themeVariant="light"
                  accentColor="#2563EB"
                  style={{ backgroundColor: Colors.light.surface }}
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )
      )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: Colors.light.textSecondary,
  },
  statusCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
    marginBottom: 3,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
  },
  value: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.light.text,
    textAlign: 'right',
    maxWidth: '60%',
  },
  link: {
    color: Colors.light.tint,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '60%',
  },
  categoryValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.light.text,
    flexShrink: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.expired,
    marginTop: 4,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.expired,
  },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    padding: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  printButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addPaymentButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  totalPaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.border,
  },
  totalPaymentLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  totalPaymentValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#2563EB',
  },
  emptyPayments: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  emptyPaymentsText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  paymentsList: {
    paddingTop: 4,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  paymentNotes: {
    fontSize: 14,
    color: Colors.light.text,
    fontStyle: 'italic' as const,
  },
  deletePaymentButton: {
    padding: 8,
  },
  modalOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContentWrapper: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContent: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  savePaymentButton: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  savePaymentButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  editableValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '60%',
  },
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerModalOverlayTouchable: {
    flex: 1,
  },
  datePickerModalContent: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  datePickerTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  datePickerCancel: {
    fontSize: 17,
    color: Colors.light.textSecondary,
  },
  datePickerDone: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#2563EB',
  },
  durationModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  durationModalOverlayTouchable: {
    flex: 1,
  },
  durationModalContent: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  durationModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  durationModalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  durationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  durationOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  durationOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  durationOptionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  durationOptionTextActive: {
    color: '#2563EB',
  },
});
