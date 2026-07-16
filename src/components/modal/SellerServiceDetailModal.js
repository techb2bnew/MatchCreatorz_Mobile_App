import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../../constans/Style';
import {
  blackColor,
  borderLightColor,
  grayColor,
  inputBgColor,
  lightPink,
  redColor,
  whiteColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import { SELLER_SERVICE_DETAIL_MODAL as COPY } from '../../constans/Constants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter } = BaseStyle;

const toText = value => {
  if (value == null || value === '') return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(toText).filter(Boolean).join(', ');
  }
  if (typeof value === 'object') {
    return toText(value.name ?? value.title ?? value.label ?? value.value ?? '');
  }
  return '';
};

const getStatusStyle = status => {
  const normalized = toText(status).toUpperCase();
  if (normalized === 'ACTIVE' || normalized === 'PUBLISHED') {
    return { bg: '#E8F8EE', text: '#1B7A45', label: 'ACTIVE' };
  }
  if (normalized === 'PENDING' || normalized === 'DRAFT') {
    return { bg: '#FFF4E5', text: '#C27803', label: 'PENDING' };
  }
  return { bg: '#F2F2F7', text: grayColor, label: normalized || 'PAUSED' };
};

const formatPrice = value => {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const DetailRow = ({ label, value, multiline = false, last = false }) => (
  <View style={[styles.detailRow, last && styles.detailRowLast]}>
    <Text style={[styles.detailLabel, style.fontWeightMedium]}>{label}</Text>
    <Text
      style={[styles.detailValue, style.fontWeightThin, multiline && styles.detailValueMultiline]}
      numberOfLines={multiline ? undefined : 4}>
      {toText(value) || '—'}
    </Text>
  </View>
);

const SellerServiceDetailModal = ({
  visible,
  onClose,
  loading = false,
  error = '',
  service,
  onEdit,
}) => {
  const statusStyle = getStatusStyle(service?.status);
  const images = Array.isArray(service?.images) ? service.images.filter(Boolean) : [];
  const delivery =
    service?.deliveryDays != null && service.deliveryDays !== '—'
      ? `${service.deliveryDays} ${COPY.daysSuffix}`
      : '—';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}>
      <View style={[styles.overlay, alignJustifyCenter]}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.card}>
          <View style={[styles.cardHeader, flexDirectionRow, alignItemsCenter]}>
            <View style={styles.headerIconWrap}>
              <Icon name="layers" size={18} color={redColor} />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={[styles.title, style.fontWeightMedium]}>{COPY.title}</Text>
              {service?.title ? (
                <Text style={[styles.subtitle, style.fontWeightThin]} numberOfLines={2}>
                  {toText(service.title)}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="x" size={20} color={grayColor} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={[styles.loaderWrap, alignJustifyCenter]}>
              <ActivityIndicator size="large" color={redColor} />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {error ? (
                <View style={[styles.errorBanner, flexDirectionRow, alignItemsCenter]}>
                  <Icon name="alert-circle" size={14} color={redColor} />
                  <Text style={[styles.errorText, style.fontWeightThin]}>{toText(error)}</Text>
                </View>
              ) : null}

              {service ? (
                <>
                  <View style={[styles.statusRow, flexDirectionRow, alignItemsCenter]}>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusText, { color: statusStyle.text }]}>
                        {statusStyle.label}
                      </Text>
                    </View>
                    <Text style={[styles.priceText, style.fontWeightMedium]}>
                      {formatPrice(service.priceRaw ?? service.price)}
                    </Text>
                  </View>

                  {images.length > 0 ? (
                    <View style={styles.imagesSection}>
                      <Text style={[styles.sectionLabel, style.fontWeightMedium]}>{COPY.images}</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.imagesRow}>
                        {images.map((uri, index) => (
                          <Image
                            key={`${uri}-${index}`}
                            source={{ uri }}
                            style={styles.imageThumb}
                          />
                        ))}
                      </ScrollView>
                    </View>
                  ) : null}

                  <View style={styles.detailsCard}>
                    <DetailRow label={COPY.category} value={service.category} />
                    <DetailRow label={COPY.delivery} value={delivery} />
                    <DetailRow label={COPY.revisions} value={service.revisions} />
                    <DetailRow label={COPY.rating} value={service.rating} />
                    <DetailRow
                      label={COPY.bookings}
                      value={
                        service.bookings != null ? `${service.bookings} bookings` : '—'
                      }
                    />
                    <DetailRow label={COPY.tags} value={service.tags} />
                    <DetailRow
                      label={COPY.description}
                      value={service.description}
                      multiline
                      last
                    />
                  </View>

                  {onEdit ? (
                    <TouchableOpacity
                      style={[styles.editBtn, flexDirectionRow, alignJustifyCenter]}
                      onPress={() => onEdit(service)}
                      activeOpacity={0.85}>
                      <Icon name="edit-2" size={16} color={whiteColor} />
                      <Text style={[styles.editBtnText, style.fontWeightMedium]}>{COPY.edit}</Text>
                    </TouchableOpacity>
                  ) : null}
                </>
              ) : null}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default SellerServiceDetailModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: wp(5),
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '100%',
    maxHeight: hp(80),
    backgroundColor: whiteColor,
    borderRadius: 16,
    paddingHorizontal: spacings.xLarge,
    paddingTop: spacings.xLarge,
    paddingBottom: spacings.large,
  },
  cardHeader: {
    gap: spacings.normal,
    marginBottom: spacings.large,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: lightPink,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
  },
  subtitle: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  loaderWrap: {
    minHeight: hp(20),
    paddingVertical: spacings.xxLarge,
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
  statusRow: {
    justifyContent: 'space-between',
    marginBottom: spacings.large,
  },
  statusBadge: {
    paddingHorizontal: spacings.medium,
    paddingVertical: spacings.xsmall,
    borderRadius: 6,
  },
  statusText: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    fontWeight: '700',
  },
  priceText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: redColor,
  },
  imagesSection: {
    marginBottom: spacings.large,
  },
  sectionLabel: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginBottom: spacings.small,
  },
  imagesRow: {
    gap: spacings.normal,
  },
  imageThumb: {
    width: wp(22),
    height: wp(22),
    borderRadius: 10,
    backgroundColor: inputBgColor,
  },
  detailsCard: {
    backgroundColor: inputBgColor,
    borderRadius: 12,
    paddingHorizontal: spacings.large,
    marginBottom: spacings.large,
  },
  detailRow: {
    paddingVertical: spacings.medium,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderLightColor,
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  detailValueMultiline: {
    lineHeight: 22,
  },
  editBtn: {
    gap: spacings.small,
    backgroundColor: redColor,
    borderRadius: 10,
    paddingVertical: spacings.large,
    marginBottom: spacings.small,
  },
  editBtnText: {
    color: whiteColor,
    fontSize: style.fontSizeNormal2x.fontSize,
  },
});
