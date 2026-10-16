'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '@/components/shell/AdminProvider';
import { NoAccess } from '@/components/shell/NoAccess';
import { PageHeader } from '@/components/shell/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { Dialog, FIELD } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { Tabs } from '@/components/ui/Tabs';
import { getContent } from '@/lib/data/content';
import { fmtDate, fmtNum } from '@/lib/format';
import type { Guide, Tag, TagGroups } from '@/lib/types';

export type Demo = 'live' | 'loading' | 'empty';
type GroupKey = keyof TagGroups;
type Dlg = { doc: true } | { k: GroupKey; tag: Tag } | null;

const TODAY = '2026-10-16';
const CATS = ['Getting started', 'Branches and outlets', 'Listings', 'Offers', 'Reviews', 'Billing'];
const GROUPS: { k: GroupKey; title: string; desc: string }[] = [
  { k: 'listing', title: 'Listing tags', desc: 'Shown on listings and used as filters in the client app.' },
  { k: 'food', title: 'Food preferences', desc: 'The cuisines clients pick during onboarding.' },
  { k: 'activity', title: 'Activity preferences', desc: 'The activity types clients pick during onboarding.' },
];
const score = (d: Guide) => (d.helpful + d.notHelpful ? Math.round((d.helpful / (d.helpful + d.notHelpful)) * 100) : 0);
const SELECT = `${FIELD} h-11 text-sm`;

