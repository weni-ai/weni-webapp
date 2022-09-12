import request from './request.js';

export default {
  profile() {
    return request.$http().get('v1/account/my-profile/');
  },
  updateProfile(profile) {
    return request.$http().put('v1/account/my-profile/', profile);
  },
  updatePicture(file) {
    var formData = new FormData();
    formData.append('file', file);

    return request
      .$http({ 'Content-Type': 'multipart/form-data' })
      .post('v1/account/my-profile/upload_photo/', formData);
  },
  updatePassword(password) {
    return request
      .$http()
      .post('v1/account/my-profile/change_password/', { password });
  },
  deletePicture() {
    return request.$http().delete('v1/account/my-profile/delete_photo/');
  },
  deleteProfile(password) {
    return request.$http().delete('v1/account/my-profile/', { password });
  },
  updateLanguage(language) {
    return request.$http().put('v1/account/my-profile/change_language/', {
      language,
    });
  },
  updateAccount2FAStatus(status, organization_uuid) {
    //THIS IS NEED TO MOVE TO ORG
    return request
      .$http()
      .patch(
        `v1/organization/org/enforce-two-factor-auth/${organization_uuid}/`,
        {
          '2fa_required': status,
        },
      );
  },
  updateAccountProfile2FAStatus(status) {
    return request
      .$http()
      .patch(`v1/account/my-profile/set_two_factor_authentication/`, {
        '2FA': status,
      });
  },
  addInitialData({ company, user }) {
    return request
      .$http()
      .post(`v1/account/my-profile/add_additional_information/`, {
        company: {
          name: 'weni',
          number_people: 10,
          sector: 'TI',
          weni_helps: 'Otimize tasks',
          segment: 'ii',
        },
        user: {
          phone: '+55082988526679',
        },
      });
  },
};
