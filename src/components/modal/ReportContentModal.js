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
import { REPORT_REASONS } from '../../services/moderationService';
import {
  REPORT_MODAL_TITLE,
  REPORT_MODAL_SUBTITLE,
  REPORT_REASON_LABEL,
  REPORT_NOTE_LABEL,
  REPORT_NOTE_PLACEHOLDER,
  REPORT_SUBMIT,
  ERROR_REPORT_REASON_REQUIRED,
} from '../../constans/Constants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';
import { keyboardAvoidingBehavior, useKeyboardBottomInset } from '../../utils/keyboard';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter, justifyContentSpaceBetween } =
  BaseStyle;

/**
 * Report objectionable content — the "flag" mechanism App Store guideline 1.2
 * requires. Works for jobs, services, profiles, chat messages, bids and reviews.
 */
const ReportContentModal = ({ visible, target = null, onClose, onSubmit, loading = false }) => {
  const keyboardBottom = useKeyboardBottomInset(24);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setReason('');
      setNote('');
      setError('');
    }
  }, [visible, target?.id]);

  const handleSubmit = () => {
    if (loading) return;
    if (!reason) {
      setError(ERROR_REPORT_REASON_REQUIRED);
      return;
    }
    setError('');
    onSubmit?.({ reason, note: note.trim() });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={loading ? undefined : onClose}>
      <KeyboardAvoidingView style={styles.flex} behavior={keyboardAvoidingBehavior}>
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={loading ? undefined : onClose}
          />
          <View style={[styles.sheet, { paddingBottom: spacings.xxLarge + keyboardBottom }]}>
            <View style={[styles.header, flexDirectionRow, alignItemsCenter]}>
              <View style={[styles.headerIcon, alignJustifyCenter]}>
                <Icon name="flag" size={18} color={redColor} />
              </View>
              <View style={styles.headerText}>
                <Text style={[styles.title, style.fontWeightMedium]}>{REPORT_MODAL_TITLE}</Text>
                <Text style={[styles.subtitle, style.fontWeightThin]}>{REPORT_MODAL_SUBTITLE}</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                disabled={loading}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="x" size={20} color={grayColor} />
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View>
                  {target?.title ? (
                    <Text style={[styles.targetText, style.fontWeightThin]} numberOfLines={2}>
                      {target.title}
                    </Text>
                  ) : null}

                  <Text style={[styles.label, style.fontWeightMedium]}>{REPORT_REASON_LABEL}</Text>
                  {REPORT_REASONS.map(item => {
                    const selected = reason === item;
                    return (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.reasonRow,
                          flexDirectionRow,
                          alignItemsCenter,
                          justifyContentSpaceBetween,
                          selected && styles.reasonRowSelected,
                        ]}
                        onPress={() => {
                          setReason(item);
                          if (error) setError('');
                        }}
                        disabled={loading}
                        activeOpacity={0.8}>
                        <Text
                          style={[
                            styles.reasonText,
                            style.fontWeightThin,
                            selected && styles.reasonTextSelected,
                          ]}>
                          {item}
                        </Text>
                        {selected ? <Icon name="check" size={16} color={redColor} /> : null}
                      </TouchableOpacity>
                    );
                  })}

                  <Text style={[styles.label, style.fontWeightMedium]}>{REPORT_NOTE_LABEL}</Text>
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder={REPORT_NOTE_PLACEHOLDER}
                    placeholderTextColor={grayColor}
                    multiline
                    returnKeyType="done"
                    blurOnSubmit
                    onSubmitEditing={() => Keyboard.dismiss()}
                    editable={!loading}
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
                      <Text style={[styles.submitText, style.fontWeightMedium]}>{REPORT_SUBMIT}</Text>
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

export default ReportContentModal;

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
  header: { gap: spacings.normal, marginBottom: spacings.large },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: lightPink,
    flexShrink: 0,
  },
  headerText: { flex: 1, minWidth: 0 },
  title: { fontSize: style.fontSizeMedium1x.fontSize, color: blackColor },
  subtitle: { fontSize: style.fontSizeSmall1x.fontSize, color: grayColor, marginTop: 2 },
  targetText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    backgroundColor: inputBgColor,
    borderRadius: 10,
    padding: spacings.normal,
    marginBottom: spacings.large,
  },
  label: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    letterSpacing: 0.5,
    marginBottom: spacings.small,
  },
  reasonRow: {
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 10,
    paddingHorizontal: spacings.large,
    minHeight: hp(5.5),
    marginBottom: spacings.small,
  },
  reasonRowSelected: { borderColor: redColor, backgroundColor: '#FFF5F5' },
  reasonText: { flex: 1, fontSize: style.fontSizeSmall2x.fontSize, color: blackColor },
  reasonTextSelected: { color: redColor },
  textArea: {
    backgroundColor: inputBgColor,
    borderRadius: 10,
    minHeight: hp(11),
    padding: spacings.large,
    color: blackColor,
    textAlignVertical: 'top',
    marginTop: spacings.small,
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
