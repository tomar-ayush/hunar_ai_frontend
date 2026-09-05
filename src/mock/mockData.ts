import type { Candidate, CampaignMetrics, ExtractedJobParameters } from '../types';

export const mockJobDescriptionSample = `We are seeking a Lead Distributed Systems Engineer to spearhead our high-throughput streaming architecture. 
You will architect microservices handling over 250,000 requests per second, optimize event pipelines in Kafka, and design fault-tolerant consensus layers using Go or Rust.
Key requirements:
- 7+ years building enterprise-grade backend infrastructure.
- Deep expertise in Go (Golang), distributed transactions, Raft/Paxos algorithms, and Kafka.
- Hands-on Kubernetes orchestration, gRPC services, and PostgreSQL/CockroachDB clustering.
- Proven track record scaling low-latency services with strict SLAs (<15ms p99).
- Strong communication, ownership, and ability to mentor engineering leads.`;

export const mockExtractedParameters: ExtractedJobParameters = {
  targetJobTitle: "Lead Distributed Systems Engineer",
  seniorityLevel: "Staff / Principal (L6+)",
  requiredSkills: ["Go (Golang)", "Kafka", "Distributed Systems", "Kubernetes", "gRPC", "PostgreSQL"],
  optionalSkills: ["Rust", "CockroachDB", "Raft Consensus", "Prometheus", "eBPF"],
  experienceMin: 1,
  experienceMax: 12,
  locationPreference: "San Francisco, CA / Remote (US/Canada)",
  targetCompanies: ["Cloudflare", "Datadog", "Confluent", "Stripe", "Uber", "Cockroach Labs"],
  compensationRange: "$210,000 - $260,000 Base + Equity (0.15% - 0.35%)"
};

