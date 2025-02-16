'use client';

import { useState } from 'react';
import { Button, Container, List, Notification, TextInput, Title } from '@mantine/core';

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [subdirectories, setSubdirectories] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubdirectories([]);
    setLoading(true);
    try {
      const res = await fetch('/api/sitemap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || '生成エラー');
      }
      const data = await res.json();
      setSubdirectories(data.subdirectories);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <form onSubmit={handleSubmit}>
        <TextInput
          label="公式ドキュメントURL"
          placeholder="https://example.com/docs"
          value={url}
          onChange={(e) => setUrl(e.currentTarget.value)}
          required
        />
        <Button type="submit" loading={loading} mt="md">
          生成
        </Button>
      </form>
      {error && (
        <Notification color="red" mt="md">
          {error}
        </Notification>
      )}
      {subdirectories.length > 0 && (
        <Container mt="xl">
          <Title order={3}>生成されたサブディレクトリ</Title>
          <List>
            {subdirectories.map((subdirectory, index) => (
              <List.Item key={index}>{subdirectory}</List.Item>
            ))}
          </List>
        </Container>
      )}
    </Container>
  );
}
