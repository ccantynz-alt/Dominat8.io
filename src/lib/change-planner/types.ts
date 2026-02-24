export type ChangeKind = 'add' | 'edit' | 'delete' | 'rename' | 'move';

export type ChangePlan = {
  id: string;
  createdAt: string;
  description: string;
  steps: ChangeStep[];
};

export type ChangeStep = {
  id: string;
  order: number;
  kind: ChangeKind;
  path: string;
  description: string;
  diff?: string;
  status: 'pending' | 'applied' | 'skipped' | 'failed';
};
