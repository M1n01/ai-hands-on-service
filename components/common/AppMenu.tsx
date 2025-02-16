'use client';

import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Header } from './Header';

export function AppMenu({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <AppShell header={{ height: 50 }} padding="md">
      <AppShell.Header style={{ padding: '5px' }}>
        <Header opened={opened} toggle={toggle} />
      </AppShell.Header>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
