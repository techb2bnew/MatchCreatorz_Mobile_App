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
  Image,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
import { PHOTO_LIBRARY, TAKE_PHOTO } from '../../constans/Constants';
import { pickImageFromCamera, pickImagesFromGallery, pickDocuments } from '../../utils/filePicker';
import { formatAppCurrency } from '../../utils/currency';
import { formatHours, formatWorkDate } from '../../utils/workEntries';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';
import { keyboardAvoidingBehavior, useKeyboardBottomInset } from '../../utils/keyboard';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter, justifyContentSpaceBetween } =
  BaseStyle;

const toApiDate = date => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

const MAX_FILES = 5;
// Hard cap per entry — nobody logs more than this in one go.
const MAX_HOURS = 160;

const todayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Seller logs one day of hourly work: date (max today), hours, optional
 * description. Rate is never entered — it comes from the contract and is only
 * shown so the seller can see the amount this entry will be worth.
 */
const LogWorkEntryModal = ({
  visible,
  hourlyRate = 0,
  weeklyLimit = null,
  weeklyUsed = 0,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const keyboardBottom = useKeyboardBottomInset(24);
  const [workDate, setWorkDate] = useState(todayStart());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setWorkDate(todayStart());
      setHours('');
      setDescription('');
      setFiles([]);
      setError('');
      setShowDatePicker(false);
    }
  }, [visible]);

  const hoursValue = Number(hours) || 0;
  const total = hoursValue * (Number(hourlyRate) || 0);
  const remaining = weeklyLimit == null ? null : Math.max(0, weeklyLimit - weeklyUsed);

  const handleDateChange = (event, selected) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (event?.type === 'dismissed' || !selected) return;
    const picked = selected > todayStart() ? todayStart() : selected;
    setWorkDate(picked);
  };

  const appendFiles = picked => {
    if (!picked?.length) return;
    setFiles(prev => {
      const slotsLeft = MAX_FILES - prev.length;
      if (slotsLeft <= 0) return prev;
      return [...prev, ...picked.slice(0, slotsLeft)];
    });
  };

  const openPicker = () => {
    if (loading) return;
    // Android's native Alert allows max 3 buttons — Cancel only on iOS there.
    const buttons = [
      {
        text: PHOTO_LIBRARY,
        onPress: async () => appendFiles(await pickImagesFromGallery(true, MAX_FILES - files.length)),
      },
      { text: TAKE_PHOTO, onPress: async () => appendFiles(await pickImageFromCamera()) },
      { text: 'Choose File', onPress: async () => appendFiles(await pickDocuments(true)) },
    ];
    if (Platform.OS === 'ios') buttons.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert('Attach files', undefined, buttons);
  };

  const removeFile = index => setFiles(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = () => {
    if (loading) return;
    if (!hoursValue || hoursValue <= 0) {
      setError('Enter the hours you worked.');
      return;
    }
    if (hoursValue > MAX_HOURS) {
      setError(`Hours cannot be more than ${MAX_HOURS}.`);
      return;
    }
    // Server is the authority on the weekly limit — this is just a nudge.
    if (remaining != null && hoursValue > remaining) {
      setError(
        `Only ${formatHours(remaining)} left in this week's ${formatHours(weeklyLimit)} limit.`,
      );
      return;
    }
    setError('');
    onSubmit?.({
      workDate: toApiDate(workDate),
      hours: hoursValue,
      description: description.trim(),
      files,
    });
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
              <Text style={[styles.title, style.fontWeightMedium]}>Log work</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="x" size={20} color={grayColor} />
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View>
                  <Text style={[styles.label, style.fontWeightMedium]}>WORK DATE</Text>
                  <TouchableOpacity
                    style={[styles.field, flexDirectionRow, alignItemsCenter]}
                    activeOpacity={0.8}
                    onPress={() => setShowDatePicker(true)}>
                    <Icon name="calendar" size={16} color={grayColor} />
                    <Text style={[styles.fieldText, style.fontWeightThin]}>
                      {formatWorkDate(workDate)}
                    </Text>
                  </TouchableOpacity>

                  {showDatePicker && Platform.OS === 'ios' ? (
                    <View style={styles.iosPickerWrap}>
                      <DateTimePicker
                        value={workDate}
                        mode="date"
                        display="inline"
                        maximumDate={todayStart()}
                        onChange={handleDateChange}
                        textColor={blackColor}
                        themeVariant="light"
                        style={styles.iosPicker}
                      />
                      <TouchableOpacity
                        style={styles.pickerDoneBtn}
                        onPress={() => setShowDatePicker(false)}>
                        <Text style={[styles.pickerDone, style.fontWeightMedium]}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  <Text style={[styles.label, style.fontWeightMedium]}>HOURS WORKED</Text>
                  <View style={[styles.field, flexDirectionRow, alignItemsCenter]}>
                    <Icon name="clock" size={16} color={grayColor} />
                    <TextInput
                      value={hours}
                      onChangeText={value => {
                        const cleaned = value.replace(/[^0-9.]/g, '');
                        // Block typing past the cap instead of failing on submit.
                        if ((Number(cleaned) || 0) > MAX_HOURS) return;
                        setHours(cleaned);
                        if (error) setError('');
                      }}
                      maxLength={6}
                      placeholder={`e.g. 5 (max ${MAX_HOURS})`}
                      placeholderTextColor={grayColor}
                      keyboardType="decimal-pad"
                      style={[styles.fieldInput, style.fontSizeNormal2x]}
                    />
                  </View>

                  {hourlyRate > 0 ? (
                    <View style={styles.previewBox}>
                      <Text style={[styles.previewText, style.fontWeightThin]}>
                        {formatHours(hoursValue)} × {formatAppCurrency(hourlyRate)}/hr ={' '}
                        <Text style={[styles.previewTotal, style.fontWeightMedium]}>
                          {formatAppCurrency(total)}
                        </Text>
                      </Text>
                      {weeklyLimit ? (
                        <Text style={[styles.previewHint, style.fontWeightThin]}>
                          {formatHours(weeklyUsed)} of {formatHours(weeklyLimit)} used this week
                        </Text>
                      ) : null}
                      <Text style={[styles.previewHint, style.fontWeightThin]}>
                        Paid only after the buyer approves.
                      </Text>
                    </View>
                  ) : null}

                  <Text style={[styles.label, style.fontWeightMedium]}>
                    DESCRIPTION <Text style={styles.optional}>(optional)</Text>
                  </Text>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="What did you work on?"
                    placeholderTextColor={grayColor}
                    multiline
                    returnKeyType="done"
                    blurOnSubmit
                    onSubmitEditing={() => Keyboard.dismiss()}
                    style={[styles.textArea, style.fontSizeNormal2x]}
                  />

                  <Text style={[styles.label, style.fontWeightMedium]}>
                    ATTACHMENTS <Text style={styles.optional}>(optional)</Text>
                  </Text>
                  <View style={[styles.filesRow, flexDirectionRow]}>
                    {files.map((file, index) => {
                      const isImage =
                        /^image\//i.test(String(file.type || '')) ||
                        /\.(png|jpe?g|gif|webp|heic)$/i.test(String(file.uri || file.name || ''));
                      return (
                        <View key={`${file.uri}-${index}`} style={styles.fileWrap}>
                          {isImage ? (
                            <Image source={{ uri: file.uri }} style={styles.file} />
                          ) : (
                            <View style={[styles.file, styles.docBox, alignJustifyCenter]}>
                              <Icon name="file-text" size={20} color={grayColor} />
                              <Text style={styles.docName} numberOfLines={1}>
                                {file.name || 'file'}
                              </Text>
                            </View>
                          )}
                          <TouchableOpacity
                            style={[styles.removeFileBtn, alignJustifyCenter]}
                            onPress={() => removeFile(index)}
                            disabled={loading}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                            <Icon name="x" size={12} color={whiteColor} />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                    {files.length < MAX_FILES ? (
                      <TouchableOpacity
                        style={[styles.addFileBox, alignJustifyCenter]}
                        onPress={openPicker}
                        disabled={loading}
                        activeOpacity={0.85}>
                        <Icon name="paperclip" size={18} color={grayColor} />
                        <Text style={[styles.addFileText, style.fontWeightThin]}>Add</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>

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
                        Submit for review
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>

      {showDatePicker && Platform.OS === 'android' ? (
        <DateTimePicker
          value={workDate}
          mode="date"
          display="default"
          maximumDate={todayStart()}
          onChange={handleDateChange}
        />
      ) : null}

    </Modal>
  );
};

export default LogWorkEntryModal;

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
  header: { marginBottom: spacings.large },
  title: { fontSize: style.fontSizeMedium1x.fontSize, color: blackColor },
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
    marginBottom: spacings.large,
  },
  fieldText: { flex: 1, fontSize: style.fontSizeNormal2x.fontSize, color: blackColor },
  fieldInput: { flex: 1, color: blackColor, padding: 0 },
  previewBox: {
    backgroundColor: '#F3F8F5',
    borderRadius: 10,
    padding: spacings.large,
    marginBottom: spacings.large,
    gap: 2,
  },
  previewText: { fontSize: style.fontSizeSmall1x.fontSize, color: blackColor },
  previewTotal: { fontSize: style.fontSizeNormal2x.fontSize, color: blackColor },
  previewHint: { fontSize: style.fontSizeExtraSmall.fontSize, color: grayColor },
  textArea: {
    backgroundColor: inputBgColor,
    borderRadius: 10,
    minHeight: hp(12),
    padding: spacings.large,
    color: blackColor,
    textAlignVertical: 'top',
    marginBottom: spacings.large,
  },
  filesRow: { gap: spacings.normal, flexWrap: 'wrap', marginBottom: spacings.large },
  fileWrap: { position: 'relative' },
  file: { width: wp(26), height: wp(26), borderRadius: 10, backgroundColor: inputBgColor },
  docBox: { borderWidth: 1, borderColor: borderLightColor, padding: 4, gap: 2 },
  docName: { fontSize: 9, color: grayColor, textAlign: 'center' },
  removeFileBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: redColor,
  },
  addFileBox: {
    width: wp(26),
    height: wp(26),
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: borderLightColor,
    backgroundColor: inputBgColor,
    gap: 2,
  },
  addFileText: { fontSize: style.fontSizeExtraSmall.fontSize, color: grayColor },
  errorText: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
    marginBottom: spacings.normal,
  },
  submitBtn: { minHeight: 48, borderRadius: 12, backgroundColor: redColor },
  submitText: { fontSize: style.fontSizeNormal2x.fontSize, color: whiteColor },
  iosPickerWrap: { marginBottom: spacings.large },
  iosPicker: { width: '100%', height: hp(38) },
  pickerDoneBtn: { alignSelf: 'flex-end', paddingVertical: spacings.small },
  pickerDone: { fontSize: style.fontSizeNormal2x.fontSize, color: redColor },
});
