import type { Project } from '../types/entities';

function startOfDayIso(date: Date): string {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString();
}

function endOfDayIso(date: Date): string {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy.toISOString();
}

export function compareProjectsByDate(left: Project, right: Project): number {
  const leftTime = new Date(left.date).getTime();
  const rightTime = new Date(right.date).getTime();

  if (leftTime !== rightTime) {
    return leftTime - rightTime;
  }

  return left.id - right.id;
}

export function sortProjectsByDate(projects: Project[]): Project[] {
  return [...projects].sort(compareProjectsByDate);
}

export function isProjectDateInPeriod(
  project: Project,
  fromDate?: Date | null,
  toDate?: Date | null,
): boolean {
  const projectTime = new Date(project.date).getTime();

  if (fromDate) {
    const fromTime = new Date(startOfDayIso(fromDate)).getTime();
    if (projectTime < fromTime) {
      return false;
    }
  }

  if (toDate) {
    const toTime = new Date(endOfDayIso(toDate)).getTime();
    if (projectTime > toTime) {
      return false;
    }
  }

  return true;
}

export function filterProjectsByFlags(
  projects: Project[],
  options: { finished?: boolean; liked?: boolean },
): Project[] {
  return projects.filter((project) => {
    if (options.finished !== undefined && project.finished !== options.finished) {
      return false;
    }

    if (options.liked !== undefined && project.liked !== options.liked) {
      return false;
    }

    return true;
  });
}
