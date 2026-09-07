import { MessagesView } from '@/components/pages/MessagesView';

export default async function AccountMessageThreadPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  return <MessagesView conversationId={Number(conversationId)} />;
}
