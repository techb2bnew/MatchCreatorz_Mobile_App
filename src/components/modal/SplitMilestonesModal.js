import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../../constans/Style';
import {
  blackColor,
  borderLightColor,
  grayColor,
  greenColor,
  inputBgColor,
  redColor,
  whiteColor,
} from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';

const { flexDirectionRow, alignItemsCenter, alignJustifyCenter, justifyContentSpaceBetween } =
  BaseStyle;

const fmt = n => `$${(Number(n) || 0).toFixed(2)}`;
const toNum = v => Number(String(v).replace(/[^0-9.]/g, '')) || 0;

/**
 * Split a booking into milestones. Each milestone has a title + amount; the
 * amounts must add up to the booking total before "Create Milestones" enables.
 * NOTE: no backend endpoint exists yet — onCreate just receives the built list
 * (caller console.logs / stores locally for now).
 */
const SplitMilestonesModal = ({ visible, total = 0, onClose, onCreate, loading = false }) => {
  const [rows, setRows] = useState([
    { title: '', amount: '' },
    { title: '', amount: '' },
  ]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setRows([
        { title: '', amount: '' },
        { title: '', amount: '' },
      ]);
      setError('');
    }
  }, [visible]);

  const enteredTotal = useMemo(
    () => rows.reduce((sum, r) => sum + toNum(r.amount), 0),
    [rows],
  );
  const matches = Math.abs(enteredTotal - Number(total)) < 0.005 && Number(total) > 0;

  const updateRow = (index, key, value) =>
    setRows(prev => prev.map((r, i) => (i === index ? { ...r, [key]: value } : r)));

  const addRow = () => setRows(prev => [...prev, { title: '', amount: '' }]);
  const removeRow = index => setRows(prev => prev.filter((_, i) => i !== index));

  const handleCreate = () => {
    if (loading) return;
    if (rows.some(r => !r.title.trim())) {
      setError('Har milestone ka title bharo.');
      return;
    }
    if (rows.some(r => toNum(r.amount) <= 0)) {
      setError('Har milestone ka amount 0 se zyada hona chahiye.');
      return;
    }
    if (!matches) {
      setError(`Amounts total ${fmt(total)} ke barabar hone chahiye.`);
      return;
    }
    setError('');
    onCreate?.(
      rows.map((r, i) => ({ title: r.title.trim(), amount: toNum(r.amount), order: i + 1 })),
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={loading ? undefined : onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={loading ? undefined : onClose} />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.card}>
            <View style={[styles.header, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
              <Text style={[styles.title, style.fontWeightMedium]}>Split into Milestones</Text>
              <TouchableOpacity onPress={onClose} disabled={loading} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="x" size={20} color={grayColor} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.hint, style.fontWeightThin]}>
              Amounts must add up to the booking total:{' '}
              <Text style={style.fontWeightMedium}>{fmt(total)}</Text>
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag">
              {rows.map((row, index) => (
                <View key={index} style={[styles.row, flexDirectionRow, alignItemsCenter]}>
                  <TextInput
                    style={[styles.titleInput, style.fontWeightThin]}
                    value={row.title}
                    onChangeText={v => updateRow(index, 'title', v)}
                    placeholder={`Milestone ${index + 1} title`}
                    placeholderTextColor={grayColor}
                    editable={!loading}
                  />
                  <TextInput
                    style={[styles.amountInput, style.fontWeightThin]}
                    value={row.amount}
                    onChangeText={v => updateRow(index, 'amount', v.replace(/[^0-9.]/g, ''))}
                    placeholder="$"
                    placeholderTextColor={grayColor}
                    keyboardType="decimal-pad"
                    editable={!loading}
                  />
                  {rows.length > 2 ? (
                    <TouchableOpacity
                      onPress={() => removeRow(index)}
                      disabled={loading}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      style={styles.removeBtn}>
                      <Icon name="x-circle" size={18} color={grayColor} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              ))}

              <TouchableOpacity
                style={[styles.addRow, flexDirectionRow, alignItemsCenter]}
                onPress={addRow}
                disabled={loading}>
                <Icon name="plus" size={16} color={redColor} />
                <Text style={[styles.addText, style.fontWeightMedium]}>Add another milestone</Text>
              </TouchableOpacity>

              <View style={[styles.totalRow, alignJustifyCenter]}>
                <Text style={[styles.totalText, style.fontWeightMedium]}>
                  Total: <Text style={{ color: matches ? greenColor : redColor }}>{fmt(enteredTotal)}</Text>{' '}
                  / {fmt(total)}
                </Text>
              </View>

              {!matches && Number(total) > 0 ? (
                <Text style={[styles.hintText, style.fontWeightThin]}>
                  {enteredTotal < Number(total)
                    ? `Add ${fmt(Number(total) - enteredTotal)} more — amounts must equal ${fmt(total)}.`
                    : `${fmt(enteredTotal - Number(total))} over — amounts must equal ${fmt(total)}.`}
                </Text>
              ) : null}

              {error ? <Text style={[styles.errorText, style.fontWeightThin]}>{error}</Text> : null}
            </ScrollView>

            <TouchableOpacity
              style={[styles.createBtn, alignJustifyCenter, (!matches || loading) && styles.createBtnDisabled]}
              onPress={handleCreate}
              disabled={loading || !matches}
              activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator size="small" color={whiteColor} />
              ) : (
                <Text style={[styles.createText, style.fontWeightMedium]}>Create Milestones</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default SplitMilestonesModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: wp(5),
  },
  backdrop: { ...StyleSheet.absoluteFillObject },
  card: {
    width: '100%',
    maxHeight: hp(82),
    backgroundColor: whiteColor,
    borderRadius: 16,
    paddingHorizontal: spacings.xLarge,
    paddingTop: spacings.xLarge,
    paddingBottom: spacings.large,
  },
  header: { marginBottom: spacings.normal },
  title: { fontSize: style.fontSizeMedium1x.fontSize, color: blackColor },
  hint: {
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
    marginBottom: spacings.large,
  },
  row: { gap: spacings.small, marginBottom: spacings.normal },
  titleInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 24,
    backgroundColor: inputBgColor,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.medium,
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  amountInput: {
    width: wp(22),
    borderWidth: 1,
    borderColor: borderLightColor,
    borderRadius: 24,
    backgroundColor: inputBgColor,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.medium,
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
  },
  removeBtn: { paddingLeft: spacings.xsmall },
  addRow: { gap: spacings.xsmall, paddingVertical: spacings.small, marginBottom: spacings.small },
  addText: { color: redColor, fontSize: style.fontSizeSmall1x.fontSize },
  totalRow: {
    backgroundColor: inputBgColor,
    borderRadius: 12,
    paddingVertical: spacings.medium,
    marginTop: spacings.small,
  },
  totalText: { fontSize: style.fontSizeNormal2x.fontSize, color: blackColor },
  hintText: {
    marginTop: spacings.small,
    textAlign: 'center',
    fontSize: style.fontSizeSmall1x.fontSize,
    color: grayColor,
  },
  errorText: {
    marginTop: spacings.normal,
    fontSize: style.fontSizeSmall1x.fontSize,
    color: redColor,
  },
  createBtn: {
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: redColor,
    marginTop: spacings.large,
  },
  createBtnDisabled: { opacity: 0.5 },
  createText: { fontSize: style.fontSizeNormal2x.fontSize, color: whiteColor },
});
