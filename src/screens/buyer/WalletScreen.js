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
  inputBgColor,
  lightPink,
  redColor,
  whiteColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import {
  EMPTY_WALLET_TRANSACTIONS_MESSAGE,
  EMPTY_WALLET_TRANSACTIONS_TITLE,
  WALLET_ADD_MONEY_BTN,
  WALLET_ADD_MONEY_DESC,
  WALLET_ADD_MONEY_TITLE,
  WALLET_ALL_TIME,
  WALLET_AVAILABLE_SUBTITLE,
  WALLET_BALANCE_LABEL,
  WALLET_CURRENT_BALANCE,
  WALLET_TITLE,
  WALLET_TOTAL_REFUNDED_LABEL,
  WALLET_TOTAL_SPENT_LABEL,
  WALLET_TRANSACTION_HISTORY,
  WALLET_QUICK_AMOUNTS_LABEL,
  WALLET_CUSTOM_AMOUNT_LABEL,
  WALLET_PAY_VIA_STRIPE,
  WALLET_STRIPE_REDIRECT_NOTE,
  WALLET_QUICK_AMOUNTS,
  WALLET_TOPUP_SUCCESS,
  WALLET_TOPUP_CANCELLED,
  STRIPE_SUCCESS_URL,
  STRIPE_CANCEL_URL,
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
  startWalletTopupApi,
  confirmWalletTopupApi,
} from '../../services/walletService';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';

const {
  flex,
  flexDirectionRow,
  alignItemsCenter,
  justifyContentSpaceBetween,
  alignJustifyCenter,
} = BaseStyle;

const num = v => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const formatCurrency = (value, currency = '$', withDecimals = false) => {
  const n = num(value);
  const formatted = withDecimals
    ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : n.toLocaleString('en-US');
  return `${currency}${formatted}`;
};

const formatTxnDate = dateStr => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const extractSummary = response => {
  const d = response?.data ?? response ?? {};
  return {
    balance: num(d.balance ?? d.available ?? d.available_balance),
    totalSpent: num(d.total_spent ?? d.totalSpent ?? d.spent),
    totalRefunded: num(d.total_refunded ?? d.totalRefunded ?? d.refunded),
    currency: d.currency_symbol || (d.currency === 'usd' || !d.currency ? '$' : `${d.currency} `),
  };
};

const extractTxnList = response => {
  const d = response?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.transactions)) return d.transactions;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.rows)) return d.rows;
  if (Array.isArray(response?.transactions)) return response.transactions;
  return [];
};

const mapTxn = t => {
  const amount = num(t?.amount ?? t?.value);
  const rawType = String(t?.type || t?.direction || '').toLowerCase();
  const isCredit = rawType
    ? /credit|topup|top_up|refund|deposit|in\b/.test(rawType)
    : amount >= 0;
  return {
    id: String(t?.id ?? t?._id ?? `${t?.created_at}-${amount}`),
    title: t?.description || t?.title || t?.reason || (isCredit ? 'Credit' : 'Debit'),
    date: formatTxnDate(t?.created_at || t?.createdAt || t?.date),
    amount: Math.abs(amount),
    type: isCredit ? 'credit' : 'debit',
  };
};

