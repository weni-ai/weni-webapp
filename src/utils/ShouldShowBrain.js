import getEnv from './env';

export default function ({ projectUuid, projectCreatedAt, userEmail }) {
  const projects = String(getEnv('BRAIN_IS_SHOWN_FOR_PROJECTS'));
  const projectsFrom = String(
    getEnv('BRAIN_IS_SHOWN_FOR_USER_MANAGED_PROJECTS_FROM'),
  );
  const users = String(getEnv('BRAIN_IS_SHOWN_FOR_USERS'));

  if (projects === '*' || projects.split(',').includes(projectUuid)) {
    return true;
  }

  if (
    projectsFrom &&
    new Date(projectCreatedAt) > new Date(projectsFrom) &&
    (users === '*' || users.split(',').includes(userEmail))
  ) {
    return true;
  }

  return false;
}