export function Content({ demo }: { demo: Demo }) {
  const { role, flash } = useAdmin();
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<'guides' | 'tags'>('guides');
  const [kind, setKind] = useState<'all' | Guide['kind']>('all');
  const [docs, setDocs] = useState<Guide[]>([]);
  const [draft, setDraft] = useState<Guide | null>(null);
  const [groups, setGroups] = useState<TagGroups | null>(null);
  const [adds, setAdds] = useState<Partial<Record<GroupKey, string>>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const [dlg, setDlg] = useState<Dlg>(null);

  useEffect(() => {
    getContent().then((r) => {
      setDocs(r.docs);
      setDraft({ ...r.docs[0] });
      setGroups(r.groups);
      setLoaded(true);
    });
  }, []);

  if (role === 'moderator') {
    return <NoAccess title="Moderators can't open Content." body="Switch role in the top bar to see this section." />;
  }

  const loading = demo === 'loading' || !loaded;
  const all = demo === 'empty' ? [] : docs;
  const articles = loading ? [] : all.filter((d) => kind === 'all' || d.kind === kind);
  const dr = !loading && draft && demo !== 'empty' ? draft : null;
  const saved = dr ? all.find((x) => x.id === dr.id) : undefined;
  const dirty = !!dr && (!saved || (['title', 'body', 'kind', 'category'] as const).some((k) => saved[k] !== dr[k]));

  const commitDoc = (patch: Partial<Guide>, msg?: string) => {
    if (!draft) return;
    const d = { ...draft, ...patch, updated: TODAY };
    setDraft(d);
    setDocs((xs) => (xs.some((x) => x.id === d.id) ? xs.map((x) => (x.id === d.id ? d : x)) : [d, ...xs]));
    if (msg) flash(msg);
  };
  const field = <K extends 'title' | 'body' | 'kind' | 'category'>(k: K, v: Guide[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));
  const grp = (k: GroupKey, fn: (a: Tag[]) => Tag[]) => setGroups((g) => (g ? { ...g, [k]: fn(g[k]) } : g));

  const confirm = () => {
    if (!dlg) return;
    if ('doc' in dlg) commitDoc({ status: 'Draft' }, 'Unpublished. It is a draft again.');
    else {
      grp(dlg.k, (a) => a.map((x) => (x.id === dlg.tag.id ? { ...x, archived: true } : x)));
      flash(dlg.tag.name + ' archived.');
    }
    setDlg(null);
  };

  return (
    <>
      <PageHeader
        title="Content"
        subtitle="Help for the Business Portal, and the tags and preference lists the apps show."
        actions={
          tab === 'guides' && (
            <Button
              size="sm"
              onClick={() =>
                setDraft({ id: 'g' + Date.now(), kind: 'Guide', title: '', category: 'Getting started', status: 'Draft', updated: TODAY, helpful: 0, notHelpful: 0, body: '' })
              }
            >
              New article
            </Button>
          )
        }
      />
      <Tabs
        tabs={[
          { id: 'guides', label: 'How-to guides and FAQ' },
          { id: 'tags', label: 'Tags and categories' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'guides' && (
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-0.5 rounded-xl bg-white p-2 shadow-card">
            <div className="flex flex-wrap gap-1.5 p-2">
              <ChipGroup
                label="Type"
                chips={[
                  { id: 'all', label: 'All' },
                  { id: 'Guide', label: 'Guides' },
                  { id: 'FAQ', label: 'FAQ' },
                ]}
                value={kind}
                onChange={setKind}
              />
            </div>
            {loading && [1, 2, 3, 4].map((k) => <div key={k} className="ca-pulse m-1 h-16 rounded-[14px] bg-surface-muted" />)}
            {!loading && articles.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted">No articles yet. Start with New article.</div>}
            {articles.map((d) => {
              const on = d.id === draft?.id;
              const hasScore = d.helpful + d.notHelpful > 0;
              return (
                <button
                  key={d.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setDraft({ ...d })}
                  className={`flex cursor-pointer flex-col gap-1.5 rounded-[14px] border-none px-3.5 py-3 text-left hover:bg-page ${
                    on ? 'bg-tint-purple shadow-[inset_0_0_0_1px_var(--primary-purple-opacity-20)]' : 'bg-transparent'
                  }`}
                >
                  <span className="text-sm font-semibold text-ink">{d.title}</span>
                  <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
                    <Badge tone={d.status === 'Published' ? 'success' : 'neutral'}>{d.status}</Badge>
                    {d.kind} · {d.category}
                    {hasScore && ` · ${score(d)}% helpful`}
                  </span>
                </button>
              );
            })}
          </div>

          {dr && (
            <section className="flex min-w-0 flex-[999_1_440px] flex-col gap-4 rounded-xl bg-white p-6 shadow-card">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge tone={dr.status === 'Published' ? 'success' : 'neutral'} dot>
                  {dr.status}
                </Badge>
                <span className="text-[13px] text-muted">Updated {fmtDate(dr.updated)}</span>
                <span className="flex-1" />
                {dirty && <span className="text-[13px] text-[var(--warning-variable-700)]">Unsaved changes</span>}
                <Button variant="text" className="px-2" onClick={() => (dr.title.trim() ? commitDoc({}, 'Draft saved.') : flash('Add a title first.'))}>
                  Save draft
                </Button>
                {dr.status === 'Published' ? (
                  <Button variant="outline" size="sm" onClick={() => setDlg({ doc: true })}>
                    Unpublish
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() =>
                      dr.title.trim() && dr.body.trim()
                        ? commitDoc({ status: 'Published' }, '“' + dr.title + '” published to the Business Portal.')
                        : flash('Add a title and body before publishing.')
                    }
                  >
                    Publish
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
                <label className="flex flex-col gap-1.5 text-[13px] text-muted">
                  Type
                  <select value={dr.kind} onChange={(e) => field('kind', e.target.value as Guide['kind'])} className={SELECT}>
                    <option value="Guide">How-to guide</option>
                    <option value="FAQ">FAQ</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1.5 text-[13px] text-muted">
                  Category
                  <select value={dr.category} onChange={(e) => field('category', e.target.value)} className={SELECT}>
                    {CATS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
              </div>
              <input
                value={dr.title}
                onChange={(e) => field('title', e.target.value)}
                placeholder="Title"
                aria-label="Title"
                className="border-x-0 border-b border-t-0 border-solid border-subtle bg-transparent py-1 font-display text-[22px] font-bold leading-[1.3] outline-none"
              />
              <textarea
                value={dr.body}
                onChange={(e) => field('body', e.target.value)}
                rows={10}
                placeholder="Write the steps in plain language."
                aria-label="Body"
                className={`${FIELD} resize-y p-3.5 text-[15px] leading-[1.6]`}
              />
              {dr.helpful + dr.notHelpful > 0 && (
                <div className="flex flex-col gap-2 rounded-[14px] p-3.5 shadow-[inset_0_0_0_1px_var(--color-border-subtle)]">
                  <span className="text-[13px] font-semibold">Was this helpful?</span>
                  <div className="h-2.5 overflow-hidden rounded-pill bg-[var(--error-opacity-10)]">
                    <div className="h-full rounded-pill bg-success" style={{ width: score(dr) + '%' }} />
                  </div>
                  <span className="text-[13px] text-muted">
                    {dr.helpful} helpful · {dr.notHelpful} not helpful · {score(dr)}%
                  </span>
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {tab === 'tags' && groups && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-4">
          {GROUPS.map(({ k, title, desc }) => {
            const arr = groups[k];
            const add = () => {
              const v = (adds[k] ?? '').trim();
              if (!v) return;
              if (arr.some((t) => t.name.toLowerCase() === v.toLowerCase())) return flash(v + ' is already in the list.');
              grp(k, (a) => [...a, { id: k + Date.now(), name: v, uses: 0 }]);
              setAdds((x) => ({ ...x, [k]: '' }));
              flash(v + ' added to ' + title.toLowerCase() + '.');
            };
            return (
              <section key={k} className="flex flex-col gap-2.5 rounded-xl bg-white p-5 shadow-card">
                <div className="flex flex-col gap-0.5">
                  <h2 className="m-0 font-display text-lg font-semibold">{title}</h2>
                  <span className="text-[13px] text-muted">{desc}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    value={adds[k] ?? ''}
                    onChange={(e) => setAdds((x) => ({ ...x, [k]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && add()}
                    placeholder="Add an item"
                    aria-label={'Add to ' + title.toLowerCase()}
                    className={`${FIELD} h-10 min-w-0 flex-1`}
                  />
                  <Button variant="outline" size="sm" onClick={add}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-col">
                  {arr.map((t, i) => {
                    const isEditing = editing === t.id;
                    const commit = () => {
                      const v = editVal.trim();
                      if (v && v !== t.name) {
                        grp(k, (a) => a.map((x) => (x.id === t.id ? { ...x, name: v } : x)));
                        flash('Renamed to ' + v + '. Existing listings update automatically.');
                      }
                      setEditing(null);
                    };
                    const move = (d: -1 | 1) =>
                      grp(k, (a) => {
                        const b = a.slice();
                        [b[i], b[i + d]] = [b[i + d], b[i]];
                        return b;
                      });
                    const actions = [
                      { icon: 'arrow-up', label: 'Move up', off: i === 0, fn: () => move(-1) },
                      { icon: 'arrow-down', label: 'Move down', off: i === arr.length - 1, fn: () => move(1) },
                      {
                        icon: 'pencil',
                        label: 'Rename',
                        off: false,
                        fn: () => {
                          setEditing(t.id);
                          setEditVal(t.name);
                        },
                      },
                      t.archived
                        ? {
                            icon: 'archive-restore',
                            label: 'Restore',
                            off: false,
                            fn: () => {
                              grp(k, (a) => a.map((x) => (x.id === t.id ? { ...x, archived: false } : x)));
                              flash(t.name + ' restored.');
                            },
                          }
                        : { icon: 'archive', label: 'Archive', off: false, fn: () => setDlg({ k, tag: t }) },
                    ];
                    return (
                      <div key={t.id} className={`flex min-h-11 items-center gap-2 border-t border-subtle ${t.archived ? 'opacity-55' : ''}`}>
                        {isEditing ? (
                          <input
                            value={editVal}
                            onChange={(e) => setEditVal(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commit();
                              if (e.key === 'Escape') setEditing(null);
                            }}
                            onBlur={commit}
                            autoFocus
                            aria-label={'Rename ' + t.name}
                            className="h-[34px] min-w-0 flex-1 rounded-[10px] border-none px-2.5 text-sm font-medium shadow-[inset_0_0_0_1px_var(--color-brand-purple)] outline-none"
                          />
                        ) : (
                          <span className="flex-1 text-sm font-medium">
                            {t.name}
                            {t.archived && <span className="text-xs font-normal text-muted"> · archived</span>}
                          </span>
                        )}
                        <span className="whitespace-nowrap text-xs text-muted">{fmtNum(t.uses)} uses</span>
                        {actions.map((a) => (
                          <button
                            key={a.label}
                            type="button"
                            onClick={a.fn}
                            title={a.label}
                            aria-label={a.label + ' ' + t.name}
                            disabled={a.off}
                            className="grid size-[30px] shrink-0 cursor-pointer place-items-center rounded-full border-none bg-transparent text-[var(--pure-black-variable-300)] hover:bg-page disabled:cursor-default disabled:opacity-30"
                          >
                            <Icon name={a.icon} size={15} />
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {dlg && (
        <Dialog
          title={'doc' in dlg ? 'Unpublish this article?' : 'Archive ' + dlg.tag.name + '?'}
          description={
            'doc' in dlg
              ? 'Businesses stop seeing it in the help centre. Its helpful score is kept.'
              : 'It disappears from pickers in the apps. The ' + fmtNum(dlg.tag.uses) + ' listings or clients using it keep it until you restore or remove it.'
          }
          width={440}
          onClose={() => setDlg(null)}
          footer={
            <>
              <Button variant="text" onClick={() => setDlg(null)} className="px-3">
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={confirm}>
                {'doc' in dlg ? 'Unpublish' : 'Archive'}
              </Button>
            </>
          }
        />
      )}
    </>
  );
}
