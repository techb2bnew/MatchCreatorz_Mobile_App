import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Feather';
import CustomTextInput from './CustomTextInput';
import RichTextEditor from './RichTextEditor';
import FormLabel from './FormLabel';
import CustomDropdown from './CustomDropdown';
import AddressAutocompleteInput from './AddressAutocompleteInput';
import { BaseStyle } from '../constans/Style';
import {
  blackColor,
  borderLightColor,
  grayColor,
  inputBgColor,
  lightPink,
  redColor,
  whiteColor,
} from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import {
  BIO,
  BIO_PLACEHOLDER,
  CATEGORY,
  CATEGORY_OPTIONS,
  LABEL_ADDRESS,
  DATE_OF_BIRTH,
  DOB_PLACEHOLDER,
  GENDER,
  GENDER_OPTIONS,
  HOURLY_RATE_PLACEHOLDER,
  LABEL_HOURLY_RATE,
  POST_JOB_PLACEHOLDERS,
  PROFILE_DETAILS,
  RESPONSE_TIME,
  RESPONSE_TIME_OPTIONS,
  RESUME_CV,
  TAGS_SKILLS,
  UPLOAD_RESUME,
} from '../constans/Constants';
import { formatFileSize, showResumePicker } from '../utils/filePicker';
import { heightPercentageToDP as hp } from '../utils';

const {
  flexDirectionRow,
  alignItemsCenter,
  alignItemsFlexStart,
  justifyContentSpaceBetween,
} = BaseStyle;

const getTodayStart = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const getMinDobDate = () => {
  const date = getTodayStart();
  date.setFullYear(date.getFullYear() - 100);
  return date;
};

const getDefaultDobDate = () => {
  const date = getTodayStart();
  date.setFullYear(date.getFullYear() - 18);
  return date;
};

const formatDobDisplay = date => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const parseDobDisplay = value => {
  if (!value) return null;
  const match = String(value)
    .trim()
    .match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const month = Number(match[1]) - 1;
  const day = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month, day);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
};

