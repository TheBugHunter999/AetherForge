use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceNodeDto {
    pub name: String,
    pub path: String,
    pub parent_path: Option<String>,
    pub is_dir: bool,
    pub is_symlink: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceOpenResult {
    pub root: String,
    pub branch: Option<String>,
    pub changed_count: usize,
    pub children: Vec<WorkspaceNodeDto>,
    pub indexing: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceInfoDto {
    pub root: Option<String>,
    pub branch: Option<String>,
    pub changed_count: usize,
    pub indexing: bool,
    pub indexed_entries: usize,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceSearchHit {
    pub path: String,
    pub name: String,
    pub score: i32,
}

#[derive(Debug, Clone, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct GitStatusDto {
    pub path: String,
    pub status: String,
    pub orig_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceGitStatusMap {
    pub branch: Option<String>,
    pub changed_count: usize,
    pub entries: Vec<GitStatusDto>,
}