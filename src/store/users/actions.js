import users from '../../api/users';

export default {
  searchUsers(store, { search }) {
    return users.search(search);
  }
};