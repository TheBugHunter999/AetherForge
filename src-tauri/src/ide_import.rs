use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EditorImportResult {
    pub found: bool,
    pub source: String,
    pub settings_path: Option<String>,
    pub settings: serde_json::Value,
    pub extensions: Vec<ExtensionInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionInfo {
    pub id: String,
    pub name: String,
    pub version: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum EditorSource {
    VsCode,
    Cursor,
}

impl EditorSource {
    fn label(self) -> &'static str {
        match self {
            Self::VsCode => "vscode",
            Self::Cursor => "cursor",
        }
    }

    fn settings_path(self) -> Option<PathBuf> {
        let appdata = std::env::var("APPDATA").ok()?;
        let sub = match self {
            Self::VsCode => "Code",
            Self::Cursor => "Cursor",
        };
        Some(PathBuf::from(appdata).join(sub).join("User").join("settings.json"))
    }

    fn extensions_dir(self) -> Option<PathBuf> {
        let home = dirs::home_dir()?;
        let sub = match self {
            Self::VsCode => ".vscode",
            Self::Cursor => ".cursor",
        };
        Some(home.join(sub).join("extensions"))
    }
}

fn parse_source(source: &str) -> Result<EditorSource, String> {
    match source.trim().to_lowercase().as_str() {
        "vscode" | "vs-code" | "code" => Ok(EditorSource::VsCode),
        "cursor" => Ok(EditorSource::Cursor),
        _ => Err(format!("Unknown editor source: {source}")),
    }
}

fn read_json_file(path: &Path) -> Option<serde_json::Value> {
    let raw = fs::read_to_string(path).ok()?;
    serde_json::from_str(&raw).ok()
}

fn extension_display_name(folder_name: &str) -> (String, Option<String>) {
    let mut parts = folder_name.splitn(2, '-');
    let publisher = parts.next().unwrap_or("unknown").to_string();
    let rest = parts.next().unwrap_or(folder_name);
    let mut name_parts = rest.rsplitn(2, '-');
    let version = name_parts.next().map(|s| s.to_string());
    let name = name_parts.next().unwrap_or(rest).replace('-', " ");
    let id = format!("{publisher}.{name}");
    (id, version)
}

fn list_extensions(dir: &Path) -> Vec<ExtensionInfo> {
    let Ok(entries) = fs::read_dir(dir) else {
        return Vec::new();
    };

    let mut extensions = Vec::new();
    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }
        let folder_name = entry.file_name().to_string_lossy().to_string();
        if folder_name.starts_with('.') {
            continue;
        }

        let manifest_path = path.join("package.json");
        if let Ok(raw) = fs::read_to_string(&manifest_path) {
            if let Ok(manifest) = serde_json::from_str::<serde_json::Value>(&raw) {
                let id = manifest
                    .get("name")
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string())
                    .unwrap_or_else(|| folder_name.clone());
                let name = manifest
                    .get("displayName")
                    .or_else(|| manifest.get("name"))
                    .and_then(|v| v.as_str())
                    .unwrap_or(&folder_name)
                    .to_string();
                let version = manifest
                    .get("version")
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string());
                extensions.push(ExtensionInfo { id, name, version });
                continue;
            }
        }

        let (id, version) = extension_display_name(&folder_name);
        extensions.push(ExtensionInfo {
            name: id.clone(),
            id,
            version,
        });
    }

    extensions.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    extensions
}

pub fn read_editor_settings(source: String) -> Result<EditorImportResult, String> {
    let editor = parse_source(&source)?;
    let settings_path = editor.settings_path();
    let extensions_dir = editor.extensions_dir();

    let settings = settings_path
        .as_ref()
        .filter(|p| p.is_file())
        .and_then(|p| read_json_file(p))
        .unwrap_or(serde_json::Value::Object(Default::default()));

    let found = settings_path
        .as_ref()
        .map(|p| p.is_file())
        .unwrap_or(false)
        || extensions_dir
            .as_ref()
            .map(|p| p.is_dir())
            .unwrap_or(false);

    let extensions = extensions_dir
        .as_ref()
        .map(|dir| list_extensions(dir))
        .unwrap_or_default();

    Ok(EditorImportResult {
        found,
        source: editor.label().to_string(),
        settings_path: settings_path.map(|p| p.to_string_lossy().to_string()),
        settings,
        extensions,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_source_accepts_aliases() {
        assert_eq!(parse_source("vscode").unwrap(), EditorSource::VsCode);
        assert_eq!(parse_source("Cursor").unwrap(), EditorSource::Cursor);
        assert!(parse_source("unknown").is_err());
    }
}