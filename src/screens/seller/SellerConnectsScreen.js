import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { BaseStyle } from '../../constans/Style';
import {
  blackColor,
  borderLightColor,
  grayColor,
  greenColor,
  redColor,
  screenBgColor,
  whiteColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import {
  EMPTY_CONNECTS_HISTORY_MESSAGE,
  EMPTY_CONNECTS_HISTORY_TITLE,
  SELLER_CONNECTS_AVAILABLE,
  SELLER_CONNECTS_AVAILABLE_SUB,
  SELLER_CONNECTS_BUY_NOW,
  SELLER_CONNECTS_BUY_CONFIRM_MESSAGE,
  SELLER_CONNECTS_BUY_CONFIRM_TITLE,
  SELLER_CONNECTS_BUY_TITLE,
  SELLER_CONNECTS_BUY_UNAVAILABLE_TOAST,
  SELLER_CONNECTS_HISTORY,
  SELLER_CONNECTS_MOST_POPULAR,
  SELLER_CONNECTS_PURCHASED,
  SELLER_CONNECTS_TITLE,
  SELLER_CONNECTS_USED,
} from '../../constans/Constants';
import ScreenHeader, { screenContentStyles } from '../../components/ScreenHeader';
import ConfirmationModal from '../../components/modal/ConfirmationModal';
import EmptyState from '../../components/EmptyState';
import { selectAuth } from '../../redux/slices/authSlice';
import { getSellerConnectsBalanceApi, getSellerConnectsHistoryApi } from '../../services/sellerService';
import { heightPercentageToDP as hp } from '../../utils';

const { flex, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween } = BaseStyle;

// No self-serve purchase endpoint exists yet — only Admin can credit connects to a seller.
const PLANS = [
  { id: '1', name: 'Starter', price: '$830', connects: 30, popular: false, discount: null },
  { id: '2', name: 'Pro', price: '$1,660', connects: 80, popular: true, discount: '15% off' },
  { id: '3', name: 'Business', price: '$3,320', connects: 200, popular: false, discount: '20% off' },
];

const extractBalance = response => {
  const data = response?.data ?? response ?? {};
  return {
    available: Number(data.available ?? data.available_connects ?? data.connects_balance ?? data.balance ?? 0) || 0,
    purchased: Number(data.total_purchased ?? data.purchased ?? 0) || 0,
    used: Number(data.total_used ?? data.used ?? 0) || 0,
  };
};

const extractHistoryList = response => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.history)) return data.history;
  if (Array.isArray(data?.transactions)) return data.transactions;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
};