export const mockCandidates: Candidate[] = [
  {
    id: "alex-johnson",
    name: "Alex Johnson",
    headline: "Staff Systems Engineer · ex-Cloudflare, Confluent",
    currentRole: "Staff Infrastructure Engineer",
    company: "Confluent",
    previousCompany: "Cloudflare",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    location: "San Francisco, CA (Open to Remote)",
    matchScore: 96,
    matchSummary: "Superb alignment with distributed consensus, high-throughput Go services, and Kafka stream processing at scale.",
    callStatus: "completed",
    email: "alex.johnson@distributed.dev",
    phone: "+1 (415) 890-2341",
    linkedinUrl: "https://linkedin.com/in/alex-johnson-systems",
    githubUrl: "https://github.com/alex-systems",
    skills: ["Go (Golang)", "Kafka", "Distributed Systems", "Kubernetes", "gRPC", "CockroachDB", "Raft"],
    experienceYears: 8.5,
    sourcedDate: "Today, 08:30 AM",
    audioDurationSec: 215, // 3m 35s
    evaluation: {
      jobSeekingIntent: "Immediate",
      intentDetails: "Actively looking due to recent team re-org. Has two final rounds scheduled next week; motivated by low-latency infrastructure challenges.",
      expectedSalary: "$230,000 - $250,000 Base + Equity",
      currentSalary: "$215,000 Base",
      noticePeriod: "2 weeks (Flexible for fast onboarding)",
      strengths: [
        "Architected Kafka event pipeline ingesting 450k msg/sec with <8ms p99 latency.",
        "Clear articulate communication, deep philosophical grasp of distributed consistency trade-offs.",
        "Demonstrated hands-on experience debugging kernel-level network socket bottlenecks."
      ],
      redFlags: [
        "Currently interviewing with 2 competing tier-1 infra startups; requires expedited hiring timeline.",
        "Prefers remote or maximum 1-day hybrid presence in SF office."
      ],
      technicalProficiencyScore: 98,
      culturalFitScore: 94,
      communicationScore: 92,
      overallScore: 96,
      overallRecommendation: "Strong Hire",
      executiveSummary: "Alex is an exceptional Staff-level engineer with battle-tested experience scaling Confluent and Cloudflare backends. During the Hunar AI voice screen, he spoke authoritatively on Raft quorum failures, backpressure propagation in Go channels, and zero-downtime schema migrations. Highly recommended for immediate engineering leader loop.",
      verifiedSkills: ["Go (Golang)", "Kafka Streaming", "Distributed Consensus", "Kubernetes", "gRPC"]
    },
    transcript: [
      {
        id: "t-1",
        speaker: "ai",
        timestamp: "00:04",
        timestampSec: 4,
        text: "Hi Alex! This is the Hunar AI Autonomous Recruiter calling on behalf of the Infrastructure Engineering leadership team. How are you doing today?",
        sentiment: "neutral",
        keyTopic: "Introduction"
      },
      {
        id: "t-2",
        speaker: "candidate",
        timestamp: "00:15",
        timestampSec: 15,
        text: "Hey! Doing great, thanks. I saw the outreach note regarding the Lead Distributed Systems position. The scale you folks are targeting sounded right up my alley.",
        sentiment: "positive",
        keyTopic: "Role Alignment"
      },
      {
        id: "t-3",
        speaker: "ai",
        timestamp: "00:28",
        timestampSec: 28,
        text: "That's fantastic to hear. We are scaling our event ingestion fabric to over 250,000 requests per second. Could you walk me through your recent work architecting high-throughput Go microservices?",
        sentiment: "neutral",
        keyTopic: "Architecture & Scale"
      },
      {
        id: "t-4",
        speaker: "candidate",
        timestamp: "00:46",
        timestampSec: 46,
        text: "Certainly. At Confluent, I led the core telemetry pipeline. We decoupled our ingestion proxies using zero-allocation Go buffers and gRPC streaming directly into partitioned Kafka topics. We tuned the JVM broker batch sizes and used custom eBPF probes to catch socket drops, bringing p99 latency down from 42ms to under 8ms at peak load.",
        sentiment: "positive",
        highlightKeywords: ["zero-allocation", "gRPC streaming", "Kafka", "eBPF", "p99 <8ms"],
        keyTopic: "Technical Deep-Dive"
      },
      {
        id: "t-5",
        speaker: "ai",
        timestamp: "01:24",
        timestampSec: 84,
        text: "Impressive numbers. When dealing with distributed state across nodes, how have you handled quorum failures or network partitions?",
        sentiment: "neutral",
        keyTopic: "Consensus & Fault Tolerance"
      },
      {
        id: "t-6",
        speaker: "candidate",
        timestamp: "01:42",
        timestampSec: 102,
        text: "We implemented a custom Raft-based consensus controller for metadata replication. Under split-brain scenarios, we prioritize linearizability over availability using lease-read mechanisms. If a follower lags past our threshold, we trigger asynchronous snapshot streaming rather than letting WAL backpressure stall active writers.",
        sentiment: "positive",
        highlightKeywords: ["Raft", "linearizability", "lease-read", "WAL backpressure"],
        keyTopic: "Distributed Consensus"
      },
      {
        id: "t-7",
        speaker: "ai",
        timestamp: "02:18",
        timestampSec: 138,
        text: "Understood. Touching on your search criteria—what is your timeline for making a move, and what are your target compensation expectations?",
        sentiment: "neutral",
        keyTopic: "Timeline & Compensation"
      },
      {
        id: "t-8",
        speaker: "candidate",
        timestamp: "02:35",
        timestampSec: 155,
        text: "I am actively exploring options right now and can wrap up current responsibilities with a standard two-week notice. On compensation, I am targeting around $230,000 to $250,000 base salary plus a meaningful equity component reflecting staff-level ownership.",
        sentiment: "positive",
        highlightKeywords: ["2 weeks notice", "$230k - $250k base"],
        keyTopic: "Offer Parameters"
      },
      {
        id: "t-9",
        speaker: "ai",
        timestamp: "03:02",
        timestampSec: 182,
        text: "That aligns well with our compensation bands for this role. Thank you for walking through your experience with such clarity, Alex. I will fast-track your profile directly to the VP of Engineering for the technical interview loop.",
        sentiment: "positive",
        keyTopic: "Next Steps"
      },
      {
        id: "t-10",
        speaker: "candidate",
        timestamp: "03:22",
        timestampSec: 202,
        text: "Sounds great! Looking forward to chatting with the engineering team. Have a good one!",
        sentiment: "positive",
        keyTopic: "Conclusion"
      }
    ]
  },
  {
    id: "sophia-chen",
    name: "Sophia Chen",
    headline: "Staff SRE & Distributed Infrastructure · Datadog",
    currentRole: "Staff Infrastructure Engineer",
    company: "Datadog",
    previousCompany: "Uber",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
    location: "Seattle, WA (Remote Eligible)",
    matchScore: 93,
    matchSummary: "Deep production mastery of Kubernetes orchestration, multi-region Kafka topologies, and automated fault recovery.",
    callStatus: "completed",
    email: "sophia.chen@infrastructure.io",
    phone: "+1 (206) 555-0192",
    linkedinUrl: "https://linkedin.com/in/sophia-chen-sre",
    githubUrl: "https://github.com/sophiachen",
    skills: ["Kubernetes", "Go", "Kafka", "Prometheus", "Distributed Systems", "gRPC"],
    experienceYears: 9,
    sourcedDate: "Today, 09:15 AM",
    audioDurationSec: 190,
    evaluation: {
      jobSeekingIntent: "High",
      intentDetails: "Looking for high-impact founding infrastructure role. Felt Datadog has become overly compartmentalized.",
      expectedSalary: "$225,000 - $245,000 Base",
      currentSalary: "$210,000 Base",
      noticePeriod: "3 weeks",
      strengths: [
        "Built automated multi-cluster failover mechanism supporting 1.2M metrics/sec.",
        "Demonstrated mastery of eBPF kernel debugging and latency tracing.",
        "Great attitude towards cross-functional pairing and developer tooling."
      ],
      redFlags: [
        "Prefers to avoid on-call rotations exceeding 1 week per month."
      ],
      technicalProficiencyScore: 95,
      culturalFitScore: 92,
      communicationScore: 94,
      overallScore: 93,
      overallRecommendation: "Strong Hire",
      executiveSummary: "Solid Staff infrastructure engineer with proven record sustaining high nine-availability platforms.",
      verifiedSkills: ["Kubernetes", "Kafka", "Go", "Distributed Observability"]
    },
    transcript: [
      {
        id: "sc-1",
        speaker: "ai",
        timestamp: "00:05",
        timestampSec: 5,
        text: "Hello Sophia! This is Hunar AI calling regarding the Lead Infrastructure opening. Is now a convenient moment for a quick 3-minute screening?",
        sentiment: "neutral",
        keyTopic: "Introduction"
      },
      {
        id: "sc-2",
        speaker: "candidate",
        timestamp: "00:16",
        timestampSec: 16,
        text: "Yes, absolutely! I've been following your product updates and love the approach to autonomous recruitment.",
        sentiment: "positive",
        keyTopic: "Interest"
      },
      {
        id: "sc-3",
        speaker: "ai",
        timestamp: "00:30",
        timestampSec: 30,
        text: "Could you highlight how you scaled Kubernetes control planes and Kafka brokers at Datadog?",
        sentiment: "neutral",
        keyTopic: "Technical Scaling"
      },
      {
        id: "sc-4",
        speaker: "candidate",
        timestamp: "00:48",
        timestampSec: 48,
        text: "We managed multi-region clusters where inter-zone data egress was costing us millions. I designed a localized Kafka broker affinity routing system in Go that cut egress costs by 34% while maintaining sub-10ms replication.",
        sentiment: "positive",
        highlightKeywords: ["affinity routing", "34% egress savings", "sub-10ms replication"],
        keyTopic: "System Architecture"
      }
    ]
  },
  {
    id: "marcus-vance",
    name: "Marcus Vance",
    headline: "Principal Backend Systems Architect · Stripe",
    currentRole: "Principal Engineer",
    company: "Stripe",
    previousCompany: "Twilio",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    location: "New York, NY",
    matchScore: 91,
    matchSummary: "World-class payments and distributed ledger expertise. Extensive background in strict consistency models and Rust.",
    callStatus: "ringing",
    email: "marcus.vance@coreeng.com",
    phone: "+1 (212) 555-8712",
    linkedinUrl: "https://linkedin.com/in/marcus-vance",
    skills: ["Go", "Rust", "CockroachDB", "Distributed Systems", "Kafka", "Security"],
    experienceYears: 11,
    sourcedDate: "Today, 09:45 AM"
  },
  {
    id: "elena-rostova",
    name: "Elena Rostova",
    headline: "Lead Distributed Storage Engineer · Cockroach Labs",
    currentRole: "Lead Database Systems Engineer",
    company: "Cockroach Labs",
    previousCompany: "MongoDB",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250",
    location: "Austin, TX (Remote)",
    matchScore: 89,
    matchSummary: "Direct author of distributed consensus protocols and LSM-tree storage engines in Go and C++.",
    callStatus: "queued",
    email: "elena.rostova@storage-lab.org",
    phone: "+1 (512) 555-4309",
    linkedinUrl: "https://linkedin.com/in/elena-rostova",
    skills: ["Go (Golang)", "Distributed Consensus", "Raft", "PostgreSQL", "LSM-Trees"],
    experienceYears: 7,
    sourcedDate: "Yesterday, 04:12 PM"
  },
  {
    id: "david-kim",
    name: "David Kim",
    headline: "Senior Distributed Platforms Engineer · Netflix",
    currentRole: "Senior Software Engineer",
    company: "Netflix",
    previousCompany: "Amazon AWS",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
    location: "Los Gatos, CA",
    matchScore: 87,
    matchSummary: "Strong background in gRPC microservice meshes, Cassandra storage, and real-time streaming pipelines.",
    callStatus: "not_contacted",
    email: "david.kim@streamcore.net",
    phone: "+1 (408) 555-9831",
    linkedinUrl: "https://linkedin.com/in/david-kim-eng",
    skills: ["Go", "Kafka", "Kubernetes", "gRPC", "Cassandra"],
    experienceYears: 8,
    sourcedDate: "Yesterday, 02:20 PM"
  },
  {
    id: "priya-patel",
    name: "Priya Patel",
    headline: "Staff Cloud Systems Architect · Uber Core Infrastructure",
    currentRole: "Staff Engineer",
    company: "Uber",
    previousCompany: "Lyft",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250",
    location: "San Francisco, CA",
    matchScore: 85,
    matchSummary: "Architect of large-scale geo-distributed microservice meshes handling tens of billions of events daily.",
    callStatus: "not_contacted",
    email: "priya.patel@uber-alumni.org",
    phone: "+1 (415) 555-7643",
    linkedinUrl: "https://linkedin.com/in/priya-patel-cloud",
    skills: ["Go (Golang)", "Distributed Systems", "Kafka", "Kubernetes", "Redis"],
    experienceYears: 10,
    sourcedDate: "Yesterday, 11:05 AM"
  },
  {
    id: "lucas-wright",
    name: "Lucas Wright",
    headline: "Backend Infrastructure Lead · Brex",
    currentRole: "Lead Backend Engineer",
    company: "Brex",
    previousCompany: "Coinbase",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250",
    location: "Salt Lake City, UT (Remote)",
    matchScore: 82,
    matchSummary: "Specializes in transactional ledger engines, idempotency systems, and PostgreSQL scaling.",
    callStatus: "declined",
    email: "lucas.wright@fininfra.com",
    phone: "+1 (801) 555-3219",
    linkedinUrl: "https://linkedin.com/in/lucas-wright",
    skills: ["Go", "PostgreSQL", "Kafka", "Docker", "gRPC"],
    experienceYears: 6.5,
    sourcedDate: "Sep 03, 2026"
  }
];

