import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
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
  EMPTY_WALLET_HOLDS_MESSAGE,
  EMPTY_WALLET_HOLDS_TITLE,
  EMPTY_WALLET_TRANSACTIONS_MESSAGE,
  EMPTY_WALLET_TRANSACTIONS_TITLE,
  SCREEN_NAMES,
  TXN_HOLD_STATUS_META,
  TXN_STATUS_META,
  TXN_TYPE_HOLD,
  WALLET_ALL_TIME,
  WALLET_AVAILABLE_SUBTITLE,
  WALLET_BALANCE_LABEL,
  WALLET_CARD_ONLY_NOTE,
  WALLET_TAB_ALL,
  WALLET_TAB_HOLD,
  WALLET_TABS,
  WALLET_TITLE,
  WALLET_PAYMENTS_LABEL,
  WALLET_PAYMENTS_SUB,
  WALLET_PENDING_PAYMENT_LABEL,
  WALLET_PENDING_PAYMENT_SUB,
  WALLET_TOTAL_SPENT_LABEL,
  WALLET_TRANSACTION_HISTORY,
} from '../../constans/Constants';
import ScreenHeader, { screenContentStyles } from '../../components/ScreenHeader';
import EmptyState from '../../components/EmptyState';
import { selectAuth } from '../../redux/slices/authSlice';
import { getWalletSummaryApi, getWalletTransactionsApi } from '../../services/walletService';
import { extractTxnList, mapWalletTxn } from '../../utils/walletTransactions';
import WalletTransactionRow from '../../components/WalletTransactionRow';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';

const { flex, flexDirectionRow, alignItemsCenter, alignJustifyCenter } = BaseStyle;

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

/**
 * GET /wallet returns { balance, available, pending_withdraw, total_in,
 * total_out, currency } and, for buyers only, { total_spent, card_spent,
 * payments_count, pending_payment }.
 *
 * There is no total_refunded field, so the old "Total Refunded" card sat at $0
 * forever. What a buyer actually wants to see is what's still coming: money
 * they'll be charged the moment they accept submitted work.
 */
const extractSummary = response => {
  const d = response?.data ?? response ?? {};
  return {
    balance: num(d.balance ?? d.available ?? d.available_balance),
    // Wallet debits plus the gross of every card payment — the backend totals
    // both, since card payments never move the wallet balance.
    totalSpent: num(d.total_spent ?? d.totalSpent ?? d.spent),
    paymentsCount: num(d.payments_count ?? d.paymentsCount),
    pendingPayment: num(d.pending_payment ?? d.pendingPayment),
    currency: d.currency_symbol || (d.currency === 'usd' || !d.currency ? '$' : `${d.currency} `),
  };
};

