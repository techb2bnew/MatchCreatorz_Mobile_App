import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
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
  SELLER_ADD_SERVICE_MODAL,
  SELLER_SERVICE_DETAIL_MODAL,
  SELLER_SERVICES_ADD,
  SELLER_SERVICES_SEARCH,
  SELLER_SERVICES_TITLE,
  SELLER_SERVICE_ACTIVATE_MESSAGE,
  SELLER_SERVICE_ACTIVATE_TITLE,
  SELLER_SERVICE_PAUSE_MESSAGE,
  SELLER_SERVICE_PAUSE_TITLE,
} from '../../constans/Constants';
import SearchBar from '../../components/SearchBar';
import ScreenHeader from '../../components/ScreenHeader';
import EmptyState from '../../components/EmptyState';
import ConfirmationModal from '../../components/modal/ConfirmationModal';
import AddServiceModal from '../../components/modal/AddServiceModal';
import SellerServiceDetailModal from '../../components/modal/SellerServiceDetailModal';
import SuccessModal from '../../components/modal/SuccessModal';
import { selectAuth } from '../../redux/slices/authSlice';
import { getApiErrorMessage } from '../../services/apiClient';
import {
  createSellerServiceApi,
  getCategoriesApi,
  getSellerReviewsApi,
  getSellerServiceByIdApi,
  getSellerServicesApi,
  pauseSellerServiceApi,
  publishSellerServiceApi,
  updateSellerServiceApi,
} from '../../services/sellerService';
import { formatAppPrice } from '../../utils/currency';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from '../../utils';

const { flex, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween, alignJustifyCenter } =
  BaseStyle;

const SERVICES_PAGE_LIMIT = 20;

const extractServicesList = response => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.services)) return response.data.services;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data?.rows)) return response.data.rows;
  if (Array.isArray(response?.services)) return response.services;
  return [];
};

const extractPagination = response => response?.pagination || response?.data?.pagination || null;

const extractCategoriesList = response => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.categories)) return response.categories;
  return [];
};

const resolveHasMore = (response, page, listLength) => {
  const pagination = extractPagination(response);
  const totalPages =
    pagination?.pages ?? pagination?.totalPages ?? pagination?.total_pages ?? null;
  const currentPage = pagination?.page ?? page;

  if (totalPages != null) {
    return Number(currentPage) < Number(totalPages);
  }

  return listLength >= SERVICES_PAGE_LIMIT;
};

const formatPrice = value => formatAppPrice(value);

const toDisplayString = value => {
  if (value == null || value === '') return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(toDisplayString).filter(Boolean).join(', ');
  }
  if (typeof value === 'object') {
    return toDisplayString(value.name ?? value.title ?? value.label ?? value.value ?? '');
  }
  return '';
};

