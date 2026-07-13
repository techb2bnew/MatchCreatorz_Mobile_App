import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  purpleColor,
  redColor,
  screenBgColor,
  tabBgColor,
  whiteColor,
  goldColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import {
  BOOKING_ACTIONS,
  BOOKINGS_FILTER_LABELS,
  BOOKINGS_FILTER_TABS,
  BUYER_PREFIX,
  EMPTY_BOOKINGS_MESSAGE,
  EMPTY_BOOKINGS_TITLE,
  EMPTY_SEARCH_MESSAGE,
  EMPTY_SEARCH_TITLE,
  EMPTY_SELLER_BIDS_MESSAGE,
  EMPTY_SELLER_BIDS_TITLE,
  EMPTY_SELLER_OFFERS_MESSAGE,
  EMPTY_SELLER_OFFERS_TITLE,
  FEE_INCL_PREFIX,
  FEE_SUFFIX,
  SELLER_BIDS_ACCEPTED,
  SELLER_BIDS_BUDGET,
  SELLER_BIDS_CONNECTS_USED,
  SELLER_BIDS_DELIVERY,
  SELLER_BIDS_FILTER_ALL,
  SELLER_BIDS_FILTER_REJECTED,
  SELLER_BIDS_PENDING,
  SELLER_BIDS_SUCCESS_RATE,
  SELLER_BIDS_TITLE,
  SELLER_BIDS_TOTAL,
  SELLER_BIDS_YOUR_BID,
  SELLER_BOOKINGS_DISPUTE,
  SELLER_BOOKINGS_MARK_COMPLETE,
  SELLER_BOOKINGS_SEARCH,
  SELLER_BOOKINGS_TITLE,
  SELLER_OFFERS_ACCEPT,
  SELLER_OFFERS_DECLINE,
  SELLER_OFFER_ACCEPT_MESSAGE,
  SELLER_OFFER_ACCEPT_TITLE,
  SELLER_OFFER_DECLINE_MESSAGE,
  SELLER_OFFER_DECLINE_TITLE,
  SELLER_BOOKING_COMPLETE_MESSAGE,
  SELLER_BOOKING_COMPLETE_TITLE,
  SELLER_OFFERS_RECEIVED,
  SELLER_OFFERS_SENT,
  SELLER_OFFERS_TITLE,
  SELLER_STATIC_USER,
  SELLER_WORK_TABS,
  SCREEN_NAMES,
  TAB_SELLER_BOOKINGS_SEGMENT,
  TAB_SELLER_MY_BIDS,
  TAB_SELLER_OFFERS,
} from '../../constans/Constants';
import SearchBar from '../../components/SearchBar';
import ScreenHeader, { screenContentStyles } from '../../components/ScreenHeader';
import EmptyState from '../../components/EmptyState';
import ConfirmationModal from '../../components/modal/ConfirmationModal';
import { heightPercentageToDP as hp } from '../../utils';

const { flex, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween, alignJustifyCenter } = BaseStyle;

const WORK_SEGMENTS = [
  { id: SELLER_WORK_TABS.BIDS, label: TAB_SELLER_MY_BIDS },
  { id: SELLER_WORK_TABS.BOOKINGS, label: TAB_SELLER_BOOKINGS_SEGMENT },
  { id: SELLER_WORK_TABS.OFFERS, label: TAB_SELLER_OFFERS },
];

const getBidIcon = status => {
  if (status === 'Accepted') return { name: 'check-circle', color: greenColor, bg: '#E8F8EE' };
  if (status === 'Rejected' || status === 'Withdrawn') return { name: 'x-circle', color: redColor, bg: lightPink };
  return { name: 'clock', color: goldColor, bg: '#FFF4E5' };
};

const getBookingStatusStyle = status => {
  if (status === 'Ongoing') return { bg: '#E8F0F8', text: blueColor };
  if (status === 'Amidst-Completion-Process') return { bg: '#F3E8FF', text: purpleColor };
  if (status === 'In-dispute') return { bg: '#FFEBEB', text: redColor };
  if (status === 'Completed') return { bg: '#E8F8EE', text: greenColor };
  return { bg: '#F3F4F6', text: grayColor };
};

