import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import CustomTextInput from './CustomTextInput';
import FormLabel from './FormLabel';
import CustomDropdown from './CustomDropdown';
import { BaseStyle } from '../constans/Style';
import {
  blackColor,
  borderLightColor,
  grayColor,
  inputBgColor,
  lightPink,
  redColor,
} from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import { getCountryNames, getDefaultStateForCountry, getStateNamesForCountry } from '../utils/locationData';
import {
  BIO,
  BIO_PLACEHOLDER,
  CATEGORY,
  CATEGORY_OPTIONS,
  CITY_PLACEHOLDER,
  COUNTRY,
  DATE_OF_BIRTH,
  DOB_PLACEHOLDER,
  GENDER,
  GENDER_OPTIONS,
  LABEL_CITY,
  LABEL_ZIP_CODE,
  PRICE_RANGE,
  PRICE_RANGE_OPTIONS,
  PROFILE_DETAILS,
  RESPONSE_TIME,
  RESPONSE_TIME_OPTIONS,
  RESUME_CV,
  SKILL_TAGS,
  STATE,
  TAGS_SKILLS,
  UPLOAD_RESUME,
  ZIP_PLACEHOLDER,
} from '../constans/Constants';
import { formatFileSize, showResumePicker } from '../utils/filePicker';
import { heightPercentageToDP as hp } from '../utils';

const { flexDirectionRow, flexWrap, alignItemsCenter, alignItemsFlexStart } = BaseStyle;

const ProfileDetailsStep = ({ form, onChange, onToggleTag }) => {
  const setField = (field, value) => onChange({ ...form, [field]: value });
  const stateOptions = useMemo(() => getStateNamesForCountry(form.country), [form.country]);
  const countryOptions = useMemo(() => getCountryNames(), []);
  const hasStateDropdown = stateOptions.length > 0;

  const handleCountryChange = country => {
    onChange({
      ...form,
      country,
      state: getDefaultStateForCountry(country),
    });
  };

  const handleResumePick = () => {
    showResumePicker(file => {
      if (file) setField('resumeFile', file);
    });
  };

  return (
    <View>
      <View style={[styles.sectionHeader, flexDirectionRow, alignItemsCenter]}>
        <Icon name="credit-card" size={16} color={redColor} />
        <Text style={[styles.sectionTitle, style.fontWeightMedium]}>{PROFILE_DETAILS}</Text>
      </View>

      <View style={[styles.gridRow, flexDirectionRow]}>
        <CustomDropdown
          label={PRICE_RANGE}
          required
          value={form.priceRange}
          options={PRICE_RANGE_OPTIONS}
          onSelect={val => setField('priceRange', val)}
        />
        <CustomTextInput
          value={form.dateOfBirth}
          onChangeText={val => setField('dateOfBirth', val)}
          label={DATE_OF_BIRTH}
          placeholder={DOB_PLACEHOLDER}
          leftIcon="calendar"
          style={styles.halfInput}
        />
      </View>

      <View style={[styles.gridRow, flexDirectionRow]}>
        <CustomDropdown
          label={COUNTRY}
          required
          value={form.country}
          options={countryOptions}
          searchable
          onSelect={handleCountryChange}
        />
        {hasStateDropdown ? (
          <CustomDropdown
            label={STATE}
            required
            value={form.state}
            options={stateOptions}
            searchable
            onSelect={val => setField('state', val)}
          />
        ) : (
          <CustomTextInput
            value={form.state}
            onChangeText={val => setField('state', val)}
            label={STATE}
            required
            placeholder={STATE}
            leftIcon="map"
            style={styles.halfInput}
          />
        )}
      </View>

      <View style={[styles.gridRow, flexDirectionRow]}>
        <CustomTextInput
          value={form.city}
          onChangeText={val => setField('city', val)}
          label={LABEL_CITY}
          placeholder={CITY_PLACEHOLDER}
          leftIcon="map-pin"
          style={styles.halfInput}
        />
        <CustomTextInput
          value={form.zipCode}
          onChangeText={val => setField('zipCode', val)}
          label={LABEL_ZIP_CODE}
          placeholder={ZIP_PLACEHOLDER}
          leftIcon="hash"
          keyboardType="number-pad"
          style={styles.halfInput}
        />
      </View>

      <View style={[styles.gridRow, flexDirectionRow]}>
        <CustomDropdown
          label={GENDER}
          value={form.gender}
          options={GENDER_OPTIONS}
          onSelect={val => setField('gender', val)}
        />
        <CustomDropdown
          label={CATEGORY}
          required
          value={form.category}
          options={CATEGORY_OPTIONS}
          onSelect={val => setField('category', val)}
        />
      </View>

      <FormLabel label={TAGS_SKILLS} />
      <View style={[styles.tagsBox, flexDirectionRow, flexWrap]}>
        {SKILL_TAGS.map(tag => {
          const isSelected = form.tags.includes(tag);
          return (
            <TouchableOpacity
              key={tag}
              activeOpacity={0.85}
              onPress={() => onToggleTag(tag)}
              style={[styles.tag, isSelected && styles.tagSelected]}>
              <Text style={[styles.tagText, style.fontWeightThin, isSelected && styles.tagTextSelected]}>
                {tag}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <CustomTextInput
        value={form.bio}
        onChangeText={val => setField('bio', val)}
        label={BIO}
        placeholder={BIO_PLACEHOLDER}
        style={styles.bioInput}
        inputStyle={styles.bioTextInput}
      />

      <View style={[styles.bottomRow, flexDirectionRow, alignItemsFlexStart]}>
        <View style={styles.halfInput}>
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
                  <Text style={[styles.fileSize, style.fontWeightThin]}>
                    {formatFileSize(form.resumeFile.size)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setField('resumeFile', null)}
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
  tagsBox: {
    backgroundColor: inputBgColor,
    borderRadius: 12,
    padding: spacings.large,
    gap: spacings.normal,
    marginBottom: hp(1.5),
  },
  tag: {
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.normal,
    borderRadius: 20,
    backgroundColor: '#E8E8ED',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tagSelected: {
    backgroundColor: lightPink,
    borderColor: redColor,
  },
  tagText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  tagTextSelected: {
    color: redColor,
  },
  bioInput: {
    marginBottom: hp(1.5),
  },
  bioTextInput: {
    minHeight: hp(10),
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
