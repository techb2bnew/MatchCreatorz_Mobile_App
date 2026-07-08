import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BaseStyle } from '../../constans/Style';
import { blackColor, borderLightColor, grayColor, greenColor, redColor, whiteColor } from '../../constans/Color';
import { style, spacings } from '../../constans/Fonts';
import { STEP_ACCOUNT, STEP_PORTFOLIO, STEP_PROFILE } from '../../constans/Constants';

const { flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween } = BaseStyle;

const STEPS = [
  { key: 1, label: STEP_ACCOUNT, icon: 'user' },
  { key: 2, label: STEP_PROFILE, icon: 'credit-card' },
  { key: 3, label: STEP_PORTFOLIO, icon: 'image' },
];

const StepIndicator = ({ currentStep }) => {
  return (
    <View style={styles.wrapper}>
      <View style={[styles.row, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
        {STEPS.map((step, index) => {
          const isCompleted = currentStep > step.key;
          const isActive = currentStep === step.key;
          const isUpcoming = currentStep < step.key;

          return (
            <React.Fragment key={step.key}>
              <View style={[styles.stepItem, alignItemsCenter]}>
                <View
                  style={[
                    styles.circle,
                    alignItemsCenter,
                    isCompleted && styles.circleCompleted,
                    isActive && styles.circleActive,
                    isUpcoming && styles.circleUpcoming,
                  ]}>
                  {isCompleted ? (
                    <Icon name="check" size={14} color={whiteColor} />
                  ) : (
                    <Icon name={step.icon} size={14} color={isActive ? whiteColor : grayColor} />
                  )}
                </View>
                <Text
                  style={[
                    styles.label,
                    style.fontWeightMedium,
                    isCompleted && styles.labelCompleted,
                    isActive && styles.labelActive,
                    isUpcoming && styles.labelUpcoming,
                  ]}>
                  {step.label}
                </Text>
              </View>
              {index < STEPS.length - 1 ? (
                <View
                  style={[
                    styles.connector,
                    currentStep > step.key && styles.connectorCompleted,
                    currentStep === step.key + 1 && styles.connectorActive,
                  ]}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </View>
      <View style={styles.activeBar} />
    </View>
  );
};

export default StepIndicator;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacings.xLarge,
  },
  row: {
    paddingHorizontal: spacings.small,
    marginBottom: spacings.large,
  },
  stepItem: {
    flex: 1,
    gap: 6,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
  },
  circleCompleted: {
    backgroundColor: greenColor,
  },
  circleActive: {
    backgroundColor: redColor,
  },
  circleUpcoming: {
    backgroundColor: '#F5F5F7',
    borderWidth: 1,
    borderColor: borderLightColor,
  },
  label: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    textAlign: 'center',
  },
  labelCompleted: {
    color: greenColor,
  },
  labelActive: {
    color: redColor,
  },
  labelUpcoming: {
    color: grayColor,
  },
  connector: {
    flex: 0.6,
    height: 2,
    backgroundColor: borderLightColor,
    marginBottom: 18,
  },
  connectorCompleted: {
    backgroundColor: greenColor,
  },
  connectorActive: {
    backgroundColor: redColor,
  },
  activeBar: {
    height: 3,
    backgroundColor: redColor,
    borderRadius: 2,
    marginTop: spacings.xsmall,
  },
});
