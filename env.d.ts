/// <reference types="vite/client" />

// 扩展 Window 接口，添加 File System Access API
interface Window {
  showOpenFilePicker?(options?: OpenFilePickerOptions): Promise<FileSystemFileHandle[]>;
  showSaveFilePicker?(options?: SaveFilePickerOptions): Promise<FileSystemFileHandle>;
  showDirectoryPicker?(options?: DirectoryPickerOptions): Promise<FileSystemDirectoryHandle>;
  AppGeneratorH5RuntimeLib?: {
      init?: () => void;
  };
  // Aegis V2 前端监控 SDK（运行时由外部脚本注入，使用前需判空）
  aegisV2?: {
    error: (err: unknown) => void;
  };
}

interface OpenFilePickerOptions {
  multiple?: boolean;
  excludeAcceptAllOption?: boolean;
  types?: FilePickerAcceptType[];
}

interface SaveFilePickerOptions {
  excludeAcceptAllOption?: boolean;
  suggestedName?: string;
  types?: FilePickerAcceptType[];
}

interface DirectoryPickerOptions {
  id?: string;
  mode?: 'read' | 'readwrite';
  startIn?: FileSystemHandle | string;
}

interface FilePickerAcceptType {
  description?: string;
  accept: Record<string, string[]>;
}

// 扩展 Navigator 接口，添加 Contact Picker API
interface Navigator {
  contacts?: ContactsManager;
}

interface ContactsManager {
  select(properties: string[], options?: ContactsSelectOptions): Promise<ContactInfo[]>;
  getProperties(): Promise<string[]>;
}

interface ContactsSelectOptions {
  multiple?: boolean;
}

interface ContactInfo {
  name?: string[];
  email?: string[];
  tel?: string[];
  address?: ContactAddress[];
  icon?: Blob[];
}
