import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../../constans/Style';
import {
  blackColor,
  blueColor,
  borderLightColor,
  grayColor,
  greenColor,
  lightPink,
  redColor,
  screenBgColor,
  whiteColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import {
  EMPTY_WALLET_TRANSACTIONS_MESSAGE,
  EMPTY_WALLET_TRANSACTIONS_TITLE,
  SELLER_WALLET_ALL_TIME,
  SELLER_WALLET_AVAILABLE,
  SELLER_WALLET_AVAILABLE_SUB,
  SELLER_WALLET_HISTORY,
  SELLER_WALLET_TITLE,
  SELLER_WALLET_TOTAL_EARNINGS,
  SELLER_WALLET_TOTAL_WITHDRAWN,
  SELLER_WALLET_WITHDRAW_BTN,
  SELLER_WALLET_WITHDRAW_DESC,
  SELLER_WALLET_WITHDRAW_TITLE,
  SELLER_WALLET_SETUP_PAYOUTS_BTN,
  SELLER_WALLET_SETUP_TITLE,
  SELLER_WALLET_SETUP_DESC,
  SELLER_WALLET_WITHDRAW_MODAL_TITLE,
  SELLER_WALLET_WITHDRAW_REQUESTED,
  SELLER_WALLET_PAYOUTS_READY,
  SCREEN_NAMES,
  CONFIRM_CANCEL,
} from '../../constans/Constants';
import ScreenHeader, { screenContentStyles } from '../../components/ScreenHeader';
import CustomButton from '../../components/CustomButton';
import EmptyState from '../../components/EmptyState';
import { selectAuth } from '../../redux/slices/authSlice';
import { getApiErrorMessage } from '../../services/apiClient';
import {
  getWalletSummaryApi,
  getWalletTransactionsApi,
  getConnectStatusApi,
  startConnectOnboardingApi,
  requestWithdrawalApi,
} from '../../services/walletService';
import { formatAppCurrency } from '../../utils/currency';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from '../../utils';

const {
  flex,
  flexDirectionRow,
  alignItemsCenter,
  justifyContentSpaceBetween,
  alignJustifyCenter,
} = BaseStyle;

const formatCurrency = value => formatAppCurrency(value, { whole: true });

const n = v => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};

const formatTxnDate = dateStr => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const extractSummary = res => {
  const d = res?.data ?? res ?? {};
  return {
    balance: n(d.balance ?? d.available ?? d.available_balance),
    totalEarnings: n(d.total_earnings ?? d.totalEarnings ?? d.earnings ?? d.total_earned),
    totalWithdrawn: n(d.total_withdrawn ?? d.totalWithdrawn ?? d.withdrawn),
    pending: n(d.pending ?? d.pending_balance),
  };
};

const extractTxnList = res => {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.transactions)) return d.transactions;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.rows)) return d.rows;
  if (Array.isArray(res?.transactions)) return res.transactions;
  return [];
};

const mapTxn = t => {
  const amount = n(t?.amount ?? t?.value);
  const rawType = String(t?.type || t?.direction || '').toLowerCase();
  const isCredit = rawType ? /credit|earning|payout_in|refund|in\b/.test(rawType) : amount >= 0;
  return {
    id: String(t?.id ?? t?._id ?? `${t?.created_at}-${amount}`),
    title: t?.description || t?.title || t?.reason || (isCredit ? 'Earning' : 'Withdrawal'),
    date: formatTxnDate(t?.created_at || t?.createdAt || t?.date),
    amount: Math.abs(amount),
    type: isCredit ? 'credit' : 'debit',
  };
};

const isPayoutsEnabled = res => {
  const d = res?.data ?? res ?? {};
  return Boolean(
    d.payouts_enabled ?? d.payoutsEnabled ?? d.connected ?? d.onboarded ?? d.charges_enabled ?? d.enabled,
  );
};

