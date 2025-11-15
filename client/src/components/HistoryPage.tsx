import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Clock, Check, X, AlertCircle, FileCheck, Download } from "lucide-react";
import type { Transaction } from "@/App";

interface HistoryPageProps {
  transactions: Transaction[];
  onGoHome: () => void;
  onViewRequest: (requestId: string) => void;
}

const downloadBase64File = (base64Data: string, fileName: string, mimeType: string) => {
  const dataUrl = base64Data.startsWith('data:') ? base64Data : `data:${mimeType};base64,${base64Data}`;
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const statusColors: Record<string, string> = {
  submitted: 'bg-primary text-foreground',
  processing: 'bg-secondary text-foreground',
  paid: 'bg-success text-foreground',
  rejected: 'bg-destructive text-foreground',
  cancelled: 'bg-muted text-foreground',
  pending: 'bg-yellow-500 text-foreground',
  confirmed: 'bg-success text-foreground',
};

const statusLabels: Record<string, string> = {
  submitted: 'ОТПРАВЛЕНА',
  processing: 'В ОБРАБОТКЕ',
  paid: 'ОПЛАЧЕНО',
  rejected: 'ОТКЛОНЕНО',
  cancelled: 'ОТМЕНЕНО',
  pending: 'ОЖИДАНИЕ',
  confirmed: 'ПОДТВЕРЖДЕНО',
};

const statusIcons: Record<string, any> = {
  submitted: AlertCircle,
  processing: Clock,
  paid: Check,
  rejected: X,
  cancelled: X,
  pending: Clock,
  confirmed: Check,
};

export default function HistoryPage({ transactions, onGoHome, onViewRequest }: HistoryPageProps) {
  const activeTransactions = transactions.filter(tx => 
    tx.status === 'submitted' || tx.status === 'processing' || tx.status === 'pending'
  );
  
  const historyTransactions = transactions.filter(tx => 
    tx.status === 'paid' || tx.status === 'rejected' || tx.status === 'cancelled' || tx.status === 'confirmed'
  );

  const renderTransactionCard = (tx: Transaction) => {
    const isDeposit = tx.type === 'deposit';
    
    return (
      <Card 
        key={tx.id} 
        className="p-6 bg-card shadow-soft cursor-pointer hover-lift transition-soft" 
        onClick={() => !isDeposit && onViewRequest(tx.id)}
        data-testid={`card-transaction-${tx.id}`}
      >
        <div className="flex justify-between items-start mb-5">
          <div>
            <p className="text-xs font-semibold uppercase mb-2 text-muted-foreground">
              {isDeposit ? 'Пополнение' : 'Платеж'}
            </p>
            <p className="text-4xl font-bold tabular-nums" data-testid={`text-amount-usdt-${tx.id}`}>
              {isDeposit ? '+' : ''}{tx.amountUsdt.toFixed(2)} USDT
            </p>
          </div>
          <Badge 
            className={`${statusColors[tx.status]} rounded-full text-xs font-semibold px-3 py-2 shadow-soft-sm flex items-center gap-2`}
            data-testid={`badge-status-${tx.id}`}
          >
            {(() => {
              const StatusIcon = statusIcons[tx.status];
              return <StatusIcon className="w-4 h-4" />;
            })()}
            {statusLabels[tx.status]}
          </Badge>
        </div>

        <div className="space-y-3 text-sm font-medium border-t border-border pt-4">
          {isDeposit ? (
            <>
              <p data-testid={`text-amount-rub-${tx.id}`}>
                ≈ {tx.amountRub.toLocaleString('ru-RU')} ₽
              </p>
              {tx.txHash && (
                <p className="text-xs text-muted-foreground truncate">
                  TX: {tx.txHash.substring(0, 10)}...{tx.txHash.substring(tx.txHash.length - 8)}
                </p>
              )}
            </>
          ) : (
            <>
              <p data-testid={`text-amount-rub-${tx.id}`}>
                {tx.amountRub.toLocaleString('ru-RU')} ₽ • {tx.urgency === 'urgent' ? 'Срочно' : 'Стандартно'}
              </p>
              <div>
                {tx.frozenRate && `${tx.frozenRate.toFixed(2)} ₽`}
              </div>
              {tx.receipt && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-green-600 hover:text-green-700 h-auto p-0 font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadBase64File(tx.receipt!.value, tx.receipt!.name, tx.receipt!.mimeType);
                  }}
                >
                  <Download className="w-4 h-4" />
                  <span className="text-xs">Скачать чек</span>
                </Button>
              )}
            </>
          )}
          <div data-testid={`text-date-${tx.id}`}>
            {new Date(tx.createdAt).toLocaleString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] px-6 pt-8 pb-28 bg-background">
      <div className="max-w-md w-full mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground">История транзакций</h1>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Card className="p-16 w-full text-center bg-card shadow-soft">
              <div className="space-y-8">
                <h2 className="text-4xl font-bold text-foreground">Пусто</h2>
                <p className="text-xl font-medium">Заявок нет</p>
                <Button onClick={onGoHome} size="lg" className="mt-8 h-14 text-lg">
                  Главная
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-card shadow-soft-sm rounded-[18px] p-1 mb-6">
              <TabsTrigger 
                value="active" 
                className="rounded-[14px] data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-soft-sm font-semibold transition-soft"
              >
                Активные платежи
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="rounded-[14px] data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-soft-sm font-semibold transition-soft"
              >
                История
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-5 animate-fade-in">
              {activeTransactions.length === 0 ? (
                <Card className="p-12 text-center bg-card shadow-soft">
                  <div className="space-y-4">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground" />
                    <p className="text-base font-medium text-muted-foreground">Нет активных платежей</p>
                  </div>
                </Card>
              ) : (
                activeTransactions.map(renderTransactionCard)
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-5 animate-fade-in">
              {historyTransactions.length === 0 ? (
                <Card className="p-12 text-center bg-card shadow-soft">
                  <div className="space-y-4">
                    <FileCheck className="w-12 h-12 mx-auto text-muted-foreground" />
                    <p className="text-base font-medium text-muted-foreground">История пуста</p>
                  </div>
                </Card>
              ) : (
                historyTransactions.map(renderTransactionCard)
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
