"use client";

import { ArrowLeft, QrCode, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { QrImage } from "@/components/feature/QrConnect";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { ErrorState, Loading } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api/client";
import { useChannelQR } from "@/lib/hooks/useChannelQR";
import {
  useChannel,
  useConnectChannel,
  useConnectionStatePolling,
  useDisconnectChannel,
} from "@/lib/hooks/useChannels";

export default function ChannelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const { data: channel, isLoading, isError, refetch } = useChannel(id);
  const connect = useConnectChannel(id);
  const disconnect = useDisconnectChannel();

  const { qr, setQr, clearQr } = useChannelQR(id);
  const [pairing, setPairing] = useState<string | null>(null);
  const [number, setNumber] = useState("");
  const [waitingQR, setWaitingQR] = useState(false);

  const connected = channel?.status === "connected";

  // While the channel is connecting, poll the live Evolution state so the UI
  // flips to "connected" automatically once the phone finishes pairing —
  // without relying on the CONNECTION_UPDATE webhook reaching the backend.
  useConnectionStatePolling(id, channel?.status === "connecting");

  async function doConnect() {
    clearQr();
    setPairing(null);
    setWaitingQR(true);
    try {
      const res = await connect.mutateAsync({ number });
      // The backend returns both codes together: the QR (also streamed over the
      // realtime WebSocket as it refreshes) and the pairing code, which it polls
      // for until Evolution finishes generating it. Render each only once its
      // full string has arrived, so the pairing code never flashes empty.
      if (res.qr_code) setQr(res.qr_code);
      if (res.pairing_code) setPairing(res.pairing_code);
      setWaitingQR(false);
    } catch (err) {
      setWaitingQR(false);
      toast.error(err instanceof ApiClientError ? err.message : "Erro");
    }
  }

  async function doDisconnect() {
    if (!confirm("Desligar este canal?")) return;
    try {
      await disconnect.mutateAsync(id);
      toast.success("Canal desligado");
      router.push("/channels");
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Erro");
    }
  }

  if (isLoading) return <Loading />;
  if (isError || !channel) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div>
      <Link
        href="/channels"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={16} /> Canais
      </Link>
      <PageHeader
        title={channel.name || "Canal"}
        description={`${channel.type} · ${channel.external_account_id || "sem número"}`}
        action={
          <Button variant="danger" onClick={doDisconnect} loading={disconnect.isPending}>
            <Trash2 size={16} /> Desligar
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Estado da ligação</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Estado atual</span>
              <Badge tone={statusTone(channel.status)}>{channel.status}</Badge>
            </div>
            {channel.instance_name && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Instância</span>
                <span className="font-mono text-sm">{channel.instance_name}</span>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ligar dispositivo</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            {connected ? (
              <p className="text-sm text-green-700">
                ✓ Canal ligado e a receber mensagens.
              </p>
            ) : (
              <>
                <Field
                  label="Número (para o código de pareamento)"
                  hint="Opcional, formato E.164. Necessário para gerar o código de pareamento."
                >
                  <Input
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="5511999999999"
                  />
                </Field>
                <Button
                  onClick={() => doConnect()}
                  loading={connect.isPending}
                  className="w-full"
                >
                  <QrCode size={16} /> Conectar WhatsApp
                </Button>

                {waitingQR && !qr && !pairing && (
                  <p className="text-sm text-slate-500">
                    A gerar os códigos de ligação…
                  </p>
                )}

                {qr && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">
                      Leia o QR Code no WhatsApp
                    </p>
                    <QrImage value={qr} />
                  </div>
                )}

                {pairing && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-sm text-slate-500">
                      Ou insira este código no WhatsApp:
                    </p>
                    <p className="mt-1 font-mono text-2xl font-bold tracking-widest">
                      {pairing}
                    </p>
                  </div>
                )}

                {(qr || pairing) && (
                  <p className="text-xs text-slate-500">
                    A aguardar leitura… o estado atualiza automaticamente.
                  </p>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
