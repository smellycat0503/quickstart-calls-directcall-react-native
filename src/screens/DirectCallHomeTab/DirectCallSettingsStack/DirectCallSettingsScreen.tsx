import React from 'react';

import { SendbirdCalls } from '@sendbird/calls-react-native';

import { DirectRoutes } from '../../../navigations/routes';
import { useDirectNavigation } from '../../../navigations/useDirectNavigation';
import AuthManager from '../../../libs/AuthManager';
import TokenManager from '../../../libs/TokenManager';
import { useAuthContext } from '../../../contexts/AuthContext';
import SettingsView from '../../../components/SettingsView';

const DirectCallSettingsScreen = () => {
  const { navigation } = useDirectNavigation<DirectRoutes.SETTINGS>();
  const { currentUser, setCurrentUser } = useAuthContext();

  if (!currentUser) return null;

  const unregisterToken = async () => {
    const token = await TokenManager.get();
    if (token) {
      switch (token.type) {
        case 'apns':
        case 'fcm': {
          await SendbirdCalls.unregisterPushToken(token.value);
          break;
        }
        case 'voip': {
          await SendbirdCalls.ios_unregisterVoIPPushToken(token.value);
          break;
        }
      }
      await TokenManager.set(null);
    }
  };

  const deauthenticate = async () => {
    await Promise.all([AuthManager.deAuthenticate(), SendbirdCalls.deauthenticate()]);
    setCurrentUser(undefined);
  };

  return (
    <SettingsView
      userId={currentUser.userId}
      nickname={currentUser.nickname}
      profileUrl={currentUser.profileUrl}
      onPressApplicationInformation={() => navigation.navigate(DirectRoutes.APP_INFO)}
      onPressSignOut={() => Promise.all([unregisterToken(), deauthenticate()])}
    />
  );
};

export default DirectCallSettingsScreen;
