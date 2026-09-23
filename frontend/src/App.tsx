import { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AppShell, Badge, Button, Container, Group, NumberInput, Paper, Stack, Text,
  Textarea, TextInput, Title, Alert, Loader, Divider,
} from '@mantine/core';

function skytKonfetti() {
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
}

type FormState = { claimDescription: string; coverage: string; deductible: string; proposedAmount: string; coffeeOffer: string };

const initial: FormState = {
  claimDescription: 'Kaffemaskinen eksploderte etter at skadebehandleren ignorerte tre varsellamper.',
  coverage: 'Inventar og løsøre', deductible: '2 000', proposedAmount: '18 500', coffeeOffer: '0',
};

export function App() {
  const [form, setForm] = useState(initial);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setReview(''); setError('');
    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          deductible: Number(form.deductible),
          proposedAmount: Number(form.proposedAmount),
          coffeeOffer: Number(form.coffeeOffer),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Noe gikk galt.');
      setReview(data.review);
      skytKonfetti();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Noe gikk galt.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell header={{ height: 64 }} padding="md">
      <AppShell.Header style={{ background: 'var(--mantine-color-gjensidige-6)', border: 'none' }}>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="xs">
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff' }} />
            <Text c="white" fw={700} tt="uppercase" size="sm" style={{ letterSpacing: '.08em' }}>
              Skadefryd / Intern kontroll
            </Text>
          </Group>
          <Badge color="dark" variant="filled">Nordnorsk kvalitetssikring</Badge>
        </Group>
      </AppShell.Header>

      <AppShell.Main bg="gray.0">
        <Container size="lg" py="xl">
          <Stack gap={4} mb="lg">
            <Text c="gjensidige.6" fw={700} tt="uppercase" size="sm">Bjarne vurderer ditt forslag</Text>
            <Title order={1} style={{ letterSpacing: '-0.03em' }}>
              Før du trykker <Text component="span" c="gjensidige.6" inherit>godkjenn.</Text>
            </Title>
            <Text c="dimmed" maw={560}>
              En fiktiv, overkvalifisert kontrollør som stopper erstatningsforslaget ditt før det gjør skade.
            </Text>
          </Stack>

          <Alert color="gjensidige" variant="light" mb="lg" title="Fiktiv demo">
            Dette påvirker ingen ekte skade, kunde eller lønn.
          </Alert>

          <Group align="flex-start" grow>
            <Paper component="form" onSubmit={submit} withBorder p="lg" radius="md">
              <Group mb="md" gap="xs">
                <Badge color="gjensidige" variant="light">01</Badge>
                <Title order={3}>Skadebehandlerens forslag</Title>
              </Group>
              <Stack>
                <Textarea
                  label="Hva skjedde?"
                  minRows={4}
                  value={form.claimDescription}
                  onChange={(e) => update('claimDescription', e.currentTarget.value)}
                />
                <TextInput
                  label="Dekning"
                  value={form.coverage}
                  onChange={(e) => update('coverage', e.currentTarget.value)}
                />
                <Group grow>
                  <NumberInput
                    label="Egenandel (kr)"
                    value={form.deductible}
                    onChange={(v) => update('deductible', String(v))}
                  />
                  <NumberInput
                    label="Foreslått beløp (kr)"
                    value={form.proposedAmount}
                    onChange={(v) => update('proposedAmount', String(v))}
                  />
                </Group>
                <NumberInput
                  label="Kaffetilbud til Bjarne (kr)"
                  value={form.coffeeOffer}
                  onChange={(v) => update('coffeeOffer', String(v))}
                />
                <Button type="submit" disabled={loading} color="gjensidige" fullWidth mt="sm">
                  {loading ? 'Bjarne sukker ...' : 'Send til kontroll →'}
                </Button>
              </Stack>
            </Paper>

            <Paper withBorder p="lg" radius="md" mih={480}>
              <Group mb="md" gap="xs">
                <Badge color="gjensidige" variant="light">02</Badge>
                <Title order={3}>Bjarnes avgjørelse</Title>
              </Group>

              {!review && !loading && (
                <Stack align="center" justify="center" h={300} c="dimmed">
                  <Text size="xl">?</Text>
                  <Text ta="center">Ingen beslutning er trygg før Bjarne har fått sagt sitt.</Text>
                  <Text size="xs">Fyll inn saken og send den til kontroll.</Text>
                </Stack>
              )}

              {loading && (
                <Stack align="center" justify="center" h={300} c="dimmed">
                  <Loader color="gjensidige" />
                  <Text ta="center">«La meg se på dette. Det burde du egentlig ha gjort selv.»</Text>
                  <Text size="xs">Bjarne regner på kaffe, inflasjon og din karriere.</Text>
                </Stack>
              )}

              {review && (
                <>
                  <Badge color="yellow" variant="filled" mb="sm">Stoppet</Badge>
                  <Divider mb="sm" />
                  <Text style={{ whiteSpace: 'pre-wrap' }} size="sm">{review}</Text>
                </>
              )}
            </Paper>
          </Group>

          {error && <Alert color="red" mt="lg" title="Feil">{error}</Alert>}

          <Text c="dimmed" size="xs" ta="center" mt="xl">
            Bjarne har ikke myndighet til å godkjenne eller avslå noe som helst. Han har bare veldig sterke meninger.
          </Text>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
