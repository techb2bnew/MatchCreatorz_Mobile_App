import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
} from 'react-native';
import { BaseStyle } from '../constans/Style';
import { borderLightColor, inputBgColor, redColor } from '../constans/Color';
import { spacings } from '../constans/Fonts';
import { BANNER_POSITION_HOME } from '../constans/Constants';
import { getBannersApi } from '../services/publicService';
import { widthPercentageToDP as wp } from '../utils';

const { flexDirectionRow, alignJustifyCenter } = BaseStyle;

const SLIDE_WIDTH = Dimensions.get('window').width - wp(10); // screen minus page padding
// Height follows the width at a fixed 2:1 ratio, so one uploaded image
// (1200 x 600 px) fills the box exactly on every phone — with a
// screen-height-based height the ratio changed per device and images got cropped.
const SLIDE_HEIGHT = Math.round(SLIDE_WIDTH / 2);
const AUTO_SCROLL_MS = 4000;

const extractBanners = response => {
  const data = response?.data;
  const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  return list
    .filter(item => item?.image_url)
    .map(item => ({
      id: String(item.id),
      title: item.title || '',
      imageUrl: item.image_url,
      linkUrl: item.link_url || '',
      order: Number(item.display_order) || 0,
    }))
    // display_order first; ties keep the API's own order (newest id first).
    .sort((a, b) => a.order - b.order);
};

/**
 * Promotional banner carousel (GET /banners?position=Home Top).
 * Auto-slides, swipeable, dots below. Renders nothing when there are no
 * banners, so the dashboards look exactly as before if the admin adds none.
 */
const BannerCarousel = ({ position = BANNER_POSITION_HOME, style: customStyle }) => {
  const [banners, setBanners] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    getBannersApi(position)
      .then(response => {
        if (!cancelled) setBanners(extractBanners(response));
      })
      .catch(() => {
        if (!cancelled) setBanners([]);
      });
    return () => {
      cancelled = true;
    };
  }, [position]);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => {
      const next = (indexRef.current + 1) % banners.length;
      indexRef.current = next;
      setActiveIndex(next);
      scrollRef.current?.scrollTo({ x: next * SLIDE_WIDTH, animated: true });
    }, AUTO_SCROLL_MS);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleScroll = useCallback(event => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SLIDE_WIDTH);
    indexRef.current = index;
    setActiveIndex(index);
  }, []);

  const openLink = url => {
    if (!url) return;
    Linking.openURL(url).catch(() => {});
  };

  if (!banners.length) return null;

  return (
    <View style={customStyle}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}>
        {banners.map(banner => (
          <TouchableOpacity
            key={banner.id}
            activeOpacity={banner.linkUrl ? 0.9 : 1}
            disabled={!banner.linkUrl}
            onPress={() => openLink(banner.linkUrl)}
            style={styles.slide}>
            <Image source={{ uri: banner.imageUrl }} style={styles.image} resizeMode="cover" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {banners.length > 1 ? (
        <View style={[styles.dots, flexDirectionRow, alignJustifyCenter]}>
          {banners.map((banner, index) => (
            <View
              key={banner.id}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default BannerCarousel;

const styles = StyleSheet.create({
  slide: {
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    backgroundColor: inputBgColor,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: borderLightColor,
  },
  dots: {
    gap: spacings.small,
    marginTop: spacings.normal,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: borderLightColor,
  },
  dotActive: {
    width: 18,
    backgroundColor: redColor,
  },
});
