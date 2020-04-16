// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useMemo, useState } from 'react';
import { FieldProps } from '@bfc/extension';
import { FieldLabel, resolveFieldWidget, usePluginConfig } from '@bfc/adaptive-form';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import { JsonEditor } from '@bfc/code-editor';
import formatMessage from 'format-message';

import { ExpressionEditor } from './ExpressionEditor';
import { getOptions, getSelectedOption } from './utils';

const styles = {
  container: css`
    display: flex;
    justify-content: space-between;
    align-items: center;

    label: ExpressionField;
  `,
  field: css`
    min-height: 66px;
  `,
};

const ExpressionField: React.FC<FieldProps> = (props) => {
  const { id, value, label, description, schema, uiOptions, definitions } = props;
  const { $role, ...expressionSchema } = schema;
  const pluginConfig = usePluginConfig();

  const options = useMemo(() => getOptions(expressionSchema, definitions), []);
  const initialSelectedOption = useMemo(
    () => getSelectedOption(value, options) || ({ key: '', data: { schema: undefined } } as IDropdownOption),
    []
  );

  const [
    {
      key: selectedKey,
      data: { schema: selectedSchema },
    },
    setSelectedOption,
  ] = useState<IDropdownOption>(initialSelectedOption);

  const handleTypeChange = (_e: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    if (option && option.key !== selectedKey) {
      setSelectedOption(option);
      props.onChange(undefined);
    }
  };

  const renderTypeTitle = (options?: IDropdownOption[]) => {
    const option = options && options[0];
    return option ? <React.Fragment>{option.text}</React.Fragment> : null;
  };

  const renderField = () => {
    if (!selectedSchema || Array.isArray(selectedSchema.type) || !selectedSchema.type) {
      return null;
    }

    if (selectedKey === 'expression') {
      return <ExpressionEditor {...props} />;
    }

    // return a json editor for open ended obejcts
    if (
      (selectedSchema.type === 'object' && !selectedSchema.properties) ||
      (selectedSchema.type === 'array' && !selectedSchema.items)
    ) {
      const defaultValue = selectedSchema.type === 'object' ? {} : [];
      return (
        <JsonEditor
          height={100}
          id={props.id}
          key={selectedSchema.type}
          onChange={props.onChange}
          schema={selectedSchema}
          value={value || defaultValue}
        />
      );
    }

    const Field = resolveFieldWidget(selectedSchema, uiOptions, pluginConfig);
    return (
      <Field
        key={selectedSchema.type}
        {...props}
        css={{ label: 'ExpressionFieldValue' }}
        // allow object fields to render their labels
        label={selectedSchema.type !== 'object' ? false : undefined}
        schema={selectedSchema}
        transparentBorder={false}
      />
    );
  };

  const shouldRenderContainer = label || (options && options.length > 1);
  const dropdownWidth = useMemo(
    () => (options.reduce((maxLength, { text }) => Math.max(maxLength, text.length), 0) > 'expression'.length ? -1 : 0),
    [options]
  );

  return (
    <React.Fragment>
      {shouldRenderContainer && (
        <div css={styles.container}>
          <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} />
          {options && options.length > 1 && (
            <Dropdown
              ariaLabel={formatMessage('select property type')}
              data-testid={`expression-type-dropdown-${label}`}
              dropdownWidth={dropdownWidth}
              id={`${props.id}-type`}
              onChange={handleTypeChange}
              onRenderTitle={renderTypeTitle}
              options={options}
              responsiveMode={ResponsiveMode.large}
              selectedKey={selectedKey}
              styles={{
                caretDownWrapper: { height: '24px', lineHeight: '24px' },
                root: { flexBasis: 'auto', padding: '5px 0', minWidth: '110px' },
                title: { height: '24px', lineHeight: '20px' },
              }}
            />
          )}
        </div>
      )}
      {renderField()}
    </React.Fragment>
  );
};

export { ExpressionField };
