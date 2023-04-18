import i18n from './plugins/i18n';
import store from '../store';

export const openServerErrorAlertModal = (...argumments) => {
  openAlertModal(...argumments);
};

export const openAlertModal = ({
  type = 'warn',
  title = i18n.t('alerts.server_problem.title'),
  description = i18n.t('alerts.server_problem.description'),
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
    icon = 'check-circle-1-1';
    scheme = 'feedback-green';
  }

  store.dispatch('openModal', {
    type: 'alert',
    data: {
      icon,
      scheme,
      title,
      description,
    },
  });
};
