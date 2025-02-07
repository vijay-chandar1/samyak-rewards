const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // First create the admin user without the tax details
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
      profileCompletion: true,
      companyDetails: {
        create: {
          companyName: 'Sample Business',
          companyAddress: '123 Business Street, City, Country'
        }
      },
      subscriptionInfo: {
        create: {
          subscriptionStatus: 'PREMIUM',
          subscriptionStart: new Date(),
          subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        }
      }
    },
    include: {
      companyDetails: true
    }
  });

  // Now create the tax details with the correct references
  if (adminUser.companyDetails) {
    await prisma.taxDetails.create({
      data: {
        countryCode: 'IN',
        taxType: 'CGST',
        taxNumber: 'GST123456789',
        taxPercentage: 18,
        vendorId: adminUser.id,
        companyDetailsId: adminUser.companyDetails.id
      }
    });
  }

  // Create employees
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password_placeholder', // Use proper hashing in production
        role: 'MANAGER',
        status: 'ACTIVE',
        permissions: {
          canViewTransactions: true,
          canCreateTransactions: true,
          canManageCustomers: true
        },
        vendorId: adminUser.id
      }
    }),
    prisma.employee.create({
      data: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'hashed_password_placeholder', // Use proper hashing in production
        role: 'EMPLOYEE',
        status: 'ACTIVE',
        permissions: {
          canViewTransactions: true,
          canCreateTransactions: true,
          canManageCustomers: false
        },
        vendorId: adminUser.id
      }
    })
  ]);

  // Create customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Alice Johnson',
        phone: '+1234567890',
        email: 'alice@example.com',
        gender: 'FEMALE',
        rewards: {
          points: 100,
          expiration: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
        },
        userId: adminUser.id
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Bob Wilson',
        phone: '+1987654321',
        email: 'bob@example.com',
        gender: 'MALE',
        rewards: {
          points: 50,
          expiration: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        },
        userId: adminUser.id
      }
    })
  ]);

  // Create transactions
  const transactions = await Promise.all([
    prisma.transaction.create({
      data: {
        phone: customers[0].phone || '',
        amount: 1500.0,
        items: [
          { itemName: 'Product A', quantity: 2, price: 500.0 },
          { itemName: 'Product B', quantity: 1, price: 500.0 }
        ],
        type: 'CASH',
        reward: {
          pointsEarned: 15,
          type: 'POINT_BASED'
        },
        category: 'Electronics',
        customerId: customers[0].id,
        userId: adminUser.id
      }
    }),
    prisma.transaction.create({
      data: {
        phone: customers[1].phone || '',
        amount: 800.0,
        items: [{ itemName: 'Product C', quantity: 1, price: 800.0 }],
        type: 'UPI',
        reward: {
          pointsEarned: 8,
          type: 'POINT_BASED'
        },
        category: 'Accessories',
        customerId: customers[1].id,
        userId: adminUser.id
      }
    })
  ]);

  // Create reward policies
  const rewardPolicies = await Promise.all([
    prisma.rewardPolicy.create({
      data: {
        name: 'Standard Points',
        type: 'POINT_BASED',
        config: {
          pointsPerHundred: 1,
          minimumAmount: 100
        },
        userId: adminUser.id
      }
    }),
    prisma.rewardPolicy.create({
      data: {
        name: 'Special Discount',
        type: 'PERCENTAGE_DISCOUNT',
        config: {
          percentage: 10,
          minimumAmount: 1000
        },
        userId: adminUser.id
      }
    })
  ]);

  // Create default promotion rules
  const defaultRule = await prisma.defaultPromotionRule.create({
    data: {
      name: 'Fixed Discount Rule',
      description: 'Standard fixed discount promotion rule',
      ruleConfig: {
        type: 'fixed',
        value: 50,
        minimumPurchase: 500
      }
    }
  });

  // Create promotions
  const promotions = await Promise.all([
    prisma.promotion.create({
      data: {
        name: 'Summer Sale',
        description: 'Special summer discounts',
        category: 'Seasonal',
        originalPrice: 1000,
        updatedPrice: 800,
        discountPercent: 20,
        images: ['summer_sale_1.jpg', 'summer_sale_2.jpg'],
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        maxRedemptions: 100,
        defaultRuleId: defaultRule.id,
        userId: adminUser.id
      }
    })
  ]);

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
