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
import {
  SELLER_PLACE_BID_MODAL,
  BID_ANSWERS_TITLE,
  BID_ANSWER_PLACEHOLDER,
  ERROR_BID_ANSWERS_REQUIRED,
} from '../../constans/Constants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';
import RichTextEditor from '../RichTextEditor';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter, justifyContentSpaceBetween } =
  BaseStyle;

const FieldLabel = ({ icon, iconColor, label }) => (
  <View style={[styles.labelRow, flexDirectionRow, alignItemsCenter]}>
    <Icon name={icon} size={14} color={iconColor} />
    <Text style={[styles.fieldLabel, style.fontWeightMedium]}>{label}</Text>
  </View>
);

// Buyer's screening questions ride on the job; every one must be answered.
const extractQuestions = job => {
  const list = job?.questions ?? job?.raw?.questions ?? job?.screening_questions ?? [];
  if (!Array.isArray(list)) return [];
  return list.map(q => (typeof q === 'string' ? q : q?.question || q?.text || '')).filter(Boolean);
};

const PlaceBidModal = ({
  visible,
  job,
  loading = false,
  error = '',
  onClose,
  onSubmit,
}) => {
  const questions = extractQuestions(job);
  const [amount, setAmount] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [proposal, setProposal] = useState('');
  const [answers, setAnswers] = useState([]);
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    if (visible) {
      setAmount('');
      setDeliveryDays('');
      setProposal('');
      setAnswers(questions.map(() => ''));
      setFieldError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, job?.id, questions.length]);

  const handleSubmit = () => {
    const amountNum = Number(amount);
    const daysNum = Number(deliveryDays);

    if (!amount.trim() || Number.isNaN(amountNum) || amountNum <= 0) {
      setFieldError(SELLER_PLACE_BID_MODAL.amountRequired);
      return;
    }
    if (!deliveryDays.trim() || Number.isNaN(daysNum) || daysNum <= 0 || !Number.isInteger(daysNum)) {
      setFieldError(SELLER_PLACE_BID_MODAL.deliveryRequired);
      return;
    }
    if (!proposal.trim()) {
      setFieldError(SELLER_PLACE_BID_MODAL.proposalRequired);
      return;
    }

    // The API matches answers to questions by index, so all must be filled.
    if (questions.length && questions.some((_, i) => !String(answers[i] || '').trim())) {
      setFieldError(ERROR_BID_ANSWERS_REQUIRED);
      return;
    }

    setFieldError('');
    onSubmit?.({
      amount: amountNum,
      delivery_days: daysNum,
      proposal: proposal.trim(),
      answers: questions.length ? questions.map((_, i) => String(answers[i] || '').trim()) : [],
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
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.overlay, alignJustifyCenter]}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
          <View style={styles.card}>
            <View style={[styles.header, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
              <Text style={[styles.title, style.fontWeightBold]}>{SELLER_PLACE_BID_MODAL.title}</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="x" size={22} color={grayColor} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              keyboardShouldPersistTaps="handled">
              <View style={styles.jobSummary}>
                <Text style={[styles.jobLabel, style.fontWeightMedium]}>
                  {SELLER_PLACE_BID_MODAL.jobLabel}
                </Text>
                <Text style={[styles.jobTitle, style.fontWeightMedium]} numberOfLines={2}>
                  {job?.title || '—'}
                </Text>
                <Text style={[styles.jobBudget, style.fontWeightMedium]}>
                  {job?.budget || '—'} {SELLER_PLACE_BID_MODAL.budgetSuffix}
                </Text>
              </View>

              <View style={styles.fieldWrap}>
                <FieldLabel
                  icon="dollar-sign"
                  iconColor={greenColor}
                  label={SELLER_PLACE_BID_MODAL.amountLabel}
                />
                <TextInput
                  style={[styles.input, style.fontWeightThin]}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder={SELLER_PLACE_BID_MODAL.amountPlaceholder}
                  placeholderTextColor={grayColor}
                  keyboardType="numeric"
                  editable={!loading}
                />
              </View>

              <View style={styles.fieldWrap}>
                <FieldLabel
                  icon="calendar"
                  iconColor={blueColor}
                  label={SELLER_PLACE_BID_MODAL.deliveryLabel}
                />
                <TextInput
                  style={[styles.input, style.fontWeightThin]}
                  value={deliveryDays}
                  onChangeText={setDeliveryDays}
                  placeholder={SELLER_PLACE_BID_MODAL.deliveryPlaceholder}
                  placeholderTextColor={grayColor}
                  keyboardType="number-pad"
                  editable={!loading}
                />
              </View>

              <View style={styles.fieldWrap}>
                <FieldLabel
                  icon="edit-2"
                  iconColor={redColor}
                  label={SELLER_PLACE_BID_MODAL.proposalLabel}
                />
                <RichTextEditor
                  value={proposal}
                  onChange={setProposal}
                  placeholder={SELLER_PLACE_BID_MODAL.proposalPlaceholder}
                  disabled={loading}
                />
              </View>

              {questions.length ? (
                <View style={styles.questionsWrap}>
                  <FieldLabel icon="help-circle" iconColor={blueColor} label={BID_ANSWERS_TITLE} />
                  {questions.map((question, index) => (
                    <View key={`q-${index}`} style={styles.questionBlock}>
                      <Text style={[styles.questionText, style.fontWeightMedium]}>
                        {index + 1}. {question}
                      </Text>
                      <TextInput
                        style={[styles.input, styles.answerInput, style.fontWeightThin]}
                        value={answers[index] || ''}
                        onChangeText={value => {
                          setAnswers(prev => {
                            const next = [...prev];
                            next[index] = value;
                            return next;
                          });
                          if (fieldError) setFieldError('');
                        }}
                        placeholder={BID_ANSWER_PLACEHOLDER}
                        placeholderTextColor={grayColor}
                        multiline
                        editable={!loading}
                      />
                    </View>
                  ))}
                </View>
              ) : null}

              <View style={[styles.connectsBanner, flexDirectionRow, alignItemsCenter]}>
                <Icon name="zap" size={14} color="#B45309" />
                <Text style={[styles.connectsText, style.fontWeightThin]}>
                  {SELLER_PLACE_BID_MODAL.connectsInfo}
                </Text>
              </View>

              {fieldError || error ? (
                <View style={[styles.errorBanner, flexDirectionRow, alignItemsCenter]}>
                  <Icon name="alert-circle" size={14} color={redColor} />
                  <Text style={[styles.errorText, style.fontWeightThin]}>
                    {fieldError || error}
                  </Text>
                </View>
              ) : null}

              <View style={[styles.btnRow, flexDirectionRow]}>
                <TouchableOpacity
                  style={[styles.cancelBtn, alignJustifyCenter]}
                  onPress={onClose}
                  disabled={loading}>
                  <Text style={[styles.cancelBtnText, style.fontWeightMedium]}>
                    {SELLER_PLACE_BID_MODAL.cancel}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, alignJustifyCenter]}
                  onPress={handleSubmit}
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator size="small" color={whiteColor} />
                  ) : (
                    <Text style={[styles.submitBtnText, style.fontWeightMedium]}>
                      {SELLER_PLACE_BID_MODAL.submit}
                    </Text>
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

export default PlaceBidModal;

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
    marginBottom: 4,
  },
  jobBudget: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: redColor,
  },
  questionsWrap: { marginBottom: spacings.large },
  questionBlock: { marginBottom: spacings.normal },
  questionText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
    marginBottom: spacings.small,
  },
  answerInput: { minHeight: hp(7), textAlignVertical: 'top', paddingTop: spacings.medium },
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
  proposalInput: {
    minHeight: hp(12),
    paddingTop: spacings.medium,
  },
  connectsBanner: {
    gap: spacings.small,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.medium,
    marginBottom: spacings.large,
  },
  connectsText: {
    flex: 1,
    fontSize: style.fontSizeSmall1x.fontSize,
    color: '#92400E',
    lineHeight: 18,
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
