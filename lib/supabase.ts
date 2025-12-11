import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Mock data for development
const MOCK_NOTES = [
  {
    id: '1',
    title: 'Contract Law Basics',
    category: 'Contracts',
    created_at: new Date().toISOString(),
    content_markdown: `# Contract Law Basics

## Offer and Acceptance
A contract requires an offer and an acceptance.

### The Offer
An offer is an expression of willingness to contract on certain terms, made with the intention that it shall become binding as soon as it is accepted by the person to whom it is addressed.

### The Acceptance
Acceptance must be a final and unqualified expression of assent to the terms of an offer.

## Consideration
Consideration is the price one pays for another's promise. It can take the form of money, property, a promise, or some act or forbearance.
`
  },
  {
    id: '2',
    title: 'Torts: Negligence',
    category: 'Torts',
    created_at: new Date().toISOString(),
    content_markdown: `# Torts: Negligence

## Duty of Care
The plaintiff must show that the defendant owed them a duty of care.

## Breach of Duty
The defendant must have breached that duty by failing to act as a reasonable person would have in similar circumstances.

## Causation
The breach must have caused the plaintiff's injury.
`
  }
];

// Mock client implementation
const mockClient = {
  from: (table: string) => ({
    select: (columns: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          console.log(`Mock single: table=${table}, column=${column}, value=${value}`);
          if (table === 'notes' && column === 'id') {
            const note = MOCK_NOTES.find(n => n.id === value);
            console.log('Mock single found note:', note);
            return { data: note, error: note ? null : { message: 'Not found' } };
          }
          console.log('Mock single conditions not met');
          return { data: null, error: null };
        },
        order: (col: string, opts: any) => ({
          data: MOCK_NOTES.filter(n => n.category === value)
        })
      }),
      order: (col: string, opts: any) => {
        return { data: MOCK_NOTES, error: null };
      },
      limit: (count: number) => {
        return { data: MOCK_NOTES.slice(0, count), error: null };
      }
    })
  })
};

export const createClient = () => {
  // Return mock client if no env vars (or always for this demo if preferred)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('Supabase env vars missing, using mock client');
    return mockClient as any;
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
