import { mutation } from "./_generated/server";

export const seedNewsArticles = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if news articles already exist
    const existingNews = await ctx.db.query("news").first();
    if (existingNews) {
      return { message: "News articles already exist. Skipping seed." };
    }

    const now = Date.now();
    const sampleArticles = [
      {
        title: "Franchiseen Launches Revolutionary Blockchain-Based Franchise Platform",
        slug: "franchiseen-launches-revolutionary-blockchain-based-franchise-platform",
        excerpt: "Today marks a new era in franchising as Franchiseen unveils its innovative platform that combines traditional franchising with cutting-edge blockchain technology.",
        images: [],
        content: `We are excited to announce the launch of Franchiseen, a groundbreaking platform that's set to transform the franchise industry. By leveraging blockchain technology and tokenization, we're making franchise ownership more accessible, transparent, and democratic than ever before.

Our platform enables fractional ownership of franchises through tokenization, allowing investors to own shares in successful franchise operations with unprecedented ease and security. This innovative approach opens up franchise investment opportunities to a much broader audience while providing franchisors with new funding mechanisms.

Key features of our platform include:

1. Tokenized Franchise Shares: Each franchise location can issue its own tokens, representing ownership stakes that can be bought, sold, and traded securely on the blockchain.

2. Transparent Operations: All financial transactions, revenue distributions, and operational metrics are recorded on the blockchain, ensuring complete transparency for all stakeholders.

3. Smart Contract Automation: Revenue sharing, royalty payments, and investor payouts are automated through smart contracts, reducing administrative overhead and ensuring timely distributions.

4. Global Accessibility: Our platform is accessible worldwide, connecting franchisors with investors and franchisees across borders.

5. Real-time Analytics: Comprehensive dashboards provide real-time insights into franchise performance, helping all stakeholders make informed decisions.

We believe this platform will democratize franchise ownership and create new opportunities for entrepreneurs, investors, and established brands alike. Join us in shaping the future of franchising!`,
        category: "company_news" as const,
        tags: ["launch", "blockchain", "innovation", "platform"],
        authorName: "Franchiseen Team",
        status: "published" as const,
        publishedAt: now - 2 * 24 * 60 * 60 * 1000, // 2 days ago
        metaTitle: "Franchiseen Launches Revolutionary Blockchain-Based Franchise Platform",
        metaDescription: "Franchiseen unveils innovative platform combining traditional franchising with blockchain technology.",
        metaKeywords: ["blockchain", "franchise", "tokenization", "investment"],
        views: 1245,
        likes: 89,
        isFeatured: true,
        allowComments: true,
        createdAt: now - 2 * 24 * 60 * 60 * 1000,
        updatedAt: now - 2 * 24 * 60 * 60 * 1000,
      },
      {
        title: "5 Key Trends Shaping the Future of Franchising in 2025",
        slug: "5-key-trends-shaping-future-of-franchising-2025",
        excerpt: "Explore the major trends transforming the franchise industry, from digital transformation to sustainability initiatives.",
        images: [],
        content: `The franchise industry is evolving rapidly, driven by technological advancements, changing consumer preferences, and global economic shifts. Here are five key trends that are shaping the future of franchising in 2025:

1. Digital Transformation and Technology Integration
Franchises are increasingly adopting advanced technologies such as AI, machine learning, and IoT to streamline operations, enhance customer experiences, and improve efficiency. From automated inventory management to AI-powered customer service, technology is becoming integral to franchise success.

2. Sustainability and Social Responsibility
Modern consumers are increasingly conscious of environmental and social issues. Franchises that prioritize sustainability, ethical sourcing, and community engagement are gaining competitive advantages. This trend is driving franchisors to implement eco-friendly practices and transparent supply chains.

3. Flexible Franchise Models
Traditional franchise models are giving way to more flexible arrangements. Micro-franchising, home-based franchises, and hybrid models are becoming popular, allowing entrepreneurs to start businesses with lower capital requirements and reduced overhead costs.

4. Data-Driven Decision Making
Big data and analytics are revolutionizing how franchises operate. Real-time data collection and analysis enable better decision-making, from site selection and inventory management to marketing strategies and customer retention.

5. Tokenization and Fractional Ownership
Blockchain technology is introducing new ways to fund and own franchises. Tokenization allows for fractional ownership, making franchise investment more accessible to a broader range of investors while providing franchisors with innovative funding mechanisms.

These trends are creating exciting opportunities for both franchisors and franchisees. Businesses that embrace these changes and adapt their strategies accordingly will be well-positioned for success in the evolving franchise landscape.`,
        category: "industry_insights" as const,
        tags: ["trends", "future", "technology", "sustainability"],
        authorName: "Industry Analyst",
        status: "published" as const,
        publishedAt: now - 5 * 24 * 60 * 60 * 1000, // 5 days ago
        metaTitle: "5 Key Trends Shaping the Future of Franchising in 2025",
        metaDescription: "Explore major trends transforming the franchise industry in 2025.",
        metaKeywords: ["franchise trends", "2025", "digital transformation", "sustainability"],
        views: 892,
        likes: 67,
        isFeatured: true,
        allowComments: true,
        createdAt: now - 5 * 24 * 60 * 60 * 1000,
        updatedAt: now - 5 * 24 * 60 * 60 * 1000,
      },
      {
        title: "How One Franchisee Achieved 200% ROI in Their First Year",
        slug: "how-one-franchisee-achieved-200-percent-roi-first-year",
        excerpt: "Learn how Sarah Martinez transformed her franchise investment into a thriving business that exceeded all expectations.",
        images: [],
        content: `When Sarah Martinez invested in her first franchise location through Franchiseen, she had modest expectations. Little did she know that her strategic approach and dedication would lead to an impressive 200% return on investment in just her first year of operation.

The Journey Begins
Sarah, a former corporate marketing manager, had always dreamed of running her own business. When she discovered Franchiseen's platform, she was immediately drawn to the transparency and accessibility it offered. After thorough research, she chose to invest in a fast-casual restaurant franchise in a growing suburban area.

Strategic Planning
From day one, Sarah approached her franchise with a business mindset:

1. Market Research: She spent months studying her target market, understanding customer preferences, and identifying gaps in the local dining scene.

2. Team Building: Sarah invested heavily in recruiting and training the right team, understanding that her staff would be the face of her business.

3. Community Engagement: She actively participated in local events, partnered with nearby businesses, and built strong relationships with community leaders.

4. Digital Marketing: Leveraging her marketing background, Sarah developed a robust online presence and ran targeted social media campaigns.

5. Operational Excellence: She maintained strict quality control while continuously seeking ways to improve efficiency and reduce waste.

The Results
By the end of her first year:
- Revenue exceeded projections by 150%
- Customer satisfaction ratings consistently above 4.8/5
- Built a loyal customer base with a 60% repeat customer rate
- Achieved profitability within 6 months
- Total ROI of 200%

Key Takeaways
Sarah attributes her success to several factors:
- Choosing the right location and franchise
- Thorough preparation and planning
- Strong focus on customer experience
- Continuous learning and adaptation
- Leveraging the support and resources provided by the franchisor

Her story demonstrates that with the right approach, dedication, and support system, franchise ownership can be highly rewarding. The transparency and tools provided by Franchiseen's platform were instrumental in helping Sarah make informed decisions throughout her journey.

Are you ready to write your own success story?`,
        category: "success_stories" as const,
        tags: ["success story", "ROI", "franchisee", "case study"],
        authorName: "Content Team",
        status: "published" as const,
        publishedAt: now - 7 * 24 * 60 * 60 * 1000, // 7 days ago
        metaTitle: "Franchisee Success Story: 200% ROI in First Year",
        metaDescription: "Learn how Sarah Martinez achieved 200% ROI with her franchise in just one year.",
        metaKeywords: ["success story", "franchise ROI", "case study", "franchisee"],
        views: 1567,
        likes: 134,
        isFeatured: true,
        allowComments: true,
        createdAt: now - 7 * 24 * 60 * 60 * 1000,
        updatedAt: now - 7 * 24 * 60 * 60 * 1000,
      },
      {
        title: "New Features: Enhanced Analytics Dashboard Now Available",
        slug: "new-features-enhanced-analytics-dashboard-now-available",
        excerpt: "We've rolled out a comprehensive update to our analytics dashboard, providing deeper insights and more powerful reporting tools.",
        images: [],
        content: `We're thrilled to announce a major update to the Franchiseen platform! Our new enhanced analytics dashboard is now live, offering franchise owners and investors unprecedented visibility into their operations and investments.

What's New:

1. Real-time Performance Metrics
- Live revenue tracking
- Customer traffic analytics
- Sales trends and forecasting
- Inventory status updates

2. Advanced Reporting
- Customizable report generation
- Export capabilities in multiple formats
- Scheduled automated reports
- Comparative analysis tools

3. Investor Dashboard
- Portfolio performance overview
- ROI calculations and projections
- Distribution history
- Token value tracking

4. Financial Insights
- Profit and loss statements
- Cash flow analysis
- Expense categorization
- Budget vs. actual comparisons

5. Operational Metrics
- Staff performance indicators
- Customer satisfaction scores
- Service quality metrics
- Efficiency benchmarks

How to Access:
All users can access the new dashboard by logging into their account and navigating to the Analytics section. We've created comprehensive video tutorials and documentation to help you get the most out of these new features.

We're committed to continuously improving our platform to provide you with the best tools for managing and growing your franchise investments. Stay tuned for more updates!`,
        category: "product_updates" as const,
        tags: ["product update", "analytics", "dashboard", "features"],
        authorName: "Product Team",
        status: "published" as const,
        publishedAt: now - 3 * 24 * 60 * 60 * 1000, // 3 days ago
        metaTitle: "New Analytics Dashboard Features Now Available",
        metaDescription: "Enhanced analytics dashboard with real-time metrics and advanced reporting now live.",
        metaKeywords: ["analytics", "dashboard", "product update", "features"],
        views: 734,
        likes: 56,
        isFeatured: false,
        allowComments: true,
        createdAt: now - 3 * 24 * 60 * 60 * 1000,
        updatedAt: now - 3 * 24 * 60 * 60 * 1000,
      },
      {
        title: "A Complete Guide to Evaluating Franchise Opportunities",
        slug: "complete-guide-evaluating-franchise-opportunities",
        excerpt: "Essential tips and considerations for assessing franchise opportunities and making informed investment decisions.",
        images: [],
        content: `Choosing the right franchise opportunity is one of the most important decisions you'll make as an entrepreneur or investor. This comprehensive guide will help you evaluate franchise opportunities effectively.

1. Financial Considerations

Initial Investment
- Franchise fee
- Equipment and inventory costs
- Real estate and buildout expenses
- Working capital requirements
- Marketing funds

Ongoing Costs
- Royalty fees
- Marketing contributions
- Supply costs
- Technology fees
- Insurance and licenses

Financial Performance
- Request Franchise Disclosure Document (FDD)
- Analyze Item 19 (Financial Performance Representations)
- Review average unit volumes
- Understand profit margins
- Calculate potential ROI

2. Market Analysis

Industry Trends
- Growth potential
- Market saturation
- Consumer demand
- Competitive landscape

Location Assessment
- Demographics
- Traffic patterns
- Competition
- Accessibility
- Local economy

3. Franchisor Evaluation

Company Background
- Years in business
- Growth trajectory
- Financial stability
- Leadership team
- Brand reputation

Support System
- Training programs
- Ongoing support
- Marketing assistance
- Technology platforms
- Supply chain management

4. Legal Considerations

Review FDD Carefully
- Item 3: Litigation history
- Item 4: Bankruptcy history
- Item 20: Outlet information
- Item 21: Financial statements

Franchise Agreement
- Territory rights
- Transfer restrictions
- Renewal terms
- Exit strategy

5. Due Diligence

Talk to Existing Franchisees
- Satisfaction levels
- Actual earnings
- Support quality
- Challenges faced
- Would they do it again?

Visit Operating Locations
- Customer experience
- Operations efficiency
- Staff morale
- Facility condition

6. Personal Assessment

Skills and Experience
- Required expertise
- Learning curve
- Management capabilities
- Industry knowledge

Lifestyle Fit
- Time commitment
- Work-life balance
- Family considerations
- Long-term goals

7. Making the Decision

Use these tools:
- Franchise evaluation scorecard
- ROI calculator
- SWOT analysis
- Risk assessment matrix

Trust Your Instincts
After thorough analysis, trust your gut feeling. If something doesn't feel right, it probably isn't.

Remember, the right franchise opportunity should align with your financial goals, personal interests, and lifestyle preferences. Take your time, do your homework, and make an informed decision.

Ready to explore franchise opportunities on Franchiseen? Our platform provides transparency and tools to help you make the best decision for your future.`,
        category: "tips_guides" as const,
        tags: ["guide", "evaluation", "investment", "due diligence"],
        authorName: "Advisory Team",
        status: "published" as const,
        publishedAt: now - 10 * 24 * 60 * 60 * 1000, // 10 days ago
        metaTitle: "Complete Guide to Evaluating Franchise Opportunities",
        metaDescription: "Essential tips and considerations for assessing franchise opportunities.",
        metaKeywords: ["franchise evaluation", "investment guide", "due diligence", "franchise selection"],
        views: 2134,
        likes: 178,
        isFeatured: false,
        allowComments: true,
        createdAt: now - 10 * 24 * 60 * 60 * 1000,
        updatedAt: now - 10 * 24 * 60 * 60 * 1000,
      },
      {
        title: "Important: Platform Maintenance Scheduled for Next Week",
        slug: "important-platform-maintenance-scheduled-next-week",
        excerpt: "We'll be performing scheduled maintenance to improve platform performance and security. Here's what you need to know.",
        images: [],
        content: `We want to inform you about scheduled maintenance that will take place next week to enhance our platform's performance, security, and reliability.

Maintenance Details:

Date: [Next Tuesday]
Time: 2:00 AM - 6:00 AM EST
Duration: Approximately 4 hours

During this maintenance window:
- The platform will be temporarily unavailable
- All transactions will be paused
- Login functionality will be disabled
- Email notifications will be queued

What We're Doing:

1. Infrastructure Upgrades
- Server capacity expansion
- Database optimization
- Network improvements

2. Security Enhancements
- Implementation of additional security measures
- Security patches and updates
- Enhanced encryption protocols

3. Performance Improvements
- Page load time optimization
- Query performance enhancements
- API response time improvements

4. Feature Preparations
- Backend updates for upcoming features
- System compatibility improvements

What You Should Do:

Before Maintenance:
- Complete any pending transactions
- Download any reports you need
- Save any work in progress
- Note important information

During Maintenance:
- Avoid attempting to access the platform
- Wait for our "All Clear" announcement
- Check our status page for updates

After Maintenance:
- Clear your browser cache
- Log in and verify your account
- Report any issues immediately

We apologize for any inconvenience this may cause and appreciate your patience as we work to improve your experience on our platform.

Questions?
If you have any concerns or questions about this maintenance, please contact our support team at support@franchiseen.com.

Stay Connected:
Follow our social media channels for real-time updates during the maintenance period.`,
        category: "announcements" as const,
        tags: ["maintenance", "announcement", "platform", "update"],
        authorName: "Operations Team",
        status: "published" as const,
        publishedAt: now - 1 * 24 * 60 * 60 * 1000, // 1 day ago
        metaTitle: "Platform Maintenance Scheduled for Next Week",
        metaDescription: "Important scheduled maintenance to improve platform performance and security.",
        metaKeywords: ["maintenance", "platform update", "announcement", "downtime"],
        views: 456,
        likes: 23,
        isFeatured: false,
        allowComments: true,
        createdAt: now - 1 * 24 * 60 * 60 * 1000,
        updatedAt: now - 1 * 24 * 60 * 60 * 1000,
      },
    ];

    // Insert all articles
    const insertedIds = [];
    for (const article of sampleArticles) {
      const id = await ctx.db.insert("news", article);
      insertedIds.push(id);
    }

    return { 
      message: `Successfully seeded ${insertedIds.length} news articles`,
      articleIds: insertedIds 
    };
  },
});

