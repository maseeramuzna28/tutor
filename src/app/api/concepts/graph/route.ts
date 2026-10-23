// GET /api/concepts/graph
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(_req: NextRequest) {
  try {
    const admin = createAdminClient();
    const { data: concepts } = await admin.from('concepts').select('*');

    const defaultConcepts = {
      groups: [
        { id: 'ds', name: 'Data structures', cx: 170, cy: 200, rx: 140, ry: 150, lx: 40, ly: 44 },
        { id: 'alg', name: 'Algorithms', cx: 490, cy: 165, rx: 130, ry: 125, lx: 385, ly: 34 },
        { id: 'db', name: 'Databases', cx: 465, cy: 345, rx: 180, ry: 48, lx: 295, ly: 291 },
      ],
      nodes: [
        { id: 'arrays', label: 'Arrays', x: 110, y: 100, mastery: 80, group: 'ds' },
        { id: 'lists', label: 'Linked lists', x: 230, y: 70, mastery: 70, group: 'ds' },
        { id: 'stacks', label: 'Stacks', x: 100, y: 210, mastery: 65, group: 'ds' },
        { id: 'trees', label: 'Trees', x: 240, y: 190, mastery: 40, group: 'ds' },
        { id: 'hashing', label: 'Hashing', x: 170, y: 320, mastery: 30, group: 'ds' },
        { id: 'recursion', label: 'Recursion', x: 400, y: 110, mastery: 45, group: 'alg' },
        { id: 'sorting', label: 'Sorting', x: 540, y: 70, mastery: 72, group: 'alg' },
        { id: 'bigo', label: 'Big O', x: 560, y: 190, mastery: 55, group: 'alg' },
        { id: 'graphs', label: 'Graph traversal', x: 420, y: 250, mastery: 35, group: 'alg' },
        { id: 'joins', label: 'SQL joins', x: 600, y: 330, mastery: 60, group: 'db' },
        { id: 'norm', label: 'Normalization', x: 470, y: 355, mastery: 44, group: 'db' },
        { id: 'index', label: 'Indexing', x: 330, y: 340, mastery: 38, group: 'db' },
      ],
      links: [
        ['arrays', 'lists'],
        ['arrays', 'stacks'],
        ['lists', 'trees'],
        ['stacks', 'recursion'],
        ['trees', 'recursion'],
        ['trees', 'graphs'],
        ['recursion', 'sorting'],
        ['sorting', 'bigo'],
        ['bigo', 'graphs'],
        ['hashing', 'index'],
        ['trees', 'index'],
        ['joins', 'norm'],
        ['norm', 'index'],
        ['hashing', 'arrays'],
        ['graphs', 'recursion'],
      ],
    };

    const result = (concepts && concepts[0]) || defaultConcepts;
    return apiSuccess(result);
  } catch (err: any) {
    return apiError(err?.message || 'Failed to fetch concept graph.', 500);
  }
}
