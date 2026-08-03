import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Linking,
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
  CONTACT_US_EMPTY,
  CONTACT_US_SUBTITLE,
  CONTACT_US_TITLE,
} from '../../constans/Constants';
import { getPublicPageApi } from '../../services/publicService';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter } = BaseStyle;

const EMAIL_REGEX = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const PHONE_REGEX = /\+?\d[\d\s\-().]{7,}\d/g;

const stripHtml = html =>
  String(html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

// Pulls the tappable values out and leaves a clean intro line behind, so the
// email/phone isn't printed twice (once in the paragraph, once in the row).
const extractContacts = text => {
  const emails = [...new Set(text.match(EMAIL_REGEX) || [])];
  let rest = text;
  emails.forEach(email => {
    rest = rest.split(email).join(' ');
  });
  const phones = [...new Set((rest.match(PHONE_REGEX) || []).map(p => p.trim()))];
  phones.forEach(phone => {
    rest = rest.split(phone).join(' ');
  });

  const intro = rest
    .replace(/\b(e-?mail|phone|mobile|call|contact|tel)\s*(us)?\s*[:\-–]\s*/gi, ' ')
    .replace(/[\s]*[:\-–,]\s*(?=\n|$)/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.replace(/[^\w]/g, '').length > 1)
    .join('\n')
    .trim();

  return { emails, phones, intro };
};

const ContactUsModal = ({ visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!visible) return;
    let active = true;
    setLoading(true);
    getPublicPageApi('contact')
      .then(response => {
        if (!active) return;
        const page = response?.data || response || {};
        setContent(stripHtml(page.content));
      })
      .catch(() => {
        if (active) setContent('');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [visible]);

  const openLink = async url => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unable to open', url);
    }
  };

  const { emails, phones, intro } = extractContacts(content);
  const rows = [
    ...emails.map(value => ({
      value,
      icon: 'mail',
      label: 'Email us',
      action: 'Send email',
      url: `mailto:${value}`,
    })),
    ...phones.map(value => ({
      value,
      icon: 'phone',
      label: 'Call us',
      action: 'Open dialer',
      url: `tel:${value.replace(/[^\d+]/g, '')}`,
    })),
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}>
      <View style={[styles.overlay, alignJustifyCenter]}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.card}>
          <View style={[styles.cardHeader, flexDirectionRow, alignItemsCenter]}>
            <View style={styles.headerIconWrap}>
              <Icon name="mail" size={18} color={redColor} />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={[styles.title, style.fontWeightMedium]}>{CONTACT_US_TITLE}</Text>
              <Text style={[styles.subtitle, style.fontWeightThin]}>{CONTACT_US_SUBTITLE}</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="x" size={20} color={grayColor} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="small" color={redColor} />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {intro ? (
                <Text style={[styles.bodyText, style.fontWeightThin]}>{intro}</Text>
              ) : null}
              {rows.length ? (
                rows.map(row => (
                  <TouchableOpacity
                    key={`${row.icon}-${row.value}`}
                    activeOpacity={0.8}
                    onPress={() => openLink(row.url)}
                    style={[styles.contactCard, flexDirectionRow, alignItemsCenter]}>
                    <View style={[styles.rowIconWrap, alignJustifyCenter]}>
                      <Icon name={row.icon} size={18} color={redColor} />
                    </View>
                    <View style={styles.rowTextWrap}>
                      <Text style={[styles.rowLabel, style.fontWeightThin]}>{row.label}</Text>
                      <Text style={[styles.rowValue, style.fontWeightMedium]} numberOfLines={1}>
                        {row.value}
                      </Text>
                      <Text style={[styles.rowAction, style.fontWeightThin]}>{row.action}</Text>
                    </View>
                    <Icon name="chevron-right" size={18} color={grayColor} />
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={[styles.bodyText, style.fontWeightThin]}>{CONTACT_US_EMPTY}</Text>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ContactUsModal;

const styles = StyleSheet.create({
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
    maxHeight: hp(70),
    backgroundColor: whiteColor,
    borderRadius: 16,
    paddingHorizontal: spacings.xLarge,
    paddingTop: spacings.xLarge,
    paddingBottom: spacings.large,
  },
  cardHeader: {
    gap: spacings.normal,
    marginBottom: spacings.large,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: lightPink,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: style.fontSizeMedium1x.fontSize,
    color: blackColor,
  },
  subtitle: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginTop: 2,
  },
  loaderWrap: {
    paddingVertical: spacings.xxLarge,
    alignItems: 'center',
  },
  bodyText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: grayColor,
    lineHeight: 20,
    marginBottom: spacings.large,
  },
  contactCard: {
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    padding: spacings.large,
    marginBottom: spacings.normal,
    gap: spacings.normal,
  },
  rowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: lightPink,
    flexShrink: 0,
  },
  rowTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  rowLabel: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  rowValue: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginTop: 1,
  },
  rowAction: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: redColor,
    marginTop: 2,
  },
});
