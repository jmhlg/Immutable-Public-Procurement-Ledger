# 📜 Immutable Public Procurement Ledger

Welcome to a transparent and tamper-proof system for public procurement on the blockchain! This project uses the Stacks blockchain and Clarity smart contracts to create immutable ledgers for government tenders, preventing bid rigging, collusion, and corruption by ensuring all processes are publicly verifiable and auditable.

## ✨ Features

🔒 Immutable recording of all bids and evaluations  
🛡️ Prevention of bid tampering through cryptographic hashing and timestamps  
📊 Transparent tender creation, bidding, and award processes  
⚖️ Automated dispute resolution mechanisms  
🔍 Public audit trails for accountability  
🚫 Detection of suspicious patterns (e.g., identical bids)  
💰 Secure milestone-based payments  
👥 Role-based access for agencies, bidders, and auditors  

## 🛠 How It Works

This system addresses the real-world problem of bid rigging in public procurement, where companies secretly collude to inflate prices or manipulate outcomes, costing governments billions annually. By leveraging blockchain's immutability, all steps—from tender announcement to contract awarding—are recorded transparently, making fraud detectable and deterring corruption.

The project involves 8 smart contracts written in Clarity, each handling a specific aspect of the procurement lifecycle:

1. **AgencyRegistry.clar**: Registers government agencies and verifies their identities to initiate tenders.  
2. **BidderRegistry.clar**: Onboards bidders with KYC-like verification to ensure legitimate participants.  
3. **TenderCreation.clar**: Allows registered agencies to create new tenders with details like description, deadlines, and criteria.  
4. **BidSubmission.clar**: Enables sealed bid submissions using hashes; bids are encrypted until the opening phase.  
5. **BidOpening.clar**: Automatically reveals bids after the deadline, preventing premature access.  
6. **EvaluationEngine.clar**: Scores bids based on predefined criteria and flags anomalies (e.g., duplicate hashes).  
7. **AwardContract.clar**: Awards the contract to the winner and locks in the terms immutably.  
8. **AuditTrail.clar**: Logs all actions across contracts for public querying and verification.

**For Government Agencies**  
- Register via AgencyRegistry.  
- Create a tender using TenderCreation, specifying requirements and timelines.  
- Monitor bids through BidOpening and evaluate with EvaluationEngine.  
- Award via AwardContract and track progress.

**For Bidders**  
- Register in BidderRegistry.  
- Submit hashed bids to BidSubmission before the deadline.  
- Verify outcomes publicly via AuditTrail.

**For Auditors/Public**  
- Query any tender's full history using AuditTrail for transparency.  
- Use built-in functions to check for rigging indicators.

Deployment is straightforward on Stacks: Deploy each contract in sequence, linking them via contract calls for a seamless workflow. This ensures end-to-end immutability, reducing corruption and saving public funds!