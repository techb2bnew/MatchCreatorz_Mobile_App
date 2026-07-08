import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../constans/Style';
import {
  blackColor,
  borderLightColor,
  grayColor,
  goldColor,
  greenColor,
  inputBgColor,
  lightPink,
  redColor,
  whiteColor,
} from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import {
  BIDS_SUFFIX,
  EMPTY_BIDS_MESSAGE,
  EMPTY_BIDS_TITLE,
  EMPTY_SEARCH_MESSAGE,
  EMPTY_SEARCH_TITLE,
  HIRE_CREATOR,
  VIEW_BIDS_TITLE,
} from '../constans/Constants';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../utils';

const {
  flex,
  flexDirectionRow,
  alignItemsCenter,
  justifyContentSpaceBetween,
  alignJustifyCenter,
} = BaseStyle;

const ViewBidsScreen = ({ navigation, route }) => {
  const job = route.params?.job;

  const [searchQuery, setSearchQuery] = useState('');
  const [bids, setBids] = useState([
    {
      id: '1',
      creatorName: 'Alex Johnson',
      initials: 'AJ',
      specialty: 'Logo Design',
      amount: '₹2,200',
      delivery: '3 days',
      rating: '4.9',
      reviews: 48,
      proposal:
        'I have 5+ years of branding experience. I will deliver 3 logo concepts with unlimited revisions.',
      hired: false,
    },
    {
      id: '2',
      creatorName: 'Priya Sharma',
      initials: 'PS',
      specialty: 'Brand Identity',
      amount: '₹1,800',
      delivery: '5 days',
      rating: '4.8',
      reviews: 32,
      proposal:
        'Specialized in bakery and food brands. Portfolio includes 20+ restaurant logos across India.',
      hired: false,
    },
    {
      id: '3',
      creatorName: 'Rahul Mehta',
      initials: 'RM',
      specialty: 'Graphic Design',
      amount: '₹2,500',
      delivery: '2 days',
      rating: '4.7',
      reviews: 21,
      proposal:
        'Fast turnaround with modern minimal style. Includes source files and brand color palette.',
      hired: false,
    },
    {
      id: '4',
      creatorName: 'Anita Verma',
      initials: 'AV',
      specialty: 'Illustration',
      amount: '₹1,500',
      delivery: '4 days',
      rating: '4.6',
      reviews: 15,
      proposal:
        'Hand-drawn illustrative logos with warm tones perfect for bakery businesses.',
      hired: false,
    },
  ]);

  const filteredBids = searchQuery.trim()
    ? bids.filter(
        b =>
          b.creatorName.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
          b.specialty.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
          b.proposal.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : bids;

  const handleHire = bidId => {
    setBids(prev =>
      prev.map(b => ({
        ...b,
        hired: b.id === bidId,
      })),
    );
  };

  return (
    <SafeAreaView style={[flex, styles.safeArea]} edges={['top']}>
      <View style={styles.container}>
        <View style={[styles.headerRow, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={20} color={blackColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, style.fontWeightMedium]}>{VIEW_BIDS_TITLE}</Text>
          <View style={styles.backBtn} />
        </View>

        {job ? (
          <View style={styles.jobSummary}>
            <Text style={[styles.jobTitle, style.fontWeightMedium]} numberOfLines={2}>
              {job.title}
            </Text>
            <Text style={[styles.jobMeta, style.fontWeightThin]}>
              {job.budgetRange} · {job.bidCount} {BIDS_SUFFIX}
            </Text>
          </View>
        ) : null}

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search bids..."
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {filteredBids.length === 0 ? (
            <EmptyState
              icon="users"
              title={searchQuery.trim() ? EMPTY_SEARCH_TITLE : EMPTY_BIDS_TITLE}
              message={searchQuery.trim() ? EMPTY_SEARCH_MESSAGE : EMPTY_BIDS_MESSAGE}
              compact
            />
          ) : (
            filteredBids.map(bid => (
              <View key={bid.id} style={styles.bidCard}>
                <View style={[flexDirectionRow, alignItemsCenter]}>
                  <View style={[styles.avatar, alignJustifyCenter]}>
                    <Text style={[styles.avatarText, style.fontWeightMedium]}>{bid.initials}</Text>
                  </View>
                  <View style={styles.bidInfo}>
                    <Text style={[styles.creatorName, style.fontWeightMedium]}>{bid.creatorName}</Text>
                    <Text style={[styles.specialty, style.fontWeightThin]}>{bid.specialty}</Text>
                    <View style={[flexDirectionRow, alignItemsCenter, styles.ratingRow]}>
                      <Icon name="star" size={12} color={goldColor} />
                      <Text style={[styles.ratingText, style.fontWeightMedium]}>
                        {bid.rating} ({bid.reviews})
                      </Text>
                    </View>
                  </View>
                  <View style={styles.bidRight}>
                    <Text style={[styles.bidAmount, style.fontWeightMedium]}>{bid.amount}</Text>
                    <Text style={styles.deliveryText}>{bid.delivery}</Text>
                  </View>
                </View>

                <Text style={[styles.proposal, style.fontWeightThin]} numberOfLines={3}>
                  {bid.proposal}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.hireBtn,
                    alignJustifyCenter,
                    flexDirectionRow,
                    bid.hired && styles.hireBtnDone,
                  ]}
                  onPress={() => handleHire(bid.id)}
                  disabled={bid.hired}>
                  <Icon name={bid.hired ? 'check' : 'user-check'} size={14} color={whiteColor} />
                  <Text style={[styles.hireBtnText, style.fontWeightMedium]}>
                    {bid.hired ? 'Hired' : HIRE_CREATOR}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ViewBidsScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: whiteColor },
  container: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
  },
  headerRow: { marginBottom: hp(1.5) },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: style.fontSizeLargeX.fontSize,
    color: blackColor,
  },
  jobSummary: {
    backgroundColor: lightPink,
    borderRadius: 12,
    padding: spacings.large,
    marginBottom: spacings.normal,
  },
  jobTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginBottom: 4,
  },
  jobMeta: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  scrollContent: { paddingBottom: hp(3) },
  bidCard: {
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    padding: spacings.large,
    marginBottom: spacings.large,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: inputBgColor,
    marginRight: spacings.normal,
  },
  avatarText: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  bidInfo: { flex: 1 },
  creatorName: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  specialty: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  ratingRow: { gap: 4, marginTop: 4 },
  ratingText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
  },
  bidRight: { alignItems: 'flex-end' },
  bidAmount: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  deliveryText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  proposal: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    lineHeight: 18,
    marginTop: spacings.large,
    marginBottom: spacings.large,
  },
  hireBtn: {
    backgroundColor: redColor,
    borderRadius: 8,
    paddingVertical: spacings.medium,
    gap: spacings.xsmall,
  },
  hireBtnDone: { backgroundColor: greenColor },
  hireBtnText: {
    color: whiteColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  emptyWrap: {
    paddingVertical: hp(8),
    gap: spacings.normal,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
  },
});
