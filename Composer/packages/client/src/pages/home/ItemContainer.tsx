// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, SerializedStyles } from '@emotion/core';
import React from 'react';
import { Button, IButtonProps } from 'office-ui-fabric-react/lib/Button';
import { Text } from 'office-ui-fabric-react/lib/Text';

import {
  itemContainerWrapper,
  itemContainer,
  itemContainerContent,
  itemContainerTitle,
  disabledItem,
  childrenContainer,
} from './styles';

const { openExternal: openExternalLink } = window as Window;

interface ItemContainerProps extends Omit<IButtonProps, 'onChange' | 'styles' | 'title'> {
  onClick?: () => void | Promise<void>;
  title: string | JSX.Element;
  subContent?: string;
  content: string;
  styles?: {
    container?: SerializedStyles;
    title?: SerializedStyles;
    content?: SerializedStyles;
  };
  disabled?: boolean;
  forwardedRef?: (project: any) => void | Promise<void>;
  openExternal?: boolean;
}

export const ItemContainer: React.FC<ItemContainerProps> = ({
  onClick = undefined,
  title,
  content,
  subContent,
  styles = {},
  disabled,
  forwardedRef,
  openExternal,
  ...rest
}) => {
  const onRenderChildren = () => {
    return (
      <div css={childrenContainer} ref={forwardedRef}>
        <div css={[itemContainer, styles.title, disabled ? disabledItem.title : undefined]}>
          <div css={itemContainerTitle}>
            <Text block variant="large">
              {title}
            </Text>
          </div>
        </div>
        <div css={[itemContainer, styles.content, disabled ? disabledItem.content : undefined]}>
          <div css={itemContainerContent}>
            <Text variant={subContent ? 'medium' : 'large'} nowrap>
              {content}
            </Text>
            {subContent && (
              <Text variant="medium" nowrap>
                {subContent}
              </Text>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Button
      css={[itemContainerWrapper(disabled), styles.container]}
      onClick={async e => {
        // todo: clean this up
        const { href } = rest as Partial<{ href: string }>;
        if (openExternal) {
          e.preventDefault();
          return openExternalLink(href, { activate: true });
        } else if (onClick && !href) {
          e.preventDefault();
          await onClick();
        }
      }}
      {...rest}
      onRenderChildren={onRenderChildren}
      disabled={disabled}
    />
  );
};