const WalletScreen = ({ navigation }) => {
  const { token } = useSelector(selectAuth);

  const [walletStats, setWalletStats] = useState({
    balance: 0,
    totalSpent: 0,
    paymentsCount: 0,
    pendingPayment: 0,
    currency: '$',
  });
  const [transactions, setTransactions] = useState([]);
  const [holdTransactions, setHoldTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState(WALLET_TAB_ALL);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchWallet = useCallback(
    async ({ isRefresh = false } = {}) => {
      if (!token) return;
      if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);
      try {
        // The hold list is its own request rather than a filter over the first
        // page: holds are rare next to ordinary activity, so filtering locally
        // would show an empty tab whenever they fall outside page 1.
        const [summaryRes, txnRes, holdRes] = await Promise.all([
          getWalletSummaryApi(token),
          getWalletTransactionsApi(token, { page: 1, limit: 30 }),
          getWalletTransactionsApi(token, { page: 1, limit: 30, type: TXN_TYPE_HOLD }),
        ]);
        setWalletStats(extractSummary(summaryRes));
        setTransactions(extractTxnList(txnRes).map(t => mapWalletTxn(t, { role: 'buyer' })));
        setHoldTransactions(extractTxnList(holdRes).map(t => mapWalletTxn(t, { role: 'buyer' })));
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
      id: 'payments',
      label: WALLET_PAYMENTS_LABEL,
      value: String(walletStats.paymentsCount),
      subtitle: WALLET_PAYMENTS_SUB,
      icon: 'credit-card',
      iconBg: '#E8F8EE',
      iconColor: greenColor,
      subtitleColor: '#1B7A45',
    },
    {
      // What a fresh Accept click would charge: submitted work and milestones
      // waiting on the buyer. Nothing is taken until they accept.
      id: 'pending',
      label: WALLET_PENDING_PAYMENT_LABEL,
      value: formatCurrency(walletStats.pendingPayment, walletStats.currency),
      subtitle: WALLET_PENDING_PAYMENT_SUB,
      icon: 'clock',
      iconBg: '#FFF6E5',
      iconColor: '#B26A00',
      subtitleColor: '#B26A00',
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

  // Opens a single transaction's receipt. The status label is resolved here so
  // the receipt reads exactly what the row does (a hold's status means
  // something different from an ordinary transaction's — see Constants).
  const openReceipt = item => {
    const meta = item.isHold
      ? TXN_HOLD_STATUS_META[item.status] || TXN_HOLD_STATUS_META.pending
      : TXN_STATUS_META[item.status] || TXN_STATUS_META.completed;
    navigation.navigate(SCREEN_NAMES.RECEIPT, {
      item,
      role: 'buyer',
      currency: walletStats.currency,
      statusLabel: meta.label,
    });
  };

  const isHoldTab = activeTab === WALLET_TAB_HOLD;
  const visibleTransactions = isHoldTab ? holdTransactions : transactions;

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

            <View style={[styles.noticeBox, flexDirectionRow]}>
              <Icon name="credit-card" size={14} color={grayColor} />
              <Text style={[styles.noticeText, style.fontWeightThin]}>{WALLET_CARD_ONLY_NOTE}</Text>
            </View>

            <Text style={[styles.sectionTitle, style.fontWeightMedium]}>{WALLET_TRANSACTION_HISTORY}</Text>

            <View style={[styles.tabRow, flexDirectionRow]}>
              {WALLET_TABS.map(tab => {
                const isActive = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.tab, alignJustifyCenter, isActive && styles.tabActive]}
                    onPress={() => setActiveTab(tab.key)}
                    activeOpacity={0.85}>
                    <Text
                      style={[styles.tabText, style.fontWeightMedium, isActive && styles.tabTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.historyCard}>
              {visibleTransactions.length === 0 ? (
                <EmptyState
                  icon="credit-card"
                  title={isHoldTab ? EMPTY_WALLET_HOLDS_TITLE : EMPTY_WALLET_TRANSACTIONS_TITLE}
                  message={isHoldTab ? EMPTY_WALLET_HOLDS_MESSAGE : EMPTY_WALLET_TRANSACTIONS_MESSAGE}
                  compact
                />
              ) : (
                visibleTransactions.map((item, index) => (
                  <WalletTransactionRow
                    key={item.id}
                    item={item}
                    role="buyer"
                    onDownloadReceipt={openReceipt}
                    currency={walletStats.currency}
                    showBorder={index < visibleTransactions.length - 1}
                  />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

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
    // Two per row: `flex: 1` would stretch a wrapped row's single card.
    flexBasis: '47%',
    flexGrow: 1,
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
  noticeBox: {
    backgroundColor: inputBgColor,
    borderRadius: 10,
    padding: spacings.large,
    marginBottom: hp(2.5),
    gap: spacings.small,
    alignItems: 'flex-start',
  },
  noticeText: {
    flex: 1,
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    lineHeight: 18,
  },
  tabRow: {
    backgroundColor: whiteColor,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: borderLightColor,
    padding: 4,
    marginBottom: hp(1.5),
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacings.medium,
    borderRadius: 8,
  },
  tabActive: { backgroundColor: redColor },
  tabText: { fontSize: style.fontSizeSmall1x.fontSize, color: grayColor, textAlign: 'center' },
  tabTextActive: { color: whiteColor },
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
    // No padding of its own — WalletTransactionRow brings its own, so an
    // expanded breakdown can sit flush inside the card.
    overflow: 'hidden',
    marginBottom: hp(2),
  },
});
