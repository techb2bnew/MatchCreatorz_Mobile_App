import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../../constans/Style';
import {
  blackColor,
  borderLightColor,
  grayColor,
  inputBgColor,
  lightPink,
  redColor,
  screenBgColor,
  whiteColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import {
  BIDS_SUFFIX,
  EMPTY_SELLER_JOBS_MESSAGE,
  EMPTY_SELLER_JOBS_TITLE,
  EMPTY_SEARCH_MESSAGE,
  EMPTY_SEARCH_TITLE,
  SELLER_JOB_CATEGORIES,
  SELLER_JOBS_SEARCH_PLACEHOLDER,
  SELLER_JOBS_TITLE,
  SELLER_PLACE_BID,
  SELLER_STATIC_USER,
} from '../../constans/Constants';
import SearchBar from '../../components/SearchBar';
import ScreenHeader, { screenContentStyles } from '../../components/ScreenHeader';
import EmptyState from '../../components/EmptyState';
import { heightPercentageToDP as hp } from '../../utils';

const { flex, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween, alignJustifyCenter } = BaseStyle;

const SellerJobsScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [jobs] = useState([
    {
      id: '1',
      title: 'Logo Design for Tech Startup',
      category: 'Design',
      budget: '₹8,300 - ₹24,900',
      description: 'Need a modern minimalist logo for our SaaS product. Must work on dark and light backgrounds.',
      client: 'Alice Johnson',
      clientInitials: 'AJ',
      posted: '2h ago',
      bids: 12,
    },
    {
      id: '2',
      title: 'WordPress Website Setup',
      category: 'Development',
      budget: '₹33,200 - ₹49,800',
      description: 'Looking for an experienced developer to build a responsive business website with 5 pages.',
      client: 'Bob Smith',
      clientInitials: 'BS',
      posted: '5h ago',
      bids: 8,
    },
    {
      id: '3',
      title: 'Product Photography',
      category: 'Design',
      budget: '₹6,640 - ₹9,960',
      description: 'Need professional product photos for e-commerce listing. 20 products, white background.',
      client: 'Carol Miller',
      clientInitials: 'CM',
      posted: '1d ago',
      bids: 5,
    },
    {
      id: '4',
      title: 'Social Media Content Pack',
      category: 'Marketing',
      budget: '₹8,300 - ₹14,940',
      description: 'Monthly social media content creation including posts, stories, and carousel designs.',
      client: 'Diana Prince',
      clientInitials: 'DP',
      posted: '2d ago',
      bids: 15,
    },
  ]);

  const filteredJobs = useMemo(() => {
    let list = jobs;
    if (activeCategory !== 'All') {
      list = list.filter(job => job.category === activeCategory);
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.trim().toLowerCase();
    return list.filter(
      job =>
        job.title.toLowerCase().includes(q) ||
        job.category.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q),
    );
  }, [jobs, searchQuery, activeCategory]);

  return (
    <SafeAreaView style={[flex, styles.safeArea]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={screenContentStyles.scrollContent}
        bounces={false}>
        <ScreenHeader title={SELLER_JOBS_TITLE} navigation={navigation} user={SELLER_STATIC_USER} />

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={SELLER_JOBS_SEARCH_PLACEHOLDER}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}>
          {SELLER_JOB_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => setActiveCategory(cat)}>
                <Text style={[styles.categoryText, style.fontWeightMedium, isActive && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {filteredJobs.length === 0 ? (
          <EmptyState
            icon="briefcase"
            title={searchQuery.trim() ? EMPTY_SEARCH_TITLE : EMPTY_SELLER_JOBS_TITLE}
            message={searchQuery.trim() ? EMPTY_SEARCH_MESSAGE : EMPTY_SELLER_JOBS_MESSAGE}
          />
        ) : (
          filteredJobs.map(job => (
            <View key={job.id} style={styles.jobCard}>
              <View style={[styles.jobHeader, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter]}>
                <Text style={[styles.jobTitle, style.fontWeightMedium]}>{job.title}</Text>
                <Text style={[styles.jobBudget, style.fontWeightMedium]}>{job.budget}</Text>
              </View>
              <Text style={[styles.jobDesc, style.fontWeightThin]} numberOfLines={3}>
                {job.description}
              </Text>
              <View style={[styles.jobFooter, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
                <View style={[flexDirectionRow, alignItemsCenter, styles.clientRow]}>
                  <View style={[styles.clientAvatar, alignJustifyCenter]}>
                    <Text style={[styles.clientInitials, style.fontWeightMedium]}>{job.clientInitials}</Text>
                  </View>
                  <View>
                    <Text style={[styles.clientName, style.fontWeightMedium]}>{job.client}</Text>
                    <Text style={[styles.jobMeta, style.fontWeightThin]}>
                      {job.posted} · {job.bids} {BIDS_SUFFIX}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={[styles.bidBtn, flexDirectionRow, alignItemsCenter]}>
                  <Text style={[styles.bidBtnText, style.fontWeightMedium]}>{SELLER_PLACE_BID}</Text>
                  <Icon name="send" size={14} color={whiteColor} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SellerJobsScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: screenBgColor },
  categoryRow: {
    gap: spacings.normal,
    paddingBottom: hp(1.8),
  },
  categoryChip: {
    borderRadius: 20,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.normal,
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
  },
  categoryChipActive: {
    backgroundColor: redColor,
    borderColor: redColor,
  },
  categoryText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  categoryTextActive: { color: whiteColor },
  jobCard: {
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    padding: spacings.large,
    marginBottom: spacings.normal,
    gap: spacings.normal,
  },
  jobHeader: { gap: spacings.normal },
  jobTitle: {
    flex: 1,
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  jobBudget: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: redColor,
  },
  jobDesc: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    lineHeight: 18,
  },
  jobFooter: { gap: spacings.normal },
  clientRow: { flex: 1, gap: spacings.normal },
  clientAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: inputBgColor,
  },
  clientInitials: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  clientName: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
  },
  jobMeta: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
  },
  bidBtn: {
    backgroundColor: redColor,
    borderRadius: 8,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.normal,
    gap: 6,
  },
  bidBtnText: {
    color: whiteColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
});
