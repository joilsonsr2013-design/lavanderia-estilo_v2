import React from 'react';
import { Card } from '../components/ui';
import { DocsIcon, InfoIcon } from '../components/icons';

const glossary = [
  { term: 'Umectação', def: 'Pré-tratamento para soltar sujidade, aplicando produto antes da lavagem principal.' },
  { term: 'Alvejamento', def: 'Remoção de manchas com oxidantes, como alvejantes à base de cloro ou oxigênio ativo.' },
  { term: 'Calandra', def: 'Máquina de passar com rolos aquecidos — ideal para lençóis e toalhas grandes.' },
  { term: 'Prensa', def: 'Equipamento de passadoria com pressão e calor — ideal para camisas e calças.' },
  { term: 'Embalagem a vácuo', def: 'Técnica de embalagem que protege as peças após o serviço, mantendo higiene e apresentação.' },
  { term: 'Capacidade real vs nominal', def: 'Diferença entre carga máxima que a máquina suporta (real) e a indicada pelo fabricante (nominal).' },
  { term: 'Código de trato (etiqueta)', def: 'Símbolos internacionais de lavagem presentes nas peças indicando temperatura, centrifugação, etc.' },
];

const checklist = [
  'Testar compatibilidade com impressoras térmicas para etiquetas de peças.',
  'Capacitar equipe nos alertas do sistema (estoque baixo, prazos vencidos).',
  'Configurar ciclos de lavagem padrão para cada tipo de tecido.',
  'Definir usuários, senhas e permissões de acesso no sistema.',
  'Integrar formas de pagamento (PIX, cartão, boleto) ao fluxo de caixa.',
  'Estabelecer procedimento de abertura e fechamento de caixa diário.',
  'Treinar equipe no fluxo de registro de ponto eletrônico.',
  'Criar tabela de preços por tipo de peça e serviço no estoque.',
];

const endpoints = [
  'POST /api/auth/login — Login e geração de token JWT',
  'GET  /api/auth/me — Dados do usuário autenticado',
  'GET  /api/dashboard/stats — Estatísticas gerais (gerente+)',
  'GET  /api/customers — Listar clientes',
  'POST /api/customers — Criar cliente',
  'GET  /api/orders — Listar pedidos',
  'POST /api/orders — Criar pedido',
  'PATCH /api/orders/:id/status — Avançar status do pedido',
  'GET  /api/production — Listar produções',
  'GET  /api/products — Listar produtos/serviços',
  'PATCH /api/products/:id/stock — Ajustar estoque',
  'GET  /api/employees — Listar funcionários (gerente+)',
  'GET  /api/time-records — Registros de ponto',
  'POST /api/time-records — Registrar entrada/saída',
  'GET  /api/time-records/summary — Resumo de horas (gerente+)',
  'GET  /api/transactions — Transações financeiras (gerente+)',
  'GET  /api/transactions/summary — Resumo financeiro (gerente+)',
  'GET  /api/settings — Configurações',
  'PUT  /api/settings — Atualizar configurações (admin)',
];

const DocumentationView: React.FC = () => (
  <div className="space-y-6 max-w-3xl animate-fade-in">
    <Card title="Glossário de Termos" subtitle="Terminologia técnica do setor de lavanderia">
      <dl className="space-y-3">
        {glossary.map(g => (
          <div key={g.term} className="p-3 bg-slate-50 rounded-xl">
            <dt className="font-bold text-slate-800 text-sm">{g.term}</dt>
            <dd className="text-sm text-slate-600 mt-0.5">{g.def}</dd>
          </div>
        ))}
      </dl>
    </Card>

    <Card title="Checklist de Implementação" subtitle="Passos para colocar o sistema em produção">
      <ul className="space-y-2">
        {checklist.map((item, i) => (
          <li key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
            <input type="checkbox" id={`chk-${i}`} className="mt-0.5 h-4 w-4 rounded text-brand-600 focus:ring-brand-400 shrink-0" />
            <label htmlFor={`chk-${i}`} className="text-sm text-slate-700 cursor-pointer">{item}</label>
          </li>
        ))}
      </ul>
    </Card>

    <Card title="Permissões por Perfil">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="py-2 text-left font-bold text-slate-600">Função</th>
              <th className="py-2 text-center font-bold text-purple-600">Admin</th>
              <th className="py-2 text-center font-bold text-blue-600">Gerente</th>
              <th className="py-2 text-center font-bold text-slate-600">Funcionário</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {[
              ['Dashboard com estatísticas', '✓', '✓', '✗'],
              ['Clientes (visualizar)', '✓', '✓', '✓'],
              ['Ordens de serviço', '✓', '✓', '✓'],
              ['Avançar status de ordens', '✓', '✓', '✓'],
              ['Cancelar / excluir ordens', '✓', '✓', '✗'],
              ['Produção (visualizar)', '✓', '✓', '✓'],
              ['Produção (editar/atribuir)', '✓', '✓', '✗'],
              ['Estoque (visualizar)', '✓', '✓', '✓'],
              ['Estoque (editar/ajustar)', '✓', '✓', '✗'],
              ['Financeiro', '✓', '✓', '✗'],
              ['Funcionários (visualizar)', '✓', '✓', '✗'],
              ['Funcionários (editar)', '✓', '✗', '✗'],
              ['Folha de ponto (própria)', '✓', '✓', '✓'],
              ['Folha de ponto (equipe)', '✓', '✓', '✗'],
              ['Configurações', '✓', '✗', '✗'],
            ].map(([fn, a, g, s]) => (
              <tr key={fn} className="hover:bg-slate-50">
                <td className="py-2 text-slate-700">{fn}</td>
                <td className="py-2 text-center">{a === '✓' ? <span className="text-green-600 font-bold">✓</span> : <span className="text-slate-300">✗</span>}</td>
                <td className="py-2 text-center">{g === '✓' ? <span className="text-green-600 font-bold">✓</span> : <span className="text-slate-300">✗</span>}</td>
                <td className="py-2 text-center">{s === '✓' ? <span className="text-green-600 font-bold">✓</span> : <span className="text-slate-300">✗</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>

    <Card title="Endpoints da API">
      <div className="space-y-1">
        {endpoints.map((ep, i) => (
          <div key={i} className="font-mono text-xs p-2 bg-slate-900 text-green-400 rounded-lg">{ep}</div>
        ))}
      </div>
    </Card>
  </div>
);

export default DocumentationView;
