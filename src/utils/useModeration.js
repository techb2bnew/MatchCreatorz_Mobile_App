import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuth } from '../redux/slices/authSlice';
import {
  blockUser,
  selectBlockedUserIds,
  unblockUser,
} from '../redux/slices/blockedUsersSlice';
import { notifyUserBlockedApi, reportContentApi } from '../services/moderationService';
import { getApiErrorMessage } from '../services/apiClient';
import {
  BLOCK_ACTION,
  BLOCK_CONFIRM_MESSAGE,
  BLOCK_CONFIRM_TITLE,
  BLOCK_DONE_MESSAGE,
  BLOCK_DONE_TITLE,
  ERROR_REPORT_FAILED,
  REPORT_ACTION,
  REPORT_SENT_MESSAGE,
  REPORT_SENT_TITLE,
  UNBLOCK_ACTION,
  UNBLOCK_DONE_MESSAGE,
  UNBLOCK_DONE_TITLE,
} from '../constans/Constants';

/**
 * Report + block, shared by every screen that shows user-generated content
 * (App Store guideline 1.2). Gives you:
 *   - reportTarget / openReport / closeReport / submitReport → drive ReportContentModal
 *   - confirmBlock(user)   → confirmation, then hides their content everywhere
 *   - openModerationMenu() → the "…" menu with Report / Block
 *   - isBlocked(userId), blockedIds
 */
export const useModeration = () => {
  const dispatch = useDispatch();
  const { token } = useSelector(selectAuth);
  const blockedIds = useSelector(selectBlockedUserIds);

  const [reportTarget, setReportTarget] = useState(null);
  const [reporting, setReporting] = useState(false);

  const isBlocked = useCallback(
    userId => Boolean(userId) && blockedIds.includes(String(userId)),
    [blockedIds],
  );

  const openReport = useCallback(target => setReportTarget(target || null), []);
  const closeReport = useCallback(() => {
    if (!reporting) setReportTarget(null);
  }, [reporting]);

  const submitReport = useCallback(
    async ({ reason, note }) => {
      if (!reportTarget || reporting) return;
      setReporting(true);
      try {
        await reportContentApi(token, { ...reportTarget, reason, note });
        setReportTarget(null);
        Alert.alert(REPORT_SENT_TITLE, REPORT_SENT_MESSAGE);
      } catch (error) {
        Alert.alert('', getApiErrorMessage(error?.data, error?.message || ERROR_REPORT_FAILED));
      } finally {
        setReporting(false);
      }
    },
    [reportTarget, reporting, token],
  );

  /** Blocks immediately (content disappears) and notifies the team in the background. */
  const confirmBlock = useCallback(
    ({ userId, userName = '' } = {}) => {
      if (!userId) return;
      const id = String(userId);
      if (blockedIds.includes(id)) {
        dispatch(unblockUser(id));
        Alert.alert(UNBLOCK_DONE_TITLE, UNBLOCK_DONE_MESSAGE);
        return;
      }
      Alert.alert(BLOCK_CONFIRM_TITLE, BLOCK_CONFIRM_MESSAGE, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: BLOCK_ACTION,
          style: 'destructive',
          onPress: () => {
            dispatch(blockUser(id));
            notifyUserBlockedApi(token, { userId: id, userName }).catch(() => {});
            Alert.alert(BLOCK_DONE_TITLE, BLOCK_DONE_MESSAGE);
          },
        },
      ]);
    },
    [blockedIds, dispatch, token],
  );

  /**
   * Native action sheet with Report / Block. Android's Alert allows 3 buttons,
   * so Cancel is only added on iOS (back / tap-outside dismisses it there).
   */
  const openModerationMenu = useCallback(
    ({ userId, userName = '', ...target } = {}) => {
      const blocked = Boolean(userId) && blockedIds.includes(String(userId));
      const buttons = [
        { text: REPORT_ACTION, onPress: () => openReport({ ...target, userId, reportedUser: userName }) },
      ];
      if (userId) {
        buttons.push({
          text: blocked ? UNBLOCK_ACTION : BLOCK_ACTION,
          style: blocked ? 'default' : 'destructive',
          onPress: () => confirmBlock({ userId, userName }),
        });
      }
      buttons.push({ text: 'Cancel', style: 'cancel' });
      Alert.alert(target.title || userName || 'Options', undefined, buttons);
    },
    [blockedIds, confirmBlock, openReport],
  );

  return {
    blockedIds,
    isBlocked,
    reportTarget,
    reporting,
    openReport,
    closeReport,
    submitReport,
    confirmBlock,
    openModerationMenu,
  };
};
