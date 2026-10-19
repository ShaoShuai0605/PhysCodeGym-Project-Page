import type {CaseStudy, ModelArtifact} from './player';

export interface TaskStudy extends CaseStudy {
  aliases: string[];
  hasFailure: boolean;
}

// Group by the benchmark task identifier; never transfer scores between artifacts.
export function groupTasks(cases: CaseStudy[]): TaskStudy[] {
  const tasks = new Map<string, TaskStudy>();
  const neutral: Record<string, [string, string]> = {
    turbines: ['Two rotating turbines', 'Two turbines rotate in a landscape with trees.'],
    rolling_egg: ['A quail egg rolling past other eggs', 'A moving egg rolls past a group of resting eggs.'],
    wine: ['Wine pouring into a glass', 'A stream of wine enters a glass and raises the liquid level.'],
    astra_cradle: ["A Newton’s cradle in motion", 'Released pendulum balls swing and transfer motion through contact.'],
    deepseek_gripper: ['A gripper stacking blocks', 'A gripper handles and releases solid blocks.'],
    glm_basket: ['A ball and a basket', 'A ball interacts with a basket resting on a table.'],
    sonnet_ball: ['A rotating decorated ball', 'A decorated ball rotates above a supporting surface.'],
  };
  for (const c of cases) {
    let task = tasks.get(c.caseId);
    if (!task) {
      const [title, description] = neutral[c.id] ?? [c.title, c.description];
      task = {...c, title, description, kind: 'Task comparison', models: [], aliases: [], hasFailure: false, unavailable: []};
      delete task.evidence;
      tasks.set(c.caseId, task);
    }
    task.aliases.push(c.id);
    task.hasFailure ||= c.kind === 'Physical failure';
    task.unavailable!.push(...(c.unavailable ?? []));
    for (const m of c.models) {
      if (task.models.some(a => a.sha256 === m.sha256 && a.setting === m.setting)) continue;
      const artifact: ModelArtifact = {
        ...m, source: m.source ?? c.source, differences: m.differences ?? c.differences,
        evidence: m.evidence ?? c.evidence, studyTitle: c.kind === 'Physical failure' ? c.title : undefined,
      };
      task.models.push(artifact);
    }
  }
  return [...tasks.values()];
}
