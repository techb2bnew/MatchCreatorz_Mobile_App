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
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../../constans/Style';
import { blackColor, grayColor, inputBgColor, redColor, whiteColor } from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import { formatAppCurrency } from '../../utils/currency';
import { formatHours, formatWorkDate } from '../../utils/workEntries';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';
import { keyboardAvoidingBehavior, useKeyboardBottomInset } from '../../utils/keyboard';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter, justifyContentSpaceBetween } =
  BaseStyle;

/**
 * One sheet for the text-input actions on a work entry or a milestone:
 *  - mode "counter": hours input (validated <= the entry's hours) + optional note
 *  - mode "amount":  money input (validated <= the milestone's amount) + optional note
 *  - mode "dispute": reason textarea
 * Used by the buyer (counter / dispute) and the seller (counter back).
 */
const WorkEntryActionModal = ({
  visible,
  mode = 'counter',
  entry = null,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const isAmount = mode === 'amount';
  const isCounter = mode === 'counter' || isAmount;
  const maxHours = Number(entry?.hours) || 0;
  const maxAmount = Number(entry?.amount) || 0;
  const rate = Number(entry?.rate) || 0;
  const maxValue = isAmount ? maxAmount : maxHours;

  const keyboardBottom = useKeyboardBottomInset(24);
  const [hours, setHours] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setHours('');
      setNote('');
      setError('');
    }
  }, [visible, entry?.id, mode]);

  const hoursValue = Number(hours) || 0;

  const handleSubmit = () => {
    if (loading) return;
    if (isCounter) {
      if (!hoursValue || hoursValue <= 0) {
        setError(isAmount ? 'Enter the amount you want to pay.' : 'Enter the hours you want to pay for.');
        return;
      }
      if (hoursValue > maxValue) {
        setError(
          isAmount
            ? `Cannot be more than the submitted ${formatAppCurrency(maxAmount)}.`
            : `Cannot be more than the logged ${formatHours(maxHours)}.`,
        );
        return;
      }
      setError('');
      if (isAmount) {
        onSubmit?.({ counterAmount: hoursValue, counterNote: note.trim() });
      } else {
        onSubmit?.({ counterHours: hoursValue, counterNote: note.trim() });
      }
      return;
    }
    setError('');
    onSubmit?.({ disputeReason: note.trim() });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.flex} behavior={keyboardAvoidingBehavior}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
          <View style={[styles.sheet, { paddingBottom: spacings.xxLarge + keyboardBottom }]}>
            <View style={[styles.header, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
              <Text style={[styles.title, style.fontWeightMedium]}>
                {isAmount ? 'Counter amount' : isCounter ? 'Counter hours' : 'Dispute entry'}
              </Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="x" size={20} color={grayColor} />
              </TouchableOpacity>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View>
            {entry ? (
              <Text style={[styles.entryLine, style.fontWeightThin]}>
                {isAmount
                  ? `${entry.title || 'Milestone'} · submitted ${formatAppCurrency(entry.amount)}`
                  : `${formatWorkDate(entry.workDate)} · ${formatHours(entry.hours)} logged · ${formatAppCurrency(entry.amount)}`}
              </Text>
            ) : null}

            {isCounter ? (
              <>
                <Text style={[styles.label, style.fontWeightMedium]}>
                  {isAmount ? "AMOUNT YOU'LL PAY" : "HOURS YOU'LL PAY FOR"}
                </Text>
                <View style={[styles.field, flexDirectionRow, alignItemsCenter]}>
                  <Icon name={isAmount ? 'dollar-sign' : 'clock'} size={16} color={grayColor} />
                  <TextInput
                    value={hours}
                    onChangeText={value => {
                      setHours(value.replace(/[^0-9.]/g, ''));
                      if (error) setError('');
                    }}
                    placeholder={isAmount ? `Max ${maxAmount}` : `Max ${maxHours}`}
                    placeholderTextColor={grayColor}
                    keyboardType="decimal-pad"
                    style={[styles.fieldInput, style.fontSizeNormal2x]}
                  />
                </View>
                {!isAmount && rate > 0 && hoursValue > 0 ? (
                  <Text style={[styles.previewText, style.fontWeightThin]}>
                    {formatHours(hoursValue)} × {formatAppCurrency(rate)}/hr ={' '}
                    <Text style={[styles.previewTotal, style.fontWeightMedium]}>
                      {formatAppCurrency(hoursValue * rate)}
                    </Text>
                  </Text>
                ) : null}
              </>
            ) : null}

            <Text style={[styles.label, style.fontWeightMedium]}>
              {isCounter ? 'NOTE ' : 'REASON '}
              <Text style={styles.optional}>(optional)</Text>
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder={
                isAmount
                  ? 'Why a lower amount?'
                  : isCounter
                    ? 'Why fewer hours?'
                    : 'Tell admin what the problem is'
              }
              placeholderTextColor={grayColor}
              multiline
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={() => Keyboard.dismiss()}
              style={[styles.textArea, style.fontSizeNormal2x]}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.submitBtn, alignJustifyCenter]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator size="small" color={whiteColor} />
              ) : (
                <Text style={[styles.submitText, style.fontWeightMedium]}>
                  {isCounter ? 'Send counter' : 'Send to dispute'}
                </Text>
              )}
            </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default WorkEntryActionModal;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    backgroundColor: whiteColor,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: wp(5),
    paddingTop: spacings.xLarge,
    maxHeight: hp(85),
  },
  header: { marginBottom: spacings.small },
  title: { fontSize: style.fontSizeMedium1x.fontSize, color: blackColor },
  entryLine: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginBottom: spacings.large,
  },
  label: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    letterSpacing: 0.5,
    marginBottom: spacings.small,
  },
  optional: { color: grayColor, fontWeight: '400' },
  field: {
    backgroundColor: inputBgColor,
    borderRadius: 10,
    minHeight: hp(6),
    paddingHorizontal: spacings.large,
    gap: spacings.normal,
    marginBottom: spacings.small,
  },
  fieldInput: { flex: 1, color: blackColor, padding: 0 },
  previewText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginBottom: spacings.large,
  },
  previewTotal: { color: blackColor, fontSize: style.fontSizeSmall1x.fontSize },
  textArea: {
    backgroundColor: inputBgColor,
    borderRadius: 10,
    minHeight: hp(11),
    padding: spacings.large,
    color: blackColor,
    textAlignVertical: 'top',
    marginBottom: spacings.large,
  },
  errorText: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
    marginBottom: spacings.normal,
  },
  submitBtn: { minHeight: 48, borderRadius: 12, backgroundColor: redColor },
  submitText: { fontSize: style.fontSizeNormal2x.fontSize, color: whiteColor },
});