const ProfileDetailsStep = ({ form, onChange, errors = {}, variant = 'signup' }) => {
  const isSellerProfile = variant === 'sellerProfile';
  const setField = (field, value) => onChange({ ...form, [field]: value });
  const [showDobPicker, setShowDobPicker] = useState(false);
  const selectedDob = parseDobDisplay(form.dateOfBirth) || getDefaultDobDate();

  const handleResumePick = () => {
    showResumePicker(file => {
      if (file) {
        onChange({
          ...form,
          resumeFile: file,
          resumeRemoved: false,
          resumeUrl: null,
        });
      }
    });
  };

  const handleResumeRemove = () => {
    onChange({
      ...form,
      resumeFile: null,
      resumeUrl: null,
      resumeRemoved: Boolean(form.resumeFile || form.resumeUrl),
    });
  };

  const handleDobChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDobPicker(false);
      if (event?.type === 'dismissed') return;
    }

    if (!selectedDate) return;
    const today = getTodayStart();
    const minDate = getMinDobDate();
    let nextDate = selectedDate;
    if (nextDate > today) nextDate = today;
    if (nextDate < minDate) nextDate = minDate;
    setField('dateOfBirth', formatDobDisplay(nextDate));
  };

  const renderResumeField = () => (
    <View style={isSellerProfile ? styles.fieldGap : styles.halfInput}>
      <FormLabel label={RESUME_CV} />
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleResumePick}
        style={[styles.uploadBox, form.resumeFile && styles.uploadBoxFilled]}>
        {form.resumeFile ? (
          <View style={[styles.filePreview, flexDirectionRow, alignItemsCenter]}>
            <View style={styles.fileIconWrap}>
              <Icon name="file-text" size={16} color={redColor} />
            </View>
            <View style={styles.fileInfo}>
              <Text style={[styles.fileName, style.fontWeightMedium]} numberOfLines={1}>
                {form.resumeFile.name}
              </Text>
              {form.resumeFile.size ? (
                <Text style={[styles.fileSize, style.fontWeightThin]}>
                  {formatFileSize(form.resumeFile.size)}
                </Text>
              ) : form.resumeFile.isRemote ? (
                <Text style={[styles.fileSize, style.fontWeightThin]}>Uploaded resume</Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={handleResumeRemove}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="x" size={16} color={grayColor} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.uploadEmpty, flexDirectionRow, alignItemsCenter]}>
            <Icon name="paperclip" size={16} color={grayColor} />
            <Text style={[styles.uploadText, style.fontWeightThin]} numberOfLines={1}>
              {UPLOAD_RESUME}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  if (isSellerProfile) {
    return (
      <View>
        <CustomTextInput
          value={form.hourlyRate}
          onChangeText={val => setField('hourlyRate', val.replace(/[^0-9.]/g, ''))}
          label={LABEL_HOURLY_RATE}
          required
          placeholder={HOURLY_RATE_PLACEHOLDER}
          leftIcon="dollar-sign"
          keyboardType="decimal-pad"
          error={errors.hourlyRate}
          style={styles.fieldGap}
        />

        <AddressAutocompleteInput
          label={LABEL_ADDRESS}
          required
          value={form.address}
          onChangeText={val => setField('address', val)}
          error={errors.address}
          style={styles.fieldGap}
        />

        <CustomTextInput
          value={form.skills || ''}
          onChangeText={val => setField('skills', val)}
          label={TAGS_SKILLS}
          required
          placeholder={POST_JOB_PLACEHOLDERS.skills}
          leftIcon="tag"
          error={errors.skills}
          style={styles.fieldGap}
        />

        <RichTextEditor
          label={BIO}
          value={form.bio}
          onChange={val => setField('bio', val)}
          placeholder={BIO_PLACEHOLDER}
        />

        {renderResumeField()}
      </View>
    );
  }

  return (
    <View>
      <View style={[styles.sectionHeader, flexDirectionRow, alignItemsCenter]}>
        <Icon name="credit-card" size={16} color={redColor} />
        <Text style={[styles.sectionTitle, style.fontWeightMedium]}>{PROFILE_DETAILS}</Text>
      </View>

      <View style={[styles.gridRow, flexDirectionRow]}>
        <CustomTextInput
          value={form.hourlyRate}
          onChangeText={val => setField('hourlyRate', val.replace(/[^0-9.]/g, ''))}
          label={LABEL_HOURLY_RATE}
          required
          placeholder={HOURLY_RATE_PLACEHOLDER}
          leftIcon="dollar-sign"
          keyboardType="decimal-pad"
          error={errors.hourlyRate}
          style={styles.halfInput}
        />
        <View style={styles.halfInput}>
          <FormLabel label={DATE_OF_BIRTH} />
          <TouchableOpacity
            style={[styles.dobField, flexDirectionRow, alignItemsCenter]}
            activeOpacity={0.8}
            onPress={() => setShowDobPicker(true)}>
            <Icon name="calendar" size={16} color={grayColor} />
            <Text
              style={[
                styles.dobText,
                style.fontWeightThin,
                !form.dateOfBirth && styles.dobPlaceholder,
              ]}>
              {form.dateOfBirth || DOB_PLACEHOLDER}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {Platform.OS === 'android' && showDobPicker ? (
        <DateTimePicker
          value={selectedDob}
          mode="date"
          display="default"
          maximumDate={getTodayStart()}
          minimumDate={getMinDobDate()}
          onChange={handleDobChange}
        />
      ) : null}

      {Platform.OS === 'ios' && showDobPicker ? (
        <Modal
          visible
          transparent
          animationType="slide"
          presentationStyle="overFullScreen"
          onRequestClose={() => setShowDobPicker(false)}>
          <View style={styles.dobModalOverlay}>
            <View style={styles.dobModalCard}>
              <View
                style={[
                  styles.dobModalHeader,
                  flexDirectionRow,
                  justifyContentSpaceBetween,
                  alignItemsCenter,
                ]}>
                <TouchableOpacity onPress={() => setShowDobPicker(false)}>
                  <Text style={[styles.dobModalAction, style.fontWeightMedium]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowDobPicker(false)}>
                  <Text
                    style={[styles.dobModalAction, styles.dobModalDone, style.fontWeightMedium]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dobPickerWrap}>
                <DateTimePicker
                  value={selectedDob}
                  mode="date"
                  display="inline"
                  maximumDate={getTodayStart()}
                  minimumDate={getMinDobDate()}
                  onChange={handleDobChange}
                  style={styles.dobIosPicker}
                  textColor={blackColor}
                  themeVariant="light"
                />
              </View>
            </View>
          </View>
        </Modal>
      ) : null}

      <AddressAutocompleteInput
        label={LABEL_ADDRESS}
        required
        value={form.address}
        onChangeText={val => setField('address', val)}
        error={errors.address}
        style={styles.fieldGap}
      />

      <View style={[styles.gridRow, flexDirectionRow]}>
        <CustomDropdown
          label={GENDER}
          value={form.gender}
          options={GENDER_OPTIONS}
          onSelect={val => setField('gender', val)}
        />
        <CustomDropdown
          label={CATEGORY}
          value={form.category}
          options={CATEGORY_OPTIONS}
          onSelect={val => setField('category', val)}
        />
      </View>

      <CustomTextInput
        value={form.skills || ''}
        onChangeText={val => setField('skills', val)}
        label={TAGS_SKILLS}
        required
        placeholder={POST_JOB_PLACEHOLDERS.skills}
        leftIcon="tag"
        error={errors.skills}
        style={styles.fieldGap}
      />

      <RichTextEditor
        label={BIO}
        value={form.bio}
        onChange={val => setField('bio', val)}
        placeholder={BIO_PLACEHOLDER}
      />

      <View style={[styles.bottomRow, flexDirectionRow, alignItemsFlexStart]}>
        {renderResumeField()}
        <CustomDropdown
          label={RESPONSE_TIME}
          value={form.responseTime}
          options={RESPONSE_TIME_OPTIONS}
          onSelect={val => setField('responseTime', val)}
          style={styles.halfInput}
        />
      </View>
    </View>
  );
};

export default ProfileDetailsStep;

const styles = StyleSheet.create({
  sectionHeader: {
    gap: spacings.normal,
    marginBottom: spacings.xLarge,
  },
  sectionTitle: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
  },
  gridRow: {
    gap: spacings.normal,
    marginBottom: hp(1.2),
  },
  bottomRow: {
    gap: spacings.normal,
    marginBottom: hp(1.2),
  },
  halfInput: {
    flex: 1,
    minWidth: '45%',
  },
  dobField: {
    backgroundColor: inputBgColor,
    borderRadius: 10,
    minHeight: hp(6),
    paddingHorizontal: spacings.large,
    gap: spacings.normal,
  },
  dobText: {
    flex: 1,
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  dobPlaceholder: {
    color: grayColor,
  },
  dobModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dobModalCard: {
    backgroundColor: whiteColor,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: spacings.large,
  },
  dobModalHeader: {
    paddingHorizontal: spacings.xLarge,
    paddingVertical: spacings.large,
  },
  dobModalAction: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: grayColor,
  },
  dobModalDone: {
    color: redColor,
  },
  dobPickerWrap: {
    width: '100%',
    height: hp(38),
    overflow: 'hidden',
  },
  dobIosPicker: {
    width: '100%',
    height: hp(38),
  },
  errorText: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
    marginBottom: hp(1.2),
    marginLeft: spacings.xsmall,
  },
  fieldGap: {
    marginBottom: hp(1.2),
  },
  bioInput: {
    marginBottom: hp(1.5),
  },
  bioTextInput: {
    minHeight: Platform.OS === 'ios' ? hp(8) : hp(10),
    height: Platform.OS === 'ios' ? hp(8) : undefined,
    textAlignVertical: 'top',
  },
  uploadBox: {
    backgroundColor: inputBgColor,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: borderLightColor,
    borderStyle: 'dashed',
    minHeight: hp(6),
    justifyContent: 'center',
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.normal,
  },
  uploadBoxFilled: {
    borderStyle: 'solid',
    borderColor: 'transparent',
  },
  uploadEmpty: {
    gap: spacings.normal,
    justifyContent: 'center',
  },
  uploadText: {
    flex: 1,
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  filePreview: {
    width: '100%',
    gap: spacings.normal,
  },
  fileIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: lightPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
  },
  fileSize: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    marginTop: 2,
  },
});
