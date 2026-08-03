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
  Image,
  Alert,
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
  SUBMIT_WORK_MODAL as COPY,
  PHOTO_LIBRARY,
  TAKE_PHOTO,
} from '../../constans/Constants';
import { pickImageFromCamera, pickImagesFromGallery, pickDocuments } from '../../utils/filePicker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter, justifyContentSpaceBetween } =
  BaseStyle;

const MAX_PHOTOS = 5;

const SubmitWorkModal = ({ visible, booking, onClose, onSubmit, onSplitMilestones, loading = false }) => {
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setDescription('');
      setPhotos([]);
      setError('');
    }
  }, [visible, booking?.id]);

  const appendPhotos = files => {
    if (!files?.length) return;
    setPhotos(prev => {
      const remaining = MAX_PHOTOS - prev.length;
      if (remaining <= 0) {
        Alert.alert('', COPY.maxPhotos);
        return prev;
      }
      return [...prev, ...files.slice(0, remaining)];
    });
  };

  const openPhotoPicker = () => {
    if (loading) return;
    // Android's native Alert supports max 3 buttons — drop Close there (back /
    // tap-outside dismisses it); iOS keeps the Close button.
    const buttons = [
      { text: PHOTO_LIBRARY, onPress: async () => appendPhotos(await pickImagesFromGallery(true, MAX_PHOTOS - photos.length)) },
      { text: TAKE_PHOTO, onPress: async () => appendPhotos(await pickImageFromCamera()) },
      { text: 'Choose File', onPress: async () => appendPhotos(await pickDocuments(true)) },
    ];
    if (Platform.OS === 'ios') buttons.push({ text: 'Close', style: 'cancel' });
    Alert.alert(COPY.photosLabel, undefined, buttons);
  };

  const removePhoto = index => setPhotos(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = () => {
    if (loading) return;
    if (!description.trim()) {
      setError(COPY.descriptionRequired);
      return;
    }
    setError('');
    onSubmit?.({
      bookingId: booking?.id,
      description: description.trim(),
      photos,
    });
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
            <View style={styles.headerTextWrap}>
              <Text style={[styles.title, style.fontWeightMedium]}>{COPY.title}</Text>
              <Text style={[styles.subtitle, style.fontWeightThin]} numberOfLines={2}>
                {booking?.title || COPY.subtitle}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={loading} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="x" size={20} color={grayColor} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
            <Text style={[styles.label, style.fontWeightMedium]}>
              {COPY.descriptionLabel}
              <Text style={styles.requiredStar}> *</Text>
            </Text>
            <TextInput
              style={[styles.descriptionInput, style.fontWeightThin]}
              value={description}
              onChangeText={setDescription}
              placeholder={COPY.descriptionPlaceholder}
              placeholderTextColor={grayColor}
              multiline
              textAlignVertical="top"
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={Keyboard.dismiss}
              editable={!loading}
            />

            <Text style={[styles.label, style.fontWeightMedium]}>{COPY.photosLabel}</Text>
            <View style={[styles.photosRow, flexDirectionRow]}>
              {photos.map((file, index) => {
                const isImage = /^image\//i.test(String(file.type || '')) ||
                  /\.(png|jpe?g|gif|webp|heic)$/i.test(String(file.uri || file.name || ''));
                return (
                  <View key={`${file.uri}-${index}`} style={styles.photoWrap}>
                    {isImage ? (
                      <Image source={{ uri: file.uri }} style={styles.photo} />
                    ) : (
                      <View style={[styles.photo, styles.docBox, alignJustifyCenter]}>
                        <Icon name="file-text" size={22} color={grayColor} />
                        <Text style={styles.docName} numberOfLines={1}>{file.name || 'file'}</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.removePhotoBtn}
                      onPress={() => removePhoto(index)}
                      disabled={loading}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                      <Icon name="x" size={12} color={whiteColor} />
                    </TouchableOpacity>
                  </View>
                );
              })}
              {photos.length < MAX_PHOTOS ? (
                <TouchableOpacity
                  style={[styles.addPhotoBox, alignJustifyCenter]}
                  onPress={openPhotoPicker}
                  disabled={loading}
                  activeOpacity={0.85}>
                  <Icon name="camera" size={20} color={grayColor} />
                  <Text style={[styles.addPhotoText, style.fontWeightThin]}>{COPY.addPhoto}</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {error ? <Text style={[styles.errorText, style.fontWeightThin]}>{error}</Text> : null}
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

          {onSplitMilestones ? (
            <TouchableOpacity
              style={[styles.splitLink, alignJustifyCenter, flexDirectionRow]}
              onPress={onSplitMilestones}
              disabled={loading}
              activeOpacity={0.7}>
              <Icon name="flag" size={15} color={redColor} />
              <Text style={[styles.splitLinkText, style.fontWeightMedium]}>
                Split into milestones instead
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default SubmitWorkModal;

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
    maxHeight: hp(82),
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
  headerTextWrap: { flex: 1, minWidth: 0 },
  title: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
  },
  subtitle: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  label: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    letterSpacing: 0.4,
    marginBottom: spacings.small,
  },
  requiredStar: {
    color: redColor,
  },
  descriptionInput: {
    minHeight: 96,
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
  durationInput: {
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
  photosRow: {
    gap: spacings.normal,
    paddingVertical: spacings.small,
    flexWrap: 'wrap',
  },
  photoWrap: {
    position: 'relative',
  },
  photo: {
    width: wp(26),
    height: wp(26),
    borderRadius: 10,
    backgroundColor: inputBgColor,
  },
  docBox: { borderWidth: 1, borderColor: borderLightColor, padding: 4, gap: 2 },
  docName: { fontSize: 9, color: grayColor, textAlign: 'center' },
  removePhotoBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: redColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoBox: {
    width: wp(26),
    height: wp(26),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderStyle: 'dashed',
    backgroundColor: inputBgColor,
    gap: 4,
  },
  addPhotoText: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
  },
  errorText: {
    marginTop: spacings.small,
    marginBottom: spacings.normal,
    fontSize: style.fontSizeSmall1x.fontSize,
    color: redColor,
  },
  actions: {
    gap: spacings.normal,
    marginTop: spacings.large,
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
  splitLink: {
    marginTop: spacings.large,
    paddingTop: spacings.large,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: borderLightColor,
    gap: spacings.small,
  },
  splitLinkText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: redColor,
    textDecorationLine: 'underline',
  },
});
