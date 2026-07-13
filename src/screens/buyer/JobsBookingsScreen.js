import React, { useMemo, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../../constans/Style';
import {
  blackColor,
  borderLightColor,
  grayColor,
  greenColor,
  inputBgColor,
  purpleColor,
  redColor,
  screenBgColor,
  tabBgColor,
  whiteColor,
  goldColor,
  blueColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import {
  BOOKING_ACCEPT_MESSAGE,
  BOOKING_ACCEPT_TITLE,
  BOOKING_ACTIONS,
  BOOKING_CANCEL_MESSAGE,
  BOOKING_CANCEL_TITLE,
  BOOKING_REJECT_MESSAGE,
  BOOKING_REJECT_TITLE,
  BOOKINGS_FILTER_LABELS,
  BOOKINGS_FILTER_TABS,
  BOOKINGS_SCREEN_TITLE,
  BUYER_PROTECTION,
  BIDS_SUFFIX,
  EXPERIENCE_LEVELS,
  FEE_INCL_PREFIX,
  FEE_SUFFIX,
  JOB_ACTIONS,
  JOB_CATEGORIES,
  JOB_TYPES,
  JOBS_BOOKINGS_TABS,
  JOBS_SCREEN_TITLE,
  JOBS_SEARCH_PLACEHOLDER,
  MY_JOBS_POST_NEW_TAB,
  MY_JOBS_POSTED_TAB,
  MY_JOBS_STATS_CONFIG,
  MY_JOBS_SUB_TABS,
  EMPTY_BOOKINGS_MESSAGE,
  EMPTY_BOOKINGS_TITLE,
  EMPTY_JOBS_MESSAGE,
  EMPTY_JOBS_TITLE,
  EMPTY_SEARCH_MESSAGE,
  EMPTY_SEARCH_TITLE,
  PLATFORM_STATS,
  PLATFORM_STATS_TITLE,
  POST_JOB_BTN,
  POST_JOB_LABELS,
  POST_JOB_PLACEHOLDERS,
  POST_JOB_SUBTITLE,
  POST_JOB_TIPS,
  POST_JOB_TITLE,
  SCREEN_NAMES,
  SELLER_PREFIX,
  TAB_BOOKINGS,
  TAB_MY_JOBS,
  TIPS_TITLE,
  UPDATE_JOB_BTN,
} from '../../constans/Constants';
import CustomTextInput from '../../components/CustomTextInput';
import CustomButton from '../../components/CustomButton';
import CustomDropdown from '../../components/CustomDropdown';
import SearchBar from '../../components/SearchBar';
import ScreenHeader, { screenContentStyles } from '../../components/ScreenHeader';
import ConfirmationModal from '../../components/modal/ConfirmationModal';
import EmptyState from '../../components/EmptyState';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';
import {
  keyboardAvoidingBehavior,
  scrollInputAboveKeyboard,
  useKeyboardBottomInset,
} from '../../utils/keyboard';

const {
  flex,
  flexDirectionRow,
  alignItemsCenter,
  justifyContentSpaceBetween,
  alignJustifyCenter,
  flexWrap,
} = BaseStyle;

const getJobStatusStyle = status => {
  if (status === 'Open') return { bg: '#E8F8EE', text: '#1B7A45' };
  if (status === 'In Progress') return { bg: '#E8F0F8', text: blueColor };
  return { bg: '#F3F4F6', text: grayColor };
};

const getBookingStatusStyle = status => {
  if (status === 'Ongoing') return { bg: '#E8F0F8', text: blueColor };
  if (status === 'Amidst-Completion-Process') return { bg: '#F3E8FF', text: purpleColor };
  if (status === 'In-dispute') return { bg: '#FFEBEB', text: redColor };
  if (status === 'Completed') return { bg: '#E8F8EE', text: greenColor };
  return { bg: '#F3F4F6', text: grayColor };
};

const formatCurrency = (amount, currency = '$') =>
  `${currency}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

const EMPTY_POST_JOB_FORM = {
  title: '',
  description: '',
  category: 'Design',
  jobType: 'Fixed Price',
  budgetMin: '',
  budgetMax: '',
  deadline: '',
  experienceLevel: 'Any Level',
  skills: '',
};

const JobsBookingsScreen = ({ navigation, route }) => {
  const scrollRef = useRef(null);
  const keyboardBottom = useKeyboardBottomInset(40);
  const [activeTab, setActiveTab] = useState(JOBS_BOOKINGS_TABS.JOBS);
  const [jobsSubTab, setJobsSubTab] = useState(MY_JOBS_SUB_TABS.POSTED);
  const [bookingFilter, setBookingFilter] = useState(BOOKINGS_FILTER_TABS.ACTIVE);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingJobId, setEditingJobId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    title: '',
    message: '',
    actionType: '',
    bookingId: null,
    confirmColor: redColor,
    iconName: 'alert-circle',
  });

  const [jobs, setJobs] = useState([
    {
      id: '1',
      title: 'Logo Design for My Bakery',
      category: 'Design',
      date: 'Jun 28',
      status: 'Open',
      description:
        'Need a modern logo for my bakery brand with warm colors and a clean, minimal style.',
      budgetRange: '₹1,000–₹2,500',
      bidCount: 7,
    },
    {
      id: '2',
      title: 'WordPress Blog Setup',
      category: 'Development',
      date: 'Jun 20',
      status: 'In Progress',
      description:
        'Looking for someone to set up a WordPress blog with custom theme and essential plugins.',
      budgetRange: '₹3,000–₹5,000',
      bidCount: 12,
    },
    {
      id: '3',
      title: 'Social Media Graphics Pack',
      category: 'Design',
      date: 'Jun 15',
      status: 'Closed',
      description:
        'Need a bundle of Instagram and Facebook graphics for a product launch campaign.',
      budgetRange: '₹2,000–₹4,000',
      bidCount: 9,
    },
    {
      id: '4',
      title: 'Product Photography',
      category: 'Video',
      date: 'Jun 10',
      status: 'Open',
      description:
        'Professional product photos for e-commerce listings. 15 products, white background.',
      budgetRange: '₹5,000–₹8,000',
      bidCount: 5,
    },
  ]);

  const [bookings, setBookings] = useState([
    {
      id: '1',
      title: 'Logo Design',
      sellerName: 'Bob Smith',
      sellerInitials: 'BS',
      date: 'Nov 10, 2024',
      total: 275.0,
      fee: 25.0,
      currency: '$',
      status: 'Ongoing',
      filterType: 'active',
    },
    {
      id: '2',
      title: 'Web Dev',
      sellerName: 'Diana Prince',
      sellerInitials: 'DP',
      date: 'Nov 8, 2024',
      total: 1320.0,
      fee: 120.0,
      currency: '$',
      status: 'Amidst-Completion-Process',
      filterType: 'active',
    },
    {
      id: '3',
      title: 'Video Editing',
      sellerName: 'Grace Hopper',
      sellerInitials: 'GH',
      date: 'Nov 2, 2024',
      total: 880.0,
      fee: 80.0,
      currency: '$',
      status: 'In-dispute',
      filterType: 'active',
    },
    {
      id: '4',
      title: 'Social Media Kit',
      sellerName: 'Alex Johnson',
      sellerInitials: 'AJ',
      date: 'Oct 15, 2024',
      total: 450.0,
      fee: 40.0,
      currency: '$',
      status: 'Completed',
      filterType: 'completed',
    },
    {
      id: '5',
      title: 'Brochure Design',
      sellerName: 'Priya Sharma',
      sellerInitials: 'PS',
      date: 'Sep 20, 2024',
      total: 320.0,
      fee: 30.0,
      currency: '$',
      status: 'Completed',
      filterType: 'completed',
    },
    {
      id: '6',
      title: 'Podcast Editing',
      sellerName: 'Rahul Mehta',
      sellerInitials: 'RM',
      date: 'Aug 5, 2024',
      total: 150.0,
      fee: 15.0,
      currency: '$',
      status: 'Cancelled',
      filterType: 'cancelled',
    },
  ]);

  const [postJobForm, setPostJobForm] = useState({ ...EMPTY_POST_JOB_FORM });

  useFocusEffect(
    useCallback(() => {
      const { initialTab, initialJobsSubTab } = route.params || {};
      if (initialTab) setActiveTab(initialTab);
      if (initialJobsSubTab) setJobsSubTab(initialJobsSubTab);
      if (initialTab || initialJobsSubTab) {
        navigation.setParams({ initialTab: undefined, initialJobsSubTab: undefined });
      }
    }, [route.params, navigation]),
  );

  const isJobsTab = activeTab === JOBS_BOOKINGS_TABS.JOBS;

  const jobStats = useMemo(
    () => ({
      total: jobs.length,
      open: jobs.filter(j => j.status === 'Open').length,
      progress: jobs.filter(j => j.status === 'In Progress').length,
      bids: jobs.reduce((sum, j) => sum + j.bidCount, 0),
    }),
    [jobs],
  );

  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    const q = searchQuery.trim().toLowerCase();
    return jobs.filter(
      j =>
        j.title.toLowerCase().includes(q) ||
        j.category.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q),
    );
  }, [jobs, searchQuery]);

  const filteredBookings = useMemo(() => {
    const byFilter = bookings.filter(b => b.filterType === bookingFilter);
    if (!searchQuery.trim()) return byFilter;
    const q = searchQuery.trim().toLowerCase();
    return byFilter.filter(
      b =>
        b.title.toLowerCase().includes(q) ||
        b.sellerName.toLowerCase().includes(q) ||
        b.status.toLowerCase().includes(q),
    );
  }, [bookings, bookingFilter, searchQuery]);

  const updateForm = (key, value) => {
    setPostJobForm(prev => ({ ...prev, [key]: value }));
  };

  const handleInputFocus = event => {
    scrollInputAboveKeyboard(scrollRef, event, 160);
  };

  const resetPostJobForm = () => {
    setPostJobForm({ ...EMPTY_POST_JOB_FORM });
    setEditingJobId(null);
  };

  const handleEditJob = job => {
    const budgetParts = job.budgetRange.replace(/₹/g, '').split('–');
    setPostJobForm({
      title: job.title,
      description: job.description,
      category: job.category,
      jobType: 'Fixed Price',
      budgetMin: budgetParts[0]?.trim() || '',
      budgetMax: budgetParts[1]?.trim() || '',
      deadline: '',
      experienceLevel: 'Any Level',
      skills: '',
    });
    setEditingJobId(job.id);
    setJobsSubTab(MY_JOBS_SUB_TABS.NEW_JOB);
  };

  const handlePostJob = () => {
    if (!postJobForm.title.trim()) return;

    const budgetMin = postJobForm.budgetMin || '0';
    const budgetMax = postJobForm.budgetMax || '0';
    const jobData = {
      title: postJobForm.title.trim(),
      category: postJobForm.category,
      description: postJobForm.description.trim() || 'No description provided.',
      budgetRange: `₹${budgetMin}–₹${budgetMax}`,
    };

    if (editingJobId) {
      setJobs(prev =>
        prev.map(j =>
          j.id === editingJobId
            ? { ...j, ...jobData }
            : j,
        ),
      );
    } else {
      const newJob = {
        id: String(Date.now()),
        ...jobData,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        status: 'Open',
        bidCount: 0,
      };
      setJobs(prev => [newJob, ...prev]);
    }

    resetPostJobForm();
    setJobsSubTab(MY_JOBS_SUB_TABS.POSTED);
  };

  const openConfirmModal = (actionType, bookingId) => {
    const configs = {
      accept: {
        title: BOOKING_ACCEPT_TITLE,
        message: BOOKING_ACCEPT_MESSAGE,
        confirmColor: greenColor,
        iconName: 'check-circle',
      },
      reject: {
        title: BOOKING_REJECT_TITLE,
        message: BOOKING_REJECT_MESSAGE,
        confirmColor: redColor,
        iconName: 'x-circle',
      },
      cancel: {
        title: BOOKING_CANCEL_TITLE,
        message: BOOKING_CANCEL_MESSAGE,
        confirmColor: '#C27803',
        iconName: 'alert-circle',
      },
    };
    const config = configs[actionType];
    setConfirmModal({
      visible: true,
      actionType,
      bookingId,
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
    const { actionType, bookingId } = confirmModal;
    if (!bookingId) {
      closeConfirmModal();
      return;
    }

    setBookings(prev =>
      prev.map(b => {
        if (b.id !== bookingId) return b;
        if (actionType === 'accept') {
          return { ...b, status: 'Completed', filterType: 'completed' };
        }
        if (actionType === 'reject') {
          return { ...b, status: 'In-dispute', filterType: 'active' };
        }
        if (actionType === 'cancel') {
          return { ...b, status: 'Cancelled', filterType: 'cancelled' };
        }
        return b;
      }),
    );
    closeConfirmModal();
  };

  const renderHeader = () => (
    <ScreenHeader
      title={isJobsTab ? JOBS_SCREEN_TITLE : BOOKINGS_SCREEN_TITLE}
      navigation={navigation}
    />
  );

  const renderSearch = () => (
    <SearchBar
      value={searchQuery}
      onChangeText={setSearchQuery}
      placeholder={JOBS_SEARCH_PLACEHOLDER}
    />
  );

  const renderMainTabs = () => (
    <View style={[styles.tabRow, flexDirectionRow]}>
      <TouchableOpacity
        style={[styles.tab, alignJustifyCenter, isJobsTab && styles.tabActive]}
        onPress={() => setActiveTab(JOBS_BOOKINGS_TABS.JOBS)}>
        <Text style={[styles.tabText, style.fontWeightMedium, isJobsTab && styles.tabTextActive]}>
          {TAB_MY_JOBS}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, alignJustifyCenter, !isJobsTab && styles.tabActive]}
        onPress={() => setActiveTab(JOBS_BOOKINGS_TABS.BOOKINGS)}>
        <Text style={[styles.tabText, style.fontWeightMedium, !isJobsTab && styles.tabTextActive]}>
          {TAB_BOOKINGS}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderJobStats = () => (
    <View style={[styles.statsGrid, flexDirectionRow, flexWrap]}>
      {MY_JOBS_STATS_CONFIG.map(item => (
        <View key={item.id} style={[styles.statCard, flexDirectionRow, alignItemsCenter]}>
          <View style={[styles.statIconWrap, alignJustifyCenter, { backgroundColor: `${item.color}18` }]}>
            <Icon name={item.icon} size={16} color={item.color} />
          </View>
          <View style={flex}>
            <Text style={[styles.statValue, style.fontWeightMedium]}>{jobStats[item.id]}</Text>
            <Text style={[styles.statLabel, style.fontWeightThin]}>{item.label}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderJobsSubTabs = () => (
    <View style={[styles.subTabRow, flexDirectionRow]}>
      <TouchableOpacity
        style={[
          styles.subTab,
          flexDirectionRow,
          alignItemsCenter,
          alignJustifyCenter,
          jobsSubTab === MY_JOBS_SUB_TABS.POSTED && styles.subTabActive,
        ]}
        onPress={() => setJobsSubTab(MY_JOBS_SUB_TABS.POSTED)}>
        <Icon
          name="briefcase"
          size={14}
          color={jobsSubTab === MY_JOBS_SUB_TABS.POSTED ? whiteColor : grayColor}
        />
        <Text
          style={[
            styles.subTabText,
            style.fontWeightMedium,
            jobsSubTab === MY_JOBS_SUB_TABS.POSTED && styles.subTabTextActive,
          ]}>
          {MY_JOBS_POSTED_TAB}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.subTab,
          flexDirectionRow,
          alignItemsCenter,
          alignJustifyCenter,
          jobsSubTab === MY_JOBS_SUB_TABS.NEW_JOB && styles.subTabActive,
        ]}
        onPress={() => setJobsSubTab(MY_JOBS_SUB_TABS.NEW_JOB)}>
        <Icon
          name="plus"
          size={14}
          color={jobsSubTab === MY_JOBS_SUB_TABS.NEW_JOB ? whiteColor : grayColor}
        />
        <Text
          style={[
            styles.subTabText,
            style.fontWeightMedium,
            jobsSubTab === MY_JOBS_SUB_TABS.NEW_JOB && styles.subTabTextActive,
          ]}>
          {MY_JOBS_POST_NEW_TAB}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderJobCard = job => {
    const statusStyle = getJobStatusStyle(job.status);
    const isOpen = job.status === 'Open';

    return (
      <View key={job.id} style={styles.jobCard}>
        <View style={[flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter]}>
          <Text style={[styles.jobTitle, style.fontWeightMedium]} numberOfLines={2}>
            {job.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{job.status}</Text>
          </View>
        </View>

        <View style={[styles.jobMetaRow, flexDirectionRow, alignItemsCenter]}>
          <Icon name="tag" size={12} color={grayColor} />
          <Text style={styles.jobMetaText}>{job.category}</Text>
          <Text style={styles.jobMetaDot}>•</Text>
          <Icon name="calendar" size={12} color={grayColor} />
          <Text style={styles.jobMetaText}>{job.date}</Text>
        </View>

        <Text style={[styles.jobDesc, style.fontWeightThin]} numberOfLines={2}>
          {job.description}
        </Text>

        <View style={[styles.jobFooter, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter]}>
          <View>
            <Text style={[styles.budgetText, style.fontWeightMedium]}>{job.budgetRange}</Text>
            <Text style={styles.bidCountText}>
              {job.bidCount} {BIDS_SUFFIX}
            </Text>
          </View>
          <View style={[flexDirectionRow, styles.jobActions]}>
            <TouchableOpacity
              style={[styles.outlineBtn, flexDirectionRow, alignItemsCenter]}
              onPress={() => navigation.navigate(SCREEN_NAMES.VIEW_BIDS, { job })}>
              <Icon name="eye" size={14} color={blackColor} />
              <Text style={[styles.outlineBtnText, style.fontWeightMedium]}>{JOB_ACTIONS.VIEW_BIDS}</Text>
            </TouchableOpacity>
            {isOpen ? (
              <TouchableOpacity
                style={[styles.editBtn, flexDirectionRow, alignItemsCenter]}
                onPress={() => handleEditJob(job)}>
                <Icon name="edit-2" size={14} color={whiteColor} />
                <Text style={[styles.editBtnText, style.fontWeightMedium]}>{JOB_ACTIONS.EDIT}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  const renderPostedJobs = () => (
    <View>
      {renderJobStats()}
      {renderJobsSubTabs()}
      {filteredJobs.length === 0 ? (
        <EmptyState
          icon="briefcase"
          title={searchQuery.trim() ? EMPTY_SEARCH_TITLE : EMPTY_JOBS_TITLE}
          message={searchQuery.trim() ? EMPTY_SEARCH_MESSAGE : EMPTY_JOBS_MESSAGE}
          actionLabel={!searchQuery.trim() ? MY_JOBS_POST_NEW_TAB : undefined}
          onAction={
            !searchQuery.trim()
              ? () => setJobsSubTab(MY_JOBS_SUB_TABS.NEW_JOB)
              : undefined
          }
        />
      ) : (
        filteredJobs.map(renderJobCard)
      )}
    </View>
  );

  const renderInfoCard = (title, icon, iconColor, children) => (
    <View style={styles.infoCard}>
      <View style={[flexDirectionRow, alignItemsCenter, styles.infoCardHeader]}>
        <Icon name={icon} size={16} color={iconColor} />
        <Text style={[styles.infoCardTitle, style.fontWeightMedium]}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const renderPostJobForm = () => (
    <View>
      {renderJobsSubTabs()}

      <View style={styles.formCard}>
        <View style={[flexDirectionRow, alignItemsCenter, styles.formHeader]}>
          <View style={[styles.formIconWrap, alignJustifyCenter]}>
            <Icon name="plus" size={16} color={whiteColor} />
          </View>
          <View style={flex}>
            <Text style={[styles.formTitle, style.fontWeightMedium]}>{POST_JOB_TITLE}</Text>
            <Text style={[styles.formSubtitle, style.fontWeightThin]}>{POST_JOB_SUBTITLE}</Text>
          </View>
        </View>

        <CustomTextInput
          label={POST_JOB_LABELS.title}
          required
          value={postJobForm.title}
          onChangeText={v => updateForm('title', v)}
          placeholder={POST_JOB_PLACEHOLDERS.title}
          leftIcon="edit-2"
          onFocus={handleInputFocus}
        />

        <CustomTextInput
          label={POST_JOB_LABELS.description}
          value={postJobForm.description}
          onChangeText={v => updateForm('description', v)}
          placeholder={POST_JOB_PLACEHOLDERS.description}
          leftIcon="file-text"
          onFocus={handleInputFocus}
          style={styles.formField}
        />

        <CustomDropdown
          label={POST_JOB_LABELS.category}
          value={postJobForm.category}
          options={JOB_CATEGORIES}
          onSelect={v => updateForm('category', v)}
          style={styles.formField}
        />

        <CustomDropdown
          label={POST_JOB_LABELS.jobType}
          value={postJobForm.jobType}
          options={JOB_TYPES}
          onSelect={v => updateForm('jobType', v)}
          style={styles.formField}
        />

        <View style={[flexDirectionRow, styles.budgetRow]}>
          <CustomTextInput
            label={POST_JOB_LABELS.budgetMin}
            value={postJobForm.budgetMin}
            onChangeText={v => updateForm('budgetMin', v)}
            placeholder={POST_JOB_PLACEHOLDERS.budgetMin}
            keyboardType="numeric"
            leftIcon="dollar-sign"
            onFocus={handleInputFocus}
            style={styles.budgetField}
          />
          <CustomTextInput
            label={POST_JOB_LABELS.budgetMax}
            value={postJobForm.budgetMax}
            onChangeText={v => updateForm('budgetMax', v)}
            placeholder={POST_JOB_PLACEHOLDERS.budgetMax}
            keyboardType="numeric"
            leftIcon="dollar-sign"
            onFocus={handleInputFocus}
            style={styles.budgetField}
          />
        </View>

        <CustomTextInput
          label={POST_JOB_LABELS.deadline}
          value={postJobForm.deadline}
          onChangeText={v => updateForm('deadline', v)}
          placeholder={POST_JOB_PLACEHOLDERS.deadline}
          leftIcon="calendar"
          onFocus={handleInputFocus}
          style={styles.formField}
        />

        <CustomDropdown
          label={POST_JOB_LABELS.experienceLevel}
          value={postJobForm.experienceLevel}
          options={EXPERIENCE_LEVELS}
          onSelect={v => updateForm('experienceLevel', v)}
          style={styles.formField}
        />

        <CustomTextInput
          label={POST_JOB_LABELS.skills}
          value={postJobForm.skills}
          onChangeText={v => updateForm('skills', v)}
          placeholder={POST_JOB_PLACEHOLDERS.skills}
          leftIcon="code"
          onFocus={handleInputFocus}
          style={styles.formField}
        />

        <CustomButton
          title={editingJobId ? UPDATE_JOB_BTN : POST_JOB_BTN}
          iconName="send"
          onPress={handlePostJob}
          style={styles.postJobBtn}
        />
      </View>

      {renderInfoCard(TIPS_TITLE, 'zap', goldColor, (
        <View style={styles.tipsList}>
          {POST_JOB_TIPS.map((tip, index) => (
            <View key={index} style={[flexDirectionRow, alignItemsCenter, styles.tipRow]}>
              <Icon name="check-circle" size={14} color={greenColor} />
              <Text style={[styles.tipText, style.fontWeightThin]}>{tip}</Text>
            </View>
          ))}
        </View>
      ))}

      {renderInfoCard('bar-chart-2', PLATFORM_STATS_TITLE, blueColor, (
        <View style={styles.platformStats}>
          {PLATFORM_STATS.map(stat => (
            <View key={stat.id} style={[flexDirectionRow, justifyContentSpaceBetween, styles.platformStatRow]}>
              <Text style={[styles.platformStatLabel, style.fontWeightThin]}>{stat.label}</Text>
              <Text style={[styles.platformStatValue, style.fontWeightMedium, { color: stat.color }]}>
                {stat.value}
              </Text>
            </View>
          ))}
        </View>
      ))}

      <View style={styles.protectionCard}>
        <View style={[flexDirectionRow, alignItemsCenter, styles.protectionHeader]}>
          <Icon name="shield" size={18} color={whiteColor} />
          <Text style={[styles.protectionTitle, style.fontWeightMedium]}>{BUYER_PROTECTION.title}</Text>
        </View>
        <Text style={[styles.protectionText, style.fontWeightThin]}>{BUYER_PROTECTION.text}</Text>
      </View>
    </View>
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

  const renderBookingActions = booking => {
    if (booking.status === 'Ongoing') {
      return (
        <TouchableOpacity
          style={[styles.cancelBtn, flexDirectionRow, alignItemsCenter]}
          onPress={() => openConfirmModal('cancel', booking.id)}>
          <Icon name="alert-circle" size={14} color="#C27803" />
          <Text style={[styles.cancelBtnText, style.fontWeightMedium]}>{BOOKING_ACTIONS.CANCEL}</Text>
        </TouchableOpacity>
      );
    }
    if (booking.status === 'Amidst-Completion-Process') {
      return (
        <View style={[flexDirectionRow, styles.bookingActionGroup]}>
          <TouchableOpacity
            style={[styles.acceptBtn, flexDirectionRow, alignItemsCenter]}
            onPress={() => openConfirmModal('accept', booking.id)}>
            <Icon name="check" size={14} color={whiteColor} />
            <Text style={[styles.acceptBtnText, style.fontWeightMedium]}>{BOOKING_ACTIONS.ACCEPT}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rejectBtn, flexDirectionRow, alignItemsCenter]}
            onPress={() => openConfirmModal('reject', booking.id)}>
            <Icon name="x" size={14} color={whiteColor} />
            <Text style={[styles.rejectBtnText, style.fontWeightMedium]}>{BOOKING_ACTIONS.REJECT}</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  const renderBookingCard = booking => {
    const statusStyle = getBookingStatusStyle(booking.status);

    return (
      <View key={booking.id} style={styles.bookingCard}>
        <View style={[flexDirectionRow, alignItemsCenter]}>
          <View style={[styles.sellerAvatar, alignJustifyCenter]}>
            <Text style={[styles.sellerAvatarText, style.fontWeightMedium]}>{booking.sellerInitials}</Text>
          </View>
          <View style={styles.bookingInfo}>
            <Text style={[styles.bookingTitle, style.fontWeightMedium]}>{booking.title}</Text>
            <Text style={[styles.sellerName, style.fontWeightThin]}>
              {SELLER_PREFIX} {booking.sellerName}
            </Text>
            <Text style={styles.bookingDate}>{booking.date}</Text>
          </View>
          <View style={styles.bookingPriceWrap}>
            <Text style={[styles.bookingPrice, style.fontWeightMedium]}>
              {formatCurrency(booking.total, booking.currency)}
            </Text>
            <Text style={styles.bookingFee}>
              {FEE_INCL_PREFIX} {formatCurrency(booking.fee, booking.currency)} {FEE_SUFFIX}
            </Text>
          </View>
        </View>

        <View style={[styles.bookingFooter, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter]}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{booking.status}</Text>
          </View>
          <View style={[flexDirectionRow, alignItemsCenter, styles.bookingActions]}>
            <TouchableOpacity
              style={[styles.outlineBtn, flexDirectionRow, alignItemsCenter]}
              onPress={() => navigation.navigate(SCREEN_NAMES.BOOKING_DETAILS, { booking })}>
              <Icon name="eye" size={14} color={blackColor} />
              <Text style={[styles.outlineBtnText, style.fontWeightMedium]}>{BOOKING_ACTIONS.DETAILS}</Text>
            </TouchableOpacity>
            {renderBookingActions(booking)}
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
          actionLabel={!searchQuery.trim() ? MY_JOBS_POST_NEW_TAB : undefined}
          onAction={
            !searchQuery.trim()
              ? () => {
                  setActiveTab(JOBS_BOOKINGS_TABS.JOBS);
                  setJobsSubTab(MY_JOBS_SUB_TABS.NEW_JOB);
                }
              : undefined
          }
        />
      ) : (
        filteredBookings.map(renderBookingCard)
      )}
    </View>
  );

  return (
    <SafeAreaView style={[flex, screenContentStyles.safeArea]} edges={['top']}>
      <KeyboardAvoidingView style={flex} behavior={keyboardAvoidingBehavior}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            screenContentStyles.scrollContent,
            jobsSubTab === MY_JOBS_SUB_TABS.NEW_JOB && styles.formScrollContent,
            {
              paddingBottom:
                (jobsSubTab === MY_JOBS_SUB_TABS.NEW_JOB ? hp(12) : hp(3)) + keyboardBottom,
            },
          ]}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
          {renderHeader()}
          {renderSearch()}
          {renderMainTabs()}

          {isJobsTab
            ? jobsSubTab === MY_JOBS_SUB_TABS.POSTED
              ? renderPostedJobs()
              : renderPostJobForm()
            : renderBookings()}
        </ScrollView>
      </KeyboardAvoidingView>

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

export default JobsBookingsScreen;

const styles = StyleSheet.create({
  formScrollContent: {
    paddingBottom: hp(12),
  },
  tabRow: {
    backgroundColor: tabBgColor,
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
  tabText: { fontSize: style.fontSizeNormal2x.fontSize, color: grayColor },
  tabTextActive: { color: whiteColor },
  statsGrid: {
    gap: spacings.normal,
    marginBottom: hp(2),
  },
  statCard: {
    width: (wp(90) - spacings.normal) / 2,
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    padding: spacings.large,
    gap: spacings.normal,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  statValue: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
  },
  statLabel: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  subTabRow: {
    gap: spacings.normal,
    marginBottom: hp(2),
  },
  subTab: {
    flex: 1,
    paddingVertical: spacings.medium,
    paddingHorizontal: spacings.normal,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: borderLightColor,
    backgroundColor: whiteColor,
    gap: spacings.xsmall,
  },
  subTabActive: {
    backgroundColor: redColor,
    borderColor: redColor,
  },
  subTabText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  subTabTextActive: { color: whiteColor },
  jobCard: {
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    padding: spacings.large,
    marginBottom: spacings.large,
  },
  jobTitle: {
    flex: 1,
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginRight: spacings.normal,
  },
  statusBadge: {
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.xsmall,
    borderRadius: 20,
  },
  statusText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    fontWeight: '600',
  },
  jobMetaRow: {
    marginTop: spacings.normal,
    gap: spacings.xsmall,
  },
  jobMetaText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginLeft: 2,
  },
  jobMetaDot: {
    color: grayColor,
    marginHorizontal: spacings.xsmall,
  },
  jobDesc: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: spacings.normal,
    lineHeight: 18,
  },
  jobFooter: {
    marginTop: spacings.large,
    flexWrap: 'wrap',
    gap: spacings.normal,
  },
  budgetText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  bidCountText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: redColor,
    marginTop: 2,
  },
  jobActions: { gap: spacings.normal },
  outlineBtn: {
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 8,
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.small,
    gap: spacings.xsmall,
  },
  outlineBtnText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
  },
  editBtn: {
    backgroundColor: redColor,
    borderRadius: 8,
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.small,
    gap: spacings.xsmall,
  },
  editBtnText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: whiteColor,
  },
  formCard: {
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    padding: spacings.large,
    marginBottom: spacings.large,
  },
  formHeader: {
    gap: spacings.normal,
    marginBottom: spacings.large,
  },
  formIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: redColor,
  },
  formTitle: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
  },
  formSubtitle: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  formField: { marginTop: spacings.large },
  budgetRow: {
    gap: spacings.normal,
    marginTop: spacings.large,
  },
  budgetField: { flex: 1 },
  postJobBtn: { marginTop: spacings.xLarge },
  infoCard: {
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    padding: spacings.large,
    marginBottom: spacings.large,
  },
  infoCardHeader: {
    gap: spacings.normal,
    marginBottom: spacings.normal,
  },
  infoCardTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  tipsList: { gap: spacings.normal },
  tipRow: { gap: spacings.normal },
  tipText: {
    flex: 1,
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  platformStats: { gap: spacings.normal },
  platformStatRow: { paddingVertical: spacings.xsmall },
  platformStatLabel: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  platformStatValue: {
    fontSize: style.fontSizeNormal2x.fontSize,
  },
  protectionCard: {
    backgroundColor: redColor,
    borderRadius: 12,
    padding: spacings.large,
    marginBottom: spacings.large,
  },
  protectionHeader: {
    gap: spacings.normal,
    marginBottom: spacings.normal,
  },
  protectionTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: whiteColor,
  },
  protectionText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: whiteColor,
    lineHeight: 20,
    opacity: 0.9,
  },
  filterRow: {
    gap: spacings.normal,
    marginBottom: hp(2),
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacings.medium,
    borderRadius: 8,
    backgroundColor: tabBgColor,
  },
  filterTabActive: { backgroundColor: redColor },
  filterTabText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  filterTabTextActive: { color: whiteColor },
  bookingCard: {
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    padding: spacings.large,
    marginBottom: spacings.large,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: redColor,
    marginRight: spacings.normal,
  },
  sellerAvatarText: {
    color: whiteColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  bookingInfo: { flex: 1 },
  bookingTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  sellerName: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  bookingDate: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  bookingPriceWrap: { alignItems: 'flex-end' },
  bookingPrice: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  bookingFee: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  bookingFooter: {
    marginTop: spacings.large,
    flexWrap: 'wrap',
    gap: spacings.normal,
  },
  bookingActions: {
    gap: spacings.normal,
    flexWrap: 'wrap',
  },
  bookingActionGroup: { gap: spacings.normal },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#C27803',
    borderRadius: 8,
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.small,
    gap: spacings.xsmall,
  },
  cancelBtnText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: '#C27803',
  },
  acceptBtn: {
    backgroundColor: greenColor,
    borderRadius: 8,
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.small,
    gap: spacings.xsmall,
  },
  acceptBtnText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: whiteColor,
  },
  rejectBtn: {
    backgroundColor: redColor,
    borderRadius: 8,
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.small,
    gap: spacings.xsmall,
  },
  rejectBtnText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: whiteColor,
  },
  emptyWrap: {
    paddingVertical: hp(8),
    gap: spacings.normal,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    backgroundColor: screenBgColor,
  },
  emptyTitle: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
  },
});