export const mockCampaignMetrics: CampaignMetrics = {
  totalSourced: 1480,
  activeCalls: 3,
  answerRate: 74.8,
  qualifiedCandidates: 184,
  qualificationRate: 29.8,
  funnel: [
    {
      stage: "Sourced",
      count: 1480,
      percentage: 100,
      subtext: "Simulated via Apollo & People Data Labs APIs"
    },
    {
      stage: "Contacted",
      count: 942,
      percentage: 63.6,
      subtext: "Automated Hunar.AI voice dials & SMS touches"
    },
    {
      stage: "Screened",
      count: 618,
      percentage: 41.7,
      subtext: "Completed interactive voice screening calls"
    },
    {
      stage: "Qualified",
      count: 184,
      percentage: 12.4,
      subtext: "Matched technical threshold (Score ≥ 85%)"
    }
  ],
  recentActivity: [
    {
      id: "act-1",
      title: "AI Voice Screen Completed",
      description: "Alex Johnson scored 96% match · Strong Hire recommendation",
      timestamp: "2 mins ago",
      type: "call_completed",
      candidateId: "alex-johnson",
      candidateName: "Alex Johnson",
      statusBadge: "Strong Hire"
    },
    {
      id: "act-2",
      title: "Outbound Call In Progress",
      description: "Hunar AI Agent is currently connected with Marcus Vance (Stripe)",
      timestamp: "Just now",
      type: "candidate_queued",
      candidateId: "marcus-vance",
      candidateName: "Marcus Vance",
      statusBadge: "Ringing"
    },
    {
      id: "act-3",
      title: "New Job Description Parsed",
      description: "Campaign 'Lead Distributed Systems Engineer' extracted 6 core parameters",
      timestamp: "18 mins ago",
      type: "jd_parsed",
      statusBadge: "Active"
    },
    {
      id: "act-4",
      title: "Candidate Sourced Batch",
      description: "PDL integration retrieved 34 new profiles matching Go + Kafka criteria",
      timestamp: "45 mins ago",
      type: "sourcing_started",
      statusBadge: "+34 Profiles"
    },
    {
      id: "act-5",
      title: "AI Voice Screen Completed",
      description: "Sophia Chen scored 93% match · Fast-tracked to technical interview loop",
      timestamp: "1 hr ago",
      type: "call_completed",
      candidateId: "sophia-chen",
      candidateName: "Sophia Chen",
      statusBadge: "Strong Hire"
    }
  ]
};
