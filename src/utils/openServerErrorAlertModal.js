import i18n from './plugins/i18n';

export const openServerErrorAlertModal = ({
  type = 'warn',
  title = i18n.t('alerts.server_problem.title'),
  description = i18n.t('alerts.server_problem.description'),
  openModal,
} = {}) => {
  let icon = null;
  let scheme = null;

  if (type === 'warn') {
    icon = 'alert-circle-1';
    scheme = 'feedback-yellow';
  } else if (type === 'danger') {
    icon = 'alert-circle-1';
    scheme = 'feedback-red';
  }

  openModal({
    type: 'alert',
    data: {
      icon,
      scheme,
      title,
      description,
    },
  });
};
