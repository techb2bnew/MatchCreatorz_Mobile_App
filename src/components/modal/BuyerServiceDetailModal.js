import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../../constans/Style';
import {
  blackColor,
  borderLightColor,
  grayColor,
  goldColor,
  inputBgColor,
  lightPink,
  redColor,
  whiteColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import { BUYER_SERVICE_DETAIL_MODAL as COPY } from '../../constans/Constants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter, justifyContentSpaceBetween } =
  BaseStyle;

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

const formatPrice = value => {
  if (typeof value === 'string' && value.trim().startsWith('₹')) return value;
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

const BuyerServiceDetailModal = ({ visible, onClose, service }) => {
  const images = Array.isArray(service?.images) ? service.images.filter(Boolean) : [];
  const tags = Array.isArray(service?.tags) ? service.tags.filter(Boolean) : [];
  const delivery =
    service?.deliveryDays != null && service.deliveryDays !== '—'
      ? `${service.deliveryDays} ${COPY?.daysSuffix || 'days'}`
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
              <Text style={[styles.title, style.fontWeightMedium]}>
                {COPY?.title || 'Service Details'}
              </Text>
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

          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {service ? (
              <>
                <View
                  style={[
                    styles.priceRow,
                    flexDirectionRow,
                    alignItemsCenter,
                    justifyContentSpaceBetween,
                  ]}>
                  <Text style={[styles.priceText, style.fontWeightMedium]}>
                    {formatPrice(service.priceRaw ?? service.price)}
                  </Text>
                  <View style={[flexDirectionRow, alignItemsCenter, styles.ratingRow]}>
                    <Icon name="star" size={14} color={goldColor} />
                    <Text style={[styles.ratingText, style.fontWeightMedium]}>
                      {toText(service.rating) || '0.0'}
                    </Text>
                    <Text style={[styles.reviewsText, style.fontWeightThin]}>
                      ({service.reviewsCount ?? 0})
                    </Text>
                  </View>
                </View>

                {images.length > 0 ? (
                  <View style={styles.imagesSection}>
                    <Text style={[styles.sectionLabel, style.fontWeightMedium]}>
                      {COPY?.images || 'Images'}
                    </Text>
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

                {tags.length > 0 ? (
                  <View style={[styles.tagsRow, flexDirectionRow]}>
                    {tags.map(tag => (
                      <View key={tag} style={styles.tagChip}>
                        <Text style={[styles.tagText, style.fontWeightThin]}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                <View style={styles.detailsCard}>
                  <DetailRow label={COPY?.seller || 'Seller'} value={service.sellerName} />
                  <DetailRow label={COPY?.category || 'Category'} value={service.category} />
                  <DetailRow label={COPY?.delivery || 'Delivery Time'} value={delivery} />
                  <DetailRow label={COPY?.revisions || 'Revisions'} value={service.revisions} />
                  <DetailRow
                    label={COPY?.orders || 'Orders'}
                    value={
                      service.ordersCount != null ? `${service.ordersCount} orders` : '—'
                    }
                  />
                  <DetailRow
                    label={COPY?.description || 'Description'}
                    value={service.description}
                    multiline
                    last
                  />
                </View>
              </>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default BuyerServiceDetailModal;

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
  priceRow: {
    marginBottom: spacings.large,
  },
  priceText: {
    fontSize: style.fontSizeLargeX.fontSize,
    color: redColor,
  },
  ratingRow: {
    gap: 4,
  },
  ratingText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
  },
  reviewsText: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
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
    width: wp(28),
    height: wp(28),
    borderRadius: 10,
    backgroundColor: inputBgColor,
  },
  tagsRow: {
    flexWrap: 'wrap',
    gap: spacings.small,
    marginBottom: spacings.large,
  },
  tagChip: {
    backgroundColor: inputBgColor,
    borderRadius: 6,
    paddingHorizontal: spacings.normal,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
  },
  detailsCard: {
    backgroundColor: inputBgColor,
    borderRadius: 12,
    paddingHorizontal: spacings.large,
    marginBottom: spacings.small,
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
});
