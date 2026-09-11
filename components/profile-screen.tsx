"use client";

import { useState } from "react";
import { Mail, LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ProfileScreenProps {
  email: string;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export function ProfileScreen({
  email,
  onLogout,
  onDeleteAccount,
}: ProfileScreenProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  return (
    <>
      <div className="min-h-[calc(100vh-9rem)] bg-background px-4 py-8 pb-24">
        <div className="mx-auto max-w-lg space-y-6">
          <h1 className="text-2xl font-bold text-[#3A4A75]">Аккаунт</h1>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <Mail className="h-5 w-5 shrink-0 text-[#F0B2B2]" />
              <span className="text-sm text-[#F0B2B2]">{email}</span>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" />
              Выйти
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Удалить аккаунт
            </Button>
          </div>

          <div className="pt-4 text-center">
            <Link
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:underline"
            >
              Политика конфиденциальности
            </Link>
          </div>
        </div>
      </div>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить аккаунт</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить аккаунт? Все ваши цели и прогресс
              будут безвозвратно удалены. Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setDeleteConfirmOpen(false);
                onDeleteAccount();
              }}
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