const SellerWalletScreen = ({ navigation }) => {
  const { token } = useSelector(selectAuth);

  const [walletStats, setWalletStats] = useState({ balance: 0, totalEarnings: 0, totalWithdrawn: 0, pending: 0 });
  const [transactions, setTransactions] = useState([]);
  const [payoutsEnabled, setPayoutsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const fetchWallet = useCallback(
    async ({ isRefresh = false } = {}) => {
      if (!token) return;
      if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);
      try {
        const [summaryRes, txnRes, statusRes] = await Promise.all([
          getWalletSummaryApi(token),
          getWalletTransactionsApi(token, { page: 1, limit: 30 }),
          getConnectStatusApi(token).catch(() => null),
        ]);
        setWalletStats(extractSummary(summaryRes));
        setTransactions(extractTxnList(txnRes).map(mapTxn));
        if (statusRes) setPayoutsEnabled(isPayoutsEnabled(statusRes));
      } catch (error) {
        // keep values on failure
      } finally {
        if (isRefresh) setIsRefreshing(false);
        else setIsLoading(false);
      }
    },
    [token],
  );

  useFocusEffect(
    useCallback(() => {
      fetchWallet();
    }, [fetchWallet]),
  );

  const handleSetupPayouts = async () => {
    if (!token || isOnboarding) return;
    setIsOnboarding(true);
    try {
      const res = await startConnectOnboardingApi(token);
      const url = res?.data?.url || res?.url;
      if (url) {
        navigation.navigate(SCREEN_NAMES.STRIPE_CHECKOUT, {
          checkoutUrl: url,
          title: SELLER_WALLET_SETUP_TITLE,
          // Stripe Connect uses backend return/refresh URLs; whenever the WebView is
          // dismissed we just re-check the payout status.
          onResult: () => fetchWallet({ isRefresh: true }),
        });
      } else {
        Alert.alert('', 'Could not start payout setup. Please try again.');
      }
    } catch (error) {
      Alert.alert('', getApiErrorMessage(error?.data, error?.message || 'Could not start payout setup.'));
    } finally {
      setIsOnboarding(false);
    }
  };

  const openWithdrawModal = () => {
    setWithdrawAmount('');
    setWithdrawModal(true);
  };

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) {
      Alert.alert('', 'Please enter a valid amount.');
      return;
    }
    if (amount > walletStats.balance) {
      Alert.alert('', 'Amount exceeds your available balance.');
      return;
    }
    if (!token || isWithdrawing) return;
    setIsWithdrawing(true);
    try {
      await requestWithdrawalApi(token, amount);
      setWithdrawModal(false);
      await fetchWallet({ isRefresh: true });
      Alert.alert('', SELLER_WALLET_WITHDRAW_REQUESTED);
    } catch (error) {
      Alert.alert('', getApiErrorMessage(error?.data, error?.message || 'Withdrawal failed.'));
    } finally {
      setIsWithdrawing(false);
    }
  };

  const statCards = [
    {
      id: 'balance',
      label: SELLER_WALLET_AVAILABLE,
      value: formatCurrency(walletStats.balance),
      subtitle: SELLER_WALLET_AVAILABLE_SUB,
      icon: 'dollar-sign',
      iconBg: lightPink,
      iconColor: redColor,
    },
    {
      id: 'earnings',
      label: SELLER_WALLET_TOTAL_EARNINGS,
      value: formatCurrency(walletStats.totalEarnings),
      subtitle: SELLER_WALLET_ALL_TIME,
      icon: 'trending-down',
      iconBg: '#E8F8EE',
      iconColor: greenColor,
    },
    {
      id: 'withdrawn',
      label: SELLER_WALLET_TOTAL_WITHDRAWN,
      value: formatCurrency(walletStats.totalWithdrawn),
      subtitle: SELLER_WALLET_ALL_TIME,
      icon: 'trending-up',
      iconBg: '#E8F0F8',
      iconColor: blueColor,
    },
  ];

  return (
    <SafeAreaView style={[flex, styles.safeArea]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={screenContentStyles.scrollContent}
        bounces={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchWallet({ isRefresh: true })}
            colors={[redColor]}
            tintColor={redColor}
          />
        }>
        <ScreenHeader title={SELLER_WALLET_TITLE} navigation={navigation} onBack={() => navigation.goBack()} />

        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={redColor} />
          </View>
        ) : (
          <>
            <View style={[styles.statsRow, flexDirectionRow]}>
              {statCards.map(card => (
                <View key={card.id} style={styles.statCard}>
                  <View style={[styles.statIconWrap, alignJustifyCenter, { backgroundColor: card.iconBg }]}>
                    <Icon name={card.icon} size={14} color={card.iconColor} />
                  </View>
                  <Text style={[styles.statLabel, style.fontWeightThin]} numberOfLines={2}>
                    {card.label}
                  </Text>
                  <Text style={[styles.statValue, style.fontWeightMedium]} numberOfLines={1}>
                    {card.value}
                  </Text>
                  <Text style={[styles.statSubtitle, style.fontWeightThin]} numberOfLines={1}>
                    {card.subtitle}
                  </Text>
                </View>
              ))}
            </View>

            {payoutsEnabled ? (
              <View style={styles.withdrawCard}>
                <View style={styles.withdrawInfo}>
                  <View style={[flexDirectionRow, alignItemsCenter, { gap: wp(1.5) }]}>
                    <Icon name="check-circle" size={14} color={greenColor} />
                    <Text style={[styles.payoutsReady, style.fontWeightMedium]}>{SELLER_WALLET_PAYOUTS_READY}</Text>
                  </View>
                  <Text style={[styles.withdrawTitle, style.fontWeightMedium]}>{SELLER_WALLET_WITHDRAW_TITLE}</Text>
                  <Text style={[styles.withdrawDesc, style.fontWeightThin]}>{SELLER_WALLET_WITHDRAW_DESC}</Text>
                </View>
                <View style={[styles.withdrawRight, alignItemsCenter]}>
                  <Text style={[styles.withdrawAmount, style.fontWeightMedium]}>
                    {formatCurrency(walletStats.balance)}
                  </Text>
                  <CustomButton
                    title={SELLER_WALLET_WITHDRAW_BTN}
                    iconName="credit-card"
                    backgroundColor={redColor}
                    onPress={openWithdrawModal}
                    style={styles.withdrawBtn}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.withdrawCard}>
                <View style={styles.withdrawInfo}>
                  <Text style={[styles.withdrawTitle, style.fontWeightMedium]}>{SELLER_WALLET_SETUP_TITLE}</Text>
                  <Text style={[styles.withdrawDesc, style.fontWeightThin]}>{SELLER_WALLET_SETUP_DESC}</Text>
                </View>
                <CustomButton
                  title={SELLER_WALLET_SETUP_PAYOUTS_BTN}
                  iconName="link"
                  backgroundColor={redColor}
                  onPress={handleSetupPayouts}
                  loading={isOnboarding}
                  style={styles.withdrawBtn}
                />
              </View>
            )}

            <Text style={[styles.sectionTitle, style.fontWeightMedium]}>{SELLER_WALLET_HISTORY}</Text>
            <View style={styles.listCard}>
              {transactions.length === 0 ? (
                <EmptyState
                  icon="credit-card"
                  title={EMPTY_WALLET_TRANSACTIONS_TITLE}
                  message={EMPTY_WALLET_TRANSACTIONS_MESSAGE}
                  compact
                />
              ) : (
                transactions.map((item, index) => {
                  const isCredit = item.type === 'credit';
                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.transactionRow,
                        flexDirectionRow,
                        alignItemsCenter,
                        index < transactions.length - 1 && styles.rowBorder,
                      ]}>
                      <View
                        style={[
                          styles.transactionIcon,
                          alignJustifyCenter,
                          { backgroundColor: isCredit ? '#E8F8EE' : lightPink },
                        ]}>
                        <Icon
                          name={isCredit ? 'arrow-down-left' : 'arrow-up-right'}
                          size={16}
                          color={isCredit ? greenColor : redColor}
                        />
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text style={[styles.transactionTitle, style.fontWeightMedium]} numberOfLines={2}>
                          {item.title}
                        </Text>
                        <Text style={[styles.transactionDate, style.fontWeightThin]}>{item.date}</Text>
                      </View>
                      <Text
                        style={[
                          styles.transactionAmount,
                          style.fontWeightMedium,
                          { color: isCredit ? greenColor : redColor },
                        ]}>
                        {isCredit ? '+' : '-'}{formatCurrency(item.amount)}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}
      </ScrollView>

      <Modal
        visible={withdrawModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setWithdrawModal(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setWithdrawModal(false)} />
          <View style={styles.modalCard}>
            <View style={[flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween, styles.modalHeader]}>
              <Text style={[styles.modalTitle, style.fontWeightMedium]}>{SELLER_WALLET_WITHDRAW_MODAL_TITLE}</Text>
              <TouchableOpacity onPress={() => setWithdrawModal(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="x" size={20} color={grayColor} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalLabel, style.fontWeightThin]}>
              {SELLER_WALLET_AVAILABLE}: {formatCurrency(walletStats.balance)}
            </Text>
            <View style={[styles.amountInputRow, flexDirectionRow, alignItemsCenter]}>
              <Text style={[styles.currencyPrefix, style.fontWeightMedium]}>$</Text>
              <TextInput
                style={[styles.amountInput, style.fontWeightMedium]}
                value={withdrawAmount}
                onChangeText={t => setWithdrawAmount(t.replace(/[^0-9.]/g, ''))}
                placeholder="0"
                placeholderTextColor={grayColor}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>
            <View style={[flexDirectionRow, styles.modalActions]}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, alignJustifyCenter]}
                onPress={() => setWithdrawModal(false)}
                disabled={isWithdrawing}>
                <Text style={[styles.modalCancelText, style.fontWeightMedium]}>{CONFIRM_CANCEL}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, alignJustifyCenter]}
                onPress={handleWithdraw}
                disabled={isWithdrawing}>
                {isWithdrawing ? (
                  <ActivityIndicator size="small" color={whiteColor} />
                ) : (
                  <Text style={[styles.modalConfirmText, style.fontWeightMedium]}>{SELLER_WALLET_WITHDRAW_BTN}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default SellerWalletScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: screenBgColor },
  loader: { paddingVertical: hp(10), alignItems: 'center' },
  statsRow: { gap: spacings.normal, marginBottom: hp(2) },
  statCard: {
    flex: 1,
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    padding: spacings.large,
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: spacings.normal,
  },
  statLabel: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    marginBottom: 4,
  },
  statValue: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
  },
  withdrawCard: {
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    padding: spacings.large,
    marginBottom: hp(2),
    gap: spacings.large,
  },
  withdrawInfo: { gap: 4 },
  payoutsReady: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: greenColor,
    marginBottom: 2,
  },
  withdrawTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  withdrawDesc: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    lineHeight: 18,
  },
  withdrawRight: { gap: spacings.normal },
  withdrawAmount: {
    fontSize: style.fontSizeLarge.fontSize,
    color: blackColor,
    alignSelf: 'flex-end',
  },
  withdrawBtn: { alignSelf: 'stretch' },
  sectionTitle: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
    marginBottom: spacings.normal,
  },
  listCard: {
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    overflow: 'hidden',
    marginBottom: hp(2),
  },
  transactionRow: {
    padding: spacings.large,
    gap: spacings.normal,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderLightColor,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  transactionInfo: { flex: 1 },
  transactionTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  transactionAmount: {
    fontSize: style.fontSizeNormal2x.fontSize,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: wp(6),
  },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalCard: {
    backgroundColor: whiteColor,
    borderRadius: 16,
    padding: spacings.xLarge,
  },
  modalHeader: { marginBottom: spacings.large },
  modalTitle: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
  },
  modalLabel: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginBottom: spacings.normal,
  },
  amountInputRow: {
    borderWidth: 1,
    borderColor: redColor,
    borderRadius: 12,
    backgroundColor: whiteColor,
    paddingHorizontal: spacings.large,
    marginBottom: spacings.xLarge,
  },
  currencyPrefix: {
    fontSize: style.fontSizeLarge.fontSize,
    color: grayColor,
    marginRight: spacings.small,
  },
  amountInput: {
    flex: 1,
    paddingVertical: spacings.medium,
    fontSize: style.fontSizeLarge.fontSize,
    color: blackColor,
  },
  modalActions: { gap: spacings.normal },
  modalCancelBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: borderLightColor,
  },
  modalCancelText: { fontSize: style.fontSizeNormal2x.fontSize, color: blackColor },
  modalConfirmBtn: {
    flex: 1.2,
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: redColor,
  },
  modalConfirmText: { fontSize: style.fontSizeNormal2x.fontSize, color: whiteColor },
});
