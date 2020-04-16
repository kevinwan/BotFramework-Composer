// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FormEvent, useContext, useState } from 'react';
import formatMessage from 'format-message';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

import { addSkillDialog } from '../../constants';
import { DialogWrapper } from '../../components/DialogWrapper/index';
import { ISkillFormData, ISkillFormDataErrors, SkillUrlRegex } from '../skills/types';
import { StorageFolder } from '../../store/types';
import { StoreContext } from '../../store';

import { manifestUrl, styles as wizardStyles } from './styles';

interface CreateDialogModalProps {
  focusedStorageFolder?: StorageFolder;
  isOpen: boolean;
  onCurrentPathUpdate?: (newPath?: string, storageId?: string) => void;
  onDismiss: () => void;
  onSubmit: (skillFormData: ISkillFormData) => void;
}

export const AddSkillDialog: React.FC<CreateDialogModalProps> = (props) => {
  const { state } = useContext(StoreContext);
  const { skills } = state;
  const { isOpen, onDismiss, onSubmit } = props;
  const [formData, setFormData] = useState<ISkillFormData>({ manifestUrl: '' });
  const [formDataErrors, setFormDataErrors] = useState<ISkillFormDataErrors>({});

  const updateForm = (field: string) => (e: FormEvent, newValue: string | undefined) => {
    const newData = {
      ...formData,
      [field]: newValue,
    };
    validateForm(newData);
    setFormData(newData);
  };

  const validateForm = (newData: ISkillFormData) => {
    const errors: ISkillFormDataErrors = {};
    const { manifestUrl } = newData;

    if (manifestUrl) {
      if (!SkillUrlRegex.test(manifestUrl)) {
        errors.manifestUrl = formatMessage('Url should start with http[s]://');
      }
      if ((skills || []).some((skill) => skill.manifestUrl === manifestUrl)) {
        errors.manifestUrl = formatMessage('Duplicate skill manifest Url');
      }
    } else {
      errors.manifestUrl = formatMessage('Please input a manifest Url');
    }
    setFormDataErrors(errors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.keys(formDataErrors).length > 0) {
      return;
    }

    onSubmit({
      ...formData,
    });
  };

  return (
    <DialogWrapper isOpen={isOpen} onDismiss={onDismiss} {...addSkillDialog.SKILL_MANIFEST_FORM}>
      <form onSubmit={handleSubmit}>
        <input style={{ display: 'none' }} type="submit" />
        <Stack styles={wizardStyles.stackinput} tokens={{ childrenGap: '2rem' }}>
          <StackItem grow={0} styles={wizardStyles.halfstack}>
            <TextField
              errorMessage={formDataErrors.manifestUrl}
              label={formatMessage('Skill manifest Url')}
              onChange={updateForm('manifestUrl')}
              required
              styles={manifestUrl}
              value={formData.manifestUrl}
            />
          </StackItem>
        </Stack>
        <DialogFooter>
          <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
          <PrimaryButton onClick={handleSubmit} text={formatMessage('Next')} />
        </DialogFooter>
      </form>
    </DialogWrapper>
  );
};
