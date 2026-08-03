import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BaseStyle } from '../constans/Style';
import { grayColor, redColor } from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import { AUTH_LEGAL_PREFIX, SCREEN_NAMES, STATIC_PAGES } from '../constans/Constants';
import { heightPercentageToDP as hp } from '../utils';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter } = BaseStyle;

const LEGAL_SLUGS = ['terms', 'privacy'];

/**
 * Terms of Service / Privacy Policy links for the Login + Create Account screens.
 * Opens StaticPageScreen (registered in authStack too) with the header's
 * notification + profile shortcuts hidden, since there's no session yet.
 */
const AuthLegalLinks = ({ navigation, style: customStyle }) => {
  const pages = STATIC_PAGES.filter(page => LEGAL_SLUGS.includes(page.slug));
  if (!pages.length) return null;

  const openPage = page =>
    navigation.navigate(SCREEN_NAMES.STATIC_PAGE, {
      slug: page.slug,
      title: page.title,
      hideHeaderActions: true,
    });

  return (
    <View style={[styles.wrapper, alignJustifyCenter, customStyle]}>
      <Text style={[styles.prefix, style.fontWeightThin]}>{AUTH_LEGAL_PREFIX}</Text>
      <View style={[flexDirectionRow, alignItemsCenter, styles.linksRow]}>
        {pages.map((page, index) => (
          <React.Fragment key={page.slug}>
            {index > 0 ? <Text style={[styles.separator, style.fontWeightThin]}>•</Text> : null}
            <TouchableOpacity onPress={() => openPage(page)} activeOpacity={0.7}>
              <Text style={[styles.link, style.fontWeightMedium]}>{page.title}</Text>
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

export default AuthLegalLinks;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: hp(2),
  },
  prefix: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    textAlign: 'center',
  },
  linksRow: {
    marginTop: 2,
    gap: spacings.small,
  },
  separator: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  link: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: redColor,
  },
});
