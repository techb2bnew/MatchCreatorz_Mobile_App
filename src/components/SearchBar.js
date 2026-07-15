import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../constans/Style';
import { blackColor, borderLightColor, grayColor, whiteColor } from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import { heightPercentageToDP as hp } from '../utils';

const { flexDirectionRow, alignItemsCenter } = BaseStyle;

const SearchBar = ({ value, onChangeText, placeholder, style: containerStyle }) => {
  return (
    <View style={[styles.searchBox, flexDirectionRow, alignItemsCenter, containerStyle]}>
      <Icon name="search" size={16} color={grayColor} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={grayColor}
        style={[styles.searchInput, style.fontSizeNormal2x]}
        blurOnSubmit={false}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
      />
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  searchBox: {
    backgroundColor: whiteColor,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: borderLightColor,
    paddingHorizontal: spacings.large,
    minHeight: hp(5.5),
    gap: spacings.normal,
    marginBottom: hp(1.8),
  },
  searchInput: {
    flex: 1,
    color: blackColor,
    paddingVertical: spacings.medium,
  },
});
