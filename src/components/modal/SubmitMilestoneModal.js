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
import { PHOTO_LIBRARY, TAKE_PHOTO } from '../../constans/Constants';
import { pickImageFromCamera, pickImagesFromGallery, pickDocuments } from '../../utils/filePicker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter, justifyContentSpaceBetween } =
  BaseStyle;

const MAX_FILES = 5;

/**
 * Seller submits a single milestone for review — a message for the buyer plus
 * optional attachments. No backend endpoint exists yet, so onSubmit just hands
 * the collected data back to the caller (console.log / local state for now).
 */
const SubmitMilestoneModal = ({ visible, milestone, onClose, onSubmit, loading = false }) => {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (visible) {
      setMessage('');
      setFiles([]);
    }
  }, [visible, milestone?.id]);

  const appendFiles = picked => {
    if (!picked?.length) return;
    setFiles(prev => {
      const remaining = MAX_FILES - prev.length;
      if (remaining <= 0) return prev;
      return [...prev, ...picked.slice(0, remaining)];
    });
  };

  const openPicker = () => {
    if (loading) return;
    // Android's native Alert supports max 3 buttons — drop Cancel there (back /
    // tap-outside dismisses it); iOS keeps the Cancel button.
    const buttons = [
      { text: PHOTO_LIBRARY, onPress: async () => appendFiles(await pickImagesFromGallery(true)) },
      { text: TAKE_PHOTO, onPress: async () => appendFiles(await pickImageFromCamera()) },
      { text: 'Choose File', onPress: async () => appendFiles(await pickDocuments(true)) },
    ];
    if (Platform.OS === 'ios') buttons.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert('Attach files', undefined, buttons);
  };

  const removeFile = index => setFiles(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = () => {
    if (loading) return;
    onSubmit?.({ milestoneId: milestone?.id, message: message.trim(), files });
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
                <Text style={[styles.title, style.fontWeightMedium]}>Submit Milestone</Text>
                {milestone?.title ? (
                  <Text style={[styles.subtitle, style.fontWeightThin]} numberOfLines={1}>
                    {milestone.title}
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity onPress={onClose} disabled={loading} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="x" size={20} color={grayColor} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag">
              <Text style={[styles.label, style.fontWeightMedium]}>Message for the buyer</Text>
              <TextInput
                style={[styles.messageInput, style.fontWeightThin]}
                value={message}
                onChangeText={setMessage}
                placeholder="Describe what you delivered..."
                placeholderTextColor={grayColor}
                multiline
                textAlignVertical="top"
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={() => Keyboard.dismiss()}
                editable={!loading}
              />

              <Text style={[styles.label, style.fontWeightMedium]}>Attach files (optional)</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filesRow}
                keyboardShouldPersistTaps="handled">
                {files.map((file, index) => {
                  const isImage = /^image\//i.test(String(file.type || '')) ||
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
                        style={styles.removeFileBtn}
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
              </ScrollView>
            </ScrollView>

            <TouchableOpacity
              style={[styles.submitBtn, alignJustifyCenter]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator size="small" color={whiteColor} />
              ) : (
                <Text style={[styles.submitText, style.fontWeightMedium]}>Submit for Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default SubmitMilestoneModal;

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
  headerTextWrap: { flex: 1, minWidth: 0 },
  title: { fontSize: style.fontSizeMedium1x.fontSize, color: blackColor },
  subtitle: { fontSize: style.fontSizeSmall1x.fontSize, color: grayColor, marginTop: 2 },
  label: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    letterSpacing: 0.4,
    marginBottom: spacings.small,
  },
  messageInput: {
    minHeight: 90,
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
  filesRow: { gap: spacings.normal, paddingVertical: spacings.small },
  fileWrap: { position: 'relative' },
  file: { width: wp(18), height: wp(18), borderRadius: 10, backgroundColor: inputBgColor },
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFileBox: {
    width: wp(18),
    height: wp(18),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderStyle: 'dashed',
    backgroundColor: inputBgColor,
    gap: 4,
  },
  addFileText: { fontSize: style.fontSizeExtraSmall.fontSize, color: grayColor },
  submitBtn: {
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: redColor,
    marginTop: spacings.large,
  },
  submitText: { fontSize: style.fontSizeNormal2x.fontSize, color: whiteColor },
});
