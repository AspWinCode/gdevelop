// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { type StorageProvider, type FileMetadata } from '../index';
import Computer from '../../UI/CustomSvgIcons/Computer';
import {
  onOpenWithPickerAndContent,
  onOpen,
  getOpenErrorMessage,
} from './LocalBrowserProjectOpener';
import {
  onSaveProject,
  onSaveProjectAs,
  getWriteErrorMessage,
} from './LocalBrowserProjectWriter';

/**
 * Storage provider for the browser that opens projects from local
 * files (.json or .zip) via a file picker and saves them back as
 * a zip download.
 */
export default ({
  internalName: 'LocalBrowserFile',
  name: t`Your computer`,
  renderIcon: props => <Computer fontSize={props.size} />,
  createOperations: () => ({
    onOpenWithPicker: async (): Promise<?FileMetadata> => {
      const result = await onOpenWithPickerAndContent();
      if (!result) return null;

      _lastOpenedContent = result.content;
      return result.fileMetadata;
    },
    onOpen: async (fileMetadata: FileMetadata) => {
      if (_lastOpenedContent) {
        const content = _lastOpenedContent;
        _lastOpenedContent = null;
        return { content };
      }
      return onOpen(fileMetadata);
    },
    getOpenErrorMessage,
    onSaveProject,
    onSaveProjectAs,
    getWriteErrorMessage,
  }),
}: StorageProvider);

let _lastOpenedContent: ?Object = null;
