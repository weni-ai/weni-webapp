import store from '../store';

export default {
  register({ projectUuid, description }) {
    let projectDescriptions = JSON.parse(
      localStorage.getItem('project-descriptions') || '[]',
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

    localStorage.setItem(
      'project-descriptions',
      JSON.stringify(projectDescriptions),
    );
  },

  project({ projectUuid }) {
    return store.state.Project.projects
      .map(({ data }) => data)
      .flat()
      .find(({ uuid }) => uuid === projectUuid);
  },

  isChanged({ projectUuid }) {
    let changed = false;

    let projectDescriptions = JSON.parse(
      localStorage.getItem('project-descriptions') || '[]',
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
        localStorage.setItem('project-descriptions', JSON.stringify(final));
      } else {
        localStorage.removeItem('project-descriptions');
      }
    }

    return changed;
  },
};
