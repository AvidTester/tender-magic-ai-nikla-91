
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load models
const User = require('./models/User');
const Tender = require('./models/Tender');
const Submission = require('./models/Submission');
const Evaluation = require('./models/Evaluation');
const Dispute = require('./models/Dispute');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'Vendor Company',
    email: 'vendor@example.com',
    password: 'password123',
    role: 'vendor'
  },
  {
    name: 'Evaluator One',
    email: 'evaluator1@example.com',
    password: 'password123',
    role: 'evaluator'
  },
  {
    name: 'Evaluator Two',
    email: 'evaluator2@example.com',
    password: 'password123',
    role: 'evaluator'
  },
  {
    name: 'Tech Office Pro',
    email: 'tech@officegroup.com',
    password: 'password123',
    role: 'vendor'
  },
  {
    name: 'Business Equipment Specialists',
    email: 'info@bespecialists.com',
    password: 'password123',
    role: 'vendor'
  },
  {
    name: 'Office Solutions Inc.',
    email: 'contact@officesolutions.com',
    password: 'password123',
    role: 'vendor'
  }
];

// Import data into DB
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Tender.deleteMany();
    await Submission.deleteMany();
    await Evaluation.deleteMany();
    await Dispute.deleteMany();
    
    console.log('Data cleared from database...');
    
    // Create users with hashed passwords
    const createdUsers = [];
    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      
      const createdUser = await User.create(user);
      createdUsers.push(createdUser);
    }
    
    // Get user IDs by role for reference
    const adminId = createdUsers.find(user => user.role === 'admin')._id;
    const evaluator1Id = createdUsers.find(user => user.email === 'evaluator1@example.com')._id;
    const evaluator2Id = createdUsers.find(user => user.email === 'evaluator2@example.com')._id;
    const vendorIds = createdUsers.filter(user => user.role === 'vendor').map(user => ({
      id: user._id,
      name: user.name
    }));
    
    // Create tenders
    const tenders = [
      {
        title: 'Office Equipment Procurement',
        description: 'Seeking a vendor to supply office equipment including computers, printers, and furniture.',
        category: 'Equipment',
        status: 'Awarded',
        budget: '$50,000',
        organization: 'Ministry of Education',
        publishDate: new Date('2025-04-01'),
        deadline: new Date('2025-04-30'),
        endDate: new Date('2025-05-01'),
        createdBy: adminId,
        documents: [
          { 
            name: 'Tender Specification Document', 
            type: 'pdf', 
            size: '2.4 MB',
            url: '/documents/specs.pdf'
          },
          { 
            name: 'Equipment Requirements', 
            type: 'docx', 
            size: '1.8 MB',
            url: '/documents/requirements.docx' 
          },
          { 
            name: 'Evaluation Criteria', 
            type: 'pdf', 
            size: '1.1 MB',
            url: '/documents/evaluation.pdf'
          }
        ],
        disputeTimeFrameDays: 7
      },
      {
        title: 'IT Services Procurement',
        description: 'Looking for a provider of IT services, including network maintenance, cybersecurity, and cloud solutions.',
        category: 'IT',
        status: 'Open',
        budget: '$120,000',
        organization: 'Department of Health',
        publishDate: new Date('2025-04-15'),
        deadline: new Date('2025-06-15'),
        createdBy: adminId,
        documents: [
          { 
            name: 'IT Services RFP', 
            type: 'pdf', 
            size: '3.1 MB',
            url: '/documents/it-rfp.pdf'
          },
          { 
            name: 'Service Level Requirements', 
            type: 'docx', 
            size: '1.5 MB',
            url: '/documents/sla.docx' 
          }
        ],
        disputeTimeFrameDays: 7
      },
      {
        title: 'Construction Services',
        description: 'Requesting bids for construction services for a new office building.',
        category: 'Construction',
        status: 'Open',
        budget: '$2,500,000',
        organization: 'City Council',
        publishDate: new Date('2025-05-01'),
        deadline: new Date('2025-07-01'),
        createdBy: adminId,
        documents: [
          { 
            name: 'Construction Plan', 
            type: 'pdf', 
            size: '8.2 MB',
            url: '/documents/construction-plan.pdf'
          }
        ],
        disputeTimeFrameDays: 7
      },
      {
        title: 'Office Supplies Contract',
        description: 'Recurring supply of office materials including paper, pens, and other stationery items.',
        category: 'Supply',
        status: 'Open',
        budget: '$15,000',
        organization: 'Ministry of Finance',
        publishDate: new Date('2025-04-01'),
        deadline: new Date('2025-05-20'),
        createdBy: adminId,
        documents: [
          { 
            name: 'Supply Contract', 
            type: 'pdf', 
            size: '1.2 MB',
            url: '/documents/supply-contract.pdf'
          }
        ],
        disputeTimeFrameDays: 7
      }
    ];
    
    const createdTenders = [];
    for (const tender of tenders) {
      const createdTender = await Tender.create(tender);
      createdTenders.push(createdTender);
    }
    
    // Create submissions for the awarded tender
    const officeEquipmentTender = createdTenders.find(t => t.title === 'Office Equipment Procurement');
    
    // Get specific vendor IDs by company name
    const officeProVendor = vendorIds.find(v => v.name === 'Office Solutions Inc.');
    const techOfficeVendor = vendorIds.find(v => v.name === 'Tech Office Pro');
    const besVendor = vendorIds.find(v => v.name === 'Business Equipment Specialists');
    
    // Create submissions
    const submissions = [
      {
        tenderId: officeEquipmentTender._id,
        tenderTitle: officeEquipmentTender.title,
        vendorId: officeProVendor.id,
        vendorName: officeProVendor.name,
        submissionDate: new Date('2025-04-15'),
        status: 'Winner',
        documents: [
          {
            id: '1',
            name: 'Technical Proposal',
            type: 'pdf',
            size: '3.2 MB',
            url: '/documents/vendor1-technical.pdf'
          },
          {
            id: '2',
            name: 'Financial Proposal',
            type: 'pdf',
            size: '1.8 MB',
            url: '/documents/vendor1-financial.pdf'
          }
        ],
        averageScore: 88.7,
        rank: 1
      },
      {
        tenderId: officeEquipmentTender._id,
        tenderTitle: officeEquipmentTender.title,
        vendorId: techOfficeVendor.id,
        vendorName: techOfficeVendor.name,
        submissionDate: new Date('2025-04-15'),
        status: 'Evaluated',
        documents: [
          {
            id: '1',
            name: 'Technical Proposal',
            type: 'pdf',
            size: '2.9 MB',
            url: '/documents/vendor2-technical.pdf'
          },
          {
            id: '2',
            name: 'Financial Proposal',
            type: 'pdf',
            size: '1.5 MB',
            url: '/documents/vendor2-financial.pdf'
          }
        ],
        averageScore: 85.5,
        rank: 2
      },
      {
        tenderId: officeEquipmentTender._id,
        tenderTitle: officeEquipmentTender.title,
        vendorId: besVendor.id,
        vendorName: besVendor.name,
        submissionDate: new Date('2025-04-14'),
        status: 'Rejected',
        rejectionDate: new Date('2025-05-01'),
        documents: [
          {
            id: '1',
            name: 'Technical Proposal',
            type: 'pdf',
            size: '2.5 MB',
            url: '/documents/vendor3-technical.pdf'
          },
          {
            id: '2',
            name: 'Financial Proposal',
            type: 'pdf',
            size: '1.2 MB',
            url: '/documents/vendor3-financial.pdf'
          }
        ],
        averageScore: 0,
        rank: 0
      }
    ];
    
    const createdSubmissions = [];
    for (const submission of submissions) {
      const createdSubmission = await Submission.create(submission);
      createdSubmissions.push(createdSubmission);
    }
    
    // Update tender with winner
    const winnerSubmission = createdSubmissions.find(s => s.status === 'Winner');
    officeEquipmentTender.winner = {
      vendorId: winnerSubmission.vendorId,
      vendorName: winnerSubmission.vendorName,
      score: winnerSubmission.averageScore,
      submissionDate: winnerSubmission.submissionDate
    };
    await officeEquipmentTender.save();
    
    // Create evaluations
    const evaluations = [];
    
    // Get the IDs of the evaluated and winner submissions
    const winnerSubId = createdSubmissions.find(s => s.status === 'Winner')._id;
    const evaluatedSubId = createdSubmissions.find(s => s.status === 'Evaluated')._id;
    
    // Evaluations for winner submission
    evaluations.push({
      tenderId: officeEquipmentTender._id,
      submissionId: winnerSubId,
      evaluatorId: evaluator1Id,
      evaluatorName: 'Evaluator One',
      scores: {
        technical: 85,
        financial: 92,
        experience: 88,
        implementation: 90
      },
      comments: 'Strong financial proposal with good implementation plan.',
      overallScore: 88.75,
      rank: 1
    });
    
    evaluations.push({
      tenderId: officeEquipmentTender._id,
      submissionId: winnerSubId,
      evaluatorId: evaluator2Id,
      evaluatorName: 'Evaluator Two',
      scores: {
        technical: 87,
        financial: 90,
        experience: 86,
        implementation: 92
      },
      comments: 'Well-balanced proposal with excellent implementation strategy.',
      overallScore: 88.75,
      rank: 1
    });
    
    // Evaluations for evaluated submission
    evaluations.push({
      tenderId: officeEquipmentTender._id,
      submissionId: evaluatedSubId,
      evaluatorId: evaluator1Id,
      evaluatorName: 'Evaluator One',
      scores: {
        technical: 88,
        financial: 80,
        experience: 92,
        implementation: 82
      },
      comments: 'Strong technical proposal with excellent experience.',
      overallScore: 85.5,
      rank: 2
    });
    
    evaluations.push({
      tenderId: officeEquipmentTender._id,
      submissionId: evaluatedSubId,
      evaluatorId: evaluator2Id,
      evaluatorName: 'Evaluator Two',
      scores: {
        technical: 90,
        financial: 78,
        experience: 88,
        implementation: 85
      },
      comments: 'Excellent technical approach but financial proposal is not as strong.',
      overallScore: 85.25,
      rank: 2
    });
    
    // Create all evaluations
    for (const evaluation of evaluations) {
      await Evaluation.create(evaluation);
    }
    
    // Create example dispute
    const dispute = {
      tenderId: officeEquipmentTender._id,
      tenderTitle: officeEquipmentTender.title,
      vendorId: techOfficeVendor.id,
      vendorName: techOfficeVendor.name,
      winnerId: officeProVendor.id,
      winnerName: officeProVendor.name,
      reason: 'Our bid offered a better warranty package (5 years vs 3 years) and our equipment has higher energy efficiency ratings which would result in cost savings over time. We believe these factors were not properly weighted in the evaluation.',
      status: 'pending',
      createdAt: new Date('2025-05-02T10:30:00'),
      disputeType: 'winner'
    };
    
    await Dispute.create(dispute);
    
    console.log('Data imported successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error importing data: ${error}`);
    process.exit(1);
  }
};

// Delete data from DB
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Tender.deleteMany();
    await Submission.deleteMany();
    await Evaluation.deleteMany();
    await Dispute.deleteMany();
    
    console.log('Data destroyed...');
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

// Check command line args and run appropriate function
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please use correct command: node seeder -i (import) or node seeder -d (delete)');
  process.exit(1);
}
