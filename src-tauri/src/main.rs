#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![read_file])
    .plugin(tauri_plugin_store::Builder::default().build())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

// #[tauri::command]
// async fn open_file_dialog() -> Result<String, String> {
//   // 打开选择文件夹 dialog
//   let path = tauri::api::dialog
//   Ok(path.to_string_lossy().to_string())
// }

#[tauri::command]
async fn read_file(path: std::path::PathBuf) -> String {
    // 读取文件内容，以文本字符串形式返回
    std::fs::read_to_string(path).unwrap()
}
