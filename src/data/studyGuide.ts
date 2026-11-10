export interface StudySection {
  id: string;
  title: string;
  domain: 1 | 2 | 3 | 4 | 5;
  iconName: string;
  summary: string;
  details: {
    heading: string;
    items: { label: string; value: string; note?: string }[];
  }[];
}

export const STUDY_GUIDE_DATA: StudySection[] = [
  {
    id: 'ethics',
    title: 'ISC2 Code of Ethics Canons (In Strict Priority)',
    domain: 1,
    iconName: 'ShieldCheck',
    summary: 'Members must follow all four canons in order of priority. Canon 1 always takes precedence over employers or personal loyalty.',
    details: [
      {
        heading: 'The 4 Mandatory Canons (In Hierarchical Order)',
        items: [
          {
            label: 'Canon 1 (Highest)',
            value: 'Protect society, the common good, necessary public trust, and the infrastructure.',
            note: 'Always supersedes client and employer demands.',
          },
          {
            label: 'Canon 2',
            value: 'Act honorably, honestly, justly, responsibly, and legally.',
            note: 'Maintain integrity in all professional dealings.',
          },
          {
            label: 'Canon 3',
            value: 'Provide diligent and competent service to principals.',
            note: 'Deliver faithful service within areas of competence.',
          },
          {
            label: 'Canon 4',
            value: 'Advance and protect the profession.',
            note: 'Avoid bringing discredit; mentor others; support fellow members.',
          },
        ],
      },
    ],
  },
  {
    id: 'risk-formulas',
    title: 'Quantitative Risk Analysis Formulas',
    domain: 1,
    iconName: 'Calculator',
    summary: 'Official mathematical models used to evaluate financial impact and justify security investments.',
    details: [
      {
        heading: 'Formulas & Definitions',
        items: [
          {
            label: 'Asset Value (AV)',
            value: 'Total financial worth of the asset (replacement, business value, intellectual property).',
          },
          {
            label: 'Exposure Factor (EF)',
            value: 'Percentage (%) of asset value lost when a specific incident occurs (e.g., 40% = 0.40).',
          },
          {
            label: 'Single Loss Expectancy (SLE)',
            value: 'SLE = AV × EF',
            note: 'Monetary loss expected from a single occurrence of the threat.',
          },
          {
            label: 'Annualized Rate of Occurrence (ARO)',
            value: 'Estimated frequency per year (e.g., once every 4 years = 0.25; twice a year = 2.0).',
          },
          {
            label: 'Annualized Loss Expectancy (ALE)',
            value: 'ALE = SLE × ARO',
            note: 'Monetary loss expected over an entire calendar year.',
          },
          {
            label: 'Cost-Benefit Analysis (CBA)',
            value: 'Value = (ALE_before - ALE_after) - ACSC',
            note: 'ACSC = Annual Cost of Safeguard/Countermeasure. If positive, control is financially justified.',
          },
        ],
      },
    ],
  },
  {
    id: 'bcp-drp-metrics',
    title: 'BCP / DRP Time Targets & Disaster Sites',
    domain: 2,
    iconName: 'Clock',
    summary: 'Recovery metrics determine business viability during disasters. Site types balance cost and recovery speed.',
    details: [
      {
        heading: 'Time Metrics',
        items: [
          {
            label: 'MTD (Maximum Tolerable Downtime)',
            value: 'Maximum time a business process can be inoperable before irreversible failure occurs.',
            note: 'MTD = RTO + WRT',
          },
          {
            label: 'RTO (Recovery Time Objective)',
            value: 'Target duration of time within which a business process must be restored after disruption.',
          },
          {
            label: 'RPO (Recovery Point Objective)',
            value: 'Maximum acceptable amount of data loss measured backwards in time from incident.',
          },
          {
            label: 'WRT (Work Recovery Time)',
            value: 'Time needed to verify system integrity, test applications, and resume normal operations.',
          },
        ],
      },
      {
        heading: 'Disaster Recovery Site Types',
        items: [
          {
            label: 'Hot Site',
            value: 'Fully equipped, real-time data replication, personnel ready. Failover: Seconds to minutes. Cost: $$$$',
          },
          {
            label: 'Warm Site',
            value: 'Hardware and communications pre-installed; data backups must be restored. Failover: Hours to days. Cost: $$',
          },
          {
            label: 'Cold Site',
            value: 'Empty facility with basic power and HVAC; no pre-installed computing hardware. Failover: Weeks. Cost: $',
          },
          {
            label: 'Mobile Site',
            value: 'Self-contained vehicle or modular trailer equipped with computers brought to location.',
          },
        ],
      },
    ],
  },
  {
    id: 'nist-incident-response',
    title: 'NIST SP 800-61 Rev. 2 Incident Response Lifecycle',
    domain: 2,
    iconName: 'AlertTriangle',
    summary: 'The standard four-stage framework for managing cybersecurity incidents.',
    details: [
      {
        heading: 'The 4 NIST Phases',
        items: [
          {
            label: 'Phase 1: Preparation',
            value: 'Forming CSIRT, creating response policies, tool procurement, training, hardening systems.',
          },
          {
            label: 'Phase 2: Detection & Analysis',
            value: 'Monitoring SIEM alerts, identifying indicators of compromise (IoC), assessing incident scope.',
          },
          {
            label: 'Phase 3: Containment, Eradication & Recovery',
            value: 'Quarantining systems (containment), removing malware/artifacts (eradication), restoring from clean backups (recovery).',
          },
          {
            label: 'Phase 4: Post-Incident Activity',
            value: 'Lessons learned meeting, updating incident documentation, updating defenses to prevent recurrence.',
          },
        ],
      },
    ],
  },
  {
    id: 'access-control-models',
    title: 'Access Control Schemes & Biometrics',
    domain: 3,
    iconName: 'Lock',
    summary: 'Foundational models governing how subjects access objects and how authentication is evaluated.',
    details: [
      {
        heading: 'Models',
        items: [
          {
            label: 'DAC (Discretionary Access Control)',
            value: 'Owner of the object has full discretion over permissions (e.g., standard Windows NTFS file permissions).',
          },
          {
            label: 'MAC (Mandatory Access Control)',
            value: 'Central authority applies security classifications & clearances (e.g. Top Secret, Secret, Unclassified). Users cannot alter labels.',
          },
          {
            label: 'RBAC (Role-Based Access Control)',
            value: 'Permissions are assigned to roles or job positions, not individual users.',
          },
          {
            label: 'ABAC (Attribute-Based Access Control)',
            value: 'Dynamic decisions based on subject, resource, action, and environmental attributes (time, IP, device).',
          },
        ],
      },
      {
        heading: 'Biometric Metrics',
        items: [
          {
            label: 'FAR (False Acceptance Rate)',
            value: 'Type II error: System mistakenly grants access to an unauthorized imposter. (Most dangerous!)',
          },
          {
            label: 'FRR (False Rejection Rate)',
            value: 'Type I error: System mistakenly rejects an authorized legitimate user. (Inconvenient)',
          },
          {
            label: 'CER / EER (Crossover / Equal Error Rate)',
            value: 'The point where FAR equals FRR. Lower CER = higher overall biometric accuracy.',
          },
        ],
      },
    ],
  },
  {
    id: 'osi-ports',
    title: 'OSI 7 Layers & Common Port Numbers',
    domain: 4,
    iconName: 'Network',
    summary: 'The bedrock of network communication protocols and firewall filtering rules.',
    details: [
      {
        heading: 'OSI 7 Layers (All People Seem To Need Data Processing)',
        items: [
          { label: 'Layer 7 - Application', value: 'HTTP, HTTPS, DNS, SSH, FTP, SMTP. Data unit: Data.' },
          { label: 'Layer 6 - Presentation', value: 'Syntax, compression, TLS/SSL, encryption. Data unit: Data.' },
          { label: 'Layer 5 - Session', value: 'Session establishment, RPC, NetBIOS. Data unit: Data.' },
          { label: 'Layer 4 - Transport', value: 'TCP, UDP, ports. Data unit: Segments.' },
          { label: 'Layer 3 - Network', value: 'IPv4, IPv6, ICMP, Routers, IPsec. Data unit: Packets.' },
          { label: 'Layer 2 - Data Link', value: 'Ethernet, MAC addresses, Switches, VLANs. Data unit: Frames.' },
          { label: 'Layer 1 - Physical', value: 'Cabling, Hubs, RF signals, Bit streams. Data unit: Bits.' },
        ],
      },
      {
        heading: 'Crucial Ports to Memorize for the CC Exam',
        items: [
          { label: 'Port 20 / 21', value: 'FTP (File Transfer Protocol - unencrypted)' },
          { label: 'Port 22', value: 'SSH / SFTP (Secure Shell / Secure FTP - encrypted)' },
          { label: 'Port 23', value: 'Telnet (Cleartext terminal - insecure)' },
          { label: 'Port 25', value: 'SMTP (Simple Mail Transfer Protocol - mail transmission)' },
          { label: 'Port 53', value: 'DNS (Domain Name System - name resolution, UDP/TCP)' },
          { label: 'Port 67 / 68', value: 'DHCP (Dynamic Host Configuration Protocol)' },
          { label: 'Port 80', value: 'HTTP (Hypertext Transfer Protocol - cleartext web)' },
          { label: 'Port 110', value: 'POP3 (Post Office Protocol v3 - email retrieval)' },
          { label: 'Port 123', value: 'NTP (Network Time Protocol - clock synchronization)' },
          { label: 'Port 143', value: 'IMAP (Internet Message Access Protocol - email retrieval)' },
          { label: 'Port 161 / 162', value: 'SNMP (Simple Network Management Protocol - monitoring)' },
          { label: 'Port 389', value: 'LDAP (Lightweight Directory Access Protocol - cleartext)' },
          { label: 'Port 443', value: 'HTTPS (HTTP Secure over TLS - encrypted web)' },
          { label: 'Port 445', value: 'SMB (Server Message Block - Windows file sharing)' },
          { label: 'Port 636', value: 'LDAPS (LDAP over SSL/TLS)' },
          { label: 'Port 3389', value: 'RDP (Remote Desktop Protocol)' },
        ],
      },
    ],
  },
  {
    id: 'data-lifecycle',
    title: 'Data Security Lifecycle & Sanitization',
    domain: 5,
    iconName: 'Server',
    summary: 'Managing data protection throughout its lifespan and sanitizing media safely.',
    details: [
      {
        heading: 'Data Security Lifecycle (CSUSAD)',
        items: [
          { label: '1. Create', value: 'Data generation or acquisition from outside source.' },
          { label: '2. Store', value: 'Writing data to persistent database, cloud, or storage array.' },
          { label: '3. Use', value: 'Data in memory/RAM being processed or modified.' },
          { label: '4. Share', value: 'Transmitting data to authorized partners or third parties.' },
          { label: '5. Archive', value: 'Long-term immutable storage for retention and regulatory compliance.' },
          { label: '6. Destroy', value: 'Irreversible sanitization and destruction of media.' },
        ],
      },
      {
        heading: 'Sanitization Methods',
        items: [
          { label: 'Clearing', value: 'Logical overwriting with 1s and 0s (reusable within the same organization).' },
          { label: 'Purging (Degaussing)', value: 'Exposing magnetic media (tapes/HDDs) to a powerful magnetic field to render unreadable. Does NOT work on SSDs!' },
          { label: 'Cryptographic Erasure', value: 'Securely deleting the encryption key, rendering ciphertext forever indecipherable.' },
          { label: 'Physical Destruction', value: 'Disintegration, incineration, or shredding. The only 100% guarantee for high-security media.' },
        ],
      },
    ],
  },
];
