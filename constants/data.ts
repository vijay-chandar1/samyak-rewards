import { NavItem } from '@/types';
import { Prisma } from '@prisma/client';
import type {
  Role as PrismaRole,
  Gender as PrismaGender,
  TransactionType as PrismaTransactionType,
  SubscriptionStatus as PrismaSubscriptionStatus,
  TaxType as PrismaTaxType,
  EmployeeStatus as PrismaEmployeeStatus,
  RewardPolicyType as PrismaRewardPolicyType
} from '@prisma/client';

export type Role = PrismaRole;
export type Gender = PrismaGender;
export type TransactionType = PrismaTransactionType;
export type SubscriptionStatus = PrismaSubscriptionStatus;
export type TaxType = PrismaTaxType;
export type EmployeeStatus = PrismaEmployeeStatus;
export type RewardPolicyType = PrismaRewardPolicyType;

export type User = {
  id: string;
  name?: string | null;
  email: string;
  emailVerified?: Date | null;
  image?: string | null;
  phone?: string | null;
  role: Role;
  isActive: boolean;
  profileCompletion: boolean;
  createdAt: Date;
  updatedAt: Date;
  settings?: Prisma.JsonValue | null;
  companyDetails?: CompanyDetails | null;
};

export type Account = {
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Session = {
  sessionToken: string;
  userId: string;
  expires: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type VerificationToken = {
  identifier: string;
  token: string;
  expires: Date;
};

export type Authenticator = {
  credentialID: string;
  userId: string;
  providerAccountId: string;
  credentialPublicKey: string;
  counter: number;
  credentialDeviceType: string;
  credentialBackedUp: boolean;
  transports?: string | null;
};

export type Employee = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  status: EmployeeStatus;
  permissions?: Prisma.JsonValue | null;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  vendorId: string;
};

export type Customer = {
  id: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  gender?: Gender | null;
  taxNumber?: string | null;
  rewards?: Prisma.JsonValue | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export type Transaction = {
  id: string;
  billerDetails?: Prisma.JsonValue | null;
  discountPercentage: number;
  phone: string;
  amount: number;
  type: TransactionType;
  reward?: Prisma.JsonValue | null;
  description?: string | null;
  category?: string | null;
  createdAt:  Date | string | null;
  updatedAt:  Date | string | null;
  customerId?: string | null;
  userId: string;
};

export type TransactionItem = {
  id: string;
  transactionId: string;
  name: string;
  quantity: number;
  price: number;
  taxRate: number;
  totalAmount: number;
  description?: string | null; 
  category?: string | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
};

export type TransactionAudit = {
  id: string;
  transactionId: string;
  originalValues: Prisma.JsonValue;
  timestamp: Date;
  userId: string;
};

export type InvoiceGeneration = {
  id: string;
  transactionId: string;
  referenceNumber: string;
  generatedAt: Date;
  generatedBy?: string | null;
  metadata?: Prisma.JsonValue | null;
};

export type Promotion = {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  originalPrice: number;
  updatedPrice: number;
  discountPercent: number;
  images: string[];
  startDate: string | Date;
  endDate: string | Date;
  isActive: boolean;
  maxRedemptions?: number | null;
  currentRedemptions: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  userId: string;
  defaultRuleId?: string | null;
  customRuleConfig?: any;
  defaultRule?: DefaultPromotionRule | null;
};


export type CompanyDetails = {
  id: string;
  companyName: string;
  companyLogo?: string | null;
  companyAddress: string;
  userId: string;
  taxDetails: TaxDetails[];
};

export type TaxDetails = {
  id: string;
  taxType: TaxType;
  taxNumber: string;
  vendorId: string;
  companyDetailsId: string;
};


export type RewardPolicy = {
  id: string;
  name: string;
  type: RewardPolicyType;
  config: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date | null;
  expiry?: number | null;
  userId: string;
};

export type RewardPolicyData = {
  type: RewardPolicyType;
  config: any;
  expiry?: number | null;
};

export type DefaultPromotionRule = {
  id: string;
  name: string;
  description?: string | null;
  ruleConfig: any;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export interface Country {
  id: number;
  name: string;
  phonecode: string;
  sortname: string;
}

export interface State {
  id: number;
  name: string;
  country_id: number;
}

export interface City {
  id: number;
  name: string;
  state_id: number;
}

export interface CountrySelectProps {
  onChange: (country: Country) => void;
  placeHolder?: string;
}

export interface StateSelectProps {
  countryid: number;
  onChange: (state: State) => void;
  placeHolder?: string;
}

export interface CitySelectProps {
  countryid: number;
  stateid: number;
  onChange: (city: City) => void;
  placeHolder?: string;
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  {
    title: 'Transaction',
    url: '/dashboard/transaction',
    icon: 'transaction',
    shortcut: ['q', 'q'],
    isActive: false,
    items: []
  },
  {
    title: 'Customer',
    url: '/dashboard/customer',
    icon: 'customer',
    shortcut: ['c', 'c'],
    isActive: false,
    items: []
  },
  {
    title: 'Promotion',
    url: '/dashboard/promotion',
    icon: 'promotion',
    shortcut: ['p', 'p'],
    isActive: false,
    items: []
  },
  // {
  //   title: 'Employee',
  //   url: '/dashboard/employee',
  //   icon: 'employee',
  //   shortcut: ['e', 'e'],
  //   isActive: false,
  //   items: []
  // },
  {
    title: 'Gift Card',
    url: '/dashboard/giftcard',
    icon: 'giftcard',
    shortcut: ['g', 'g'],
    isActive: false,
    items: []
  },
  {
    title: 'Account',
    url: '#',
    icon: 'billing',
    isActive: true,
    items: [
      {
        title: 'Profile',
        url: '/dashboard/profile',
        icon: 'userPen',
        shortcut: ['m', 'm']
      },
      {
        title: 'Subscription',
        shortcut: ['s', 's'],
        url: '/dashboard/subscription',
        icon: 'subscription'
      }
    ]
  }
];
