use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager};

const MAX_DROPPED_IMAGE_BYTES: usize = 25 * 1024 * 1024;
const IMAGE_EXTS: &[&str] = &["png", "jpg", "jpeg", "webp", "gif", "bmp", "svg"];

fn dropped_images_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_cache_dir()
        .map_err(|e| format!("Failed to resolve app cache directory: {e}"))?
        .join("terminal-dropped-images");
    fs::create_dir_all(&dir).map_err(|e| format!("Failed to create dropped image directory: {e}"))?;
    Ok(dir)
}

fn now_millis() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis())
        .unwrap_or(0)
}

fn clean_name_piece(input: &str) -> String {
    let cleaned: String = input
        .chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || c == '-' || c == '_' || c == '.' {
                c
            } else {
                '-'
            }
        })
        .collect();

    let trimmed = cleaned.trim_matches(['-', '.', '_']);
    if trimmed.is_empty() {
        "image".to_string()
    } else {
        trimmed.chars().take(80).collect()
    }
}

fn extension_from_mime(mime_type: Option<&str>) -> Option<&'static str> {
    let mime = mime_type?.to_ascii_lowercase();
    if mime.contains("png") {
        Some("png")
    } else if mime.contains("jpeg") || mime.contains("jpg") {
        Some("jpg")
    } else if mime.contains("webp") {
        Some("webp")
    } else if mime.contains("gif") {
        Some("gif")
    } else if mime.contains("bmp") {
        Some("bmp")
    } else if mime.contains("svg") {
        Some("svg")
    } else {
        None
    }
}

fn extension_from_name(name: Option<&str>) -> Option<String> {
    let ext = name?
        .rsplit_once('.')
        .map(|(_, ext)| ext.to_ascii_lowercase())?;
    if IMAGE_EXTS.contains(&ext.as_str()) {
        Some(ext)
    } else {
        None
    }
}

fn extension_from_url(url: &str) -> Option<String> {
    let without_query = url.split('?').next().unwrap_or(url);
    extension_from_name(Some(without_query))
}

fn looks_like_image(mime_type: Option<&str>, name: Option<&str>) -> bool {
    mime_type
        .map(|m| m.to_ascii_lowercase().starts_with("image/"))
        .unwrap_or(false)
        || extension_from_name(name).is_some()
}

fn write_image(app: AppHandle, file_name: Option<String>, mime_type: Option<String>, bytes: Vec<u8>) -> Result<String, String> {
    if bytes.is_empty() {
        return Err("Dropped image is empty".to_string());
    }
    if bytes.len() > MAX_DROPPED_IMAGE_BYTES {
        return Err(format!(
            "Dropped image is too large. Limit is {} MB.",
            MAX_DROPPED_IMAGE_BYTES / 1024 / 1024
        ));
    }
    if !looks_like_image(mime_type.as_deref(), file_name.as_deref()) {
        return Err("Dropped file does not look like an image".to_string());
    }

    let dir = dropped_images_dir(&app)?;
    let ext = extension_from_name(file_name.as_deref())
        .or_else(|| extension_from_mime(mime_type.as_deref()).map(str::to_string))
        .unwrap_or_else(|| "png".to_string());
    let base = file_name
        .as_deref()
        .and_then(|name| name.rsplit_once('.').map(|(base, _)| base).or(Some(name)))
        .map(clean_name_piece)
        .unwrap_or_else(|| "image".to_string());
    let file_path = dir.join(format!("{}-{}.{}", now_millis(), base, ext));
    fs::write(&file_path, bytes).map_err(|e| format!("Failed to save dropped image: {e}"))?;
    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn save_dropped_image(
    app: AppHandle,
    file_name: Option<String>,
    mime_type: Option<String>,
    bytes: Vec<u8>,
) -> Result<String, String> {
    write_image(app, file_name, mime_type, bytes)
}

#[tauri::command]
pub async fn download_dropped_image(app: AppHandle, url: String) -> Result<String, String> {
    let parsed = reqwest::Url::parse(&url).map_err(|e| format!("Invalid image URL: {e}"))?;
    match parsed.scheme() {
        "http" | "https" => {}
        _ => return Err("Only http and https image URLs can be downloaded".to_string()),
    }

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(25))
        .user_agent("Grokden image dropper")
        .build()
        .map_err(|e| format!("Failed to build download client: {e}"))?;

    let response = client
        .get(parsed.clone())
        .send()
        .await
        .map_err(|e| format!("Failed to download image: {e}"))?;

    if !response.status().is_success() {
        return Err(format!("Image download failed with status {}", response.status()));
    }

    if let Some(length) = response.content_length() {
        if length as usize > MAX_DROPPED_IMAGE_BYTES {
            return Err(format!(
                "Remote image is too large. Limit is {} MB.",
                MAX_DROPPED_IMAGE_BYTES / 1024 / 1024
            ));
        }
    }

    let content_type = response
        .headers()
        .get(reqwest::header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .map(|v| v.split(';').next().unwrap_or(v).trim().to_string());

    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("Failed to read downloaded image: {e}"))?;

    if bytes.len() > MAX_DROPPED_IMAGE_BYTES {
        return Err(format!(
            "Remote image is too large. Limit is {} MB.",
            MAX_DROPPED_IMAGE_BYTES / 1024 / 1024
        ));
    }

    let file_name = parsed
        .path_segments()
        .and_then(|mut parts| parts.next_back())
        .filter(|name| !name.trim().is_empty())
        .map(|name| name.to_string())
        .or_else(|| extension_from_url(&url).map(|ext| format!("remote-image.{ext}")))
        .or_else(|| extension_from_mime(content_type.as_deref()).map(|ext| format!("remote-image.{ext}")))
        .or_else(|| Some("remote-image.png".to_string()));

    write_image(app, file_name, content_type, bytes.to_vec())
}
