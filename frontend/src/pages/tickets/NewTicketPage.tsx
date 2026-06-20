import { Loader2 } from 'lucide-react'
import { FormEvent, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import {
  CATEGORY_LABEL,
  CATEGORY_OPTIONS,
  PRIORITY_LABEL,
  PRIORITY_OPTIONS,
} from '../../lib/constants'
import { ticketsService } from '../../services/tickets.service'

export function NewTicketPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [category, setCategory] = useState('OTHER')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const ticket = await ticketsService.create({ title, description, priority, category })
      toast.success('Chamado aberto com sucesso!')
      navigate(`/tickets/${ticket.id}`)
    } catch {
      toast.error('Não foi possível abrir o chamado (verifique os campos)')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout title="Novo Chamado">
      <form
        onSubmit={handleSubmit}
        className="panel mx-auto max-w-2xl space-y-4 p-6"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-mist-200">Título</label>
          <input
            required
            minLength={5}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Resumo do problema (mín. 5 caracteres)"
            className="input-dark"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-mist-200">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-dark"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-mist-200">Prioridade</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="input-dark"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-mist-200">Descrição</label>
          <textarea
            required
            minLength={10}
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o problema com detalhes (mín. 10 caracteres)"
            className="input-dark"
          />
          <p className="mt-1 text-right text-xs text-mist-400">{description.length} caracteres</p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/tickets')}
            className="btn-ghost px-4 py-2 text-sm"
          >
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-primary px-4 py-2 text-sm">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Abrir Chamado
          </button>
        </div>
      </form>
    </AppLayout>
  )
}
