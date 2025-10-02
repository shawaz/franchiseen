import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get chat history for a user
export const getChatHistory = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const messages = await ctx.db
      .query("aiChatMessages")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();
    
    return messages;
  },
});

// Send a message and get AI response
export const sendMessage = mutation({
  args: {
    content: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, { content, userId }) => {
    // Save user message
    const userMessageId = await ctx.db.insert("aiChatMessages", {
      content,
      role: "user",
      userId,
      timestamp: Date.now(),
    });

    // Get AI response (simulated for now - you can integrate with OpenAI API)
    const aiResponse = await generateAIResponse(content);

    // Save AI response
    const aiMessageId = await ctx.db.insert("aiChatMessages", {
      content: aiResponse,
      role: "assistant",
      userId,
      timestamp: Date.now(),
    });

    return { userMessageId, aiMessageId };
  },
});

// Clear chat history for a user
export const clearChatHistory = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const messages = await ctx.db
      .query("aiChatMessages")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    
    return { deletedCount: messages.length };
  },
});

// Generate AI response (simulated - replace with actual OpenAI integration)
async function generateAIResponse(userMessage: string): Promise<string> {
  // This is a simulated response - replace with actual OpenAI API call
  const responses = {
    greeting: [
      "Hello! I'm your AI assistant for franchise management. How can I help you today?",
      "Hi there! I'm here to assist you with your franchise operations. What would you like to know?",
      "Welcome! I'm ready to help you with franchise management tasks. What can I do for you?"
    ],
    performance: [
      "I can help you analyze franchise performance metrics. Let me break down the key performance indicators you should focus on:\n\n• Revenue per location\n• Customer acquisition cost\n• Profit margins\n• Staff productivity\n• Customer satisfaction scores\n\nWould you like me to dive deeper into any specific metric?",
      "For franchise performance analysis, I recommend tracking these essential KPIs:\n\n📊 Financial Metrics:\n- Monthly recurring revenue (MRR)\n- Average revenue per customer\n- Cost of goods sold (COGS)\n- Operating expenses\n\n📈 Operational Metrics:\n- Customer retention rate\n- Staff turnover\n- Inventory turnover\n- Average order value\n\nWould you like me to help you set up tracking for any of these metrics?"
    ],
    marketing: [
      "I'd be happy to help you create a marketing strategy! Here's a comprehensive approach:\n\n🎯 Target Audience Analysis:\n- Demographics and psychographics\n- Customer journey mapping\n- Competitor analysis\n\n📢 Marketing Channels:\n- Digital marketing (social media, email, SEO)\n- Local advertising (radio, print, billboards)\n- Community partnerships\n- Referral programs\n\n💰 Budget Allocation:\n- 40% Digital marketing\n- 30% Local advertising\n- 20% Community events\n- 10% Referral incentives\n\nWhat specific aspect of marketing would you like to focus on?",
      "Let me help you develop a robust marketing strategy for your franchise:\n\n🔍 Market Research:\n- Analyze local competition\n- Identify target demographics\n- Study customer behavior patterns\n\n📱 Digital Presence:\n- Optimize Google My Business\n- Create engaging social media content\n- Implement local SEO strategies\n\n🤝 Community Engagement:\n- Partner with local businesses\n- Sponsor community events\n- Develop loyalty programs\n\nWould you like me to elaborate on any of these strategies?"
    ],
    inventory: [
      "I can help you optimize your inventory management system. Here's a comprehensive approach:\n\n📦 Inventory Optimization:\n- ABC analysis for stock prioritization\n- Just-in-time (JIT) inventory system\n- Safety stock calculations\n- Demand forecasting\n\n🔄 Process Improvements:\n- Automated reorder points\n- Supplier relationship management\n- Quality control procedures\n- Waste reduction strategies\n\n📊 Technology Solutions:\n- Inventory management software\n- Barcode scanning systems\n- Real-time tracking\n- Analytics and reporting\n\nWhat specific area of inventory management would you like to focus on?",
      "Let me help you streamline your inventory management:\n\n🎯 Key Strategies:\n- Implement demand forecasting\n- Set optimal reorder points\n- Reduce carrying costs\n- Minimize stockouts\n\n📈 Best Practices:\n- Regular inventory audits\n- Supplier performance tracking\n- Seasonal demand planning\n- Technology integration\n\n💡 Pro Tips:\n- Use 80/20 rule for inventory focus\n- Implement cycle counting\n- Track inventory turnover rates\n- Monitor supplier lead times\n\nWould you like me to help you implement any of these strategies?"
    ],
    finance: [
      "I can help you generate comprehensive financial reports. Here's what I recommend tracking:\n\n💰 Key Financial Reports:\n- Profit & Loss Statement\n- Balance Sheet\n- Cash Flow Statement\n- Budget vs. Actual Analysis\n\n📊 Performance Metrics:\n- Gross profit margin\n- Net profit margin\n- Return on investment (ROI)\n- Break-even analysis\n\n📈 Forecasting:\n- Revenue projections\n- Expense budgeting\n- Cash flow forecasting\n- Growth planning\n\nWould you like me to help you create any specific financial reports?",
      "Let me help you with financial analysis and reporting:\n\n📋 Essential Reports:\n- Monthly P&L statements\n- Quarterly balance sheets\n- Annual cash flow analysis\n- Franchise performance comparison\n\n🎯 Key Metrics to Track:\n- Revenue per square foot\n- Labor cost percentage\n- Food cost percentage (for restaurants)\n- Customer acquisition cost\n\n💡 Financial Health Indicators:\n- Current ratio\n- Quick ratio\n- Debt-to-equity ratio\n- Return on assets\n\nWhat specific financial aspect would you like me to analyze?"
    ],
    customer: [
      "I can help you develop excellent customer service strategies. Here's a comprehensive approach:\n\n🎯 Customer Service Excellence:\n- Service standards and protocols\n- Staff training programs\n- Customer feedback systems\n- Complaint resolution processes\n\n📞 Communication Channels:\n- In-person service training\n- Phone etiquette\n- Digital communication\n- Social media management\n\n⭐ Service Quality:\n- Mystery shopping programs\n- Customer satisfaction surveys\n- Service recovery procedures\n- Loyalty program development\n\nWould you like me to help you implement any specific customer service strategies?",
      "Let me help you create a world-class customer service experience:\n\n🏆 Service Standards:\n- Greeting protocols\n- Service time targets\n- Quality checkpoints\n- Follow-up procedures\n\n👥 Staff Training:\n- Customer service workshops\n- Role-playing exercises\n- Product knowledge training\n- Conflict resolution skills\n\n📊 Measurement:\n- Customer satisfaction scores\n- Net Promoter Score (NPS)\n- Service quality metrics\n- Employee performance reviews\n\nWhat specific customer service area would you like to focus on?"
    ],
    training: [
      "I can help you create comprehensive training materials for your staff. Here's a structured approach:\n\n📚 Training Modules:\n- Onboarding procedures\n- Job-specific training\n- Customer service skills\n- Safety protocols\n- Company policies\n\n🎓 Training Methods:\n- Interactive workshops\n- Online learning modules\n- Hands-on practice\n- Mentorship programs\n- Assessment and certification\n\n📋 Training Materials:\n- Employee handbooks\n- Video tutorials\n- Quick reference guides\n- Training checklists\n- Progress tracking systems\n\nWould you like me to help you develop any specific training materials?",
      "Let me help you create effective staff training programs:\n\n🎯 Training Structure:\n- New employee orientation\n- Role-specific training\n- Ongoing development\n- Leadership development\n- Cross-training programs\n\n📖 Content Development:\n- Training manuals\n- Video content\n- Interactive modules\n- Assessment tools\n- Feedback systems\n\n🏆 Best Practices:\n- Regular training updates\n- Performance evaluations\n- Career development paths\n- Recognition programs\n- Continuous improvement\n\nWhat specific training area would you like me to help you with?"
    ]
  };

  const message = userMessage.toLowerCase();
  
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
  } else if (message.includes('performance') || message.includes('analytics') || message.includes('metrics')) {
    return responses.performance[Math.floor(Math.random() * responses.performance.length)];
  } else if (message.includes('marketing') || message.includes('campaign') || message.includes('promotion')) {
    return responses.marketing[Math.floor(Math.random() * responses.marketing.length)];
  } else if (message.includes('inventory') || message.includes('stock') || message.includes('supply')) {
    return responses.inventory[Math.floor(Math.random() * responses.inventory.length)];
  } else if (message.includes('finance') || message.includes('financial') || message.includes('revenue') || message.includes('profit')) {
    return responses.finance[Math.floor(Math.random() * responses.finance.length)];
  } else if (message.includes('customer') || message.includes('service') || message.includes('support')) {
    return responses.customer[Math.floor(Math.random() * responses.customer.length)];
  } else if (message.includes('training') || message.includes('staff') || message.includes('employee')) {
    return responses.training[Math.floor(Math.random() * responses.training.length)];
  } else {
    return `I understand you're asking about "${userMessage}". As your AI assistant for franchise management, I'm here to help you with various aspects of running your franchise business. I can assist you with:\n\n• Performance analysis and metrics\n• Marketing strategies and campaigns\n• Inventory management optimization\n• Financial reporting and analysis\n• Customer service strategies\n• Staff training and development\n• Operational improvements\n• Growth planning\n\nCould you please be more specific about what you'd like help with? I'm here to provide detailed guidance and actionable insights for your franchise operations.`;
  }
}
