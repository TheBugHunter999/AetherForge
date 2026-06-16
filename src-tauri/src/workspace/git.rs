use std::path::{Path, PathBuf};

use git2::{Repository, Status, StatusOptions};

use super::types::{GitStatusDto, WorkspaceGitStatusMap};

fn normalize_path(path: &Path) -> String {
    path.to_string_lossy().replace('\\', "/")
}

fn status_letter(status: Status) -> Option<char> {
    if status.is_conflicted() {
        return Some('!');
    }
    if status.is_index_new() {
        return Some('A');
    }
    if status.is_wt_new() {
        return Some('?');
    }
    if status.is_wt_deleted() || status.is_index_deleted() {
        return Some('D');
    }
    if status.is_wt_renamed() || status.is_index_renamed() {
        return Some('R');
    }
    if status.is_wt_modified()
        || status.is_index_modified()
        || status.is_wt_typechange()
        || status.is_index_typechange()
    {
        return Some('M');
    }
    None
}

pub fn collect_git_status(workspace_root: &Path) -> Result<WorkspaceGitStatusMap, String> {
    let repo = match Repository::discover(workspace_root) {
        Ok(repo) => repo,
        Err(_) => {
            return Ok(WorkspaceGitStatusMap {
                branch: None,
                changed_count: 0,
                entries: Vec::new(),
            });
        }
    };

    let branch = repo
        .head()
        .ok()
        .and_then(|head| head.shorthand().map(|s| s.to_string()));

    let mut opts = StatusOptions::new();
    opts.include_untracked(true)
        .recurse_untracked_dirs(true)
        .renames_head_to_index(true)
        .renames_index_to_workdir(true);

    let statuses = repo
        .statuses(Some(&mut opts))
        .map_err(|e| format!("Git status failed: {e}"))?;

    let mut entries = Vec::new();
    for entry in statuses.iter() {
        let status = entry.status();
        let Some(letter) = status_letter(status) else {
            continue;
        };
        let path_str = entry
            .path()
            .map(|p| p.replace('\\', "/"))
            .unwrap_or_default();
        if path_str.is_empty() {
            continue;
        }
        let full_path = workspace_root.join(&path_str);
        let orig_path = entry
            .head_to_index()
            .and_then(|diff| diff.old_file().path())
            .map(|p| normalize_path(&workspace_root.join(p.to_string_lossy().as_ref())));

        entries.push(GitStatusDto {
            path: normalize_path(&full_path),
            status: letter.to_string(),
            orig_path,
        });
    }

    let changed_count = entries.len();
    Ok(WorkspaceGitStatusMap {
        branch,
        changed_count,
        entries,
    })
}

pub fn find_git_root(start: &Path) -> Option<PathBuf> {
    Repository::discover(start).ok().map(|repo| repo.workdir().unwrap_or(start).to_path_buf())
}