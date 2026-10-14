// @flow
import { t } from '@lingui/macro';
import { initializeZipJs } from '../../Utils/Zip.js';
import { type FileMetadata } from '../index';

/**
 * Show a file picker for .json or .zip project files and return the chosen File.
 */
const pickProjectFile = (): Promise<?File> => {
  return new Promise(resolve => {
    if (window.showOpenFilePicker) {
      window
        .showOpenFilePicker({
          types: [
            {
              description: 'GDevelop Project',
              accept: {
                'application/json': ['.json'],
                'application/zip': ['.zip'],
              },
            },
          ],
          excludeAcceptAllOption: false,
          multiple: false,
        })
        .then(handles => {
          if (!handles || !handles.length) return resolve(null);
          handles[0].getFile().then(file => resolve(file));
        })
        .catch(() => resolve(null));
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,.zip';
      input.onchange = e => {
        const files = e.target.files;
        if (!files || !files.length) return resolve(null);
        resolve(files[0]);
      };

      const onFocusBack = () => {
        window.removeEventListener('focus', onFocusBack);
        if (document.body) {
          document.body.addEventListener('pointermove', onDialogClosed);
        }
      };
      const onDialogClosed = () => {
        if (document.body) {
          document.body.removeEventListener('pointermove', onDialogClosed);
        }
        if (!input.files || !input.files.length) resolve(null);
      };
      window.addEventListener('focus', onFocusBack);
      input.click();
    }
  });
};

/**
 * Read a .zip file, find game.json inside, and return its parsed content.
 */
const readProjectFromZip = async (file: File): Promise<Object> => {
  const zipJs: ZipJs = await initializeZipJs();
  const blob = file;

  return new Promise((resolve, reject) => {
    zipJs.createReader(
      new zipJs.BlobReader(blob),
      reader => {
        reader.getEntries(entries => {
          const gameJsonEntry = entries.find(
            e => e.filename === 'game.json' || e.filename.endsWith('/game.json')
          );
          if (!gameJsonEntry) {
            reader.close();
            reject(
              new Error(
                'No game.json found in the zip archive. Make sure the zip contains a valid GDevelop project.'
              )
            );
            return;
          }

          gameJsonEntry.getData(new zipJs.TextWriter(), text => {
            reader.close();
            try {
              resolve(JSON.parse(text));
            } catch (e) {
              reject(new Error('game.json in the zip is not valid JSON.'));
            }
          });
        });
      },
      error => {
        reject(new Error('Unable to read the zip file: ' + (error.message || error)));
      }
    );
  });
};

export const onOpenWithPicker = async (): Promise<?FileMetadata> => {
  const file = await pickProjectFile();
  if (!file) return null;

  return {
    fileIdentifier: file.name,
  };
};

/**
 * Open a project file (.json or .zip) and return its content.
 * We store the last picked file so that `onOpen` can re-read it.
 */
let _lastPickedFile: ?File = null;

export const onOpenWithPickerAndContent = async (): Promise<
  ?{| fileMetadata: FileMetadata, content: Object |}
> => {
  const file = await pickProjectFile();
  if (!file) return null;

  _lastPickedFile = file;
  const content = await readFileContent(file);
  return {
    fileMetadata: { fileIdentifier: file.name },
    content,
  };
};

const readFileContent = async (file: File): Promise<Object> => {
  const name = file.name.toLowerCase();
  if (name.endsWith('.zip')) {
    return readProjectFromZip(file);
  }

  const text = await file.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('The file is not valid JSON.');
  }
};

export const onOpen = async (
  fileMetadata: FileMetadata
): Promise<{| content: Object |}> => {
  if (_lastPickedFile && _lastPickedFile.name === fileMetadata.fileIdentifier) {
    const content = await readFileContent(_lastPickedFile);
    return { content };
  }

  throw new Error(
    'Cannot re-open a browser-local file. Please use "Open" to pick the file again.'
  );
};

export const getOpenErrorMessage = () =>
  t`An error occurred when opening the project. Check that the file is a valid GDevelop project (.json or .zip).`;
