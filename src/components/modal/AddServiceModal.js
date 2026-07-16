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
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../../constans/Style';
import {
  blackColor,
  borderLightColor,
  grayColor,
  lightPink,
  redColor,
  whiteColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import {
  SELLER_ADD_SERVICE_MODAL as COPY,
} from '../../constans/Constants';
import UploadOptionsModal from './UploadOptionsModal';
import { pickImageFromCamera, pickImagesFromGallery } from '../../utils/filePicker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter, justifyContentSpaceBetween } =
  BaseStyle;

const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const normalizeCategory = item => {
  if (item == null) return null;
  if (typeof item === 'string') {
    return { id: item, name: item };
  }
  const id = item.id ?? item.category_id ?? item.value;
  const name = item.name || item.title || item.label || String(id);
  if (id == null) return null;
  return { id, name };
};

const FieldLabel = ({ label }) => (
  <Text style={[styles.fieldLabel, style.fontWeightMedium]}>{label}</Text>
);

const AddServiceModal = ({
  visible,
  loading = false,
  error = '',
  mode = 'create',
  initialValues = null,
  categories = [],
  categoriesLoading = false,
  onClose,
  onSubmit,
}) => {
  const isEdit = mode === 'edit';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [price, setPrice] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [revisions, setRevisions] = useState('');
  const [tags, setTags] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  const categoryOptions = (Array.isArray(categories) ? categories : [])
    .map(normalizeCategory)
    .filter(Boolean);

  const totalImageCount = existingImages.length + newImages.length;

  useEffect(() => {
    if (!visible) return;

    const nextExisting = Array.isArray(initialValues?.existingImages)
      ? initialValues.existingImages.filter(Boolean).slice(0, MAX_IMAGES)
      : [];

    setTitle(String(initialValues?.title || ''));
    setDescription(String(initialValues?.description || ''));
    setExistingImages(nextExisting);
    setNewImages([]);
    setSelectedCategoryIds(
      (Array.isArray(initialValues?.category_ids) ? initialValues.category_ids : [])
        .map(Number)
        .filter(n => !Number.isNaN(n)),
    );
    setShowCategories(false);
    setPrice(
      initialValues?.price != null && initialValues.price !== ''
        ? String(initialValues.price)
        : '',
    );
    setDeliveryDays(
      initialValues?.delivery_days != null && initialValues.delivery_days !== ''
        ? String(initialValues.delivery_days)
        : '',
    );
    setRevisions(
      initialValues?.revisions != null && initialValues.revisions !== ''
        ? String(initialValues.revisions)
        : '',
    );
    setTags(
      Array.isArray(initialValues?.tags)
        ? initialValues.tags.filter(Boolean).join(', ')
        : String(initialValues?.tags || ''),
    );
    setFieldError('');
    setShowUploadOptions(false);
  }, [visible, mode, initialValues?.id]);

  const appendImages = files => {
    if (!files?.length) return;

    const valid = [];
    let oversized = false;

    files.forEach(file => {
      if ((file.size || 0) > MAX_IMAGE_BYTES) {
        oversized = true;
        return;
      }
      valid.push(file);
    });

    if (oversized) {
      Alert.alert('File too large', COPY.imageTooLarge);
    }

    setNewImages(prev => {
      const remaining = MAX_IMAGES - existingImages.length - prev.length;
      if (remaining <= 0) {
        Alert.alert('Limit reached', COPY.maxImages);
        return prev;
      }
      if (valid.length > remaining) {
        Alert.alert('Limit reached', COPY.maxImages);
      }
      return [...prev, ...valid.slice(0, remaining)];
    });
  };

  const handleUploadOption = async option => {
    if (option === 'gallery') {
      appendImages(await pickImagesFromGallery(true));
      return;
    }
    if (option === 'camera') {
      appendImages(await pickImageFromCamera());
    }
  };

  const removeExistingImage = index => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = index => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleCategory = categoryId => {
    const id = Number(categoryId);
    if (Number.isNaN(id)) return;
    setSelectedCategoryIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const parseTags = value =>
    value
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);

  const handleSubmit = () => {
    const priceNum = Number(price);
    const daysNum = Number(deliveryDays);
    const revisionsNum = Number(revisions);

    if (!title.trim()) {
      setFieldError(COPY.titleRequired);
      return;
    }
    if (!description.trim()) {
      setFieldError(COPY.descriptionRequired);
      return;
    }
    if (!selectedCategoryIds.length) {
      setFieldError(COPY.categoryRequired);
      return;
    }
    if (!price.trim() || Number.isNaN(priceNum) || priceNum <= 0) {
      setFieldError(COPY.priceRequired);
      return;
    }
    if (
      !deliveryDays.trim() ||
      Number.isNaN(daysNum) ||
      daysNum <= 0 ||
      !Number.isInteger(daysNum)
    ) {
      setFieldError(COPY.deliveryRequired);
      return;
    }
    if (
      !revisions.trim() ||
      Number.isNaN(revisionsNum) ||
      revisionsNum < 0 ||
      !Number.isInteger(revisionsNum)
    ) {
      setFieldError(COPY.revisionsRequired);
      return;
    }

    setFieldError('');
    onSubmit?.({
      title: title.trim(),
      description: description.trim(),
      images: newImages,
      existing_images: existingImages,
      category_ids: selectedCategoryIds.map(Number).filter(n => !Number.isNaN(n)),
      price: priceNum,
      delivery_days: daysNum,
      revisions: revisionsNum,
      tags: parseTags(tags),
    });
  };

  const selectedNames = categoryOptions
    .filter(cat => selectedCategoryIds.includes(Number(cat.id)))
    .map(cat => cat.name);
  const categoryDisplay =
    selectedNames.length > 0 ? selectedNames.join(', ') : COPY.categoryPlaceholder;
  const modalTitle = isEdit ? COPY.editTitle : COPY.title;
  const submitLabel = isEdit ? COPY.editSubmit : COPY.submit;

  return (
    <>
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
              <View
                style={[
                  styles.header,
                  flexDirectionRow,
                  alignItemsCenter,
                  justifyContentSpaceBetween,
                ]}>
                <Text style={[styles.title, style.fontWeightBold]}>{modalTitle}</Text>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  disabled={loading}>
                  <Icon name="x" size={22} color={grayColor} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}>
                <View style={styles.fieldWrap}>
                  <FieldLabel label={COPY.titleLabel} />
                  <TextInput
                    style={[styles.input, style.fontWeightThin]}
                    value={title}
                    onChangeText={setTitle}
                    placeholder={COPY.titlePlaceholder}
                    placeholderTextColor={grayColor}
                    editable={!loading}
                  />
                </View>

                <View style={styles.fieldWrap}>
                  <FieldLabel label={COPY.descriptionLabel} />
                  <TextInput
                    style={[styles.input, styles.descriptionInput, style.fontWeightThin]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder={COPY.descriptionPlaceholder}
                    placeholderTextColor={grayColor}
                    multiline
                    textAlignVertical="top"
                    editable={!loading}
                  />
                </View>

                <View style={styles.fieldWrap}>
                  <FieldLabel label={COPY.imagesLabel} />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.imagesRow}>
                    {existingImages.map((uri, index) => (
                      <View key={`existing-${uri}-${index}`} style={styles.imagePreviewWrap}>
                        <Image source={{ uri }} style={styles.imagePreview} />
                        <TouchableOpacity
                          style={styles.removeImageBtn}
                          onPress={() => removeExistingImage(index)}
                          disabled={loading}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <Icon name="x" size={12} color={whiteColor} />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {newImages.map((file, index) => (
                      <View key={`new-${file.uri}-${index}`} style={styles.imagePreviewWrap}>
                        <Image source={{ uri: file.uri }} style={styles.imagePreview} />
                        <TouchableOpacity
                          style={styles.removeImageBtn}
                          onPress={() => removeNewImage(index)}
                          disabled={loading}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <Icon name="x" size={12} color={whiteColor} />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {totalImageCount < MAX_IMAGES ? (
                      <TouchableOpacity
                        style={[styles.addPhotoBox, alignJustifyCenter]}
                        onPress={() => setShowUploadOptions(true)}
                        disabled={loading}
                        activeOpacity={0.85}>
                        <Icon name="plus" size={22} color={grayColor} />
                        <Text style={[styles.addPhotoText, style.fontWeightThin]}>
                          {COPY.addPhoto}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </ScrollView>
                </View>

                <View style={styles.fieldWrap}>
                  <FieldLabel label={COPY.categoryLabel} />
                  <TouchableOpacity
                    style={[styles.categoryTrigger, flexDirectionRow, alignItemsCenter]}
                    onPress={() => setShowCategories(prev => !prev)}
                    disabled={loading || categoriesLoading}
                    activeOpacity={0.85}>
                    <Icon name="tag" size={16} color={redColor} />
                    <Text
                      style={[
                        styles.categoryValue,
                        style.fontWeightThin,
                        !selectedCategoryIds.length && styles.placeholder,
                        { flex: 1 },
                      ]}
                      numberOfLines={1}>
                      {categoriesLoading ? 'Loading categories...' : categoryDisplay}
                    </Text>
                    <Icon
                      name={showCategories ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={grayColor}
                    />
                  </TouchableOpacity>
                  {showCategories ? (
                    <View style={styles.categoryList}>
                      {categoryOptions.length === 0 ? (
                        <Text style={[styles.categoryEmpty, style.fontWeightThin]}>
                          {COPY.loadCategoriesError}
                        </Text>
                      ) : (
                        categoryOptions.map(category => {
                          const selected = selectedCategoryIds.includes(Number(category.id));
                          return (
                            <TouchableOpacity
                              key={String(category.id)}
                              style={[
                                styles.categoryOption,
                                flexDirectionRow,
                                alignItemsCenter,
                                justifyContentSpaceBetween,
                                selected && styles.categoryOptionSelected,
                              ]}
                              onPress={() => toggleCategory(category.id)}
                              disabled={loading}>
                              <Text
                                style={[
                                  styles.categoryOptionText,
                                  style.fontWeightThin,
                                  selected && styles.categoryOptionTextSelected,
                                ]}>
                                {category.name}
                              </Text>
                              {selected ? <Icon name="check" size={16} color={redColor} /> : null}
                            </TouchableOpacity>
                          );
                        })
                      )}
                    </View>
                  ) : null}
                </View>

                <View style={[styles.metricsRow, flexDirectionRow]}>
                  <View style={[styles.metricField, { flex: 1 }]}>
                    <FieldLabel label={COPY.priceLabel} />
                    <TextInput
                      style={[styles.input, style.fontWeightThin]}
                      value={price}
                      onChangeText={setPrice}
                      placeholder={COPY.pricePlaceholder}
                      placeholderTextColor={grayColor}
                      keyboardType="numeric"
                      editable={!loading}
                    />
                  </View>
                  <View style={[styles.metricField, { flex: 1 }]}>
                    <FieldLabel label={COPY.deliveryLabel} />
                    <TextInput
                      style={[styles.input, style.fontWeightThin]}
                      value={deliveryDays}
                      onChangeText={setDeliveryDays}
                      placeholder={COPY.deliveryPlaceholder}
                      placeholderTextColor={grayColor}
                      keyboardType="number-pad"
                      editable={!loading}
                    />
                  </View>
                  <View style={[styles.metricField, { flex: 1 }]}>
                    <FieldLabel label={COPY.revisionsLabel} />
                    <TextInput
                      style={[styles.input, style.fontWeightThin]}
                      value={revisions}
                      onChangeText={setRevisions}
                      placeholder={COPY.revisionsPlaceholder}
                      placeholderTextColor={grayColor}
                      keyboardType="number-pad"
                      editable={!loading}
                    />
                  </View>
                </View>

                <View style={styles.fieldWrap}>
                  <FieldLabel label={COPY.tagsLabel} />
                  <TextInput
                    style={[styles.input, style.fontWeightThin]}
                    value={tags}
                    onChangeText={setTags}
                    placeholder={COPY.tagsPlaceholder}
                    placeholderTextColor={grayColor}
                    editable={!loading}
                    autoCapitalize="none"
                  />
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
                    <Text style={[styles.cancelBtnText, style.fontWeightMedium]}>{COPY.cancel}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.submitBtn, alignJustifyCenter]}
                    onPress={handleSubmit}
                    disabled={loading}>
                    {loading ? (
                      <ActivityIndicator size="small" color={whiteColor} />
                    ) : (
                      <Text style={[styles.submitBtnText, style.fontWeightMedium]}>
                        {submitLabel}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <UploadOptionsModal
        visible={showUploadOptions}
        photoOnly
        onClose={() => setShowUploadOptions(false)}
        onSelect={handleUploadOption}
      />
    </>
  );
};

export default AddServiceModal;

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
    maxHeight: hp(88),
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
  scrollContent: {
    paddingBottom: spacings.small,
  },
  fieldWrap: {
    marginBottom: spacings.large,
  },
  fieldLabel: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: blackColor,
    marginBottom: spacings.small,
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
  descriptionInput: {
    minHeight: hp(10),
    paddingTop: spacings.medium,
  },
  imagesRow: {
    gap: spacings.normal,
    alignItems: 'center',
  },
  addPhotoBox: {
    width: wp(22),
    height: wp(22),
    borderWidth: 1.5,
    borderColor: borderLightColor,
    borderStyle: 'dashed',
    borderRadius: 10,
    gap: 4,
  },
  addPhotoText: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
  },
  imagePreviewWrap: {
    width: wp(22),
    height: wp(22),
    borderRadius: 10,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTrigger: {
    gap: spacings.normal,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 10,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.medium,
  },
  categoryValue: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  placeholder: {
    color: grayColor,
  },
  categoryList: {
    marginTop: spacings.small,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 10,
    overflow: 'hidden',
  },
  categoryEmpty: {
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.medium,
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  categoryOption: {
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.medium,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderLightColor,
  },
  categoryOptionSelected: {
    backgroundColor: lightPink,
  },
  categoryOptionText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  categoryOptionTextSelected: {
    color: redColor,
    fontWeight: '600',
  },
  metricsRow: {
    gap: spacings.normal,
    marginBottom: spacings.large,
  },
  metricField: {
    minWidth: 0,
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
