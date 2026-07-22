import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../constans/Style';
import { blackColor, borderLightColor, grayColor, inputBgColor, redColor, whiteColor } from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from '../utils';

const { flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween } = BaseStyle;

import FormLabel from './FormLabel';

const CustomDropdown = ({
  label,
  value,
  options,
  onSelect,
  style: customStyle,
  searchable = false,
  required = false,
  error = '',
}) => {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchable || !search.trim()) return options;
    const query = search.trim().toLowerCase();
    return options.filter(item => item.toLowerCase().includes(query));
  }, [options, search, searchable]);

  const closeModal = () => {
    setVisible(false);
    setSearch('');
  };

  return (
    <View style={[styles.wrapper, customStyle]}>
      <FormLabel label={label} required={required} />
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setVisible(true)}
        style={[styles.trigger, flexDirectionRow, alignItemsCenter, error && styles.triggerError]}>
        <Text style={[styles.value, style.fontSizeNormal2x, !value && styles.placeholder]} numberOfLines={1}>
          {value || 'Select'}
        </Text>
        <Icon name="chevron-down" size={16} color={grayColor} />
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={visible} transparent animationType="fade" onRequestClose={closeModal}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeModal}>
          <TouchableOpacity activeOpacity={1} style={styles.modal} onPress={() => {}}>
            <View style={[styles.header, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
              <Text style={[styles.headerTitle, style.fontWeightMedium]} numberOfLines={1}>
                {label || 'Select'}
              </Text>
              <TouchableOpacity onPress={closeModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="x" size={20} color={grayColor} />
              </TouchableOpacity>
            </View>

            {searchable ? (
              <View style={[styles.searchBox, flexDirectionRow, alignItemsCenter]}>
                <Icon name="search" size={16} color={grayColor} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search..."
                  placeholderTextColor={grayColor}
                  style={[styles.searchInput, style.fontSizeNormal2x]}
                  autoCorrect={false}
                />
                {search ? (
                  <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Icon name="x-circle" size={16} color={grayColor} />
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}

            <FlatList
              data={filteredOptions}
              keyExtractor={item => item}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={[styles.emptyText, style.fontWeightThin]}>No results found</Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, item === value && styles.optionSelected]}
                  onPress={() => {
                    onSelect(item);
                    closeModal();
                  }}>
                  <Text
                    style={[
                      styles.optionText,
                      style.fontSizeNormal2x,
                      item === value && styles.optionTextSelected,
                    ]}
                    numberOfLines={1}>
                    {item}
                  </Text>
                  {item === value ? <Icon name="check" size={16} color={redColor} /> : null}
                </TouchableOpacity>
              )}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default CustomDropdown;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: '45%',
  },
  trigger: {
    backgroundColor: inputBgColor,
    borderRadius: 10,
    paddingHorizontal: spacings.large,
    minHeight: hp(6),
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  triggerError: {
    borderColor: redColor,
  },
  errorText: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
    marginTop: spacings.xsmall,
    marginLeft: spacings.xsmall,
  },
  value: {
    flex: 1,
    color: blackColor,
    marginRight: spacings.small,
  },
  placeholder: {
    color: grayColor,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: wp(6),
  },
  modal: {
    backgroundColor: whiteColor,
    borderRadius: 16,
    maxHeight: hp(58),
    paddingTop: spacings.large,
    paddingBottom: spacings.normal,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: spacings.xLarge,
    paddingBottom: spacings.large,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderLightColor,
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
    marginRight: spacings.normal,
  },
  searchBox: {
    backgroundColor: inputBgColor,
    borderRadius: 10,
    marginHorizontal: spacings.xLarge,
    marginTop: spacings.large,
    marginBottom: spacings.small,
    paddingHorizontal: spacings.large,
    minHeight: hp(5.5),
    gap: spacings.normal,
  },
  searchInput: {
    flex: 1,
    color: blackColor,
    padding: 0,
  },
  listContent: {
    paddingHorizontal: spacings.large,
    paddingTop: spacings.small,
    paddingBottom: spacings.large,
  },
  emptyText: {
    textAlign: 'center',
    color: grayColor,
    paddingVertical: spacings.xxLarge,
    fontSize: style.fontSizeNormal2x.fontSize,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.large,
    borderRadius: 10,
    gap: spacings.normal,
  },
  optionSelected: {
    backgroundColor: '#FFF5F5',
  },
  optionText: {
    flex: 1,
    minWidth: 0,
    color: blackColor,
  },
  optionTextSelected: {
    color: redColor,
    fontWeight: '600',
  },
});
