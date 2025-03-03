import '@mantine/core/styles.css';

import React from 'react';
import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
import { AppMenu } from '../components/common/AppMenu';
import { theme } from '../theme';

export const metadata = {
  title: 'AIハンズオン',
  description: 'AIハンズオン学習教材',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <AppMenu>{children}</AppMenu>
        </MantineProvider>
      </body>
    </html>
  );
}
