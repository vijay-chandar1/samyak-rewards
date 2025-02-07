'use client';

import { useEffect, useState } from 'react';
import { fetchGiftCards, deleteGiftCard } from './actions';
import { GiftCard, GiftCardStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Plus } from 'lucide-react';
import GiftCardForm from './giftcard-form';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';

const gradientClasses = [
  'from-green-50/80 to-blue-50/80 dark:from-green-900/30 dark:to-blue-900/30',
  'from-purple-50/80 to-pink-50/80 dark:from-purple-900/30 dark:to-pink-900/30',
  'from-orange-50/80 to-red-50/80 dark:from-orange-900/30 dark:to-red-900/30',
  'from-indigo-50/80 to-cyan-50/80 dark:from-indigo-900/30 dark:to-cyan-900/30'
];

const sortOptions = [
  { value: 'createdAtDesc', label: 'Newest' },
  { value: 'createdAtAsc', label: 'Oldest' },
  { value: 'expirationDateAsc', label: 'Expiration (earliest)' },
  { value: 'expirationDateDesc', label: 'Expiration (latest)' },
  { value: 'amountAsc', label: 'Amount (low to high)' },
  { value: 'amountDesc', label: 'Amount (high to low)' },
];

const getGradientClass = (index: number) => {
  return gradientClasses[index % 4];
};

const getStatusColor = (status: GiftCardStatus) => {
  const colors = {
    ACTIVE: 'bg-green-600 dark:bg-green-300',
    USED: 'bg-blue-600 dark:bg-blue-300',
    EXPIRED: 'bg-gray-600 dark:bg-gray-300',
    REVOKED: 'bg-red-600 dark:bg-red-300'
  };
  return colors[status] || 'bg-gray-600 dark:bg-gray-300';
};

export default function GiftCardList({ initialGiftCards }: { initialGiftCards: GiftCard[] }) {
  const [giftCards, setGiftCards] = useState<GiftCard[]>(initialGiftCards);
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<GiftCardStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<string>('createdAtDesc');

  const loadGiftCards = async () => {
    try {
      const result = await fetchGiftCards();
      if (!result.error && result.giftCards) {
        setGiftCards(result.giftCards as GiftCard[]);
      }
    } catch (error) {
      toast.error('Failed to load gift cards');
    }
  };

  const displayedGiftCards = giftCards
    .filter(card => filterStatus === 'ALL' ? true : card.status === filterStatus)
    .sort((a, b) => {
      switch(sortBy) {
        case 'createdAtDesc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'createdAtAsc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'expirationDateAsc':
          return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
        case 'expirationDateDesc':
          return new Date(b.expirationDate).getTime() - new Date(a.expirationDate).getTime();
        case 'amountAsc':
          return a.amount - b.amount;
        case 'amountDesc':
          return b.amount - a.amount;
        default:
          return 0;
      }
    });

  const handleDelete = async () => {
    if (!cardToDelete) return;
    
    setDeleteLoading(true);
    try {
      const result = await deleteGiftCard(cardToDelete);
      if (result?.error) {
        throw new Error(result.error);
      }
      toast.success('Gift card deleted successfully');
      await loadGiftCards();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete gift card');
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setCardToDelete(null);
    }
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <AlertModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <GiftCardForm 
            onSuccess={async () => {
              await loadGiftCards();
              setIsCreateDialogOpen(false);
              toast.success('Gift card created successfully');
            }} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          {selectedCard && (
            <GiftCardForm 
              initialData={selectedCard} 
              onSuccess={async () => {
                await loadGiftCards();
                setIsEditDialogOpen(false);
                toast.success('Gift card updated successfully');
              }} 
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200">Gift Cards</h1>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="w-full md:w-auto"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Gift Card
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Filter: {filterStatus === 'ALL' ? 'All Statuses' : filterStatus}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setFilterStatus('ALL')}>
              All Statuses
            </DropdownMenuItem>
            {Object.values(GiftCardStatus).map(status => (
              <DropdownMenuItem key={status} onSelect={() => setFilterStatus(status)}>
                {status}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Sort by: {sortOptions.find(opt => opt.value === sortBy)?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {sortOptions.map(option => (
              <DropdownMenuItem 
                key={option.value} 
                onSelect={() => setSortBy(option.value)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {displayedGiftCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg bg-muted/50 dark:bg-muted/20">
          <h3 className="text-base md:text-lg font-semibold mb-2 dark:text-gray-300">No gift cards found</h3>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-4">Get started by creating a new gift card</p>
          <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Gift Card
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {displayedGiftCards.map((card, index) => (
            <Card 
              key={card.id} 
              className={`relative bg-gradient-to-br ${getGradientClass(index)} min-h-[180px] flex flex-col 
                border dark:border-gray-700`}
            >
              <CardHeader className="flex flex-row justify-between items-start p-3 pb-1 space-y-0">
                <div className="space-y-1 max-w-[80%]">
                  <Badge className={`${getStatusColor(card.status)} text-white dark:text-gray-900 text-xs`}>
                    {card.status}
                  </Badge>
                  <span className="font-mono font-semibold text-gray-800 dark:text-gray-200 text-sm truncate block mt-1">
                    {card.code}
                  </span>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-7 w-7 flex items-center justify-center absolute top-2 right-2">
                    <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="dark:bg-gray-800">
                    <DropdownMenuItem
                      className="dark:hover:bg-gray-700"
                      onClick={() => {
                        setSelectedCard(card);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 dark:text-red-400 dark:hover:bg-gray-700"
                      onClick={() => {
                        setCardToDelete(card.id);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              
              <CardContent className="p-3 pt-0 flex-1">
                <div className="space-y-2">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    ₹{card.amount}
                  </div>
                  {card.description && (
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {card.description}
                    </p>
                  )}
                  <div className="text-[0.7rem] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Valid until: {format(new Date(card.expirationDate), 'MMM dd, yyyy')}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-3 pt-0 mt-auto">
                <div className="text-[0.65rem] sm:text-xs text-gray-400 dark:text-gray-500 w-full text-right">
                  Created: {format(new Date(card.createdAt), 'MMM dd, yyyy')}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}