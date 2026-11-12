/**
 * Core business and interactive logic for Himanshi's romantic proposal website.
 * Decoupled from DOM for clean unit testing and reliability.
 */

export interface HeartItem {
  id: number;
  text: string;
  collected: boolean;
}

export const INITIAL_HEART_MESSAGES: string[] = [
  "You have a really lovely smile.",
  "You deserve all the happiness.",
  "Never stop being your amazing self.",
  "Someone is rooting for you.",
  "You make ordinary moments feel special.",
  "You're genuinely one of a kind.",
  "Here's a little virtual hug!",
  "Sending you extra positive vibes.",
  "Hope you're smiling right now.",
  "Okay, you're officially adorable! ❤️"
];

export class HeartCollector {
  private collectedIds: Set<number> = new Set();
  public readonly total: number = 10;

  public collect(id: number): { newlyCollected: boolean; totalCollected: number; isComplete: boolean } {
    if (id < 0 || id >= this.total) {
      throw new Error(`Heart ID ${id} is out of bounds (0..${this.total - 1})`);
    }
    const newlyCollected = !this.collectedIds.has(id);
    this.collectedIds.add(id);
    return {
      newlyCollected,
      totalCollected: this.collectedIds.size,
      isComplete: this.collectedIds.size >= this.total
    };
  }

  public isCollected(id: number): boolean {
    return this.collectedIds.has(id);
  }

  public getCount(): number {
    return this.collectedIds.size;
  }

  public reset(): void {
    this.collectedIds.clear();
  }
}

export const SURPRISE_MESSAGES: string[] = [
  "Breaking news: Someone thinks Himanshi is amazing! ✨",
  "Reminder: Your smile is worth a thousand sunsets. 🌅",
  "If being adorable was a competition, you'd win without trying. 🏆",
  "A little reminder that you're truly special to someone today. 💌",
  "Sending 1000 virtual hugs your way right now! 🤗",
  "Psst... someone has a very big question for you. 👀",
  "You make this whole world just a little softer and warmer. 🌸",
  "Scientific fact: Himanshi's presence increases room brightness by 200%. ☀️",
  "Just checking in to make sure you're drinking water and having a lovely day! 💧",
  "Warning: Extreme cuteness detected in your direction! 🚨❤️"
];

export function getNextSurprise(lastIndex: number = -1, messages: string[] = SURPRISE_MESSAGES): { message: string; index: number } {
  if (messages.length <= 1) {
    return { message: messages[0] || "", index: 0 };
  }
  let newIndex = Math.floor(Math.random() * messages.length);
  while (newIndex === lastIndex) {
    newIndex = Math.floor(Math.random() * messages.length);
  }
  return { message: messages[newIndex], index: newIndex };
}

export interface DatePlanProposal {
  dateIdea: string;
  preferredDate: string;
  preferredTime: string;
  personalMessage?: string;
  phoneNumber?: string;
}

export function buildWhatsAppProposalUrl(proposal: DatePlanProposal): string {
  const phone = (proposal.phoneNumber || "").replace(/[^0-9]/g, "");
  const base = phone ? `https://wa.me/${phone}` : `https://api.whatsapp.com/send`;
  
  const textParts = [
    `Hey! ❤️ It's Himanshi! I checked out the little website you made for me, and... YES! I'd love to go on a date with you! 🥹✨`,
    ``,
    `Here's what I picked:`,
    `✨ Plan: ${proposal.dateIdea || 'A Surprise Plan'}`,
    `📅 Date: ${proposal.preferredDate || 'Flexible!'}`,
    `⏰ Time: ${proposal.preferredTime || 'Anytime good for you!'}`,
  ];

  if (proposal.personalMessage && proposal.personalMessage.trim()) {
    textParts.push(`💌 Little Note: "${proposal.personalMessage.trim()}"`);
  }

  textParts.push(``);
  textParts.push(`Can't wait! Let me know when you're free! 🥰`);

  const fullText = textParts.join('\n');
  return `${base}?text=${encodeURIComponent(fullText)}`;
}

export class SecretEasterEggCounter {
  private count: number = 0;
  private readonly target: number = 7;
  private lastClickTime: number = 0;
  private readonly timeoutMs: number = 5000;

  public click(now: number = Date.now()): { count: number; triggered: boolean } {
    if (this.lastClickTime > 0 && now - this.lastClickTime > this.timeoutMs) {
      this.count = 0;
    }
    this.lastClickTime = now;
    this.count++;

    if (this.count >= this.target) {
      this.count = 0; // reset after triggering
      return { count: this.target, triggered: true };
    }
    return { count: this.count, triggered: false };
  }

  public reset(): void {
    this.count = 0;
    this.lastClickTime = 0;
  }
}
