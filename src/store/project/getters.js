export default {
  getCurrentProject() {
    const object = window.localStorage.getItem('project');
    if (object) return JSON.parse(object);
    return null;
  },
};