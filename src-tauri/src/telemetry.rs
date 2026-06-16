use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use std::sync::LazyLock;
use tauri::{AppHandle, Manager};

const BLOCKED_KEYS: &[&str] = &[
    "path",
    "filepath",
    "file_path",
    "prompt",
    "content",
    "command",
    "cwd",
    "password",
    "token",
    "secret",
    "api_key",
    "apikey",
];

static TELEMETRY_ENABLED: LazyLock<Mutex<bool>> = LazyLock::new(|| Mutex::new(false));

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TelemetryStorageInfo {
    pub enabled: bool,
    pub directory: String,
    pub events_file: String,
    pub event_count: u64,
    pub file_size_bytes: u64,
}

#[derive(Debug, Serialize)]
struct TelemetryEvent {
    ts: String,
    event: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    properties: Option<serde_json::Value>,
}

fn telemetry_dir(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_local_data_dir()
        .map_err(|e| format!("Failed to resolve app data dir: {e}"))
        .map(|dir| dir.join("telemetry"))
}

fn events_file_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(telemetry_dir(app)?.join("events.jsonl"))
}

fn is_blocked_key(key: &str) -> bool {
    let lower = key.to_lowercase();
    BLOCKED_KEYS.iter().any(|blocked| lower.contains(blocked))
}

fn sanitize_properties(value: Option<serde_json::Value>) -> Option<serde_json::Value> {
    let serde_json::Value::Object(map) = value? else {
        return None;
    };

    let mut sanitized = serde_json::Map::new();
    for (key, val) in map {
        if is_blocked_key(&key) {
            continue;
        }
        if let serde_json::Value::String(s) = &val {
            if s.len() > 200 {
                continue;
            }
        }
        sanitized.insert(key, val);
    }

    if sanitized.is_empty() {
        None
    } else {
        Some(serde_json::Value::Object(sanitized))
    }
}

fn count_lines(path: &PathBuf) -> u64 {
    fs::read_to_string(path)
        .map(|content| content.lines().filter(|line| !line.trim().is_empty()).count() as u64)
        .unwrap_or(0)
}

pub fn set_enabled(enabled: bool) {
    *TELEMETRY_ENABLED.lock() = enabled;
}

pub fn is_enabled() -> bool {
    *TELEMETRY_ENABLED.lock()
}

pub fn storage_info(app: &AppHandle) -> Result<TelemetryStorageInfo, String> {
    let dir = telemetry_dir(app)?;
    let events_file = events_file_path(app)?;
    let file_size_bytes = fs::metadata(&events_file).map(|m| m.len()).unwrap_or(0);
    let event_count = if events_file.is_file() {
        count_lines(&events_file)
    } else {
        0
    };

    Ok(TelemetryStorageInfo {
        enabled: is_enabled(),
        directory: dir.to_string_lossy().to_string(),
        events_file: events_file.to_string_lossy().to_string(),
        event_count,
        file_size_bytes,
    })
}

pub fn record_event(
    app: &AppHandle,
    event: String,
    properties: Option<serde_json::Value>,
) -> Result<(), String> {
    if !is_enabled() {
        return Ok(());
    }

    let dir = telemetry_dir(app)?;
    fs::create_dir_all(&dir).map_err(|e| format!("Failed to create telemetry dir: {e}"))?;

    let entry = TelemetryEvent {
        ts: chrono_lite_timestamp(),
        event: event.trim().to_string(),
        properties: sanitize_properties(properties),
    };

    let line = serde_json::to_string(&entry).map_err(|e| format!("Failed to encode event: {e}"))?;
    let path = events_file_path(app)?;
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .map_err(|e| format!("Failed to open telemetry file: {e}"))?;
    writeln!(file, "{line}").map_err(|e| format!("Failed to write telemetry event: {e}"))?;
    Ok(())
}

pub fn clear_events(app: &AppHandle) -> Result<(), String> {
    let path = events_file_path(app)?;
    if path.is_file() {
        fs::remove_file(&path).map_err(|e| format!("Failed to clear telemetry: {e}"))?;
    }
    Ok(())
}

fn chrono_lite_timestamp() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    format!("{secs}")
}