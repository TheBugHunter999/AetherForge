mod git;
mod index;
mod search;
mod types;

pub use index::WorkspaceState;
pub use types::{
    WorkspaceGitStatusMap, WorkspaceInfoDto, WorkspaceNodeDto, WorkspaceOpenResult,
    WorkspaceSearchHit,
};

use tauri::State;

#[tauri::command]
pub fn workspace_open(
    state: State<'_, WorkspaceState>,
    root: String,
    exclude_patterns: Option<Vec<String>>,
) -> Result<WorkspaceOpenResult, String> {
    state.open(root, exclude_patterns.unwrap_or_default())
}

#[tauri::command]
pub fn workspace_close(state: State<'_, WorkspaceState>) -> Result<(), String> {
    state.close();
    Ok(())
}

#[tauri::command]
pub fn workspace_get_info(state: State<'_, WorkspaceState>) -> Result<WorkspaceInfoDto, String> {
    Ok(state.get_info())
}

#[tauri::command]
pub fn workspace_children(
    state: State<'_, WorkspaceState>,
    parent_path: String,
) -> Result<Vec<WorkspaceNodeDto>, String> {
    state.children(parent_path)
}

#[tauri::command]
pub fn workspace_refresh(state: State<'_, WorkspaceState>) -> Result<WorkspaceInfoDto, String> {
    state.refresh()
}

#[tauri::command]
pub fn workspace_git_status(state: State<'_, WorkspaceState>) -> Result<WorkspaceGitStatusMap, String> {
    Ok(state.git_status_map())
}

#[tauri::command]
pub fn workspace_search_fuzzy(
    state: State<'_, WorkspaceState>,
    query: String,
    limit: Option<u32>,
) -> Result<Vec<WorkspaceSearchHit>, String> {
    Ok(state.search_fuzzy(query, limit.unwrap_or(50)))
}