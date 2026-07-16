import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../../constans/Style';
import {
  blackColor,
  borderLightColor,
  grayColor,
  goldColor,
  inputBgColor,
  redColor,
  whiteColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import { SUBMIT_REVIEW_MODAL as COPY } from '../../constans/Constants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter, justifyContentSpaceBetween } =
  BaseStyle;

const SubmitReviewModal = ({
  visible,
  booking,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setRating(0);
      setComment('');
      setError('');
    }
  }, [visible, booking?.id]);

  const handleSubmit = () => {
    if (loading) return;
    if (!rating || rating < 1) {
      setError(COPY.ratingRequired);
      return;
    }
    setError('');
    onSubmit?.({ rating, comment: comment.trim() });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={loading ? undefined : onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={loading ? undefined : onClose}
        />
        <View style={styles.card}>
          <View
            style={[styles.header, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
            <View style={styles.headerTextWrap}>
              <Text style={[styles.title, style.fontWeightMedium]}>{COPY.title}</Text>
              <Text style={[styles.subtitle, style.fontWeightThin]} numberOfLines={2}>
                {booking?.title || COPY.subtitle}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              disabled={loading}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="x" size={20} color={grayColor} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled">
            {booking?.sellerName ? (
              <Text style={[styles.sellerText, style.fontWeightThin]}>
                Seller: {booking.sellerName}
              </Text>
            ) : null}

            <Text style={[styles.label, style.fontWeightMedium]}>{COPY.ratingLabel}</Text>
            <View style={[styles.starsRow, flexDirectionRow, alignItemsCenter]}>
              {[1, 2, 3, 4, 5].map(value => (
                <TouchableOpacity
                  key={value}
                  onPress={() => {
                    if (loading) return;
                    setRating(value);
                    setError('');
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                  activeOpacity={0.8}>
                  <Text
                    style={[
                      styles.starGlyph,
                      { color: value <= rating ? goldColor : borderLightColor },
                    ]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {error ? (
              <Text style={[styles.errorText, style.fontWeightThin]}>{error}</Text>
            ) : null}

            <Text style={[styles.label, style.fontWeightMedium]}>{COPY.commentLabel}</Text>
            <TextInput
              style={[styles.commentInput, style.fontWeightThin]}
              value={comment}
              onChangeText={setComment}
              placeholder={COPY.commentPlaceholder}
              placeholderTextColor={grayColor}
              multiline
              textAlignVertical="top"
              editable={!loading}
            />
          </ScrollView>

          <View style={[styles.actions, flexDirectionRow]}>
            <TouchableOpacity
              style={[styles.cancelBtn, alignJustifyCenter]}
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.85}>
              <Text style={[styles.cancelText, style.fontWeightMedium]}>{COPY.cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, alignJustifyCenter]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator size="small" color={whiteColor} />
              ) : (
                <Text style={[styles.submitText, style.fontWeightMedium]}>{COPY.submit}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default SubmitReviewModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
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
  header: {
    marginBottom: spacings.large,
    gap: spacings.normal,
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
  sellerText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginBottom: spacings.large,
  },
  label: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    letterSpacing: 0.4,
    marginBottom: spacings.small,
  },
  starsRow: {
    gap: spacings.normal,
    marginBottom: spacings.large,
  },
  starGlyph: {
    fontSize: 32,
    lineHeight: 36,
  },
  errorText: {
    marginTop: -spacings.normal,
    marginBottom: spacings.large,
    fontSize: style.fontSizeSmall1x.fontSize,
    color: redColor,
  },
  commentInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    backgroundColor: inputBgColor,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.medium,
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginBottom: spacings.xLarge,
  },
  actions: {
    gap: spacings.normal,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: borderLightColor,
    backgroundColor: whiteColor,
  },
  cancelText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  submitBtn: {
    flex: 1.2,
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: redColor,
  },
  submitText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: whiteColor,
  },
});
