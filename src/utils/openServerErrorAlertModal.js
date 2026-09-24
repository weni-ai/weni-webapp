import i18n from './plugins/i18n';
import { useModalStore } from '@/store/modal';

export const openServerErrorAlertModal = (...argumments) => {
  openAlertModal(...argumments);
};

export const openAlertModal = ({
  type = 'warn',
  title = i18n.global.t('alerts.server_problem.title'),
  description = i18n.global.t('alerts.server_problem.description'),
} = {}) => {
  let icon = null;
  let scheme = null;

  if (type === 'warn') {
    icon = 'alert-circle-1';
    scheme = 'feedback-yellow';
  } else if (type === 'danger') {
    icon = 'alert-circle-1';
    scheme = 'feedback-red';
  } else {
    icon = 'check_circle';
    scheme = 'feedback-green';
  }

  useModalStore().openModal({
    type: 'alert',
    data: {
      icon,
      scheme,
      title,
      description,
    },
  });
};
