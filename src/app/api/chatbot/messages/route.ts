import { requireAuth } from '@/lib/clerk-auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { conversationId, message } = await request.json();

    if (!conversationId || !message) {
      return NextResponse.json(
        { error: 'Missing conversationId or message' },
        { status: 400 }
      );
    }

    // Verify conversation belongs to user
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
      include: { messages: true },
    });

    if (!conversation || conversation.userId !== user.id) {
      return NextResponse.json(
        { error: 'Conversation not found or access denied' },
        { status: 403 }
      );
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        conversationId,
        role: 'user',
        content: message,
      },
    });

    // Get Claude API key
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 500 }
      );
    }

    // Build messages for Claude
    const messages = conversation.messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    messages.push({
      role: 'user',
      content: message,
    });

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        system: 'You are a helpful AI assistant for a focus and productivity app. Help users improve their focus, manage distractions, and achieve their goals. Be concise, friendly, and supportive.',
        messages,
      }),
    });

    if (!response.ok) {
      let errorDetails = 'Unknown error';
      try {
        const errorData = await response.json();
        errorDetails = errorData.error?.message || JSON.stringify(errorData);
      } catch (e) {
        errorDetails = `HTTP ${response.status}: ${response.statusText}`;
      }
      console.error('Claude API error:', errorDetails);
      return NextResponse.json(
        { error: `Failed to get response from AI: ${errorDetails}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const assistantMessage =
      data.content?.[0]?.text ||
      'Sorry, I could not generate a response.';

    // Save assistant message
    await prisma.chatMessage.create({
      data: {
        conversationId,
        role: 'assistant',
        content: assistantMessage,
      },
    });

    // Update conversation title if it's the first exchange
    if (conversation.messages.length === 0) {
      const title = message.substring(0, 50);
      await prisma.chatConversation.update({
        where: { id: conversationId },
        data: { title },
      });
    }

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error('Error in chatbot API:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