const WalletScreen = ({ navigation }) => {
  const { token } = useSelector(selectAuth);

  const [walletStats, setWalletStats] = useState({
    balance: 0,
    totalSpent: 0,
    totalRefunded: 0,
    currency: '$',
  });
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [topupModal, setTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [isStartingTopup, setIsStartingTopup] = useState(false);

  const fetchWallet = useCallback(
    async ({ isRefresh = false } = {}) => {
      if (!token) return;
      if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);
      try {
        const [summaryRes, txnRes] = await Promise.all([
          getWalletSummaryApi(token),
          getWalletTransactionsApi(token, { page: 1, limit: 30 }),
        ]);
        setWalletStats(extractSummary(summaryRes));
        setTransactions(extractTxnList(txnRes).map(mapTxn));
      } catch (error) {
        // keep existing values on refresh failure
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

  const openTopupModal = () => {
    setTopupAmount('');
    setTopupModal(true);
  };

  // Called after the in-app Stripe WebView returns.
  const handleTopupResult = useCallback(
    async (result, sessionId) => {
      if (result === 'success') {
        try {
          if (sessionId) await confirmWalletTopupApi(token, sessionId);
        } catch (error) {
          // confirm can also land via webhook — refresh regardless
        }
        await fetchWallet({ isRefresh: true });
        Alert.alert('', WALLET_TOPUP_SUCCESS);
      } else {
        // cancelled or closed — just refresh silently in case it partially settled
        fetchWallet({ isRefresh: true });
        Alert.alert('', WALLET_TOPUP_CANCELLED);
      }
    },
    [token, fetchWallet],
  );

  const handleStartTopup = async () => {
    const amount = Number(topupAmount);
    if (!amount || amount <= 0) {
      Alert.alert('', 'Please enter a valid amount.');
      return;
    }
    if (!token || isStartingTopup) return;
    setIsStartingTopup(true);
    try {
      const response = await startWalletTopupApi(token, {
        amount,
        successUrl: STRIPE_SUCCESS_URL,
        cancelUrl: STRIPE_CANCEL_URL,
      });
      const data = response?.data || response;
      const url = data?.url;
      const sessionId = data?.session_id || data?.sessionId;
      setTopupModal(false);
      if (url) {
        navigation.navigate(SCREEN_NAMES.STRIPE_CHECKOUT, {
          checkoutUrl: url,
          title: WALLET_ADD_MONEY_TITLE,
          onResult: result => handleTopupResult(result, sessionId),
        });
      } else {
        Alert.alert('', 'Could not start top-up. Please try again.');
      }
    } catch (error) {
      Alert.alert('', getApiErrorMessage(error?.data, error?.message || 'Could not start top-up.'));
    } finally {
      setIsStartingTopup(false);
    }
  };

  const statCards = [
    {
      id: 'balance',
      label: WALLET_BALANCE_LABEL,
      value: formatCurrency(walletStats.balance, walletStats.currency),
      subtitle: WALLET_AVAILABLE_SUBTITLE,
      icon: 'dollar-sign',
      iconBg: lightPink,
      iconColor: redColor,
      subtitleColor: '#1B7A45',
    },
    {
      id: 'spent',
      label: WALLET_TOTAL_SPENT_LABEL,
      value: formatCurrency(walletStats.totalSpent, walletStats.currency),
      subtitle: WALLET_ALL_TIME,
      icon: 'trending-up',
      iconBg: '#E8F0F8',
      iconColor: blueColor,
      subtitleColor: '#1B7A45',
    },
    {
      id: 'refunded',
      label: WALLET_TOTAL_REFUNDED_LABEL,
      value: formatCurrency(walletStats.totalRefunded, walletStats.currency),
      subtitle: WALLET_ALL_TIME,
      icon: 'trending-down',
      iconBg: '#E8F8EE',
      iconColor: greenColor,
      subtitleColor: '#1B7A45',
    },
  ];

  const renderStatCard = card => (
    <View key={card.id} style={styles.statCard}>
      <View style={[styles.statIconWrap, alignJustifyCenter, { backgroundColor: card.iconBg }]}>
        <Icon name={card.icon} size={14} color={card.iconColor} />
      </View>
      <Text style={[styles.statLabel, style.fontWeightThin]} numberOfLines={1}>
        {card.label}
      </Text>
      <Text style={[styles.statValue, style.fontWeightMedium]} numberOfLines={1}>
        {card.value}
      </Text>
      <View style={[flexDirectionRow, alignItemsCenter, styles.statSubtitleRow]}>
        <Icon name="arrow-up" size={10} color={card.subtitleColor} />
        <Text style={[styles.statSubtitle, style.fontWeightThin, { color: card.subtitleColor }]} numberOfLines={1}>
          {card.subtitle}
        </Text>
      </View>
    </View>
  );

  const renderTransaction = (item, index) => {
    const isCredit = item.type === 'credit';
    const amountPrefix = isCredit ? '+' : '-';
    const amountColor = isCredit ? '#1B7A45' : redColor;

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
            styles.transactionIconWrap,
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
        <Text style={[styles.transactionAmount, style.fontWeightMedium, { color: amountColor }]}>
          {amountPrefix}
          {formatCurrency(item.amount, walletStats.currency, true)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[flex, screenContentStyles.safeArea]} edges={['top']}>
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
        <ScreenHeader title={WALLET_TITLE} navigation={navigation} />

        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={redColor} />
          </View>
        ) : (
          <>
            <View style={[styles.statsRow, flexDirectionRow]}>{statCards.map(renderStatCard)}</View>

            <View style={styles.addMoneyCard}>
              <Text style={[styles.addMoneyTitle, style.fontWeightMedium]}>{WALLET_ADD_MONEY_TITLE}</Text>
              <Text style={[styles.addMoneyDesc, style.fontWeightThin]}>{WALLET_ADD_MONEY_DESC}</Text>

              <View style={[styles.addMoneyFooter, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
                <View>
                  <Text style={[styles.balanceValue, style.fontWeightMedium]}>
                    {formatCurrency(walletStats.balance, walletStats.currency)}
                  </Text>
                  <Text style={[styles.balanceLabel, style.fontWeightThin]}>{WALLET_CURRENT_BALANCE}</Text>
                </View>
                <CustomButton
                  title={WALLET_ADD_MONEY_BTN}
                  iconName="plus"
                  onPress={openTopupModal}
                  style={styles.addMoneyBtn}
                  textStyle={styles.addMoneyBtnText}
                />
              </View>
            </View>

            <Text style={[styles.sectionTitle, style.fontWeightMedium]}>{WALLET_TRANSACTION_HISTORY}</Text>
            <View style={styles.historyCard}>
              {transactions.length === 0 ? (
                <EmptyState
                  icon="credit-card"
                  title={EMPTY_WALLET_TRANSACTIONS_TITLE}
                  message={EMPTY_WALLET_TRANSACTIONS_MESSAGE}
                  compact
                />
              ) : (
                transactions.map(renderTransaction)
              )}
            </View>
          </>
        )}
      </ScrollView>

      <Modal
        visible={topupModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setTopupModal(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setTopupModal(false)} />
          <View style={styles.modalCard}>
            <View style={[flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween, styles.modalHeader]}>
              <Text style={[styles.modalTitle, style.fontWeightMedium]}>{WALLET_ADD_MONEY_TITLE}</Text>
              <TouchableOpacity onPress={() => setTopupModal(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="x" size={20} color={grayColor} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalLabel, style.fontWeightThin]}>{WALLET_QUICK_AMOUNTS_LABEL}</Text>
            <View style={[flexDirectionRow, styles.quickRow]}>
              {WALLET_QUICK_AMOUNTS.map(amt => {
                const selected = String(amt) === String(topupAmount);
                return (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.quickChip, alignJustifyCenter, selected && styles.quickChipActive]}
                    onPress={() => setTopupAmount(String(amt))}
                    activeOpacity={0.8}>
                    <Text style={[styles.quickChipText, style.fontWeightMedium, selected && styles.quickChipTextActive]}>
                      {(walletStats.currency.trim() || '$') + amt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.modalLabel, style.fontWeightThin]}>{WALLET_CUSTOM_AMOUNT_LABEL}</Text>
            <View style={[styles.amountInputRow, flexDirectionRow, alignItemsCenter]}>
              <Text style={[styles.currencyPrefix, style.fontWeightMedium]}>{walletStats.currency.trim() || '$'}</Text>
              <TextInput
                style={[styles.amountInput, style.fontWeightMedium]}
                value={topupAmount}
                onChangeText={t => setTopupAmount(t.replace(/[^0-9.]/g, ''))}
                placeholder="0"
                placeholderTextColor={grayColor}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={[styles.noteRow, flexDirectionRow, alignItemsCenter]}>
              <Icon name="credit-card" size={14} color={grayColor} />
              <Text style={[styles.noteText, style.fontWeightThin]}>{WALLET_STRIPE_REDIRECT_NOTE}</Text>
            </View>

            <View style={[flexDirectionRow, styles.modalActions]}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, alignJustifyCenter]}
                onPress={() => setTopupModal(false)}
                disabled={isStartingTopup}>
                <Text style={[styles.modalCancelText, style.fontWeightMedium]}>{CONFIRM_CANCEL}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, alignJustifyCenter, flexDirectionRow]}
                onPress={handleStartTopup}
                disabled={isStartingTopup}>
                {isStartingTopup ? (
                  <ActivityIndicator size="small" color={whiteColor} />
                ) : (
                  <>
                    <Icon name="credit-card" size={15} color={whiteColor} />
                    <Text style={[styles.modalConfirmText, style.fontWeightMedium]}>{WALLET_PAY_VIA_STRIPE}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default WalletScreen;

const styles = StyleSheet.create({
  loader: { paddingVertical: hp(10), alignItems: 'center' },
  statsRow: {
    gap: wp(2.5),
    marginBottom: hp(2),
    alignItems: 'stretch',
  },
  statCard: {
    flex: 1,
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    paddingHorizontal: spacings.large,
    paddingTop: spacings.large,
    paddingBottom: spacings.large,
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
    marginBottom: spacings.xsmall,
    lineHeight: 14,
  },
  statValue: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
    marginBottom: spacings.xsmall,
    lineHeight: 22,
  },
  statSubtitleRow: {
    gap: 3,
    marginTop: spacings.xsmall,
  },
  statSubtitle: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    lineHeight: 14,
    flexShrink: 1,
  },
  addMoneyCard: {
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    padding: spacings.xLarge,
    marginBottom: hp(2.5),
  },
  addMoneyTitle: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
    marginBottom: spacings.small,
  },
  addMoneyDesc: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    lineHeight: 18,
    marginBottom: spacings.large,
  },
  addMoneyFooter: {
    gap: spacings.normal,
  },
  balanceValue: {
    fontSize: style.fontSizeLargeX.fontSize,
    color: redColor,
  },
  balanceLabel: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  addMoneyBtn: {
    width: 'auto',
    minWidth: wp(34),
    minHeight: hp(5),
    paddingVertical: spacings.normal,
    paddingHorizontal: spacings.large,
    borderRadius: 8,
  },
  addMoneyBtnText: {
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  sectionTitle: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
    marginBottom: spacings.normal,
  },
  historyCard: {
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.small,
    marginBottom: hp(2),
  },
  transactionRow: {
    paddingVertical: spacings.large,
    gap: spacings.normal,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderLightColor,
  },
  transactionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    flexShrink: 0,
  },
  transactionInfo: {
    flex: 1,
    minWidth: 0,
  },
  transactionTitle: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
  },
  transactionAmount: {
    fontSize: style.fontSizeSmall1x.fontSize,
    flexShrink: 0,
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
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    marginBottom: spacings.small,
  },
  quickRow: {
    gap: wp(2),
    marginBottom: spacings.large,
  },
  quickChip: {
    flex: 1,
    paddingVertical: spacings.medium,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: borderLightColor,
    backgroundColor: whiteColor,
  },
  quickChipActive: {
    borderColor: redColor,
    backgroundColor: lightPink,
  },
  quickChipText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
  },
  quickChipTextActive: {
    color: redColor,
  },
  amountInputRow: {
    borderWidth: 1,
    borderColor: redColor,
    borderRadius: 12,
    backgroundColor: whiteColor,
    paddingHorizontal: spacings.large,
    marginBottom: spacings.large,
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
  noteRow: {
    gap: wp(2),
    backgroundColor: inputBgColor,
    borderRadius: 10,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.medium,
    marginBottom: spacings.xLarge,
  },
  noteText: {
    flex: 1,
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    lineHeight: 16,
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
    flex: 1.4,
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: redColor,
    gap: wp(1.5),
  },
  modalConfirmText: { fontSize: style.fontSizeNormal2x.fontSize, color: whiteColor },
});
