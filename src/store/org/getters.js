export default {
  getCurrentOrgId() {
    const org =  window.localStorage.getItem('org');
      try {
        const orgObject = JSON.parse(org);
        return orgObject.uuid;
      } catch(e) {
        return null;
      }
  },
};