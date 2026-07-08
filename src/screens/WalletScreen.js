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
import { BaseStyle } from '../constans/Style';
import {
  blackColor,
  blueColor,
  borderLightColor,
  grayColor,
  greenColor,
  lightPink,
  redColor,
  whiteColor,
} from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import {
  EMPTY_WALLET_TRANSACTIONS_MESSAGE,
  EMPTY_WALLET_TRANSACTIONS_TITLE,
  WALLET_ADD_MONEY_BTN,
  WALLET_ADD_MONEY_DESC,
  WALLET_ADD_MONEY_TITLE,
  WALLET_ADD_MONEY_TOAST,
  WALLET_ALL_TIME,
  WALLET_AVAILABLE_SUBTITLE,
  WALLET_BALANCE_LABEL,
  WALLET_CURRENT_BALANCE,
  WALLET_TITLE,
  WALLET_TOTAL_REFUNDED_LABEL,
  WALLET_TOTAL_SPENT_LABEL,
  WALLET_TRANSACTION_HISTORY,
} from '../constans/Constants';
import ScreenHeader, { screenContentStyles } from '../components/ScreenHeader';
import CustomButton from '../components/CustomButton';
import EmptyState from '../components/EmptyState';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../utils';

const {
  flex,
  flexDirectionRow,
  alignItemsCenter,
  justifyContentSpaceBetween,
  alignJustifyCenter,
} = BaseStyle;

const formatCurrency = (value, currency = '$', withDecimals = false) => {
  const formatted = withDecimals
    ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : value.toLocaleString('en-US');
  return `${currency}${formatted}`;
};

const WalletScreen = ({ navigation }) => {
  const [walletStats] = useState({
    balance: 1405,
    totalSpent: 3840,
    totalRefunded: 400,
    currency: '$',
  });

  const [transactions] = useState([
    {
      id: '1',
      title: 'Wallet Top-up via Stripe',
      date: 'Nov 10, 2024',
      amount: 1000,
      type: 'credit',
    },
    {
      id: '2',
      title: 'Booking #8 - Logo Design',
      date: 'Nov 9, 2024',
      amount: 275,
      type: 'debit',
    },
    {
      id: '3',
      title: 'Booking #7 - Copywriting',
      date: 'Nov 8, 2024',
      amount: 150,
      type: 'debit',
    },
    {
      id: '4',
      title: 'Refund - Video Editing',
      date: 'Nov 7, 2024',
      amount: 400,
      type: 'credit',
    },
    {
      id: '5',
      title: 'Booking #5 - Brand Guidelines',
      date: 'Nov 5, 2024',
      amount: 220,
      type: 'debit',
    },
    {
      id: '6',
      title: 'Wallet Top-up via Stripe',
      date: 'Nov 1, 2024',
      amount: 500,
      type: 'credit',
    },
  ]);

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

  const handleAddMoney = () => {
    Alert.alert(WALLET_ADD_MONEY_BTN, WALLET_ADD_MONEY_TOAST);
  };

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
        bounces={false}>
        <ScreenHeader title={WALLET_TITLE} navigation={navigation} />

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
              onPress={handleAddMoney}
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default WalletScreen;

const styles = StyleSheet.create({
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
});
