'use client';

import { useState } from 'react';
import { Button, Container, Notification, TextInput, Title } from '@mantine/core';

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [tutorial, setTutorial] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTutorial('');
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || '生成エラー');
      }
      const data = await res.json();
      setTutorial(data.tutorial);
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
      {tutorial && (
        <Container mt="xl">
          <Title order={3}>生成された教材</Title>
          <div>{tutorial}</div>
        </Container>
      )}
    </Container>
  );
}
