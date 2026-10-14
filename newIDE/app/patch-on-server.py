#!/usr/bin/env python3
"""
Скопируйте этот файл на сервер и запустите из каталога newIDE/app:
  python3 patch-on-server.py

Применит правки: ResourceFetcher для LocalBrowserFile и убирает cloud-проверки в загрузчике.
"""
import os

BASE = "src"

def patch_browser_resource_fetcher():
    path = os.path.join(BASE, "ProjectsStorage", "ResourceFetcher", "BrowserResourceFetcher.js")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    if "LocalBrowserFileStorageProvider" in content:
        print("BrowserResourceFetcher.js: уже исправлен")
        return
    # Добавить импорт после UrlStorageProvider
    old = "import UrlStorageProvider from '../UrlStorageProvider';\nimport { fetchRelativeResourcesToFullUrls }"
    new = "import UrlStorageProvider from '../UrlStorageProvider';\nimport LocalBrowserFileStorageProvider from '../LocalBrowserFileStorageProvider';\nimport { fetchRelativeResourcesToFullUrls }"
    content = content.replace(old, new)
    # Добавить функцию и запись в fetchers
    old = "  [UrlStorageProvider.internalName]: fetchRelativeResourcesToFullUrls,\n};"
    new = "  [UrlStorageProvider.internalName]: fetchRelativeResourcesToFullUrls,\n  [LocalBrowserFileStorageProvider.internalName]: async () => ({ erroredResources: [] }),\n};"
    content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("BrowserResourceFetcher.js: исправлен")

def patch_file_to_cloud_uploader():
    path = os.path.join(BASE, "ResourcesList", "FileToCloudProjectResourceUploader.js")
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    if "authenticatedUser" not in "".join(lines) and "cloudProjectId" not in "".join(lines):
        print("FileToCloudProjectResourceUploader.js: уже исправлен")
        return
    out = []
    i = 0
    while i < len(lines):
        line = lines[i]
        # Пропустить импорт AuthenticatedUserContext
        if "AuthenticatedUserContext" in line and "import" in line:
            i += 1
            continue
        # Пропустить const authenticatedUser = ...
        if "const authenticatedUser = React.useContext" in line:
            i += 1
            continue
        if "const cloudProjectId = " in line:
            i += 1
            continue
        if "if (!cloudProjectId) return;" in line:
            i += 1
            continue
        # В массиве зависимостей убрать authenticatedUser и cloudProjectId
        if "authenticatedUser," in line or "cloudProjectId," in line:
            i += 1
            continue
        out.append(line)
        i += 1
    with open(path, "w", encoding="utf-8") as f:
        f.writelines(out)
    print("FileToCloudProjectResourceUploader.js: исправлен")

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    if not os.path.isdir(BASE):
        print("Запустите скрипт из каталога newIDE/app (где есть папка src)")
        exit(1)
    patch_browser_resource_fetcher()
    patch_file_to_cloud_uploader()
    print("Готово. Выполните: export NODE_OPTIONS='--max-old-space-size=8192' && npm run build")
