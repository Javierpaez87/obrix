import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { CheckCircle, XCircle, Calendar, AlertTriangle, Clock } from 'lucide-react';

const NEON = '#00FFA3';

interface Ticket {
  id: string;
  title: string;
  description: string;
  type: 'labor' | 'materials' | 'combined';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  due_date: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  project_id: string | null;
  created_by?: string | null;
}

interface Recipient {
  id: string;
  ticket_id: string;
  status: 'sent' | 'accepted' | 'rejected';
  recipient_phone: string | null;
  recipient_email: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  recipient_profile_id?: string | null;
  ticket_creator_id?: string | null;
}

const TicketDetail: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useApp();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(false);

  console.log('[TicketDetail] MOUNTED', ticketId);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      localStorage.setItem('pending_ticket_link', window.location.href);
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      if (!ticketId || !user?.id) {
        setError('Link inválido: falta información.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('[TicketDetail] Loading ticket for user:', user.id, 'ticket:', ticketId);

        // 1) Leer ticket (ahora es "readable by authenticated" según la policy nueva)
        const { data: ticketData, error: ticketError } = await supabase
          .from('tickets')
          .select('*')
          .eq('id', ticketId)
          .maybeSingle();

        if (ticketError) {
          console.error('[TicketDetail] Ticket load error:', ticketError?.message || ticketError);
          setError(`Error al cargar el ticket: ${ticketError.message || 'Error desconocido'}`);
          setLoading(false);
          return;
        }

        if (!ticketData) {
          console.error('[TicketDetail] Ticket not found or no permission');
          setError('No tenés permiso para ver este ticket o no existe.');
          setLoading(false);
          return;
        }

        // 2) Buscar si ya existe "mi recipient row" (mi oferta) para este ticket
        const { data: myRecipient, error: myRecipientError } = await supabase
          .from('ticket_recipients')
          .select('*')
          .eq('ticket_id', ticketId)
          .eq('recipient_profile_id', user.id)
          .maybeSingle();

        if (myRecipientError) {
          console.error('[TicketDetail] myRecipientError:', myRecipientError?.message || myRecipientError);
          setError(`Error al cargar tu respuesta: ${myRecipientError.message || 'Error desconocido'}`);
          setLoading(false);
          return;
        }

        // 3) Si no existe, crearla (esto habilita el flujo multi-constructores con un solo link)
        let recipientRow = myRecipient;

        if (!recipientRow) {
          console.log('[TicketDetail] No recipient row found for user. Creating one...');

          const { data: createdRecipient, error: createRecipientError } = await supabase
            .from('ticket_recipients')
            .insert({
              ticket_id: ticketId,
              ticket_creator_id: (ticketData as any).created_by ?? null,
              recipient_profile_id: user.id,
              status: 'sent',
              recipient_phone: null,
              recipient_email: null,
            })
            .select('*')
            .maybeSingle();

          if (createRecipientError) {
            console.error('[TicketDetail] createRecipientError:', createRecipientError?.message || createRecipientError);
            setError(
              `No se pudo crear tu respuesta: ${createRecipientError.message || 'Error desconocido'}. Revisá policies de ticket_recipients.`
            );
            setLoading(false);
            return;
          }

          if (!createdRecipient) {
            console.error('[TicketDetail] No data returned after insert');
            setError('No se pudo crear tu respuesta para este ticket (no data). Revisá policies de ticket_recipients.');
            setLoading(false);
            return;
          }

          recipientRow = createdRecipient;
        }

        setTicket(ticketData);
        setRecipient(recipientRow);
        setLoading(false);
      } catch (err) {
        console.error('[TicketDetail] Unexpected error:', err);
        setError('Ocurrió un error inesperado.');
        setLoading(false);
      }
    };

    fetchData();
  }, [ticketId, isAuthenticated, authLoading, navigate, user?.id]);

  const handleAccept = async () => {
    if (!recipient || !user) return;

    setSubmitting(true);
    try {
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('ticket_recipients')
        .update({
          status: 'accepted',
          accepted_at: now,
          rejected_at: null,
        })
        .eq('id', recipient.id);

      if (error) {
        console.error('[TicketDetail] Error accepting ticket:', error?.message || error);
        alert(`Hubo un error al aceptar la solicitud: ${error.message || 'Error desconocido'}`);
        setSubmitting(false);
        return;
      }

      setRecipient({ ...recipient, status: 'accepted', accepted_at: now, rejected_at: null });
      setActionCompleted(true);
    } catch (err) {
      console.error('[TicketDetail] Unexpected error:', err);
      alert('Ocurrió un error inesperado.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!recipient || !user) return;

    setSubmitting(true);
    try {
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('ticket_recipients')
        .update({
          status: 'rejected',
          rejected_at: now,
          accepted_at: null,
        })
        .eq('id', recipient.id);

      if (error) {
        console.error('[TicketDetail] Error rejecting ticket:', error?.message || error);
        alert(`Hubo un error al rechazar la solicitud: ${error.message || 'Error desconocido'}`);
        setSubmitting(false);
        return;
      }

      setRecipient({ ...recipient, status: 'rejected', rejected_at: now, accepted_at: null });
      setActionCompleted(true);
    } catch (err) {
      console.error('[TicketDetail] Unexpected error:', err);
      alert('Ocurrió un error inesperado.');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#FF4444';
      case 'high':
        return '#FF9944';
      case 'medium':
        return '#FFD644';
      case 'low':
        return '#44FF88';
      default:
        return NEON;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'labor':
        return 'Mano de Obra';
      case 'materials':
        return 'Materiales';
      case 'combined':
        return 'Mano de Obra + Materiales';
      default:
        return type;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return priority;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-white text-lg">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-4">
            <AlertTriangle className="w-16 h-16 mx-auto" style={{ color: '#FF4444' }} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: NEON,
              color: '#0a0a0a',
              boxShadow: `0 0 20px ${NEON}40`,
            }}
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!ticket || !recipient) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-4">
            <AlertTriangle className="w-16 h-16 mx-auto" style={{ color: '#FF4444' }} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Ticket no encontrado</h1>
          <p className="text-white/70 mb-6">
            No se pudo cargar la información del ticket.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: NEON,
              color: '#0a0a0a',
              boxShadow: `0 0 20px ${NEON}40`,
            }}
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const alreadyResponded = recipient.status !== 'sent';
  const canRespond = !alreadyResponded && !actionCompleted;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div
          className="rounded-2xl p-8 border"
          style={{
            backgroundColor: 'rgba(0,0,0,0.4)',
            borderColor: `${NEON}33`,
            boxShadow: `0 0 30px ${NEON}15`,
          }}
        >
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">{ticket.title}</h1>
              <span
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: `${getPriorityColor(ticket.priority)}20`,
                  color: getPriorityColor(ticket.priority),
                  border: `1px solid ${getPriorityColor(ticket.priority)}40`,
                }}
              >
                {getPriorityLabel(ticket.priority)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <span
                className="px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${NEON}15`,
                  color: NEON,
                }}
              >
                {getTypeLabel(ticket.type)}
              </span>
            </div>
          </div>

          <div className="mb-8 p-6 rounded-xl bg-white/5 border border-white/10">
            <h2 className="text-sm font-medium text-white/70 mb-2">Descripción</h2>
            <p className="text-white whitespace-pre-wrap">{ticket.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {ticket.start_date && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <Calendar className="w-5 h-5" style={{ color: NEON }} />
                <div>
                  <div className="text-xs text-white/60">Fecha de Inicio</div>
                  <div className="text-white font-medium">
                    {new Date(ticket.start_date).toLocaleDateString('es-AR')}
                  </div>
                </div>
              </div>
            )}
            {ticket.end_date && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <Calendar className="w-5 h-5" style={{ color: NEON }} />
                <div>
                  <div className="text-xs text-white/60">Fecha de Fin</div>
                  <div className="text-white font-medium">
                    {new Date(ticket.end_date).toLocaleDateString('es-AR')}
                  </div>
                </div>
              </div>
            )}
            {ticket.due_date && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <Clock className="w-5 h-5" style={{ color: NEON }} />
                <div>
                  <div className="text-xs text-white/60">Fecha Límite</div>
                  <div className="text-white font-medium">
                    {new Date(ticket.due_date).toLocaleDateString('es-AR')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {actionCompleted && (
            <div
              className="mb-6 p-4 rounded-xl border text-center"
              style={{
                backgroundColor: recipient.status === 'accepted' ? `${NEON}10` : '#FF444410',
                borderColor: recipient.status === 'accepted' ? `${NEON}40` : '#FF444440',
                color: recipient.status === 'accepted' ? NEON : '#FF4444',
              }}
            >
              <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                {recipient.status === 'accepted' ? (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    Oferta Enviada (Aceptada)
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6" />
                    Oferta Rechazada
                  </>
                )}
              </div>
              <p className="text-sm mt-2 opacity-80">Tu respuesta ha sido registrada correctamente.</p>
            </div>
          )}

          {alreadyResponded && !actionCompleted && (
            <div
              className="mb-6 p-4 rounded-xl border text-center"
              style={{
                backgroundColor: `${NEON}10`,
                borderColor: `${NEON}40`,
                color: NEON,
              }}
            >
              <p className="text-sm">
                Ya respondiste a esta solicitud:{' '}
                <span className="font-semibold">
                  {recipient.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                </span>
              </p>
            </div>
          )}

          {canRespond && (
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAccept}
                disabled={submitting}
                className="flex-1 py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  backgroundColor: NEON,
                  color: '#0a0a0a',
                  boxShadow: `0 0 20px ${NEON}40`,
                }}
              >
                <CheckCircle className="w-6 h-6" />
                {submitting ? 'Enviando...' : 'Aceptar'}
              </button>
              <button
                onClick={handleReject}
                disabled={submitting}
                className="flex-1 py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border"
                style={{
                  backgroundColor: 'rgba(255,68,68,0.1)',
                  color: '#FF4444',
                  borderColor: '#FF444440',
                }}
              >
                <XCircle className="w-6 h-6" />
                {submitting ? 'Enviando...' : 'Rechazar'}
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-white/60 hover:text-white transition-colors text-sm"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
