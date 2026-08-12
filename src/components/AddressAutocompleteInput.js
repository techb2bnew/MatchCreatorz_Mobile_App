import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { BaseStyle } from '../constans/Style';
import {
  blackColor,
  borderLightColor,
  grayColor,
  inputBgColor,
  redColor,
  whiteColor,
} from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import { ADDRESS_PLACEHOLDER, GOOGLE_PLACES_API_KEY } from '../constans/Constants';
import { heightPercentageToDP as hp } from '../utils';
import FormLabel from './FormLabel';

const { flexDirectionRow, alignItemsCenter } = BaseStyle;

const ROW_HEIGHT = hp(6);
const ICON_SIZE = 17;
// How far the places container is inset from the box's left edge
// (box padding + icon + icon margin) — used to pull the dropdown back out
// so it spans the full width of the field instead of starting after the icon.
const INNER_LEFT_INSET = spacings.large + ICON_SIZE + spacings.normal;

/**
 * Single "address" field backed by Google Places autocomplete.
 * Styled to match CustomTextInput so it drops into existing forms.
 *
 * The suggestion list is absolutely positioned *below* the field, so picking an
 * address never changes the field's height or pushes the form around.
 *
 * Added alongside the existing city / state / country fields — the backend still
 * takes those; this will become the single `address` key once the API changes.
 * With no GOOGLE_PLACES_API_KEY set it still works as a plain text input,
 * just without suggestions.
 */
const AddressAutocompleteInput = ({
  label,
  value,
  onChangeText,
  placeholder = ADDRESS_PLACEHOLDER,
  required = false,
  error = '',
  style: customStyle,
}) => (
  <View style={[styles.wrapper, customStyle]}>
    <FormLabel label={label} required={required} />
    <View style={[styles.row, flexDirectionRow, alignItemsCenter, error && styles.rowError]}>
      <Icon name="map-pin" size={ICON_SIZE} color={grayColor} style={styles.leftIcon} />
      <GooglePlacesAutocomplete
        placeholder={placeholder}
        fetchDetails={false}
        keepResultsAfterBlur={false}
        enablePoweredByContainer={false}
        minLength={3}
        debounce={300}
        disableScroll
        query={{ key: GOOGLE_PLACES_API_KEY, language: 'en' }}
        onPress={data => onChangeText?.(data?.description || '')}
        onFail={() => {}}
        textInputProps={{
          value,
          onChangeText,
          placeholderTextColor: grayColor,
          autoCapitalize: 'words',
        }}
        styles={placesStyles}
      />
    </View>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

export default AddressAutocompleteInput;

const placesStyles = {
  // Zero-height container: the input sits in the row, the list floats below it.
  container: { flex: 1, height: ROW_HEIGHT },
  textInputContainer: { backgroundColor: 'transparent', paddingHorizontal: 0 },
  textInput: {
    height: ROW_HEIGHT,
    backgroundColor: 'transparent',
    color: blackColor,
    fontSize: style.fontSizeNormal2x.fontSize,
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  listView: {
    position: 'absolute',
    top: ROW_HEIGHT + spacings.small,
    left: -INNER_LEFT_INSET,
    right: -spacings.large,
    backgroundColor: whiteColor,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: borderLightColor,
    zIndex: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 6 },
    }),
  },
  row: { backgroundColor: 'transparent', paddingVertical: spacings.large },
  description: { color: blackColor, fontSize: style.fontSizeSmall1x.fontSize },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: borderLightColor },
};

const styles = StyleSheet.create({
  wrapper: {
    // Keeps the floating list above the fields that follow.
    zIndex: 20,
  },
  row: {
    borderRadius: 10,
    backgroundColor: inputBgColor,
    paddingHorizontal: spacings.large,
    height: ROW_HEIGHT,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  rowError: {
    borderColor: redColor,
  },
  leftIcon: {
    marginRight: spacings.normal,
  },
  errorText: {
    color: redColor,
    fontSize: style.fontSizeSmall1x.fontSize,
    marginTop: spacings.xsmall,
    marginLeft: spacings.xsmall,
  },
});
