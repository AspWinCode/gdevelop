// @flow
import { t } from '@lingui/macro';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import { type FileMetadata, type SaveAsLocation } from '../index';
import { serializeToJSObject } from '../../Utils/Serializer';
import {
  archiveFiles,
  type BlobFileDescriptor,
  type TextFileDescriptor,
} from '../../Utils/BrowserArchiver';
import { downloadResourcesAsBlobs } from '../DownloadFileStorageProvider/DownloadFileSaveAsDialog';
import { openBlobDownloadUrl } from '../../Utils/BlobDownloadUrlHolder';

const gd: libGDevelop = global.gd;

const PROJECT_JSON_FILENAME = 'game.json';

const buildAndDownloadZip = async (project: gdProject): Promise<string> => {
  const newProject = gd.ProjectHelper.createNewGDJSProject();
  try {
    const serializedProject = new gd.SerializerElement();
    project.serializeTo(serializedProject);
    newProject.unserializeFrom(serializedProject);
    serializedProject.delete();

    const blobFiles: Array<BlobFileDescriptor> = [];
    const textFiles: Array<TextFileDescriptor> = [];

    await downloadResourcesAsBlobs({
      project: newProject,
      onAddBlobFile: (blobFileDescriptor: BlobFileDescriptor) => {
        blobFiles.push(blobFileDescriptor);
      },
      onProgress: () => {},
    });

    textFiles.push({
      text: JSON.stringify(serializeToJSObject(newProject)),
      filePath: PROJECT_JSON_FILENAME,
    });

    const zippedBlob = await archiveFiles({
      textFiles,
      blobFiles,
      basePath: '/',
      onProgress: () => {},
    });

    const projectName = project.getName() || 'gdevelop-game';
    const safeName = projectName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${safeName}.zip`;

    const url = URL.createObjectURL(zippedBlob);
    openBlobDownloadUrl(url, filename);
    setTimeout(() => URL.revokeObjectURL(url), 10000);

    return filename;
  } finally {
    newProject.delete();
  }
};

export const onSaveProject = async (
  project: gdProject,
  fileMetadata: FileMetadata
): Promise<{| wasSaved: boolean, fileMetadata: FileMetadata |}> => {
  const filename = await buildAndDownloadZip(project);
  return {
    wasSaved: true,
    fileMetadata: { fileIdentifier: filename },
  };
};

export const onSaveProjectAs = async (
  project: gdProject,
  saveAsLocation: ?SaveAsLocation,
  options: {|
    onStartSaving: () => void,
    onMoveResources: ({| newFileMetadata: FileMetadata |}) => Promise<void>,
  |}
): Promise<{| wasSaved: boolean, fileMetadata: ?FileMetadata |}> => {
  options.onStartSaving();
  const filename = await buildAndDownloadZip(project);
  return {
    wasSaved: true,
    fileMetadata: { fileIdentifier: filename },
  };
};

export const getWriteErrorMessage = (error: Error): MessageDescriptor =>
  t`An error occurred when saving the project. Please try again.`;
