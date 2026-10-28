export const initialState = Object.freeze({ activeGoal: null, selectedProject: null });

export function selectGoal(state, goalId, goals) {
  const goal = goals.find(item => item.id === goalId);
  if (!goal) return state;
  return state.activeGoal === goalId
    ? { ...initialState }
    : { activeGoal: goalId, selectedProject: goal.projects[0] };
}

export function selectProject(state, projectId, goals) {
  const goal = goals.find(item => item.id === state.activeGoal);
  return goal?.projects.includes(projectId) ? { ...state, selectedProject: projectId } : state;
}
