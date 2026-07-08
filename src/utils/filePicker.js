import { Alert, Platform, PermissionsAndroid } from 'react-native';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

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

const showOversizedAlert = (total, valid) => {
  if (total > valid) {
    Alert.alert('File too large', 'Some files were skipped. Maximum file size is 20MB each.');
  }
};

export const pickImagesFromGallery = async (allowMultiple = true) => {
  const result = await launchImageLibrary({
    mediaType: 'mixed',
    selectionLimit: allowMultiple ? 0 : 1,
    quality: 0.8,
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
    quality: 0.8,
    saveToPhotos: false,
    includeBase64: false,
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
      type: [types.images, types.pdf, types.video, types.doc, types.docx],
      allowMultiSelection: allowMultiple,
      presentationStyle: 'fullScreen',
      copyTo: 'cachesDirectory',
    });

    const files = filterBySize((Array.isArray(results) ? results : [results]).map(mapDocument));
    showOversizedAlert((Array.isArray(results) ? results : [results]).length, files.length);
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
      copyTo: 'cachesDirectory',
    });

    const file = mapDocument(Array.isArray(results) ? results[0] : results);
    if (file.size > MAX_FILE_SIZE_BYTES) {
      Alert.alert('File too large', 'Maximum file size is 20MB.');
      return null;
    }
    return file;
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
