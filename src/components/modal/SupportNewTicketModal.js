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
  redColor,
  whiteColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import {
  SUPPORT_NEW_TICKET_TITLE,
  SUPPORT_NEW_TICKET_SUBJECT_LABEL,
  SUPPORT_NEW_TICKET_SUBJECT_PLACEHOLDER,
  SUPPORT_NEW_TICKET_BODY_LABEL,
  SUPPORT_NEW_TICKET_BODY_PLACEHOLDER,
  SUPPORT_NEW_TICKET_BODY_REQUIRED,
  SUPPORT_NEW_TICKET_SUBMIT,
  CONFIRM_CANCEL,
} from '../../constans/Constants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter, justifyContentSpaceBetween } =
  BaseStyle;

const SupportNewTicketModal = ({ visible, onClose, onSubmit, loading = false }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setSubject('');
      setBody('');
      setError('');
    }
  }, [visible]);

  const handleSubmit = () => {
    if (loading) return;
    if (!body.trim()) {
      setError(SUPPORT_NEW_TICKET_BODY_REQUIRED);
      return;
    }
    setError('');
    onSubmit?.({ subject: subject.trim() || undefined, body: body.trim() });
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
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={loading ? undefined : onClose} />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.card}>
          <View style={[styles.header, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
            <Text style={[styles.title, style.fontWeightMedium]}>{SUPPORT_NEW_TICKET_TITLE}</Text>
            <TouchableOpacity onPress={onClose} disabled={loading} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="x" size={20} color={grayColor} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
            <Text style={[styles.label, style.fontWeightMedium]}>{SUPPORT_NEW_TICKET_SUBJECT_LABEL}</Text>
            <TextInput
              style={[styles.subjectInput, style.fontWeightThin]}
              value={subject}
              onChangeText={setSubject}
              placeholder={SUPPORT_NEW_TICKET_SUBJECT_PLACEHOLDER}
              placeholderTextColor={grayColor}
              maxLength={120}
              editable={!loading}
            />

            <Text style={[styles.label, style.fontWeightMedium]}>{SUPPORT_NEW_TICKET_BODY_LABEL}</Text>
            <TextInput
              style={[styles.bodyInput, style.fontWeightThin]}
              value={body}
              onChangeText={setBody}
              placeholder={SUPPORT_NEW_TICKET_BODY_PLACEHOLDER}
              placeholderTextColor={grayColor}
              multiline
              textAlignVertical="top"
              editable={!loading}
              blurOnSubmit
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            {error ? <Text style={[styles.errorText, style.fontWeightThin]}>{error}</Text> : null}
          </ScrollView>

          <View style={[styles.actions, flexDirectionRow]}>
            <TouchableOpacity
              style={[styles.cancelBtn, alignJustifyCenter]}
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.85}>
              <Text style={[styles.cancelText, style.fontWeightMedium]}>{CONFIRM_CANCEL}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, alignJustifyCenter]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator size="small" color={whiteColor} />
              ) : (
                <Text style={[styles.submitText, style.fontWeightMedium]}>{SUPPORT_NEW_TICKET_SUBMIT}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default SupportNewTicketModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: wp(5),
  },
  backdrop: { ...StyleSheet.absoluteFillObject },
  card: {
    width: '100%',
    maxHeight: hp(80),
    backgroundColor: whiteColor,
    borderRadius: 16,
    paddingHorizontal: spacings.xLarge,
    paddingTop: spacings.xLarge,
    paddingBottom: spacings.large,
  },
  header: { marginBottom: spacings.large },
  title: { fontSize: style.fontSizeMedium1x.fontSize, color: blackColor },
  label: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    letterSpacing: 0.4,
    marginBottom: spacings.small,
  },
  subjectInput: {
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    backgroundColor: inputBgColor,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.medium,
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginBottom: spacings.large,
  },
  bodyInput: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    backgroundColor: inputBgColor,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.medium,
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginBottom: spacings.normal,
  },
  errorText: {
    marginBottom: spacings.normal,
    fontSize: style.fontSizeSmall1x.fontSize,
    color: redColor,
  },
  actions: { gap: spacings.normal, marginTop: spacings.large },
  cancelBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: borderLightColor,
    backgroundColor: whiteColor,
  },
  cancelText: { fontSize: style.fontSizeNormal2x.fontSize, color: blackColor },
  submitBtn: { flex: 1.2, minHeight: 48, borderRadius: 10, backgroundColor: redColor },
  submitText: { fontSize: style.fontSizeNormal2x.fontSize, color: whiteColor },
});
