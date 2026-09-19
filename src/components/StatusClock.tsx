import { useEffect, useState } from 'react'

// Relógio do NOC: hora com segundos e a data do dia.
//
// Fica em um componente próprio de propósito. Como ele se atualiza a cada
// segundo, se o estado do relógio morasse no App a página inteira — incluindo
// o gráfico e a tabela — seria redesenhada 60 vezes por minuto à toa.
export function StatusClock() {
  const [agora, setAgora] = useState(() => new Date())

  useEffect(() => {
    const relogio = setInterval(() => setAgora(new Date()), 1000)
    return () => clearInterval(relogio)
  }, [])

  // O fuso vem do próprio navegador, em vez de "UTC-3" fixo no código:
  // getTimezoneOffset devolve minutos e com o sinal invertido.
  const horas = -agora.getTimezoneOffset() / 60
  const fuso = `UTC${horas >= 0 ? '+' : '−'}${Math.abs(horas)}`

  return (
    <div className="text-right font-mono leading-tight">
      <div className="text-sm font-bold tracking-wider text-slate-200">
        {agora.toLocaleTimeString('pt-BR')}{' '}
        <span className="text-[10px] font-normal text-slate-500">{fuso}</span>
      </div>
      <div className="text-[10px] text-slate-500">{agora.toLocaleDateString('pt-BR')}</div>
    </div>
  )
}
