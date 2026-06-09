import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

export type AbaId = 'inicio' | 'estoque' | 'eventos' | 'historico' | 'configuracoes';

export interface AbaPrincipal {
  id: AbaId;
  titulo: string;
  icone: ComponentProps<typeof Ionicons>['name'];
}

export const abasPrincipais: AbaPrincipal[] = [
  { id: 'inicio', titulo: 'Início', icone: 'grid-outline' },
  { id: 'estoque', titulo: 'Estoque', icone: 'cube-outline' },
  { id: 'eventos', titulo: 'Eventos', icone: 'calendar-outline' },
  { id: 'historico', titulo: 'Histórico', icone: 'time-outline' },
  { id: 'configuracoes', titulo: 'Info', icone: 'settings-outline' },
];
