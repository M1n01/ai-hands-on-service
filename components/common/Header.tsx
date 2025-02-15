'use client';
import { Burger, Flex, Title} from '@mantine/core';

interface HeaderProps {
  opened: boolean;
  toggle: () => void;
}

export function Header({ opened, toggle }: HeaderProps) {

  return (
    <Flex mih={40} gap="sm" justify="flex-start" align="center" direction="row" wrap="wrap">
      <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
      <Title style={{ padding: '5px' }} order={1} size="h3">
        AIハンズオンサービス(仮)
      </Title>
    </Flex>
  );
}
