import { api } from './api'

export const commentsService = {
  async create(ticketId: string, content: string, isInternal: boolean) {
    const { data } = await api.post(`/api/tickets/${ticketId}/comments`, { content, isInternal })
    return data.data
  },
}

export const attachmentsService = {
  async upload(ticketId: string, files: FileList) {
    const form = new FormData()
    Array.from(files).forEach((f) => form.append('files', f))
    const { data } = await api.post(`/api/tickets/${ticketId}/attachments`, form)
    return data.data
  },

  /** Baixa via Axios (com o Bearer token) e dispara o download no navegador. */
  async download(id: string, originalName: string) {
    const res = await api.get(`/api/tickets/attachments/${id}/download`, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = originalName
    a.click()
    URL.revokeObjectURL(url)
  },

  async remove(id: string) {
    await api.delete(`/api/tickets/attachments/${id}`)
  },
}
