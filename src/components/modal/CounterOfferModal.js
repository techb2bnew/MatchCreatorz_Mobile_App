import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
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
  redColor,
  whiteColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import { COUNTER_OFFER_MODAL } from '../../constans/Constants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter, justifyContentSpaceBetween } =
  BaseStyle;

const FieldLabel = ({ icon, iconColor, label }) => (
  <View style={[styles.labelRow, flexDirectionRow, alignItemsCenter]}>
    <Icon name={icon} size={14} color={iconColor} />
    <Text style={[styles.fieldLabel, style.fontWeightMedium]}>{label}</Text>
  </View>
);

const CounterOfferModal = ({
  visible,
  job,
  title = COUNTER_OFFER_MODAL.title,
  submitLabel = COUNTER_OFFER_MODAL.submit,
  loading = false,
  error = '',
  onClose,
  onSubmit,
}) => {
  const [amount, setAmount] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [note, setNote] = useState('');
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    if (visible) {
      setAmount('');
      setDeliveryDays('');
      setNote('');
      setFieldError('');
    }
  }, [visible, job?.id]);

  const handleSubmit = () => {
    const amountNum = Number(amount);

    if (!amount.trim() || Number.isNaN(amountNum) || amountNum <= 0) {
      setFieldError(COUNTER_OFFER_MODAL.amountRequired);
      return;
    }

    if (deliveryDays.trim()) {
      const daysNum = Number(deliveryDays);
      if (Number.isNaN(daysNum) || daysNum <= 0 || !Number.isInteger(daysNum)) {
        setFieldError(COUNTER_OFFER_MODAL.deliveryRequired);
        return;
      }
    }

    setFieldError('');
    onSubmit?.({
      amount: amountNum,
      delivery_days: deliveryDays.trim() ? Number(deliveryDays) : undefined,
      note: note.trim(),
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.overlay, alignJustifyCenter]}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
          <View style={styles.card}>
            <View style={[styles.header, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
              <Text style={[styles.title, style.fontWeightBold]}>{title}</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="x" size={22} color={grayColor} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} bounces={false} keyboardShouldPersistTaps="handled">
              {job?.title ? (
                <View style={styles.jobSummary}>
                  <Text style={[styles.jobLabel, style.fontWeightMedium]}>{COUNTER_OFFER_MODAL.jobLabel}</Text>
                  <Text style={[styles.jobTitle, style.fontWeightMedium]} numberOfLines={2}>
                    {job.title}
                  </Text>
                </View>
              ) : null}

              <View style={styles.fieldWrap}>
                <FieldLabel icon="dollar-sign" iconColor={greenColor} label={COUNTER_OFFER_MODAL.amountLabel} />
                <TextInput
                  style={[styles.input, style.fontWeightThin]}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder={COUNTER_OFFER_MODAL.amountPlaceholder}
                  placeholderTextColor={grayColor}
                  keyboardType="numeric"
                  editable={!loading}
                />
              </View>

              <View style={styles.fieldWrap}>
                <FieldLabel icon="calendar" iconColor={blueColor} label={COUNTER_OFFER_MODAL.deliveryLabel} />
                <TextInput
                  style={[styles.input, style.fontWeightThin]}
                  value={deliveryDays}
                  onChangeText={setDeliveryDays}
                  placeholder={COUNTER_OFFER_MODAL.deliveryPlaceholder}
                  placeholderTextColor={grayColor}
                  keyboardType="number-pad"
                  editable={!loading}
                />
              </View>

              <View style={styles.fieldWrap}>
                <FieldLabel icon="edit-2" iconColor={redColor} label={COUNTER_OFFER_MODAL.noteLabel} />
                <TextInput
                  style={[styles.input, styles.noteInput, style.fontWeightThin]}
                  value={note}
                  onChangeText={setNote}
                  placeholder={COUNTER_OFFER_MODAL.notePlaceholder}
                  placeholderTextColor={grayColor}
                  multiline
                  textAlignVertical="top"
                  editable={!loading}
                />
              </View>

              {fieldError || error ? (
                <View style={[styles.errorBanner, flexDirectionRow, alignItemsCenter]}>
                  <Icon name="alert-circle" size={14} color={redColor} />
                  <Text style={[styles.errorText, style.fontWeightThin]}>{fieldError || error}</Text>
                </View>
              ) : null}

              <View style={[styles.btnRow, flexDirectionRow]}>
                <TouchableOpacity style={[styles.cancelBtn, alignJustifyCenter]} onPress={onClose} disabled={loading}>
                  <Text style={[styles.cancelBtnText, style.fontWeightMedium]}>{COUNTER_OFFER_MODAL.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.submitBtn, alignJustifyCenter]} onPress={handleSubmit} disabled={loading}>
                  {loading ? (
                    <ActivityIndicator size="small" color={whiteColor} />
                  ) : (
                    <Text style={[styles.submitBtnText, style.fontWeightMedium]}>{submitLabel}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CounterOfferModal;

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
    maxHeight: hp(85),
    backgroundColor: whiteColor,
    borderRadius: 16,
    paddingHorizontal: spacings.xLarge,
    paddingTop: spacings.xLarge,
    paddingBottom: spacings.large,
  },
  header: {
    marginBottom: spacings.large,
  },
  title: {
    fontSize: style.fontSizeLargeX.fontSize,
    color: blackColor,
  },
  jobSummary: {
    backgroundColor: inputBgColor,
    borderRadius: 12,
    padding: spacings.large,
    marginBottom: spacings.large,
  },
  jobLabel: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  fieldWrap: {
    marginBottom: spacings.large,
  },
  labelRow: {
    gap: 6,
    marginBottom: spacings.small,
  },
  fieldLabel: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 10,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.medium,
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  noteInput: {
    minHeight: hp(9),
    paddingTop: spacings.medium,
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
  btnRow: {
    gap: spacings.normal,
    marginBottom: spacings.small,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: redColor,
    borderRadius: 10,
    paddingVertical: spacings.large,
  },
  cancelBtnText: {
    color: redColor,
    fontSize: style.fontSizeNormal2x.fontSize,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: redColor,
    borderRadius: 10,
    paddingVertical: spacings.large,
  },
  submitBtnText: {
    color: whiteColor,
    fontSize: style.fontSizeNormal2x.fontSize,
  },
});
