import { Alert, Platform, PermissionsAndroid } from 'react-native';
import { pick, keepLocalCopy, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

/** Per-file limit — nginx body limit is typically much lower than 20MB. */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
/** Combined resume + portfolio limit for register/upload requests. */
export const MAX_TOTAL_UPLOAD_BYTES = 8 * 1024 * 1024;

const IMAGE_PICKER_OPTIONS = {
  quality: 0.5,
  maxWidth: 1280,
  maxHeight: 1280,
};

const requestAndroidCameraPermission = async () => {
  if (Platform.OS !== 'android') return true;

  const alreadyGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
  if (alreadyGranted) return true;

  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
    title: 'Camera Permission',
    message: 'MatchCreators needs camera access to take a profile photo.',
    buttonPositive: 'Allow',
    buttonNegative: 'Deny',
  });

  return result === PermissionsAndroid.RESULTS.GRANTED;
};

const mapAsset = asset => ({
  uri: asset.uri,
  name: asset.fileName || asset.name || `file_${Date.now()}`,
  type: asset.type || 'application/octet-stream',
  size: asset.fileSize || asset.size || 0,
});

const mapDocument = doc => ({
  uri: doc.uri,
  name: doc.name || `file_${Date.now()}`,
  type: doc.type || 'application/octet-stream',
  size: doc.size || 0,
});

const filterBySize = files => files.filter(file => file.size <= MAX_FILE_SIZE_BYTES);

// iOS puts picked documents in a tmp "Inbox" folder that can be purged before
// the upload request reads them, so keep a stable local copy first.
const copyDocumentsLocally = async docs => {
  if (!docs.length) return docs;

  try {
    const copies = await keepLocalCopy({
      files: docs.map(doc => ({ uri: doc.uri, fileName: doc.name })),
      destination: 'cachesDirectory',
    });

    return docs.map(doc => {
      const copy = copies.find(item => item.sourceUri === doc.uri);
      return copy?.status === 'success' ? { ...doc, uri: copy.localUri } : doc;
    });
  } catch (error) {
    console.warn('[filePicker] keepLocalCopy failed, using original uris:', error);
    return docs;
  }
};

const showOversizedAlert = (total, valid) => {
  if (total > valid) {
    Alert.alert('File too large', 'Some files were skipped. Maximum file size is 5MB each.');
  }
};

export const getFilesTotalSize = (files = []) =>
  files.reduce((sum, file) => sum + (Number(file?.size) || 0), 0);

/**
 * Keep newly picked files within total upload budget (existing + new).
 * Returns accepted new files only.
 */
export const filterWithinTotalLimit = (existingFiles = [], newFiles = [], maxTotal = MAX_TOTAL_UPLOAD_BYTES) => {
  const existingTotal = getFilesTotalSize(existingFiles);
  const accepted = [];
  let running = existingTotal;

  for (const file of newFiles) {
    const size = Number(file?.size) || 0;
    if (running + size > maxTotal) continue;
    accepted.push(file);
    running += size;
  }

  if (accepted.length < newFiles.length) {
    Alert.alert(
      'Upload limit',
      'Total upload size cannot exceed 8MB. Some files were skipped. Please use smaller files.',
    );
  }

  return accepted;
};

export const pickImagesFromGallery = async (allowMultiple = true) => {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: allowMultiple ? 0 : 1,
    ...IMAGE_PICKER_OPTIONS,
  });

  if (result.didCancel || !result.assets?.length) return [];

  const files = filterBySize(result.assets.map(mapAsset));
  showOversizedAlert(result.assets.length, files.length);
  return files;
};

export const pickImageFromCamera = async () => {
  const hasPermission = await requestAndroidCameraPermission();
  if (!hasPermission) {
    Alert.alert('Permission required', 'Please allow camera access to take a photo.');
    return [];
  }

  const result = await launchCamera({
    mediaType: 'photo',
    cameraType: 'front',
    saveToPhotos: false,
    includeBase64: false,
    ...IMAGE_PICKER_OPTIONS,
  });

  if (result.errorCode) {
    Alert.alert(
      'Camera unavailable',
      result.errorMessage || 'Unable to open camera. Please try again or pick from gallery.',
    );
    return [];
  }

  if (result.didCancel || !result.assets?.length) return [];

  const files = filterBySize(result.assets.map(mapAsset));
  showOversizedAlert(result.assets.length, files.length);
  return files;
};

export const pickDocuments = async (allowMultiple = true) => {
  try {
    const results = await pick({
      type: [types.images, types.pdf, types.doc, types.docx],
      allowMultiSelection: allowMultiple,
      presentationStyle: 'fullScreen',
    });

    const docs = (Array.isArray(results) ? results : [results]).map(mapDocument);
    const files = await copyDocumentsLocally(filterBySize(docs));
    showOversizedAlert(docs.length, files.length);
    return files;
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
      return [];
    }
    throw error;
  }
};

export const pickResumeDocument = async () => {
  try {
    const results = await pick({
      type: [types.pdf, types.doc, types.docx],
      allowMultiSelection: false,
      presentationStyle: 'fullScreen',
    });

    const file = mapDocument(Array.isArray(results) ? results[0] : results);
    if (file.size > MAX_FILE_SIZE_BYTES) {
      Alert.alert('File too large', 'Maximum file size is 5MB.');
      return null;
    }
    const [copiedFile] = await copyDocumentsLocally([file]);
    return copiedFile;
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
      return null;
    }
    throw error;
  }
};

export const showPortfolioPicker = onFilesPicked => {
  const options = [
    { text: 'Photo Library', onPress: async () => onFilesPicked(await pickImagesFromGallery(true)) },
    { text: 'Take Photo', onPress: async () => onFilesPicked(await pickImageFromCamera()) },
    { text: 'Browse Files', onPress: async () => onFilesPicked(await pickDocuments(true)) },
    { text: 'Cancel', style: 'cancel' },
  ];

  if (Platform.OS === 'ios') {
    Alert.alert('Upload files', 'Choose how you want to add files', options);
  } else {
    Alert.alert('Upload files', 'Choose how you want to add files', options.slice(0, 3).concat(options[3]));
  }
};

export const showResumePicker = onFilePicked => {
  Alert.alert('Upload Resume', 'Choose how you want to upload your resume', [
    { text: 'Browse PDF/DOC', onPress: async () => onFilePicked(await pickResumeDocument()) },
    { text: 'Cancel', style: 'cancel' },
  ]);
};

export const formatFileSize = bytes => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const isImageFile = file => (file?.type || '').startsWith('image/');
