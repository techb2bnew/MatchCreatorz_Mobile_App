import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  SELLER_WALLET_WITHDRAW_TOAST,
} from '../../constans/Constants';
import ScreenHeader, { screenContentStyles } from '../../components/ScreenHeader';
import CustomButton from '../../components/CustomButton';
import EmptyState from '../../components/EmptyState';
import { formatAppCurrency } from '../../utils/currency';
import { heightPercentageToDP as hp } from '../../utils';

const {
  flex,
  flexDirectionRow,
  alignItemsCenter,
  justifyContentSpaceBetween,
  alignJustifyCenter,
} = BaseStyle;

const formatCurrency = value => formatAppCurrency(value, { whole: true });

const SellerWalletScreen = ({ navigation }) => {
  const [walletStats] = useState({
    balance: 236000,
    totalEarnings: 1510000,
    totalWithdrawn: 1274000,
  });

  const [transactions] = useState([
    { id: '1', title: 'Booking #12 - Logo Design', date: 'Nov 10, 2024', amount: 18675, type: 'credit' },
    { id: '2', title: 'Booking #11 - Icon Set', date: 'Nov 7, 2024', amount: 8964, type: 'credit' },
    { id: '3', title: 'Booking #10 - Brand Identity', date: 'Nov 2, 2024', amount: 59760, type: 'credit' },
    { id: '4', title: 'Withdrawal Request', date: 'Nov 5, 2024', amount: 41500, type: 'debit' },
    { id: '5', title: 'Withdrawal Request', date: 'Oct 28, 2024', amount: 83000, type: 'debit' },
  ]);

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

  const handleWithdraw = () => {
    Alert.alert(SELLER_WALLET_WITHDRAW_BTN, SELLER_WALLET_WITHDRAW_TOAST);
  };

  return (
    <SafeAreaView style={[flex, styles.safeArea]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={screenContentStyles.scrollContent}
        bounces={false}>
        <ScreenHeader
          title={SELLER_WALLET_TITLE}
          navigation={navigation}
          onBack={() => navigation.goBack()}
        />

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

        <View style={styles.withdrawCard}>
          <View style={styles.withdrawInfo}>
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
              onPress={handleWithdraw}
              style={styles.withdrawBtn}
            />
          </View>
        </View>

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
      </ScrollView>
    </SafeAreaView>
  );
};

export default SellerWalletScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: screenBgColor },
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
});
