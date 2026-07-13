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
  goldColor,
  grayColor,
  greenColor,
  lightPink,
  redColor,
  screenBgColor,
  whiteColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import {
  EMPTY_SELLER_SERVICES_MESSAGE,
  EMPTY_SELLER_SERVICES_TITLE,
  EMPTY_SEARCH_MESSAGE,
  EMPTY_SEARCH_TITLE,
  SELLER_SERVICES_ADD,
  SELLER_SERVICES_SEARCH,
  SELLER_SERVICES_TITLE,
  SELLER_SERVICE_ACTIVATE_MESSAGE,
  SELLER_SERVICE_ACTIVATE_TITLE,
  SELLER_SERVICE_PAUSE_MESSAGE,
  SELLER_SERVICE_PAUSE_TITLE,
  SELLER_STATIC_USER,
} from '../../constans/Constants';
import SearchBar from '../../components/SearchBar';
import ScreenHeader, { screenContentStyles } from '../../components/ScreenHeader';
import EmptyState from '../../components/EmptyState';
import ConfirmationModal from '../../components/modal/ConfirmationModal';
import { heightPercentageToDP as hp } from '../../utils';

const { flex, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween } = BaseStyle;

const getStatusStyle = status => {
  if (status === 'ACTIVE') return { bg: '#E8F8EE', text: '#1B7A45' };
  if (status === 'PENDING') return { bg: '#FFF4E5', text: '#C27803' };
  return { bg: '#F2F2F7', text: grayColor };
};

const SellerMyServicesScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    serviceId: null,
    isActivate: true,
    title: '',
    message: '',
  });
  const [services, setServices] = useState([
    {
      id: '1',
      title: 'Professional Logo Design',
      category: 'Design',
      price: '₹6,200',
      rating: '4.9',
      bookings: 48,
      status: 'ACTIVE',
    },
    {
      id: '2',
      title: 'Social Media Marketing',
      category: 'Marketing',
      price: '₹9,960',
      rating: '4.7',
      bookings: 32,
      status: 'ACTIVE',
    },
    {
      id: '3',
      title: 'WordPress Development',
      category: 'Development',
      price: '₹16,500',
      rating: '4.8',
      bookings: 21,
      status: 'PENDING',
    },
    {
      id: '4',
      title: 'Video Editing Package',
      category: 'Video',
      price: '₹8,300',
      rating: '4.6',
      bookings: 15,
      status: 'PAUSED',
    },
  ]);

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services;
    const q = searchQuery.trim().toLowerCase();
    return services.filter(
      s => s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q),
    );
  }, [services, searchQuery]);

  const handleAddService = () => {
    // Add service flow coming soon
  };

  const openToggleModal = (serviceId, isActivate) => {
    setConfirmModal({
      visible: true,
      serviceId,
      isActivate,
      title: isActivate ? SELLER_SERVICE_ACTIVATE_TITLE : SELLER_SERVICE_PAUSE_TITLE,
      message: isActivate ? SELLER_SERVICE_ACTIVATE_MESSAGE : SELLER_SERVICE_PAUSE_MESSAGE,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, visible: false }));
  };

  const handleConfirmToggle = () => {
    const { serviceId, isActivate } = confirmModal;
    if (!serviceId) {
      closeConfirmModal();
      return;
    }

    setServices(prev =>
      prev.map(service =>
        service.id === serviceId
          ? { ...service, status: isActivate ? 'ACTIVE' : 'PAUSED' }
          : service,
      ),
    );
    closeConfirmModal();
  };

  return (
    <SafeAreaView style={[flex, styles.safeArea]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={screenContentStyles.scrollContent}
        bounces={false}>
        <ScreenHeader
          title={SELLER_SERVICES_TITLE}
          navigation={navigation}
          user={SELLER_STATIC_USER}
          onBack={() => navigation.goBack()}
        />

        <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder={SELLER_SERVICES_SEARCH} />

        <TouchableOpacity
          style={[styles.addBtn, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}
          onPress={handleAddService}>
          <Text style={[styles.addBtnText, style.fontWeightMedium]}>{SELLER_SERVICES_ADD}</Text>
          <Icon name="plus" size={18} color={whiteColor} />
        </TouchableOpacity>

        {filteredServices.length === 0 ? (
          <EmptyState
            icon="layers"
            title={searchQuery.trim() ? EMPTY_SEARCH_TITLE : EMPTY_SELLER_SERVICES_TITLE}
            message={searchQuery.trim() ? EMPTY_SEARCH_MESSAGE : EMPTY_SELLER_SERVICES_MESSAGE}
          />
        ) : (
          filteredServices.map(service => {
            const statusStyle = getStatusStyle(service.status);
            const isPaused = service.status === 'PAUSED' || service.status === 'PENDING';
            return (
              <View key={service.id} style={styles.serviceCard}>
                <View style={[styles.cardTop, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter]}>
                  <View style={[styles.statusChip, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>{service.status}</Text>
                  </View>
                  <Text style={[styles.price, style.fontWeightMedium]}>{service.price}</Text>
                </View>
                <Text style={[styles.serviceTitle, style.fontWeightMedium]}>{service.title}</Text>
                <Text style={[styles.category, style.fontWeightThin]}>{service.category}</Text>
                <View style={[flexDirectionRow, alignItemsCenter, styles.ratingRow]}>
                  <Icon name="star" size={12} color={goldColor} />
                  <Text style={[styles.ratingText, style.fontWeightMedium]}>{service.rating}</Text>
                  <Text style={[styles.bookingsText, style.fontWeightThin]}>· {service.bookings} bookings</Text>
                </View>
                <View style={[styles.actionRow, flexDirectionRow]}>
                  <TouchableOpacity style={[styles.editBtn, flex, flexDirectionRow, alignItemsCenter]}>
                    <Icon name="edit-2" size={14} color={redColor} />
                    <Text style={[styles.editText, style.fontWeightMedium]}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[isPaused ? styles.activateBtn : styles.pauseBtn, flex, alignItemsCenter]}
                    onPress={() => openToggleModal(service.id, isPaused)}>
                    <Text
                      style={[
                        isPaused ? styles.activateText : styles.pauseText,
                        style.fontWeightMedium,
                      ]}>
                      {isPaused ? 'Activate' : 'Pause'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <ConfirmationModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmColor={confirmModal.isActivate ? greenColor : redColor}
        iconName={confirmModal.isActivate ? 'check-circle' : 'pause-circle'}
        confirmText={confirmModal.isActivate ? 'Activate' : 'Pause'}
        onConfirm={handleConfirmToggle}
        onCancel={closeConfirmModal}
      />
    </SafeAreaView>
  );
};

export default SellerMyServicesScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: screenBgColor },
  addBtn: {
    backgroundColor: redColor,
    borderRadius: 10,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.large,
    marginBottom: hp(1.8),
  },
  addBtnText: {
    color: whiteColor,
    fontSize: style.fontSizeNormal2x.fontSize,
  },
  serviceCard: {
    backgroundColor: whiteColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderLightColor,
    padding: spacings.large,
    marginBottom: spacings.normal,
  },
  cardTop: { marginBottom: spacings.normal },
  statusChip: {
    borderRadius: 6,
    paddingHorizontal: spacings.normal,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    fontWeight: '700',
  },
  price: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: redColor,
  },
  serviceTitle: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
    marginBottom: 4,
  },
  category: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginBottom: spacings.small,
  },
  ratingRow: { gap: 4, marginBottom: spacings.large },
  ratingText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
  },
  bookingsText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  actionRow: { gap: spacings.normal },
  editBtn: {
    borderWidth: 1,
    borderColor: redColor,
    borderRadius: 8,
    paddingVertical: spacings.normal,
    justifyContent: 'center',
    gap: 6,
  },
  editText: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  pauseBtn: {
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 8,
    paddingVertical: spacings.normal,
    justifyContent: 'center',
  },
  pauseText: {
    color: grayColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
  activateBtn: {
    backgroundColor: redColor,
    borderRadius: 8,
    paddingVertical: spacings.normal,
    justifyContent: 'center',
  },
  activateText: {
    color: whiteColor,
    fontSize: style.fontSizeSmall1x.fontSize,
  },
});
