import store from '../store';
import { moduleStorage } from './moduleStorage';

export default {
  register({ projectUuid, description }) {
    let projectDescriptions = JSON.parse(
      moduleStorage.getItem('project-descriptions') || '[]',
    );

    const projectDescription = projectDescriptions.find(
      ({ uuid }) => uuid === projectUuid,
    );

    if (projectDescription) {
      projectDescription.description = description;
      projectDescription.updatedAt = new Date();
    } else {
      projectDescriptions.push({
        uuid: projectUuid,
        description,
        updatedAt: new Date(),
      });
    }

    moduleStorage.setItem(
      'project-descriptions',
      JSON.stringify(projectDescriptions),
    );
  },

  project({ projectUuid }) {
    if (store.state.Project.currentProject?.uuid === projectUuid) {
      return store.state.Project.currentProject;
    }

    return store.state.Project.projects
      .map(({ data }) => data)
      .flat()
      .find(({ uuid }) => uuid === projectUuid);
  },

  isChanged({ projectUuid }) {
    let changed = false;

    let projectDescriptions = JSON.parse(
      moduleStorage.getItem('project-descriptions') || '[]',
    );

    const projectDescription = projectDescriptions.find(
      ({ uuid }) => uuid === projectUuid,
    );

    const project = this.project({ projectUuid });

    if (
      projectDescription &&
      project &&
      projectDescription.description !== project.description
    ) {
      project.description = projectDescription.description;
      changed = true;
    }

    const remove = projectDescriptions.filter(
      (projectDescription) =>
        (new Date() - new Date(projectDescription.updatedAt)) / 1000 > 6,
    );

    if (remove.length) {
      const final = projectDescriptions.filter(
        ({ uuid }) => !remove.some((toRemove) => toRemove.uuid === uuid),
      );

      if (final.length) {
        moduleStorage.setItem('project-descriptions', JSON.stringify(final));
      } else {
        moduleStorage.removeItem('project-descriptions');
      }
    }

    return changed;
  },
};