const formatInr = amount => `₹${amount.toLocaleString('en-IN')}`;

const SellerWorkScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState(SELLER_WORK_TABS.BIDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [bidFilter, setBidFilter] = useState('all');
  const [bookingFilter, setBookingFilter] = useState(BOOKINGS_FILTER_TABS.ACTIVE);
  const [offerSubTab, setOfferSubTab] = useState('received');
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    actionType: '',
    targetId: null,
    title: '',
    message: '',
    confirmColor: redColor,
    iconName: 'alert-circle',
  });

  const [bids] = useState([
    {
      id: '1',
      title: 'Need a Logo Design for Tech Startup',
      client: 'Alice Johnson',
      time: '1 week ago',
      yourBid: '₹20,750',
      budget: '₹16,600 - ₹33,200',
      delivery: '5 days',
      totalBids: 8,
      connects: 2,
      proposal: 'I have 5+ years of experience in logo design and have worked with multiple tech startups...',
      status: 'Pending',
    },
    {
      id: '2',
      title: 'Mobile App UI/UX Design',
      client: 'FinApp Co.',
      time: '2 weeks ago',
      yourBid: '₹39,800',
      budget: '₹33,200 - ₹58,100',
      delivery: '10 days',
      totalBids: 12,
      connects: 2,
      proposal: 'I specialize in fintech app design with a focus on clean, user-friendly interfaces...',
      status: 'Accepted',
    },
    {
      id: '3',
      title: 'Video Editing for YouTube Channel',
      client: 'Media House',
      time: '3 weeks ago',
      yourBid: '₹9,960',
      budget: '₹8,300 - ₹16,600',
      delivery: '3 days',
      totalBids: 15,
      connects: 1,
      proposal: 'Professional video editor with expertise in YouTube content optimization...',
      status: 'Rejected',
    },
  ]);

  const [bookings, setBookings] = useState([
    {
      id: '1',
      title: 'Logo Design',
      client: 'Alice Johnson',
      clientInitials: 'AJ',
      date: 'Nov 10, 2024',
      total: 20750,
      fee: 2075,
      status: 'Ongoing',
      filterType: 'active',
    },
    {
      id: '2',
      title: 'Icon Set',
      client: 'Carol Reed',
      clientInitials: 'CR',
      date: 'Nov 8, 2024',
      total: 9960,
      fee: 996,
      status: 'Amidst-Completion-Process',
      filterType: 'active',
    },
    {
      id: '3',
      title: 'UI Design',
      client: 'Grace Hopper',
      clientInitials: 'GH',
      date: 'Nov 2, 2024',
      total: 66400,
      fee: 6640,
      status: 'In-dispute',
      filterType: 'active',
    },
    {
      id: '4',
      title: 'Brochure Design',
      client: 'Design Co.',
      clientInitials: 'DC',
      date: 'Oct 20, 2024',
      total: 8500,
      fee: 850,
      status: 'Completed',
      filterType: 'completed',
    },
    {
      id: '5',
      title: 'Social Media Kit',
      client: 'Priya Sharma',
      clientInitials: 'PS',
      date: 'Oct 15, 2024',
      total: 12500,
      fee: 1250,
      status: 'Completed',
      filterType: 'completed',
    },
    {
      id: '6',
      title: 'Podcast Editing',
      client: 'Rahul Mehta',
      clientInitials: 'RM',
      date: 'Aug 5, 2024',
      total: 4500,
      fee: 450,
      status: 'Cancelled',
      filterType: 'cancelled',
    },
  ]);

  const [offers, setOffers] = useState({
    received: [
      {
        id: '1',
        client: 'Alice Johnson',
        initials: 'AJ',
        project: 'Logo Design for Tech Startup',
        message: 'Hi, I love your portfolio. Would you be interested in working on our logo project?',
        amount: '₹23,240',
        status: 'Pending',
      },
      {
        id: '2',
        client: 'Carol Reed',
        initials: 'CR',
        project: 'Brand Identity Package',
        message: 'We would like to offer you this project based on your previous work quality.',
        amount: '₹41,500',
        status: 'Pending',
      },
    ],
    sent: [
      {
        id: '3',
        client: 'Bob Smith',
        initials: 'BS',
        project: 'Website Redesign',
        message: 'I can deliver a modern responsive website within your timeline and budget.',
        amount: '₹58,100',
        status: 'Pending',
      },
    ],
  });

  useFocusEffect(
    useCallback(() => {
      const { initialTab } = route.params || {};
      if (initialTab) {
        setActiveTab(initialTab);
        navigation.setParams({ initialTab: undefined });
      }
    }, [route.params, navigation]),
  );

  const bidStats = useMemo(
    () => ({
      total: bids.length,
      pending: bids.filter(b => b.status === 'Pending').length,
      accepted: bids.filter(b => b.status === 'Accepted').length,
      successRate: `${Math.round((bids.filter(b => b.status === 'Accepted').length / bids.length) * 100)}%`,
    }),
    [bids],
  );

  const screenTitle = useMemo(() => {
    if (activeTab === SELLER_WORK_TABS.BIDS) return SELLER_BIDS_TITLE;
    if (activeTab === SELLER_WORK_TABS.BOOKINGS) return SELLER_BOOKINGS_TITLE;
    return SELLER_OFFERS_TITLE;
  }, [activeTab]);

  const searchPlaceholder = useMemo(() => {
    if (activeTab === SELLER_WORK_TABS.BOOKINGS) return SELLER_BOOKINGS_SEARCH;
    return 'Search...';
  }, [activeTab]);

  const filteredBids = useMemo(() => {
    let list = bids;
    if (bidFilter === 'pending') list = list.filter(b => b.status === 'Pending');
    else if (bidFilter === 'accepted') list = list.filter(b => b.status === 'Accepted');
    else if (bidFilter === 'rejected') list = list.filter(b => b.status === 'Rejected');
    if (!searchQuery.trim()) return list;
    const q = searchQuery.trim().toLowerCase();
    return list.filter(b => b.title.toLowerCase().includes(q) || b.client.toLowerCase().includes(q));
  }, [bids, bidFilter, searchQuery]);

  const filteredBookings = useMemo(() => {
    let list = bookings.filter(b => b.filterType === bookingFilter);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.trim().toLowerCase();
    return list.filter(
      b => b.title.toLowerCase().includes(q) || b.client.toLowerCase().includes(q),
    );
  }, [bookings, bookingFilter, searchQuery]);

  const activeOffers = offerSubTab === 'received' ? offers.received : offers.sent;

  const openConfirmModal = (actionType, targetId) => {
    const configs = {
      acceptOffer: {
        title: SELLER_OFFER_ACCEPT_TITLE,
        message: SELLER_OFFER_ACCEPT_MESSAGE,
        confirmColor: greenColor,
        iconName: 'check-circle',
      },
      declineOffer: {
        title: SELLER_OFFER_DECLINE_TITLE,
        message: SELLER_OFFER_DECLINE_MESSAGE,
        confirmColor: redColor,
        iconName: 'x-circle',
      },
      markComplete: {
        title: SELLER_BOOKING_COMPLETE_TITLE,
        message: SELLER_BOOKING_COMPLETE_MESSAGE,
        confirmColor: greenColor,
        iconName: 'check-circle',
      },
    };
    const config = configs[actionType];
    setConfirmModal({
      visible: true,
      actionType,
      targetId,
      title: config.title,
      message: config.message,
      confirmColor: config.confirmColor,
      iconName: config.iconName,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, visible: false }));
  };

  const handleConfirmAction = () => {
    const { actionType, targetId } = confirmModal;
    if (!targetId) {
      closeConfirmModal();
      return;
    }

    if (actionType === 'markComplete') {
      setBookings(prev =>
        prev.map(booking =>
          booking.id === targetId
            ? { ...booking, status: 'Amidst-Completion-Process' }
            : booking,
        ),
      );
    }

    if (actionType === 'acceptOffer' || actionType === 'declineOffer') {
      const newStatus = actionType === 'acceptOffer' ? 'Accepted' : 'Declined';
      setOffers(prev => ({
        ...prev,
        received: prev.received.map(offer =>
          offer.id === targetId ? { ...offer, status: newStatus } : offer,
        ),
      }));
    }

    closeConfirmModal();
  };

  const renderBidStats = () => (
    <View style={[styles.statsRow, flexDirectionRow]}>
      {[
        { label: SELLER_BIDS_TOTAL, value: bidStats.total, icon: 'briefcase', color: blueColor },
        { label: SELLER_BIDS_PENDING, value: bidStats.pending, icon: 'clock', color: goldColor },
        { label: SELLER_BIDS_ACCEPTED, value: bidStats.accepted, icon: 'check-circle', color: greenColor },
        { label: SELLER_BIDS_SUCCESS_RATE, value: bidStats.successRate, icon: 'trending-up', color: redColor },
      ].map(item => (
        <View key={item.label} style={styles.statCard}>
          <View style={[styles.statIcon, alignJustifyCenter, { backgroundColor: `${item.color}18` }]}>
            <Icon name={item.icon} size={14} color={item.color} />
          </View>
          <Text style={[styles.statValue, style.fontWeightMedium]}>{item.value}</Text>
          <Text style={[styles.statLabel, style.fontWeightThin]} numberOfLines={2}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderBidFilters = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
      {[
        { id: 'all', label: SELLER_BIDS_FILTER_ALL },
        { id: 'pending', label: `${SELLER_BIDS_PENDING} (${bidStats.pending})` },
        { id: 'accepted', label: `${SELLER_BIDS_ACCEPTED} (${bidStats.accepted})` },
        { id: 'rejected', label: SELLER_BIDS_FILTER_REJECTED },
      ].map(f => (
        <TouchableOpacity
          key={f.id}
          style={[styles.filterChip, bidFilter === f.id && styles.filterChipActive]}
          onPress={() => setBidFilter(f.id)}>
          <Text style={[styles.filterText, style.fontWeightMedium, bidFilter === f.id && styles.filterTextActive]}>
            {f.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderBids = () => (
    <>
      {renderBidStats()}
      {renderBidFilters()}
      <View style={styles.listCard}>
        {filteredBids.length === 0 ? (
          <EmptyState icon="file-text" title={EMPTY_SELLER_BIDS_TITLE} message={EMPTY_SELLER_BIDS_MESSAGE} compact />
        ) : (
          filteredBids.map((bid, index) => {
            const iconStyle = getBidIcon(bid.status);
            return (
              <View key={bid.id} style={[styles.bidCard, index < filteredBids.length - 1 && styles.rowBorder]}>
                <View style={[flexDirectionRow, alignItemsCenter, styles.bidTop]}>
                  <View style={[styles.bidStatusIcon, alignJustifyCenter, { backgroundColor: iconStyle.bg }]}>
                    <Icon name={iconStyle.name} size={18} color={iconStyle.color} />
                  </View>
                  <View style={styles.bidInfo}>
                    <Text style={[styles.bidTitle, style.fontWeightMedium]}>{bid.title}</Text>
                    <Text style={[styles.bidMeta, style.fontWeightThin]}>
                      {bid.client} · {bid.time}
                    </Text>
                  </View>
                  <View style={[styles.statusChip, { backgroundColor: iconStyle.bg }]}>
                    <Text style={[styles.statusText, { color: iconStyle.color }]}>{bid.status}</Text>
                  </View>
                </View>
                <View style={styles.metricsGrid}>
                  {[
                    { label: SELLER_BIDS_YOUR_BID, value: bid.yourBid, highlight: true },
                    { label: SELLER_BIDS_BUDGET, value: bid.budget },
                    { label: SELLER_BIDS_DELIVERY, value: bid.delivery },
                    { label: 'Total Bids', value: `${bid.totalBids}` },
                    { label: SELLER_BIDS_CONNECTS_USED, value: `${bid.connects}` },
                  ].map(m => (
                    <View key={m.label} style={styles.metricItem}>
                      <Text style={[styles.metricLabel, style.fontWeightThin]}>{m.label}</Text>
                      <Text
                        style={[
                          styles.metricValue,
                          style.fontWeightMedium,
                          m.highlight && { color: redColor },
                        ]}>
                        {m.value}
                      </Text>
                    </View>
                  ))}
                </View>
                <Text style={[styles.proposal, style.fontWeightThin]} numberOfLines={2}>
                  {bid.proposal}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </>
  );

  const renderBookingFilters = () => (
    <View style={[styles.filterRow, flexDirectionRow]}>
      {Object.values(BOOKINGS_FILTER_TABS).map(key => (
        <TouchableOpacity
          key={key}
          style={[styles.filterTab, alignJustifyCenter, bookingFilter === key && styles.filterTabActive]}
          onPress={() => setBookingFilter(key)}>
          <Text
            style={[
              styles.filterTabText,
              style.fontWeightMedium,
              bookingFilter === key && styles.filterTabTextActive,
            ]}>
            {BOOKINGS_FILTER_LABELS[key.toUpperCase()]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSellerBookingActions = booking => {
    if (booking.status === 'Ongoing') {
      return (
        <View style={[flexDirectionRow, styles.sellerBookingActionGroup]}>
          <TouchableOpacity
            style={[styles.sellerCompleteBtn, flexDirectionRow, alignItemsCenter]}
            onPress={() => openConfirmModal('markComplete', booking.id)}>
            <Icon name="upload" size={14} color={whiteColor} />
            <Text style={[styles.sellerCompleteText, style.fontWeightMedium]}>{SELLER_BOOKINGS_MARK_COMPLETE}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sellerDisputeBtn, flexDirectionRow, alignItemsCenter]}>
            <Icon name="alert-triangle" size={14} color="#C27803" />
            <Text style={[styles.sellerDisputeText, style.fontWeightMedium]}>{SELLER_BOOKINGS_DISPUTE}</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  const renderBookingCard = booking => {
    const statusStyle = getBookingStatusStyle(booking.status);

    return (
      <View key={booking.id} style={styles.sellerBookingCard}>
        <View style={[flexDirectionRow, alignItemsCenter]}>
          <View style={[styles.buyerAvatar, alignJustifyCenter]}>
            <Text style={[styles.buyerAvatarText, style.fontWeightMedium]}>{booking.clientInitials}</Text>
          </View>
          <View style={styles.sellerBookingInfo}>
            <Text style={[styles.sellerBookingTitle, style.fontWeightMedium]}>{booking.title}</Text>
            <Text style={[styles.buyerName, style.fontWeightThin]}>
              {BUYER_PREFIX} {booking.client}
            </Text>
            <Text style={styles.sellerBookingDate}>{booking.date}</Text>
          </View>
          <View style={styles.sellerBookingPriceWrap}>
            <Text style={[styles.sellerBookingPrice, style.fontWeightMedium]}>{formatInr(booking.total)}</Text>
            <Text style={styles.sellerBookingFee}>
              {FEE_INCL_PREFIX} {formatInr(booking.fee)} {FEE_SUFFIX}
            </Text>
          </View>
        </View>

        <View style={[styles.sellerBookingFooter, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter]}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>{booking.status}</Text>
          </View>
          <View style={[flexDirectionRow, alignItemsCenter, styles.sellerBookingActions]}>
            <TouchableOpacity
              style={[styles.sellerDetailsBtn, flexDirectionRow, alignItemsCenter]}
              onPress={() =>
                navigation.navigate(SCREEN_NAMES.BOOKING_DETAILS, {
                  booking: {
                    ...booking,
                    sellerName: booking.client,
                    sellerInitials: booking.clientInitials,
                    currency: '₹',
                  },
                })
              }>
              <Icon name="eye" size={14} color={blackColor} />
              <Text style={[styles.sellerDetailsText, style.fontWeightMedium]}>{BOOKING_ACTIONS.DETAILS}</Text>
            </TouchableOpacity>
            {renderSellerBookingActions(booking)}
          </View>
        </View>
      </View>
    );
  };

  const renderBookings = () => (
    <View>
      {renderBookingFilters()}
      {filteredBookings.length === 0 ? (
        <EmptyState
          icon="calendar"
          title={searchQuery.trim() ? EMPTY_SEARCH_TITLE : EMPTY_BOOKINGS_TITLE}
          message={searchQuery.trim() ? EMPTY_SEARCH_MESSAGE : EMPTY_BOOKINGS_MESSAGE}
        />
      ) : (
        filteredBookings.map(renderBookingCard)
      )}
    </View>
  );

  const renderOffers = () => (
    <>
      <View style={[styles.filterRow, flexDirectionRow]}>
        <TouchableOpacity
          style={[styles.filterTab, alignJustifyCenter, offerSubTab === 'received' && styles.filterTabActive]}
          onPress={() => setOfferSubTab('received')}>
          <Text
            style={[
              styles.filterTabText,
              style.fontWeightMedium,
              offerSubTab === 'received' && styles.filterTabTextActive,
            ]}>
            {SELLER_OFFERS_RECEIVED}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, alignJustifyCenter, offerSubTab === 'sent' && styles.filterTabActive]}
          onPress={() => setOfferSubTab('sent')}>
          <Text
            style={[
              styles.filterTabText,
              style.fontWeightMedium,
              offerSubTab === 'sent' && styles.filterTabTextActive,
            ]}>
            {SELLER_OFFERS_SENT}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.listCard}>
        {activeOffers.length === 0 ? (
          <EmptyState icon="tag" title={EMPTY_SELLER_OFFERS_TITLE} message={EMPTY_SELLER_OFFERS_MESSAGE} compact />
        ) : (
          activeOffers.map((offer, index) => (
            <View key={offer.id} style={[styles.offerCard, index < activeOffers.length - 1 && styles.rowBorder]}>
              <View style={[flexDirectionRow, alignItemsCenter, styles.offerTop]}>
                <View style={[styles.clientAvatar, alignJustifyCenter]}>
                  <Text style={[styles.clientInitials, style.fontWeightMedium]}>{offer.initials}</Text>
                </View>
                <View style={styles.offerInfo}>
                  <Text style={[styles.offerClient, style.fontWeightMedium]}>{offer.client}</Text>
                  <Text style={[styles.offerProject, style.fontWeightThin]}>Re: {offer.project}</Text>
                </View>
                <Text style={[styles.offerAmount, style.fontWeightMedium]}>{offer.amount}</Text>
              </View>
              <Text style={[styles.offerMessage, style.fontWeightThin]} numberOfLines={2}>
                {offer.message}
              </Text>
              {offerSubTab === 'received' && offer.status === 'Pending' ? (
                <View style={[styles.offerActions, flexDirectionRow]}>
                  <TouchableOpacity
                    style={[styles.declineBtn, flex]}
                    onPress={() => openConfirmModal('declineOffer', offer.id)}>
                    <Text style={[styles.declineText, style.fontWeightMedium]}>{SELLER_OFFERS_DECLINE}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.acceptBtn, flex]}
                    onPress={() => openConfirmModal('acceptOffer', offer.id)}>
                    <Text style={[styles.acceptText, style.fontWeightMedium]}>{SELLER_OFFERS_ACCEPT}</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          ))
        )}
      </View>
    </>
  );

  return (
    <SafeAreaView style={[flex, styles.safeArea]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={screenContentStyles.scrollContent}
        bounces={false}>
        <ScreenHeader title={screenTitle} navigation={navigation} user={SELLER_STATIC_USER} />

        <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder={searchPlaceholder} />

        <View style={[styles.tabRow, flexDirectionRow]}>
          {WORK_SEGMENTS.map(segment => {
            const isActive = activeTab === segment.id;
            return (
              <TouchableOpacity
                key={segment.id}
                style={[styles.tab, alignJustifyCenter, isActive && styles.tabActive]}
                onPress={() => {
                  setActiveTab(segment.id);
                  setSearchQuery('');
                }}>
                <Text style={[styles.tabText, style.fontWeightMedium, isActive && styles.tabTextActive]}>
                  {segment.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeTab === SELLER_WORK_TABS.BIDS && renderBids()}
        {activeTab === SELLER_WORK_TABS.BOOKINGS && renderBookings()}
        {activeTab === SELLER_WORK_TABS.OFFERS && renderOffers()}
      </ScrollView>

      <ConfirmationModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmColor={confirmModal.confirmColor}
        iconName={confirmModal.iconName}
        onConfirm={handleConfirmAction}
        onCancel={closeConfirmModal}
      />
    </SafeAreaView>
  );
};

export default SellerWorkScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: screenBgColor },
  tabRow: {
    backgroundColor: whiteColor,
    borderRadius: 10,
    padding: 4,
    marginBottom: hp(2),
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
  filterRow: {
    backgroundColor: tabBgColor,
    borderRadius: 10,
    padding: 4,
    marginBottom: hp(2),
    gap: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacings.medium,
    borderRadius: 8,
  },
  filterTabActive: { backgroundColor: whiteColor },
  filterTabText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    textAlign: 'center',
  },
  filterTabTextActive: { color: redColor },
  statsRow: { gap: spacings.normal, marginBottom: hp(1.8) },
  statCard: {
    flex: 1,
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    padding: spacings.normal,
    alignItems: 'center',
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: spacings.xsmall,
  },
  statValue: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  statLabel: {
    fontSize: 9,
    color: grayColor,
    textAlign: 'center',
    marginTop: 2,
  },
  filterRow: { gap: spacings.normal, marginBottom: hp(1.8) },
  filterChip: {
    borderRadius: 20,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.normal,
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
  },
  filterChipActive: { backgroundColor: redColor, borderColor: redColor },
  filterText: { fontSize: style.fontSizeSmall1x.fontSize, color: grayColor },
  filterTextActive: { color: whiteColor },
  listCard: {
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    overflow: 'hidden',
    marginBottom: hp(2),
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderLightColor,
  },
  bidCard: { padding: spacings.large, gap: spacings.normal },
  bidTop: { gap: spacings.normal },
  bidStatusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  bidInfo: { flex: 1 },
  bidTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginBottom: 2,
  },
  bidMeta: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  statusChip: {
    borderRadius: 10,
    paddingHorizontal: spacings.normal,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacings.normal,
  },
  metricItem: { width: '30%', minWidth: 90 },
  metricLabel: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
  },
  proposal: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    lineHeight: 18,
  },
  sellerBookingCard: {
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    padding: spacings.large,
    marginBottom: spacings.large,
  },
  buyerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: redColor,
    marginRight: spacings.normal,
  },
  buyerAvatarText: {
    color: whiteColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  sellerBookingInfo: { flex: 1 },
  sellerBookingTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  buyerName: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  sellerBookingDate: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  sellerBookingPriceWrap: { alignItems: 'flex-end' },
  sellerBookingPrice: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  sellerBookingFee: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  sellerBookingFooter: {
    marginTop: spacings.large,
    flexWrap: 'wrap',
    gap: spacings.normal,
  },
  statusBadge: {
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.xsmall,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    fontWeight: '600',
  },
  sellerBookingActions: {
    gap: spacings.normal,
    flexWrap: 'wrap',
  },
  sellerBookingActionGroup: { gap: spacings.normal },
  sellerDetailsBtn: {
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 8,
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.small,
    gap: spacings.xsmall,
  },
  sellerDetailsText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
  },
  sellerCompleteBtn: {
    backgroundColor: redColor,
    borderRadius: 8,
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.small,
    gap: spacings.xsmall,
  },
  sellerCompleteText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: whiteColor,
  },
  sellerDisputeBtn: {
    borderWidth: 1,
    borderColor: '#C27803',
    borderRadius: 8,
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.small,
    gap: spacings.xsmall,
    backgroundColor: '#FFF4E5',
  },
  sellerDisputeText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: '#C27803',
  },
  clientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: inputBgColor,
  },
  clientInitials: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  offerCard: { padding: spacings.large, gap: spacings.normal },
  offerTop: { gap: spacings.normal },
  offerInfo: { flex: 1 },
  offerClient: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  offerProject: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  offerAmount: {
    fontSize: style.fontSizeLarge.fontSize,
    color: redColor,
  },
  offerMessage: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    lineHeight: 18,
  },
  offerActions: { gap: spacings.normal },
  declineBtn: {
    borderWidth: 1,
    borderColor: redColor,
    borderRadius: 8,
    paddingVertical: spacings.normal,
    alignItems: 'center',
  },
  declineText: { color: redColor, fontSize: style.fontSizeSmall1x.fontSize },
  acceptBtn: {
    backgroundColor: greenColor,
    borderRadius: 8,
    paddingVertical: spacings.normal,
    alignItems: 'center',
  },
  acceptText: { color: whiteColor, fontSize: style.fontSizeSmall1x.fontSize },
});