const formatHistoryDate = dateStr => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return String(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const mapApiHistoryToUi = item => {
  const amount = Number(item?.amount ?? item?.connects ?? 0) || 0;
  const typeRaw = String(item?.type || '').trim().toLowerCase();
  const isCredit = typeRaw ? typeRaw === 'credit' : amount >= 0;

  return {
    id: String(item?.id),
    title: item?.title || item?.description || item?.reason || (isCredit ? 'Connects credited' : 'Connects used'),
    date: formatHistoryDate(item?.created_at || item?.createdAt || item?.date),
    amount: Math.abs(amount),
    isCredit,
  };
};

const SellerConnectsScreen = ({ navigation }) => {
  const { token } = useSelector(selectAuth);
  const [stats, setStats] = useState({ available: 0, purchased: 0, used: 0 });
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const fetchConnectsData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const [balanceResponse, historyResponse] = await Promise.all([
        getSellerConnectsBalanceApi(token),
        getSellerConnectsHistoryApi(token, { page: 1, limit: 20 }),
      ]);
      setStats(extractBalance(balanceResponse));
      setHistory(extractHistoryList(historyResponse).map(mapApiHistoryToUi));
    } catch (error) {
      setStats({ available: 0, purchased: 0, used: 0 });
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchConnectsData();
    }, [fetchConnectsData]),
  );

  const handleBuy = plan => {
    setSelectedPlan(plan);
    setShowBuyModal(true);
  };

  const handleConfirmBuy = () => {
    setShowBuyModal(false);
    setSelectedPlan(null);
    Alert.alert(SELLER_CONNECTS_BUY_TITLE, SELLER_CONNECTS_BUY_UNAVAILABLE_TOAST);
  };

  return (
    <SafeAreaView style={[flex, styles.safeArea]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={screenContentStyles.scrollContent}
        bounces={false}>
        <ScreenHeader
          title={SELLER_CONNECTS_TITLE}
          navigation={navigation}
          onBack={() => navigation.goBack()}
        />

        {isLoading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="small" color={redColor} />
          </View>
        ) : (
          <>
            <View style={[styles.statsRow, flexDirectionRow]}>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, style.fontWeightMedium]}>{stats.available}</Text>
                <Text style={[styles.statLabel, style.fontWeightThin]}>{SELLER_CONNECTS_AVAILABLE}</Text>
                <Text style={[styles.statSub, style.fontWeightThin, { color: greenColor }]}>
                  {SELLER_CONNECTS_AVAILABLE_SUB}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, style.fontWeightMedium]}>{stats.purchased}</Text>
                <Text style={[styles.statLabel, style.fontWeightThin]}>{SELLER_CONNECTS_PURCHASED}</Text>
                <Text style={[styles.statSub, style.fontWeightThin, { color: greenColor }]}>All time</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, style.fontWeightMedium]}>{stats.used}</Text>
                <Text style={[styles.statLabel, style.fontWeightThin]}>{SELLER_CONNECTS_USED}</Text>
                <Text style={[styles.statSub, style.fontWeightThin, { color: greenColor }]}>All time bids</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, style.fontWeightMedium]}>{SELLER_CONNECTS_BUY_TITLE}</Text>
            {PLANS.map(plan => (
              <View key={plan.id} style={[styles.planCard, plan.popular && styles.planCardPopular]}>
                {plan.popular ? (
                  <View style={styles.popularBadge}>
                    <Text style={[styles.popularText, style.fontWeightMedium]}>{SELLER_CONNECTS_MOST_POPULAR}</Text>
                  </View>
                ) : null}
                <View style={[flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter]}>
                  <View>
                    <Text style={[styles.planName, style.fontWeightMedium]}>{plan.name}</Text>
                    <Text style={[styles.planConnects, style.fontWeightThin]}>{plan.connects} Connects</Text>
                  </View>
                  <View style={alignItemsCenter}>
                    <Text style={[styles.planPrice, style.fontWeightMedium]}>{plan.price}</Text>
                    {plan.discount ? (
                      <Text style={[styles.discount, style.fontWeightMedium]}>{plan.discount}</Text>
                    ) : null}
                  </View>
                </View>
                <TouchableOpacity
                  style={[plan.popular ? styles.buyBtnFilled : styles.buyBtnOutline, alignItemsCenter]}
                  onPress={() => handleBuy(plan)}>
                  <Text
                    style={[
                      plan.popular ? styles.buyTextFilled : styles.buyTextOutline,
                      style.fontWeightMedium,
                    ]}>
                    {SELLER_CONNECTS_BUY_NOW}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            <Text style={[styles.sectionTitle, style.fontWeightMedium]}>{SELLER_CONNECTS_HISTORY}</Text>
            {history.length === 0 ? (
              <EmptyState
                icon="link"
                title={EMPTY_CONNECTS_HISTORY_TITLE}
                message={EMPTY_CONNECTS_HISTORY_MESSAGE}
                compact
              />
            ) : (
              <View style={styles.listCard}>
                {history.map((item, index) => (
                  <View
                    key={item.id}
                    style={[
                      styles.historyRow,
                      flexDirectionRow,
                      alignItemsCenter,
                      justifyContentSpaceBetween,
                      index < history.length - 1 && styles.rowBorder,
                    ]}>
                    <View style={styles.historyInfo}>
                      <Text style={[styles.historyTitle, style.fontWeightMedium]}>{item.title}</Text>
                      <Text style={[styles.historyDate, style.fontWeightThin]}>{item.date}</Text>
                    </View>
                    <Text
                      style={[
                        styles.historyAmount,
                        style.fontWeightMedium,
                        { color: item.isCredit ? greenColor : redColor },
                      ]}>
                      {item.isCredit ? '+' : '-'}
                      {item.amount} connects
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <ConfirmationModal
        visible={showBuyModal}
        title={SELLER_CONNECTS_BUY_CONFIRM_TITLE}
        message={
          selectedPlan
            ? `${SELLER_CONNECTS_BUY_CONFIRM_MESSAGE}\n\n${selectedPlan.name} — ${selectedPlan.price} (${selectedPlan.connects} connects)`
            : SELLER_CONNECTS_BUY_CONFIRM_MESSAGE
        }
        confirmText={SELLER_CONNECTS_BUY_NOW}
        iconName="shopping-cart"
        onConfirm={handleConfirmBuy}
        onCancel={() => {
          setShowBuyModal(false);
          setSelectedPlan(null);
        }}
      />
    </SafeAreaView>
  );
};

export default SellerConnectsScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: screenBgColor },
  loaderWrap: { paddingVertical: hp(6), alignItems: 'center' },
  statsRow: { gap: spacings.normal, marginBottom: hp(2) },
  statCard: {
    flex: 1,
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    padding: spacings.large,
    alignItems: 'center',
  },
  statValue: {
    fontSize: style.fontSizeLarge.fontSize,
    color: blackColor,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    textAlign: 'center',
    marginBottom: 2,
  },
  statSub: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
    marginBottom: spacings.normal,
  },
  planCard: {
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    padding: spacings.large,
    marginBottom: spacings.normal,
    gap: spacings.large,
  },
  planCardPopular: {
    borderColor: redColor,
    borderWidth: 2,
  },
  popularBadge: {
    alignSelf: 'flex-start',
    backgroundColor: redColor,
    borderRadius: 6,
    paddingHorizontal: spacings.normal,
    paddingVertical: 2,
    marginBottom: -spacings.small,
  },
  popularText: {
    color: whiteColor,
    fontSize: style.fontSizeExtraSmall.fontSize,
  },
  planName: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginBottom: 2,
  },
  planConnects: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  planPrice: {
    fontSize: style.fontSizeLarge.fontSize,
    color: blackColor,
  },
  discount: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: greenColor,
    marginTop: 2,
  },
  buyBtnOutline: {
    borderWidth: 1,
    borderColor: redColor,
    borderRadius: 8,
    paddingVertical: spacings.normal,
  },
  buyBtnFilled: {
    backgroundColor: redColor,
    borderRadius: 8,
    paddingVertical: spacings.normal,
  },
  buyTextOutline: { color: redColor, fontSize: style.fontSizeSmall1x.fontSize },
  buyTextFilled: { color: whiteColor, fontSize: style.fontSizeSmall1x.fontSize },
  listCard: {
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    overflow: 'hidden',
    marginBottom: hp(2),
  },
  historyRow: { padding: spacings.large },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderLightColor,
  },
  historyInfo: { flex: 1, paddingRight: spacings.normal },
  historyTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginBottom: 2,
  },
  historyDate: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  historyAmount: {
    fontSize: style.fontSizeSmall1x.fontSize,
  },
});
