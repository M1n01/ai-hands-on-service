'use client';

import { useState } from 'react';
import { Button, Container, Group, List, Notification, TextInput, Title } from '@mantine/core';

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [subdirectories, setSubdirectories] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubdirectories([]);
    setLoading(true);
    try {
      const res = await fetch('/api/parse-sitemap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '生成エラー');
      }
      setSubdirectories(data.subdirectories);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('予期せぬエラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePdfGenerate = async () => {
    if (subdirectories.length === 0) {
      return;
    }
    setGeneratingPdf(true);
    try {
      const response = await fetch('/api/convert-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: subdirectories }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'PDF生成エラー');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated-document.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('予期せぬエラーが発生しました');
      }
    } finally {
      setGeneratingPdf(false);
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
          <Group mt="md">
            <Button
              onClick={handlePdfGenerate}
              loading={generatingPdf}
              disabled={subdirectories.length === 0}
            >
              PDFを生成
            </Button>
          </Group>
        </Container>
      )}
    </Container>
  );
}
