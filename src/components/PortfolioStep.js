import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import CustomTextInput from './CustomTextInput';
import FormLabel from './FormLabel';
import UploadOptionsModal from './modal/UploadOptionsModal';
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
  ACCEPT_TERMS,
  ADD_MORE_FILES,
  CONFIRM_PASSWORD,
  LABEL_CONFIRM_PASSWORD,
  LABEL_PASSWORD,
  OPTIONAL,
  PASSWORD,
  PORTFOLIO,
  PORTFOLIO_LINK_PLACEHOLDER,
  PORTFOLIO_LINKS,
  PORTFOLIO_SUBTITLE,
  PORTFOLIO_UPLOAD,
  SET_PASSWORD,
  SET_PASSWORD_SUBTITLE,
  SMS_CONSENT,
  TERMS_AND_CONDITIONS,
  UPLOAD_FILES,
  UPLOAD_FILES_HINT,
} from '../constans/Constants';
import {
  filterWithinTotalLimit,
  formatFileSize,
  isImageFile,
  pickDocuments,
  pickImageFromCamera,
  pickImagesFromGallery,
} from '../utils/filePicker';
import { heightPercentageToDP as hp } from '../utils';

const { flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween, flexWrap } = BaseStyle;

const PortfolioStep = ({
  form,
  onChange,
  onAddLink,
  onRemoveLink,
  onRemoveFile,
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  passwordError,
  confirmPasswordError,
  acceptTerms,
  acceptSms,
  onToggleTerms,
  onToggleSms,
  termsError,
  existingUploadBytes = 0,
}) => {
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const setLink = value => onChange({ ...form, portfolioLink: value });
  const portfolioFiles = form.portfolioFiles || [];
  const imageFiles = portfolioFiles.filter(isImageFile);
  const otherFiles = portfolioFiles.filter(file => !isImageFile(file));

  const appendFiles = files => {
    if (!files.length) return;
    // Reserve space already used by resume (and any other prior uploads).
    const reserved = [{ size: existingUploadBytes }];
    const accepted = filterWithinTotalLimit([...reserved, ...portfolioFiles], files);
    if (!accepted.length) return;
    onChange({
      ...form,
      portfolioFiles: [...portfolioFiles, ...accepted],
    });
  };

  const handleUploadOption = async option => {
    if (option === 'gallery') appendFiles(await pickImagesFromGallery(true));
    if (option === 'camera') appendFiles(await pickImageFromCamera());
    if (option === 'files') appendFiles(await pickDocuments(true));
  };

  const hasFiles = portfolioFiles.length > 0;

  return (
    <View>
      <View style={[styles.sectionHeader, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
        <View style={[flexDirectionRow, alignItemsCenter, { gap: spacings.normal }]}>
          <Icon name="image" size={16} color={redColor} />
          <Text style={[styles.sectionTitle, style.fontWeightMedium]}>{PORTFOLIO}</Text>
        </View>
        <Text style={[styles.optional, style.fontWeightThin]}>{OPTIONAL}</Text>
      </View>

      <Text style={[styles.subtitle, style.fontWeightThin]}>{PORTFOLIO_SUBTITLE}</Text>

      <FormLabel label={PORTFOLIO_UPLOAD} />
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setShowUploadOptions(true)}
        style={[styles.uploadArea, hasFiles && styles.uploadAreaFilled]}>
        {!hasFiles ? (
          <>
            <View style={styles.uploadIconCircle}>
              <Icon name="upload-cloud" size={28} color="#5B9BD5" />
            </View>
            <Text style={[styles.uploadTitle, style.fontWeightMedium]}>{UPLOAD_FILES}</Text>
            <Text style={[styles.uploadHint, style.fontWeightThin]}>{UPLOAD_FILES_HINT}</Text>
          </>
        ) : (
          <View style={styles.previewContent}>
            {imageFiles.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageRow}>
                {imageFiles.map((file, index) => {
                  const fileIndex = portfolioFiles.indexOf(file);
                  return (
                    <View key={`${file.uri}-${index}`} style={styles.imagePreviewWrap}>
                      <Image source={{ uri: file.uri }} style={styles.imagePreview} />
                      <TouchableOpacity
                        style={styles.removeImageBtn}
                        onPress={() => onRemoveFile(fileIndex)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Icon name="x" size={12} color={whiteColor} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            ) : null}

            {otherFiles.length > 0 ? (
              <View style={styles.otherFilesWrap}>
                {otherFiles.map((file, index) => {
                  const fileIndex = portfolioFiles.indexOf(file);
                  return (
                    <View key={`${file.uri}-${index}`} style={[styles.fileChip, flexDirectionRow, alignItemsCenter]}>
                      <Icon name="file" size={14} color={redColor} />
                      <Text style={[styles.fileChipName, style.fontWeightThin]} numberOfLines={1}>
                        {file.name}
                      </Text>
                      <TouchableOpacity onPress={() => onRemoveFile(fileIndex)}>
                        <Icon name="x" size={14} color={grayColor} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ) : null}

            <View style={[styles.addMoreRow, flexDirectionRow, alignItemsCenter]}>
              <Icon name="plus-circle" size={16} color={redColor} />
              <Text style={[styles.addMoreText, style.fontWeightMedium]}>{ADD_MORE_FILES}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      <UploadOptionsModal
        visible={showUploadOptions}
        onClose={() => setShowUploadOptions(false)}
        onSelect={handleUploadOption}
      />

      <FormLabel label={PORTFOLIO_LINKS} />
      <View style={[styles.linkRow, flexDirectionRow]}>
        <CustomTextInput
          value={form.portfolioLink}
          onChangeText={setLink}
          placeholder={PORTFOLIO_LINK_PLACEHOLDER}
          leftIcon="link"
          keyboardType="url"
          style={styles.linkInput}
        />
        <TouchableOpacity activeOpacity={0.85} onPress={onAddLink} style={styles.addBtn}>
          <Icon name="plus" size={18} color={whiteColor} />
        </TouchableOpacity>
      </View>

      {form.portfolioLinks.length > 0 ? (
        <View style={styles.linksList}>
          {form.portfolioLinks.map((link, index) => (
            <View key={`${link}-${index}`} style={[styles.linkItem, flexDirectionRow, alignItemsCenter]}>
              <Icon name="link" size={14} color={grayColor} />
              <Text style={[styles.linkText, style.fontWeightThin]} numberOfLines={1}>
                {link}
              </Text>
              <TouchableOpacity onPress={() => onRemoveLink(index)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="x" size={16} color={grayColor} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.passwordSection}>
        <View style={[styles.passwordHeader, flexDirectionRow, alignItemsCenter]}>
          <Icon name="lock" size={16} color={redColor} />
          <Text style={[styles.sectionTitle, style.fontWeightMedium]}>{SET_PASSWORD}</Text>
        </View>
        <Text style={[styles.passwordSubtitle, style.fontWeightThin]}>{SET_PASSWORD_SUBTITLE}</Text>

        <CustomTextInput
          value={password}
          onChangeText={onPasswordChange}
          label={LABEL_PASSWORD}
          required
          placeholder={PASSWORD}
          leftIcon="lock"
          secureTextEntry
          error={passwordError}
          style={styles.passwordInput}
        />
        <CustomTextInput
          value={confirmPassword}
          onChangeText={onConfirmPasswordChange}
          label={LABEL_CONFIRM_PASSWORD}
          required
          placeholder={CONFIRM_PASSWORD}
          leftIcon="lock"
          secureTextEntry
          error={confirmPasswordError}
          style={styles.passwordInput}
        />
      </View>

      <TouchableOpacity style={[styles.checkboxRow, flexDirectionRow]} onPress={onToggleTerms}>
        <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
          {acceptTerms ? <Icon name="check" size={12} color={whiteColor} /> : null}
        </View>
        <Text style={[styles.checkboxText, style.fontWeightThin]}>
          {ACCEPT_TERMS} <Text style={styles.termsLinkText}>{TERMS_AND_CONDITIONS}</Text>
          <Text style={styles.required}> *</Text>
        </Text>
      </TouchableOpacity>
      {termsError ? <Text style={styles.termsError}>{termsError}</Text> : null}

      <TouchableOpacity style={[styles.checkboxRow, flexDirectionRow]} onPress={onToggleSms}>
        <View style={[styles.checkbox, acceptSms && styles.checkboxChecked]}>
          {acceptSms ? <Icon name="check" size={12} color={whiteColor} /> : null}
        </View>
        <Text style={[styles.checkboxText, style.fontWeightThin]}>{SMS_CONSENT}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PortfolioStep;

const styles = StyleSheet.create({
  sectionHeader: {
    marginBottom: spacings.normal,
  },
  sectionTitle: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
  },
  optional: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  subtitle: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginBottom: spacings.xLarge,
    lineHeight: 18,
  },
  uploadArea: {
    backgroundColor: inputBgColor,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: borderLightColor,
    borderStyle: 'dashed',
    paddingVertical: hp(4),
    paddingHorizontal: spacings.large,
    alignItems: 'center',
    marginBottom: hp(2),
    minHeight: hp(18),
    justifyContent: 'center',
  },
  uploadAreaFilled: {
    paddingVertical: spacings.large,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  uploadIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F4FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacings.large,
  },
  uploadTitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginBottom: spacings.xsmall,
    textAlign: 'center',
  },
  uploadHint: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    textAlign: 'center',
  },
  previewContent: {
    width: '100%',
    gap: spacings.large,
  },
  imageRow: {
    gap: spacings.normal,
    paddingVertical: spacings.xsmall,
  },
  imagePreviewWrap: {
    position: 'relative',
  },
  imagePreview: {
    width: hp(12),
    height: hp(12),
    borderRadius: 10,
    backgroundColor: '#E8E8ED',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otherFilesWrap: {
    gap: spacings.normal,
  },
  fileChip: {
    backgroundColor: whiteColor,
    borderRadius: 8,
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.normal,
    gap: spacings.normal,
  },
  fileChipName: {
    flex: 1,
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
  },
  addMoreRow: {
    justifyContent: 'center',
    gap: spacings.normal,
    paddingTop: spacings.xsmall,
  },
  addMoreText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: redColor,
  },
  linkRow: {
    gap: spacings.normal,
    marginBottom: spacings.large,
    alignItems: 'flex-end',
  },
  linkInput: {
    flex: 1,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: redColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linksList: {
    gap: spacings.normal,
    marginBottom: spacings.large,
  },
  linkItem: {
    backgroundColor: lightPink,
    borderRadius: 8,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.normal,
    gap: spacings.normal,
  },
  linkText: {
    flex: 1,
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
  },
  passwordSection: {
    marginTop: spacings.normal,
    marginBottom: spacings.xLarge,
    paddingTop: spacings.xLarge,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: borderLightColor,
  },
  passwordHeader: {
    gap: spacings.normal,
    marginBottom: spacings.xsmall,
  },
  passwordSubtitle: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginBottom: spacings.large,
    lineHeight: 18,
  },
  passwordInput: {
    marginBottom: hp(1.2),
  },
  checkboxRow: {
    alignItems: 'flex-start',
    marginBottom: hp(1.2),
    gap: spacings.normal,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: grayColor,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: redColor,
    borderColor: redColor,
  },
  checkboxText: {
    flex: 1,
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    lineHeight: 18,
  },
  termsLinkText: {
    color: redColor,
  },
  required: {
    color: redColor,
  },
  termsError: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
    marginBottom: hp(1),
    marginLeft: spacings.xsmall,
  },
});
