import { router } from 'expo-router';

export const navigateToScreen = (screenName: string) => {
  router.push(screenName);
};

export const goBack = () => {
  router.back();
};