const capitalizeTitle = value => {
  const text = toDisplayString(value).trim();
  if (!text) return '—';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const mapServiceStatus = status => {
  const normalized = toDisplayString(status)
    .trim()
    .toUpperCase()
    .replace(/-/g, '_');
  if (normalized === 'ACTIVE' || normalized === 'PUBLISHED') return 'ACTIVE';
  if (normalized === 'PAUSED' || normalized === 'INACTIVE') return 'PAUSED';
  if (normalized === 'PENDING' || normalized === 'DRAFT') return 'PENDING';
  return normalized || 'PENDING';
};

const formatCategories = service => {
  const fromCategories = toDisplayString(service?.categories);
  if (fromCategories) return fromCategories;

  const fromNames = toDisplayString(service?.category_names);
  if (fromNames) return fromNames;

  const fromCategory = toDisplayString(service?.category ?? service?.category_name);
  return fromCategory || '—';
};

const formatReviewDate = dateStr => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return String(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const mapApiReviewToUi = review => {
  const buyer = review?.buyer || review?.user || review?.client || {};
  const buyerName =
    toDisplayString(buyer?.name || buyer?.full_name || review?.buyer_name || review?.user_name) ||
    'Buyer';
  return {
    id: String(review?.id ?? `${buyerName}-${review?.rating ?? ''}-${review?.created_at ?? ''}`),
    rating: Number(review?.rating) || 0,
    comment: toDisplayString(review?.comment || review?.review || review?.message || review?.feedback),
    buyerName,
    date: formatReviewDate(review?.created_at || review?.createdAt || review?.date),
    serviceId: String(
      review?.service_id ?? review?.serviceId ?? review?.service?.id ?? '',
    ),
  };
};

const extractReviewsFromService = service => {
  const raw =
    service?.reviews ||
    service?.recent_reviews ||
    service?.service_reviews ||
    service?.buyer_reviews ||
    [];
  if (!Array.isArray(raw)) return [];
  return raw.map(mapApiReviewToUi);
};

const extractReviewsCount = (service, reviewsList = []) => {
  const countRaw =
    service?.reviews_count ??
    service?.review_count ??
    service?.total_reviews ??
    service?.ratings_count ??
    (typeof service?.rating === 'object' ? service.rating?.count : null);
  const countNum = Number(countRaw);
  if (Number.isFinite(countNum) && countNum >= 0) return countNum;
  return reviewsList.length;
};

const mapApiServiceToUi = service => {
  const ratingRaw = service?.rating ?? service?.avg_rating ?? service?.average_rating;
  const ratingNum = Number(
    typeof ratingRaw === 'object' && ratingRaw != null
      ? ratingRaw.average ?? ratingRaw.value ?? ratingRaw.rating
      : ratingRaw,
  );
  const bookingsRaw =
    service?.bookings ?? service?.bookings_count ?? service?.total_bookings ?? 0;
  const bookingsNum = Number(
    typeof bookingsRaw === 'object' && bookingsRaw != null
      ? bookingsRaw.count ?? bookingsRaw.total ?? bookingsRaw.value
      : bookingsRaw,
  );
  const reviews = extractReviewsFromService(service);

  return {
    id: String(service?.id ?? ''),
    title: capitalizeTitle(service?.title),
    category: formatCategories(service),
    price: formatPrice(service?.price),
    rating: Number.isFinite(ratingNum) ? ratingNum.toFixed(1) : '—',
    reviewsCount: extractReviewsCount(service, reviews),
    reviews,
    bookings: Number.isFinite(bookingsNum) ? bookingsNum : 0,
    status: mapServiceStatus(service?.status),
    raw: service,
  };
};

const extractImageUrls = service => {
  const raw =
    service?.images ||
    service?.image_urls ||
    service?.existing_images ||
    service?.service_images ||
    [];
  if (!Array.isArray(raw)) return [];
  return raw
    .map(item => {
      if (typeof item === 'string') return item.trim();
      return String(item?.url || item?.image_url || item?.uri || '').trim();
    })
    .filter(Boolean);
};

const extractCategoryIds = service => {
  if (Array.isArray(service?.category_ids) && service.category_ids.length) {
    return service.category_ids.map(Number).filter(n => !Number.isNaN(n));
  }
  if (Array.isArray(service?.categories) && service.categories.length) {
    return service.categories
      .map(c => Number(typeof c === 'object' ? c?.id ?? c?.category_id : c))
      .filter(n => !Number.isNaN(n));
  }
  const single = Number(service?.category_id);
  return Number.isNaN(single) ? [] : [single];
};

const extractTags = service => {
  if (Array.isArray(service?.tags)) {
    return service.tags
      .map(tag => (typeof tag === 'string' ? tag : tag?.name || tag?.label || ''))
      .map(tag => String(tag).trim())
      .filter(Boolean);
  }
  if (typeof service?.tags === 'string' && service.tags.trim()) {
    return service.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
  }
  return [];
};

const mapServiceDetailForDisplay = service => {
  const listMapped = mapApiServiceToUi(service);
  const delivery =
    service?.delivery_days ?? service?.deliveryDays ?? service?.delivery ?? null;
  const revisions = service?.revisions ?? service?.revision_count ?? null;

  return {
    ...listMapped,
    priceRaw: service?.price,
    description: toDisplayString(service?.description) || '—',
    deliveryDays: delivery == null || delivery === '' ? '—' : String(delivery),
    revisions: revisions == null || revisions === '' ? '—' : String(revisions),
    tags: extractTags(service).join(', ') || '—',
    images: extractImageUrls(service),
    categoryIds: extractCategoryIds(service),
    tagList: extractTags(service),
  };
};

const mapServiceToFormValues = service => {
  const detail = mapServiceDetailForDisplay(service);
  const priceValue =
    service?.priceRaw ??
    (typeof service?.price === 'number' || /^\d+(\.\d+)?$/.test(String(service?.price || ''))
      ? service.price
      : service?.raw?.price ?? service?.priceRaw ?? '');
  const deliveryValue =
    service?.delivery_days ??
    service?.deliveryDays ??
    service?.raw?.delivery_days ??
    '';
  const revisionsValue =
    service?.revisions ?? service?.raw?.revisions ?? '';

  return {
    id: detail.id,
    title: toDisplayString(service?.raw?.title ?? service?.title),
    description: toDisplayString(service?.raw?.description ?? service?.description),
    price: priceValue === '—' ? '' : priceValue,
    delivery_days: deliveryValue === '—' ? '' : deliveryValue,
    revisions: revisionsValue === '—' ? '' : revisionsValue,
    category_ids: detail.categoryIds,
    tags: detail.tagList,
    existingImages: detail.images,
  };
};

const getStatusStyle = status => {
  if (status === 'ACTIVE') return { bg: '#E8F8EE', text: '#1B7A45' };
  if (status === 'PENDING') return { bg: '#FFF4E5', text: '#C27803' };
  return { bg: '#F2F2F7', text: grayColor };
};

const SellerMyServicesScreen = ({ navigation }) => {
  const { token } = useSelector(selectAuth);
  const fetchingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(1);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [services, setServices] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [listError, setListError] = useState('');

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [addModal, setAddModal] = useState({
    visible: false,
    loading: false,
    error: '',
    mode: 'create',
    initialValues: null,
  });
  const [successModal, setSuccessModal] = useState({
    visible: false,
    title: '',
    message: '',
  });
  const [detailModal, setDetailModal] = useState({
    visible: false,
    loading: false,
    service: null,
    error: '',
  });

  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    loading: false,
    serviceId: null,
    isActivate: true,
    title: '',
    message: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const response = await getCategoriesApi();
      setCategories(extractCategoriesList(response));
    } catch (error) {
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const fetchServices = useCallback(
    async (page = 1, { isLoadMore = false } = {}) => {
      if (!token || fetchingRef.current) return;
      if (isLoadMore && !hasMoreRef.current) return;

      fetchingRef.current = true;
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsInitialLoading(true);
        setListError('');
      }

      try {
        const response = await getSellerServicesApi(token, {
          search: debouncedSearch || undefined,
          page,
          limit: SERVICES_PAGE_LIMIT,
        });
        const list = extractServicesList(response);
        const mapped = list.map(mapApiServiceToUi);
        const nextHasMore = resolveHasMore(response, page, list.length);

        setServices(prev => (isLoadMore ? [...prev, ...mapped] : mapped));
        pageRef.current = page;
        hasMoreRef.current = nextHasMore;
      } catch (error) {
        if (!isLoadMore) {
          setServices([]);
          setListError(
            String(
              getApiErrorMessage(error?.data, error?.message || 'Could not load services.'),
            ),
          );
        }
      } finally {
        fetchingRef.current = false;
        setIsInitialLoading(false);
        setIsLoadingMore(false);
      }
    },
    [token, debouncedSearch],
  );

  const handleLoadMore = useCallback(() => {
    if (isInitialLoading || isLoadingMore || !hasMoreRef.current) return;
    fetchServices(pageRef.current + 1, { isLoadMore: true });
  }, [isInitialLoading, isLoadingMore, fetchServices]);

  const refreshServices = useCallback(async () => {
    hasMoreRef.current = true;
    pageRef.current = 1;
    await fetchServices(1, { isLoadMore: false });
  }, [fetchServices]);

  useFocusEffect(
    useCallback(() => {
      hasMoreRef.current = true;
      pageRef.current = 1;
      fetchServices(1, { isLoadMore: false });
      fetchCategories();
    }, [fetchServices, fetchCategories]),
  );

  const handleAddService = () => {
    setAddModal({
      visible: true,
      loading: false,
      error: '',
      mode: 'create',
      initialValues: null,
    });
    if (!categories.length) fetchCategories();
  };

  const closeAddModal = () => {
    if (addModal.loading) return;
    setAddModal({
      visible: false,
      loading: false,
      error: '',
      mode: 'create',
      initialValues: null,
    });
  };

  const openEditWithService = servicePayload => {
    setDetailModal({ visible: false, loading: false, service: null, error: '' });
    setAddModal({
      visible: true,
      loading: false,
      error: '',
      mode: 'edit',
      initialValues: mapServiceToFormValues(servicePayload),
    });
    if (!categories.length) fetchCategories();
  };

  const handleViewService = async service => {
    if (!token || !service?.id || detailModal.loading) return;

    setDetailModal({ visible: true, loading: true, service: null, error: '' });
    try {
      const [response, reviewsResponse] = await Promise.all([
        getSellerServiceByIdApi(token, service.id),
        getSellerReviewsApi(token, { page: 1, limit: 100 }).catch(() => null),
      ]);
      const detail = response?.data || response;
      const mapped = mapServiceDetailForDisplay(detail);

      const allReviews = Array.isArray(reviewsResponse?.data)
        ? reviewsResponse.data
        : Array.isArray(reviewsResponse?.data?.reviews)
          ? reviewsResponse.data.reviews
          : Array.isArray(reviewsResponse?.reviews)
            ? reviewsResponse.reviews
            : [];
      const serviceReviews = allReviews
        .map(mapApiReviewToUi)
        .filter(item => !item.serviceId || item.serviceId === String(service.id));

      const reviews =
        serviceReviews.length > 0
          ? serviceReviews
          : Array.isArray(mapped.reviews) && mapped.reviews.length
            ? mapped.reviews
            : [];

      setDetailModal({
        visible: true,
        loading: false,
        service: {
          ...mapped,
          reviews,
          reviewsCount: Math.max(mapped.reviewsCount || 0, reviews.length),
        },
        error: '',
      });
    } catch (error) {
      const fallback = service.raw || service;
      setDetailModal({
        visible: true,
        loading: false,
        service: mapServiceDetailForDisplay(fallback),
        error: getApiErrorMessage(
          error?.data,
          error?.message || SELLER_SERVICE_DETAIL_MODAL.loadError,
        ),
      });
    }
  };

  const handleEditService = async service => {
    if (!token || !service?.id || addModal.loading) return;

    if (!categories.length) fetchCategories();

    try {
      const response = await getSellerServiceByIdApi(token, service.id);
      const detail = response?.data || response;
      openEditWithService(detail);
    } catch (error) {
      const fallback = service.raw || service;
      openEditWithService(fallback);
      Alert.alert(
        'Warning',
        getApiErrorMessage(
          error?.data,
          error?.message || SELLER_SERVICE_DETAIL_MODAL.loadError,
        ),
      );
    }
  };

  const handleSubmitService = async payload => {
    if (!token || addModal.loading) return;

    setAddModal(prev => ({ ...prev, loading: true, error: '' }));
    try {
      if (addModal.mode === 'edit' && addModal.initialValues?.id) {
        await updateSellerServiceApi(token, addModal.initialValues.id, payload);
        setAddModal({
          visible: false,
          loading: false,
          error: '',
          mode: 'create',
          initialValues: null,
        });
        setSuccessModal({
          visible: true,
          title: SELLER_ADD_SERVICE_MODAL.editSuccessTitle,
          message: SELLER_ADD_SERVICE_MODAL.editSuccessMessage,
        });
      } else {
        await createSellerServiceApi(token, payload);
        setAddModal({
          visible: false,
          loading: false,
          error: '',
          mode: 'create',
          initialValues: null,
        });
        setSuccessModal({
          visible: true,
          title: SELLER_ADD_SERVICE_MODAL.successTitle,
          message: SELLER_ADD_SERVICE_MODAL.successMessage,
        });
      }
      await refreshServices();
    } catch (error) {
      setAddModal(prev => ({
        ...prev,
        loading: false,
        error: getApiErrorMessage(
          error?.data,
          error?.message ||
            (prev.mode === 'edit'
              ? SELLER_ADD_SERVICE_MODAL.editSubmitError
              : SELLER_ADD_SERVICE_MODAL.submitError),
        ),
      }));
    }
  };

  const openToggleModal = (serviceId, isActivate) => {
    setConfirmModal({
      visible: true,
      loading: false,
      serviceId,
      isActivate,
      title: isActivate ? SELLER_SERVICE_ACTIVATE_TITLE : SELLER_SERVICE_PAUSE_TITLE,
      message: isActivate ? SELLER_SERVICE_ACTIVATE_MESSAGE : SELLER_SERVICE_PAUSE_MESSAGE,
    });
  };

  const closeConfirmModal = () => {
    if (confirmModal.loading) return;
    setConfirmModal(prev => ({ ...prev, visible: false, loading: false }));
  };

  const handleConfirmToggle = async () => {
    const { serviceId, isActivate } = confirmModal;
    if (!token || !serviceId || confirmModal.loading) return;

    setConfirmModal(prev => ({ ...prev, loading: true }));
    try {
      if (isActivate) {
        await publishSellerServiceApi(token, serviceId);
      } else {
        await pauseSellerServiceApi(token, serviceId);
      }
      setConfirmModal(prev => ({ ...prev, visible: false, loading: false }));
      await refreshServices();
    } catch (error) {
      setConfirmModal(prev => ({ ...prev, visible: false, loading: false }));
      Alert.alert(
        'Error',
        getApiErrorMessage(error?.data, error?.message || 'Could not update service status.'),
      );
    }
  };

  const renderServiceCard = ({ item: service }) => {
    const statusStyle = getStatusStyle(service.status);
    const isPaused = service.status === 'PAUSED' || service.status === 'PENDING';

    return (
      <TouchableOpacity
        style={styles.serviceCard}
        activeOpacity={0.9}
        onPress={() => handleViewService(service)}>
        <View
          style={[
            styles.cardTop,
            flexDirectionRow,
            justifyContentSpaceBetween,
            alignItemsCenter,
          ]}>
          <View style={[styles.statusChip, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {String(service.status)}
            </Text>
          </View>
          <Text style={[styles.price, style.fontWeightMedium]}>{String(service.price)}</Text>
        </View>
        <Text style={[styles.serviceTitle, style.fontWeightMedium]}>{String(service.title)}</Text>
        <Text style={[styles.category, style.fontWeightThin]}>{String(service.category)}</Text>
        <View style={[flexDirectionRow, alignItemsCenter, styles.ratingRow]}>
          <Icon name="star" size={12} color={goldColor} />
          <Text style={[styles.ratingText, style.fontWeightMedium]}>{String(service.rating)}</Text>
          <Text style={[styles.bookingsText, style.fontWeightThin]}>
            ({String(service.reviewsCount ?? 0)} reviews)
          </Text>
          <Text style={[styles.bookingsText, style.fontWeightThin]}>
            · {String(service.bookings)} bookings
          </Text>
        </View>
        <View
          style={[styles.actionRow, flexDirectionRow]}
          onStartShouldSetResponder={() => true}>
          <TouchableOpacity
            style={[styles.editBtn, flex, flexDirectionRow, alignItemsCenter]}
            onPress={() => handleEditService(service)}>
            <Icon name="edit-2" size={14} color={redColor} />
            <Text style={[styles.editText, style.fontWeightMedium]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[isPaused ? styles.activateBtn : styles.pauseBtn, flex, alignItemsCenter]}
            onPress={() => openToggleModal(service.id, isPaused)}>
            <Text
              style={[isPaused ? styles.activateText : styles.pauseText, style.fontWeightMedium]}>
              {isPaused ? 'Activate' : 'Pause'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (isInitialLoading) {
      return (
        <View style={[styles.loaderWrap, alignJustifyCenter]}>
          <ActivityIndicator size="small" color={redColor} />
        </View>
      );
    }

    return (
      <EmptyState
        icon="layers"
        title={searchQuery.trim() ? EMPTY_SEARCH_TITLE : EMPTY_SELLER_SERVICES_TITLE}
        message={searchQuery.trim() ? EMPTY_SEARCH_MESSAGE : EMPTY_SELLER_SERVICES_MESSAGE}
      />
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={redColor} />
      </View>
    );
  };

  return (
    <SafeAreaView style={[flex, styles.safeArea]} edges={['top']}>
      <View style={styles.fixedHeader}>
        <ScreenHeader
          title={SELLER_SERVICES_TITLE}
          navigation={navigation}
          onBack={() => navigation.goBack()}
        />

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={SELLER_SERVICES_SEARCH}
        />

        <TouchableOpacity
          style={[styles.addBtn, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}
          onPress={handleAddService}>
          <Text style={[styles.addBtnText, style.fontWeightMedium]}>{SELLER_SERVICES_ADD}</Text>
          <Icon name="plus" size={18} color={whiteColor} />
        </TouchableOpacity>

        {listError ? (
          <View style={[styles.errorBanner, flexDirectionRow, alignItemsCenter]}>
            <Icon name="alert-circle" size={14} color={redColor} />
            <Text style={[styles.errorText, style.fontWeightThin]}>{listError}</Text>
          </View>
        ) : null}
      </View>

      <FlatList
        style={flex}
        data={services}
        keyExtractor={item => String(item.id)}
        renderItem={renderServiceCard}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          services.length === 0 && styles.emptyListContent,
        ]}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        bounces={false}
      />

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

      <AddServiceModal
        visible={addModal.visible}
        loading={addModal.loading}
        error={addModal.error}
        mode={addModal.mode}
        initialValues={addModal.initialValues}
        categories={categories}
        categoriesLoading={categoriesLoading}
        onClose={closeAddModal}
        onSubmit={handleSubmitService}
      />

      <SellerServiceDetailModal
        visible={detailModal.visible}
        loading={detailModal.loading}
        error={detailModal.error}
        service={detailModal.service}
        onClose={() =>
          setDetailModal({ visible: false, loading: false, service: null, error: '' })
        }
        onEdit={service => {
          if (!service?.id) return;
          openEditWithService(service.raw || service);
        }}
      />

      <SuccessModal
        visible={successModal.visible}
        title={successModal.title}
        message={successModal.message}
        onPress={() => setSuccessModal({ visible: false, title: '', message: '' })}
      />
    </SafeAreaView>
  );
};

export default SellerMyServicesScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: screenBgColor },
  fixedHeader: {
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
  },
  listContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(3),
    flexGrow: 1,
  },
  emptyListContent: { flexGrow: 1 },
  loaderWrap: {
    paddingVertical: hp(8),
  },
  footerLoader: {
    paddingVertical: spacings.large,
    alignItems: 'center',
  },
  errorBanner: {
    gap: spacings.small,
    backgroundColor: lightPink,
    borderRadius: 8,
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.medium,
    marginBottom: spacings.large,
  },
  errorText: {
    flex: 1,
    fontSize: style.fontSizeSmall1x.fontSize,
    color: redColor,
    lineHeight: 18,
  },
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
