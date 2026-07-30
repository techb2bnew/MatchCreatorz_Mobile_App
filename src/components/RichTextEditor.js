import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import {
  blackColor,
  grayColor,
  redColor,
  borderLightColor,
  whiteColor,
  screenBgColor,
} from '../constans/Color';
import { style, spacings } from '../constans/Fonts';
import { heightPercentageToDP as hp } from '../utils';
import { isHtmlEmpty } from '../utils/html';

const EDITOR_STYLE = {
  backgroundColor: whiteColor,
  color: blackColor,
  placeholderColor: grayColor,
  contentCSSText: 'font-size:15px; line-height:22px;',
};

const TOOLBAR_ACTIONS = [
  actions.setBold,
  actions.setItalic,
  actions.setUnderline,
  actions.insertBulletsList,
  actions.insertOrderedList,
  actions.heading3,
  actions.undo,
  actions.redo,
];

/**
 * Rich-text (HTML) input built on react-native-pell-rich-editor (WebView based;
 * webview is already installed for Stripe). Emits an HTML string via onChange,
 * normalised to '' when the content is visually empty so existing "required"
 * checks (value.trim()) keep working. Render the stored HTML with
 * <RichTextViewer/> on the display side.
 */
const RichTextEditor = ({
  label,
  required = false,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  minHeight = hp(18),
}) => {
  const richRef = useRef(null);

  const handleChange = html => {
    onChange?.(isHtmlEmpty(html) ? '' : html);
  };

  // Prefill (edit mode) once the WebView editor is ready.
  const handleInitialized = () => {
    if (value) richRef.current?.setContentHTML(value);
  };

  return (
    <View>
      {label ? (
        <Text style={[styles.label, style.fontWeightMedium]}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}

      <View style={[styles.box, error ? styles.boxError : null]}>
        <View style={styles.toolbarRow}>
          <RichToolbar
            editor={richRef}
            actions={TOOLBAR_ACTIONS}
            iconTint={grayColor}
            selectedIconTint={redColor}
            disabled={disabled}
            style={styles.toolbar}
          />
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => richRef.current?.dismissKeyboard()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.doneText, style.fontWeightMedium]}>Done</Text>
          </TouchableOpacity>
        </View>
        <RichEditor
          ref={richRef}
          initialContentHTML={value || ''}
          editorInitializedCallback={handleInitialized}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          initialHeight={minHeight}
          editorStyle={EDITOR_STYLE}
          style={[styles.editor, { minHeight }]}
          useContainer
        />
      </View>

      {error ? <Text style={[styles.error, style.fontWeightThin]}>{error}</Text> : null}
    </View>
  );
};

export default RichTextEditor;

const styles = StyleSheet.create({
  label: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    color: grayColor,
    marginBottom: spacings.small,
    letterSpacing: 0.4,
  },
  required: { color: redColor },
  box: {
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 12,
    backgroundColor: whiteColor,
    overflow: 'hidden',
  },
  boxError: { borderColor: redColor },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: screenBgColor,
    borderBottomWidth: 1,
    borderBottomColor: borderLightColor,
  },
  toolbar: {
    flex: 1,
    backgroundColor: screenBgColor,
  },
  doneBtn: {
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.small,
  },
  doneText: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: redColor,
  },
  editor: { flex: 1 },
  error: {
    marginTop: spacings.small,
    fontSize: style.fontSizeSmall1x.fontSize,
    color: redColor,
  },
});
