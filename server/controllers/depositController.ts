import type { Request, Response } from 'express';
import { storage } from '../storage';
import type { InsertDeposit } from '@shared/schema';
import { getOrCreateUserAddress } from '../services/tronWallet';
import QRCode from 'qrcode';

function verifyAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  return password === adminPassword;
}

export async function startDeposit(req: Request, res: Response) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const tronAddress = await getOrCreateUserAddress(userId);

    const qrCodeDataUrl = await QRCode.toDataURL(tronAddress, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    res.json({
      tronAddress,
      qrCode: qrCodeDataUrl,
    });
  } catch (error) {
    console.error('Error starting deposit:', error);
    res.status(500).json({ error: 'Failed to start deposit' });
  }
}

export async function createDeposit(req: Request, res: Response) {
  try {
    const { userId, amount, txHash } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: 'userId and amount are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    const insertDeposit: InsertDeposit = {
      userId,
      amount: amount.toString(),
      status: 'pending',
      txHash: txHash || null,
    };

    const deposit = await storage.createDeposit(insertDeposit);

    await storage.createNotification({
      userId,
      message: `Создана заявка на депозит ${amount} USDT. Ожидает подтверждения администратором.`,
      isRead: 0,
    });

    res.json(deposit);
  } catch (error) {
    console.error('Error creating deposit:', error);
    res.status(500).json({ error: 'Failed to create deposit' });
  }
}

export async function getUserDeposits(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const deposits = await storage.getDepositsByUserId(userId);

    const formattedDeposits = deposits.map(deposit => ({
      ...deposit,
      amount: parseFloat(deposit.amount),
    }));

    res.json(formattedDeposits);
  } catch (error) {
    console.error('Error getting user deposits:', error);
    res.status(500).json({ error: 'Failed to get deposits' });
  }
}

export async function getPendingDeposits(req: Request, res: Response) {
  try {
    const { password } = req.query;

    if (!password || !verifyAdminPassword(password as string)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const deposits = await storage.getPendingDeposits();
    const users = await storage.getAllUsers();

    const userMap = new Map(users.map(u => [u.id, u]));

    const formattedDeposits = deposits.map(deposit => {
      const user = userMap.get(deposit.userId);
      return {
        ...deposit,
        amount: parseFloat(deposit.amount),
        username: user?.username || 'Unknown',
      };
    });

    res.json(formattedDeposits);
  } catch (error) {
    console.error('Error getting pending deposits:', error);
    res.status(500).json({ error: 'Failed to get pending deposits' });
  }
}

export async function confirmDeposit(req: Request, res: Response) {
  try {
    const { depositId } = req.params;
    const { password, adminId = 'admin' } = req.body;

    if (!password || !verifyAdminPassword(password)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const deposit = await storage.getDeposit(depositId);
    if (!deposit) {
      return res.status(404).json({ error: 'Deposit not found' });
    }

    if (deposit.status !== 'pending') {
      return res.status(400).json({ error: 'Deposit is not pending' });
    }

    const user = await storage.getUser(deposit.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentAvailable = parseFloat(user.availableBalance);
    const depositAmount = parseFloat(deposit.amount);
    const newAvailable = currentAvailable + depositAmount;

    await storage.updateUserBalance(
      deposit.userId,
      newAvailable.toString(),
      user.frozenBalance
    );

    await storage.confirmDeposit(depositId, adminId);

    await storage.createNotification({
      userId: deposit.userId,
      message: `Депозит на ${depositAmount.toFixed(2)} USDT подтверждён`,
      isRead: 0,
    });

    res.json({
      success: true,
      message: 'Deposit confirmed',
      newBalance: newAvailable,
    });
  } catch (error) {
    console.error('Error confirming deposit:', error);
    res.status(500).json({ error: 'Failed to confirm deposit' });
  }
}

export async function rejectDeposit(req: Request, res: Response) {
  try {
    const { depositId } = req.params;
    const { password } = req.body;

    if (!password || !verifyAdminPassword(password)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const deposit = await storage.getDeposit(depositId);
    if (!deposit) {
      return res.status(404).json({ error: 'Deposit not found' });
    }

    if (deposit.status !== 'pending') {
      return res.status(400).json({ error: 'Deposit is not pending' });
    }

    await storage.rejectDeposit(depositId);

    await storage.createNotification({
      userId: deposit.userId,
      message: 'Депозит отклонён',
      isRead: 0,
    });

    res.json({
      success: true,
      message: 'Deposit rejected',
    });
  } catch (error) {
    console.error('Error rejecting deposit:', error);
    res.status(500).json({ error: 'Failed to reject deposit' });
  }
}
